import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.consultation import Consultation
from app.models.patient import Patient
from app.schemas.consultation import ConsultationSave, ConsultationOut

router = APIRouter(prefix="/api/consultations", tags=["Consultations"])


@router.post("", response_model=ConsultationOut, status_code=201)
def save_consultation(payload: ConsultationSave, db: Session = Depends(get_db)):
    """
    Save a completed consultation (transcript + AI summary) linked to a patient.
    Called automatically after the Whisper + Groq workflow completes.
    """
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    consultation = Consultation(
        consultation_id=f"CONS-{uuid.uuid4().hex[:8].upper()}",
        patient_id=payload.patient_id,
        doctor_name=payload.doctor_name,
        transcript=payload.transcript,
        ai_summary=payload.ai_summary,
        pdf_path=payload.pdf_path,
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)
    return consultation


@router.get("/patient/{patient_id}", response_model=List[ConsultationOut])
def get_patient_consultations(patient_id: str, db: Session = Depends(get_db)):
    """Return all consultations for a given patient UUID."""
    consultations = (
        db.query(Consultation)
        .filter(Consultation.patient_id == patient_id)
        .order_by(Consultation.consultation_date.desc())
        .all()
    )
    return consultations
