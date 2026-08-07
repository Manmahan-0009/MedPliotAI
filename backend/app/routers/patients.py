from datetime import date, datetime
from typing import List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, cast, String

from app.database import get_db
from app.models.patient import Patient, PatientStatus
from app.schemas.patient import PatientCreate, PatientUpdate, PatientOut, PatientWithConsultations

router = APIRouter(prefix="/api/patients", tags=["Patients"])


def _generate_patient_id(db: Session) -> str:
    """Generate sequential Patient ID like MP-2026-0001."""
    year = datetime.utcnow().year
    count = db.query(Patient).filter(
        func.extract("year", Patient.created_at) == year
    ).count()
    return f"MP-{year}-{count + 1:04d}"


def _calculate_age(dob: Optional[date]) -> Optional[int]:
    if not dob:
        return None
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


def _find_patient(patient_id: str, db: Session) -> Patient:
    """Find patient by UUID string or patient_id string (e.g. MP-2026-0001)."""
    query = db.query(Patient).filter(Patient.status == PatientStatus.active)
    patient = query.filter(Patient.patient_id == patient_id).first()
    if not patient:
        try:
            patient = query.filter(cast(Patient.id, String) == patient_id).first()
        except Exception:
            pass
    return patient


# ─── GET /api/patients ────────────────────────────────────────────────────────
@router.get("", response_model=Union[List[PatientOut], dict])
def list_patients(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: Optional[str] = "created_at",
    order: Optional[str] = "desc",
    db: Session = Depends(get_db),
):
    """Return active patients with optional search, status filtering, sorting, and pagination."""
    query = db.query(Patient)

    if status and status.lower() != "all":
        if status.lower() == "active":
            query = query.filter(Patient.status == PatientStatus.active)
        elif status.lower() == "inactive":
            query = query.filter(Patient.status == PatientStatus.inactive)
    else:
        query = query.filter(Patient.status == PatientStatus.active)

    if search and search.strip():
        term = f"%{search.strip()}%"
        full_name = func.concat(Patient.first_name, " ", Patient.last_name)
        query = query.filter(
            or_(
                Patient.first_name.ilike(term),
                Patient.last_name.ilike(term),
                full_name.ilike(term),
                Patient.patient_id.ilike(term),
                Patient.phone.ilike(term),
                Patient.email.ilike(term),
                Patient.blood_group.ilike(term),
            )
        )

    total = query.count()

    if sort_by == "name":
        col = Patient.first_name
    elif sort_by == "patient_id":
        col = Patient.patient_id
    elif sort_by == "age":
        col = Patient.age
    else:
        col = Patient.created_at

    if order == "asc":
        query = query.order_by(col.asc())
    else:
        query = query.order_by(col.desc())

    items = query.offset(skip).limit(limit).all()
    page = (skip // limit) + 1 if limit > 0 else 1
    total_pages = (total + limit - 1) // limit if limit > 0 else 1

    return {
        "items": [PatientOut.model_validate(p) for p in items],
        "total": total,
        "page": page,
        "totalPages": total_pages,
    }


# ─── GET /api/patients/search — MUST be before /{patient_id} ─────────────────
@router.get("/search", response_model=List[PatientOut])
def search_patients(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    """Search patients by name, patient_id, phone, or email (partial match)."""
    term = f"%{q}%"
    full_name = func.concat(Patient.first_name, " ", Patient.last_name)
    return (
        db.query(Patient)
        .filter(
            Patient.status == PatientStatus.active,
            or_(
                Patient.first_name.ilike(term),
                Patient.last_name.ilike(term),
                full_name.ilike(term),
                Patient.patient_id.ilike(term),
                Patient.phone.ilike(term),
                Patient.email.ilike(term),
            ),
        )
        .order_by(Patient.created_at.desc())
        .limit(20)
        .all()
    )


# ─── GET /api/patients/{id} ───────────────────────────────────────────────────
@router.get("/{patient_id}", response_model=PatientWithConsultations)
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    """Return a single patient with their consultation history."""
    patient = _find_patient(patient_id, db)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


# ─── POST /api/patients ───────────────────────────────────────────────────────
@router.post("", response_model=PatientOut, status_code=201)
def create_patient(payload: PatientCreate, db: Session = Depends(get_db)):
    """Create a new patient. Checks for duplicate email/phone."""
    if payload.email:
        if db.query(Patient).filter(Patient.email == payload.email).first():
            raise HTTPException(status_code=409, detail="A patient with this email already exists.")
    if payload.phone:
        if db.query(Patient).filter(Patient.phone == payload.phone).first():
            raise HTTPException(status_code=409, detail="A patient with this phone number already exists.")

    patient = Patient(
        patient_id=_generate_patient_id(db),
        age=_calculate_age(payload.date_of_birth),
        **payload.model_dump(),
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


# ─── PUT /api/patients/{id} ───────────────────────────────────────────────────
@router.put("/{patient_id}", response_model=PatientOut)
def update_patient(patient_id: str, payload: PatientUpdate, db: Session = Depends(get_db)):
    """Update patient fields."""
    patient = _find_patient(patient_id, db)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "date_of_birth" in update_data and update_data["date_of_birth"]:
        update_data["age"] = _calculate_age(update_data["date_of_birth"])

    for field, value in update_data.items():
        setattr(patient, field, value)

    db.commit()
    db.refresh(patient)
    return patient


# ─── DELETE /api/patients/{id} ────────────────────────────────────────────────
@router.delete("/{patient_id}", status_code=200)
def delete_patient(patient_id: str, db: Session = Depends(get_db)):
    """Soft delete — sets status to inactive."""
    patient = _find_patient(patient_id, db)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient.status = PatientStatus.inactive
    db.commit()
    return {"message": f"Patient {patient.patient_id} deactivated successfully."}
