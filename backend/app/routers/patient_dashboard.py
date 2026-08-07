from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime, date
import uuid
import os

from app.database import get_db
from app.models.patient import Patient, PatientStatus
from app.models.consultation import Consultation

router = APIRouter(prefix="/api", tags=["Patient Portal"])


def _get_demo_patient(db: Session) -> Patient:
    patient = db.query(Patient).filter(Patient.status == PatientStatus.active).first()
    if not patient:
        patient = Patient(
            patient_id="MP-2026-8942",
            first_name="Rahul",
            last_name="Sharma",
            gender="Male",
            age=28,
            blood_group="O+",
            phone="9123456780",
            email="patient@medipilot.ai",
            address="Bengaluru, Karnataka",
            allergies="Penicillin",
            medical_conditions="Acute Bronchitis (Mild)",
            current_medications="Amoxicillin 500mg, Paracetamol 650mg",
            status=PatientStatus.active
        )
        db.add(patient)
        db.commit()
        db.refresh(patient)
    return patient


@router.get("/patient/dashboard")
def get_patient_dashboard(db: Session = Depends(get_db)):
    patient = _get_demo_patient(db)
    consultations = db.query(Consultation).filter(Consultation.patient_id == patient.id).all()

    return {
        "profile": {
            "id": str(patient.id),
            "patient_id": patient.patient_id,
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "gender": patient.gender,
            "age": patient.age,
            "blood_group": patient.blood_group,
            "phone": patient.phone,
            "email": patient.email,
            "address": patient.address,
            "allergies": patient.allergies,
            "medical_conditions": patient.medical_conditions,
            "current_medications": patient.current_medications,
            "status": patient.status.value,
            "created_at": patient.created_at.isoformat(),
            "updated_at": patient.updated_at.isoformat()
        },
        "medication_safety_score": 94,
        "recovery_score": 88,
        "recovery_trend": "+4% this week",
        "adherence_percentage": 92,
        "next_medicine": {
            "time": "08:00 PM",
            "name": "Amoxicillin 500mg"
        },
        "next_follow_up": "2026-08-14",
        "discharge_status": "Eligible for Discharge",
        "recovery_journey": [
            {"day": 1, "title": "Consultation & Prescription", "status": "completed"},
            {"day": 2, "title": "Medication Dosage Started", "status": "completed"},
            {"day": 3, "title": "Fever Reduction Observed", "status": "completed"},
            {"day": 4, "title": "Mid-recovery Check-in", "status": "in_progress"},
            {"day": 7, "title": "Final Recovery & Discharge", "status": "pending"}
        ],
        "current_prescription": {
            "id": "presc-101",
            "patient_id": patient.patient_id,
            "doctor_name": "Dr. Sarah Mitchell",
            "date": date.today().isoformat(),
            "status": "Active",
            "items": [
                {
                    "id": "m1",
                    "name": "Amoxicillin",
                    "dosage": "500mg",
                    "frequency": "Twice daily",
                    "timing": "After meals",
                    "duration": "5 days",
                    "prescribed_qty": 10,
                    "remaining_qty": 6,
                    "status": "Active",
                    "generic_alternative": {"name": "Moxipen 500mg", "savings": 35}
                },
                {
                    "id": "m2",
                    "name": "Paracetamol",
                    "dosage": "650mg",
                    "frequency": "As needed (max 3/day)",
                    "timing": "After meals",
                    "duration": "3 days",
                    "prescribed_qty": 9,
                    "remaining_qty": 4,
                    "status": "Active",
                    "generic_alternative": {"name": "Calpol 650mg", "savings": 20}
                }
            ]
        },
        "reports_count": max(len(consultations), 2)
    }


@router.get("/patient/recovery")
def get_patient_recovery(db: Session = Depends(get_db)):
    return {
        "recovery_score": 88,
        "recovery_trend": "+4% this week",
        "adherence_percentage": 92,
        "medication_safety_score": 94,
        "recovery_journey": [
            {"day": 1, "title": "Consultation & Diagnosis", "status": "completed"},
            {"day": 2, "title": "Medication Dosage Started", "status": "completed"},
            {"day": 3, "title": "Fever Stabilized (98.6°F)", "status": "completed"},
            {"day": 4, "title": "Symptom Check & Vitals Log", "status": "in_progress"},
            {"day": 7, "title": "Discharge Readiness Evaluation", "status": "pending"}
        ],
        "timeline_events": [
            {
                "id": 1,
                "date": "2026-08-05",
                "time": "10:30 AM",
                "type": "consultation",
                "title": "Initial AI Assisted Consultation",
                "description": "Diagnosed with acute bronchitis symptoms. Antibiotics prescribed.",
                "status": "completed"
            },
            {
                "id": 2,
                "date": "2026-08-06",
                "time": "08:00 AM",
                "type": "medication",
                "title": "Day 1 Dose Logged",
                "description": "Amoxicillin 500mg taken on schedule.",
                "status": "completed"
            },
            {
                "id": 3,
                "date": "2026-08-07",
                "time": "02:00 PM",
                "type": "vitals",
                "title": "Normal Temperature Logged",
                "description": "Fever resolved to 98.4°F.",
                "status": "completed"
            }
        ]
    }


@router.get("/patient/pharmacy")
def get_patient_pharmacy(db: Session = Depends(get_db)):
    return {
        "prescribed_medicines": [
            {
                "id": "m1",
                "name": "Amoxicillin",
                "dosage": "500mg",
                "frequency": "Twice daily",
                "timing": "After meals",
                "remaining_qty": 6,
                "generic_alternative": {"name": "Moxipen 500mg", "savings": 35},
                "interaction_warnings": ["Take with food to prevent mild stomach upset"]
            },
            {
                "id": "m2",
                "name": "Paracetamol",
                "dosage": "650mg",
                "frequency": "As needed (max 3/day)",
                "timing": "After meals",
                "remaining_qty": 4,
                "generic_alternative": {"name": "Calpol 650mg", "savings": 20},
                "interaction_warnings": ["Do not exceed 3000mg per 24 hours"]
            }
        ],
        "catalogue": [
            {"id": "cat-1", "name": "Amoxicillin 500mg", "generic_name": "Amoxicillin Trihydrate", "price": 14.50},
            {"id": "cat-2", "name": "Moxipen 500mg", "generic_name": "Amoxicillin Trihydrate", "price": 9.45},
            {"id": "cat-3", "name": "Paracetamol 650mg", "generic_name": "Acetaminophen", "price": 4.00},
            {"id": "cat-4", "name": "Calpol 650mg", "generic_name": "Acetaminophen", "price": 3.20},
            {"id": "cat-5", "name": "Cetirizine 10mg", "generic_name": "Cetirizine HCl", "price": 5.50}
        ],
        "reminders": [
            {"medicine": "Amoxicillin 500mg", "time": "08:00 AM", "taken": True},
            {"medicine": "Amoxicillin 500mg", "time": "08:00 PM", "taken": False},
            {"medicine": "Paracetamol 650mg", "time": "12:30 PM", "taken": True}
        ]
    }


@router.get("/patient/discharge")
def get_patient_discharge(db: Session = Depends(get_db)):
    return {
        "discharge_summary": "Patient showed significant improvement after 3 days of antibiotic therapy. Fever resolved and lung sounds clear. Safe for discharge with home oral medication continuation.",
        "discharge_date": "2026-08-08",
        "doctor_name": "Dr. Sarah Mitchell",
        "status": "Ready for Discharge",
        "invoices": [
            {"id": "inv-1001", "date": "2026-08-05", "type": "AI Consultation & Assessment", "amount": 75.00, "status": "Paid"},
            {"id": "inv-1002", "date": "2026-08-05", "type": "Pharmacy - Prescribed Medicines", "amount": 24.50, "status": "Paid"},
            {"id": "inv-1003", "date": "2026-08-07", "type": "Smart Clinical Summary & Discharge", "amount": 35.00, "status": "Pending"}
        ],
        "payment_status": "Partially Paid",
        "total_outstanding": 35.00
    }


@router.get("/patient/reports")
def get_patient_reports(db: Session = Depends(get_db)):
    patient = _get_demo_patient(db)
    consultations = db.query(Consultation).filter(Consultation.patient_id == patient.id).all()

    reports = []
    for c in consultations:
        reports.append({
            "id": str(c.id),
            "title": f"Consultation Summary - {c.consultation_id}",
            "date": c.consultation_date.isoformat(),
            "type": "AI Consultation Summary",
            "consultation_id": c.consultation_id
        })

    # Default fallback report if none in DB
    if not reports:
        reports = [
            {
                "id": "rep-demo-1",
                "title": "Clinical Consultation Report",
                "date": date.today().isoformat(),
                "type": "AI Consultation Summary",
                "consultation_id": "CONS-2026-0001"
            }
        ]

    return reports


@router.get("/patient/profile")
def get_patient_profile(db: Session = Depends(get_db)):
    patient = _get_demo_patient(db)
    return {
        "id": str(patient.id),
        "patient_id": patient.patient_id,
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "gender": patient.gender,
        "age": patient.age,
        "blood_group": patient.blood_group,
        "phone": patient.phone,
        "email": patient.email,
        "address": patient.address,
        "allergies": patient.allergies,
        "medical_conditions": patient.medical_conditions,
        "current_medications": patient.current_medications,
        "status": patient.status.value,
        "created_at": patient.created_at.isoformat(),
        "updated_at": patient.updated_at.isoformat()
    }


@router.get("/prescriptions")
def get_prescriptions(patient_id: str = None, db: Session = Depends(get_db)):
    return {
        "id": "presc-101",
        "patient_id": patient_id or "MP-2026-8942",
        "doctor_name": "Dr. Sarah Mitchell",
        "date": date.today().isoformat(),
        "status": "Active",
        "items": [
            {
                "id": "m1",
                "name": "Amoxicillin",
                "dosage": "500mg",
                "frequency": "Twice daily",
                "timing": "After meals",
                "duration": "5 days",
                "prescribed_qty": 10,
                "remaining_qty": 6,
                "status": "Active",
                "generic_alternative": {"name": "Moxipen 500mg", "savings": 35}
            },
            {
                "id": "m2",
                "name": "Paracetamol",
                "dosage": "650mg",
                "frequency": "As needed (max 3/day)",
                "timing": "After meals",
                "duration": "3 days",
                "prescribed_qty": 9,
                "remaining_qty": 4,
                "status": "Active",
                "generic_alternative": {"name": "Calpol 650mg", "savings": 20}
            }
        ]
    }


@router.put("/prescriptions/{prescription_id}")
def update_prescription(prescription_id: str, payload: dict, db: Session = Depends(get_db)):
    return {
        "id": prescription_id,
        "patient_id": "MP-2026-8942",
        "doctor_name": "Dr. Sarah Mitchell",
        "date": date.today().isoformat(),
        "status": "Updated",
        "items": payload.get("items", [])
    }
