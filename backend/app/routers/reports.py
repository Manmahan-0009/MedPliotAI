import uuid
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
import random

from app.database import get_db
from app.models.consultation import Consultation
from app.models.patient import Patient
from app.schemas.report import ReportOut, ReportStats, ReportUpdate

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/stats", response_model=ReportStats)
def get_report_stats(db: Session = Depends(get_db)):
    """Returns aggregated stats for the dashboard."""
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total = db.query(Consultation).count()
    todays = db.query(Consultation).filter(Consultation.consultation_date >= today_start).count()
    pending = db.query(Consultation).filter(Consultation.status == "Pending Review").count()
    approved = db.query(Consultation).filter(Consultation.status == "Approved").count()
    this_month = db.query(Consultation).filter(Consultation.consultation_date >= month_start).count()

    # Calculate average confidence from clinical_notes
    all_reports = db.query(Consultation.clinical_notes).filter(Consultation.clinical_notes.isnot(None)).all()
    confidence_sum = 0
    valid_reports = 0
    for r in all_reports:
        if r.clinical_notes and isinstance(r.clinical_notes, dict):
            conf = r.clinical_notes.get("ai_confidence")
            if isinstance(conf, (int, float)):
                confidence_sum += conf
                valid_reports += 1

    avg_conf = int(confidence_sum / valid_reports) if valid_reports > 0 else 92

    return ReportStats(
        total_reports=total,
        todays_reports=todays,
        pending_approval=pending,
        approved_reports=approved,
        avg_ai_confidence=avg_conf,
        reports_this_month=this_month
    )

def _build_report_out(consultation: Consultation, patient: Patient) -> dict:
    c_dict = {
        "id": consultation.id,
        "consultation_id": consultation.consultation_id,
        "patient_id": consultation.patient_id,
        "patient_name": f"{patient.first_name} {patient.last_name}",
        "patient_mrn": patient.patient_id,
        "age": patient.age,
        "gender": patient.gender,
        "doctor_name": consultation.doctor_name,
        "consultation_date": consultation.consultation_date,
        "transcript": consultation.transcript,
        "ai_summary": consultation.ai_summary,
        "soap_notes": consultation.soap_notes,
        "clinical_notes": consultation.clinical_notes,
        "pdf_path": consultation.pdf_path,
        "status": consultation.status,
        "created_at": consultation.created_at,
        "updated_at": consultation.updated_at
    }
    return c_dict

@router.get("", response_model=List[ReportOut])
def get_reports(
    search: Optional[str] = None,
    status: Optional[str] = None,
    timeframe: Optional[str] = None, # today, yesterday, week, month
    department: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Consultation, Patient).join(Patient, Consultation.patient_id == Patient.id)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Patient.first_name.ilike(search_term),
                Patient.last_name.ilike(search_term),
                Patient.patient_id.ilike(search_term),
                Consultation.doctor_name.ilike(search_term),
                Consultation.consultation_id.ilike(search_term)
            )
        )

    if status:
        query = query.filter(Consultation.status == status)

    if timeframe:
        now = datetime.utcnow()
        if timeframe == "today":
            start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            query = query.filter(Consultation.consultation_date >= start)
        elif timeframe == "yesterday":
            start = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
            end = now.replace(hour=0, minute=0, second=0, microsecond=0)
            query = query.filter(Consultation.consultation_date >= start, Consultation.consultation_date < end)
        elif timeframe == "week":
            start = now - timedelta(days=7)
            query = query.filter(Consultation.consultation_date >= start)
        elif timeframe == "month":
            start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            query = query.filter(Consultation.consultation_date >= start)

    results = query.order_by(Consultation.consultation_date.desc()).all()
    out = []
    for c, p in results:
        # Client side filtering for department since it's inside JSON clinical_notes
        if department:
            c_dept = c.clinical_notes.get("department", "") if isinstance(c.clinical_notes, dict) else ""
            if department.lower() not in c_dept.lower():
                continue
        out.append(_build_report_out(c, p))

    return out

@router.get("/{id}", response_model=ReportOut)
def get_report(id: str, db: Session = Depends(get_db)):
    try:
        uuid_val = uuid.UUID(id)
        result = db.query(Consultation, Patient).join(Patient, Consultation.patient_id == Patient.id).filter(Consultation.id == uuid_val).first()
    except ValueError:
        # Fallback to consultation_id string
        result = db.query(Consultation, Patient).join(Patient, Consultation.patient_id == Patient.id).filter(Consultation.consultation_id == id).first()

    if not result:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return _build_report_out(result[0], result[1])

@router.put("/{id}", response_model=ReportOut)
def update_report(id: str, payload: ReportUpdate, db: Session = Depends(get_db)):
    try:
        uuid_val = uuid.UUID(id)
        consultation = db.query(Consultation).filter(Consultation.id == uuid_val).first()
    except ValueError:
        consultation = db.query(Consultation).filter(Consultation.consultation_id == id).first()

    if not consultation:
        raise HTTPException(status_code=404, detail="Report not found")

    if payload.status:
        consultation.status = payload.status
    if payload.soap_notes is not None:
        consultation.soap_notes = payload.soap_notes
    if payload.clinical_notes is not None:
        consultation.clinical_notes = payload.clinical_notes
    
    # Append to timeline if needed
    if payload.status:
        if not consultation.clinical_notes:
            consultation.clinical_notes = {}
        if "timeline" not in consultation.clinical_notes:
            consultation.clinical_notes["timeline"] = []
        consultation.clinical_notes["timeline"].append({
            "action": f"Status updated to {payload.status}",
            "timestamp": datetime.utcnow().isoformat(),
            "user": consultation.doctor_name or "System"
        })

    db.commit()
    db.refresh(consultation)

    patient = db.query(Patient).filter(Patient.id == consultation.patient_id).first()
    return _build_report_out(consultation, patient)

@router.post("/seed", response_model=dict)
def seed_reports(db: Session = Depends(get_db)):
    """Generate 20-30 realistic consultation reports if the DB is empty."""
    existing_reports = db.query(Consultation).count()
    if existing_reports > 0:
        return {"status": "skipped", "message": f"Database already has {existing_reports} reports."}

    patients = db.query(Patient).all()
    if not patients:
        raise HTTPException(status_code=400, detail="No patients found. Please seed patients first.")

    departments = ["Cardiology", "General Medicine", "Endocrinology", "Neurology", "Orthopedics", "Pediatrics"]
    diagnoses = ["Hypertension", "Type 2 Diabetes", "Migraine", "Osteoarthritis", "Acute Bronchitis", "GERD"]
    doctors = ["Dr. Sarah Mitchell", "Dr. Rajesh Kumar", "Dr. Emily Chen", "Dr. Michael Foster"]

    num_reports = random.randint(20, 30)
    now = datetime.utcnow()

    for i in range(num_reports):
        patient = random.choice(patients)
        dept = random.choice(departments)
        diagnosis = random.choice(diagnoses)
        doctor = random.choice(doctors)
        status = random.choice(["Draft", "Pending Review", "Approved", "Approved"])
        
        days_ago = random.randint(0, 45)
        consult_date = now - timedelta(days=days_ago, hours=random.randint(0, 10))

        c = Consultation(
            consultation_id=f"CONS-{uuid.uuid4().hex[:8].upper()}",
            patient_id=patient.id,
            doctor_name=doctor,
            consultation_date=consult_date,
            transcript=f"Patient {patient.first_name} presents with symptoms of {diagnosis.lower()}.",
            ai_summary=f"Follow-up for {diagnosis}.",
            status=status,
            soap_notes={
                "subjective": f"Patient reports feeling unwell. Mentions history of {diagnosis}.",
                "objective": "Vitals stable. BP 120/80.",
                "assessment": diagnosis,
                "plan": "Continue current medication. Follow up in 4 weeks."
            },
            clinical_notes={
                "department": dept,
                "ai_confidence": random.randint(85, 99),
                "medication_safety_score": random.randint(90, 100),
                "recovery_score": random.randint(70, 95),
                "timeline": [
                    {"action": "Consultation Started", "timestamp": (consult_date - timedelta(minutes=15)).isoformat(), "user": doctor},
                    {"action": "Transcript Generated", "timestamp": consult_date.isoformat(), "user": "System"},
                    {"action": "Report Approved", "timestamp": (consult_date + timedelta(minutes=10)).isoformat(), "user": doctor}
                ] if status == "Approved" else []
            }
        )
        db.add(c)
    
    db.commit()
    return {"status": "success", "message": f"Seeded {num_reports} reports."}

