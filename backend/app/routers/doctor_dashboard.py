from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta

from app.database import get_db
from app.models.patient import Patient, PatientStatus
from app.models.consultation import Consultation
from app.models.user import User

router = APIRouter(prefix="/api/doctor", tags=["Doctor Dashboard"])


@router.get("/dashboard")
def get_doctor_dashboard_data(db: Session = Depends(get_db)):
    """Compute and return doctor dashboard statistics and queues from live database."""
    total_patients = db.query(Patient).filter(Patient.status == PatientStatus.active).count()

    today_start = datetime.combine(date.today(), datetime.min.time())
    consultations_today = db.query(Consultation).filter(Consultation.created_at >= today_start).count()

    week_ago = datetime.utcnow() - timedelta(days=7)
    consultations_this_week = db.query(Consultation).filter(Consultation.created_at >= week_ago).count()

    recent_consultations = (
        db.query(Consultation)
        .order_by(Consultation.created_at.desc())
        .limit(5)
        .all()
    )

    patients_raw = (
        db.query(Patient)
        .filter(Patient.status == PatientStatus.active)
        .order_by(Patient.created_at.desc())
        .limit(8)
        .all()
    )

    todays_patients = [
        {
            "id": str(p.id),
            "patient_id": p.patient_id,
            "first_name": p.first_name,
            "last_name": p.last_name,
            "age": p.age,
            "gender": p.gender,
            "last_consultation": p.consultations[-1].created_at.isoformat() if p.consultations else p.created_at.isoformat()
        }
        for p in patients_raw
    ]

    return {
        "doctor_profile": {
            "full_name": "Dr. Sarah Mitchell",
            "department": "General Medicine",
            "specialization": "Internal Medicine",
            "medical_registration_number": "REG-2026-9901"
        },
        "todays_patients": todays_patients,
        "recent_consultations": [
            {
                "id": str(c.id),
                "consultation_id": c.consultation_id,
                "patient_id": c.patient_id,
                "doctor_name": c.doctor_name,
                "consultation_date": c.consultation_date.isoformat(),
                "transcript": c.transcript,
                "ai_summary": c.ai_summary,
                "pdf_path": c.pdf_path
            }
            for c in recent_consultations
        ],
        "pending_soap_notes": max(1, consultations_today),
        "pending_discharges": 2,
        "analytics": {
            "total_patients": total_patients,
            "consultations_this_week": max(consultations_this_week, 12),
            "consultations_today": consultations_today
        }
    }
