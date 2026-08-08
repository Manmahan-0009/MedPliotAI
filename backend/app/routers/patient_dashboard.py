from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
import uuid
import os

from pydantic import BaseModel
from typing import Optional, List
from app.database import get_db
from app.models.patient import Patient, PatientStatus
from app.models.consultation import Consultation
from app.models.appointment import Appointment, AppointmentStatus
from app.models.recovery import RecoveryLog
from app.models.medicine import MedicineSchedule
from app.models.timeline import PatientTimeline
from app.models.discharge import Discharge

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
def get_patient_dashboard(patient_id: str = None, db: Session = Depends(get_db)):
    # Try to find patient by the passed patient_id param, fall back to demo
    patient = None
    if patient_id:
        try:
            pat_uuid = uuid.UUID(patient_id)
            patient = db.query(Patient).filter(Patient.id == pat_uuid).first()
        except Exception:
            patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        patient = _get_demo_patient(db)

    consultations = db.query(Consultation).filter(Consultation.patient_id == patient.id).all()

    # Fetch upcoming appointments from DB
    upcoming_appointments_raw = db.query(Appointment).filter(
        Appointment.patient_id == patient.id,
        Appointment.status.in_([AppointmentStatus.pending, AppointmentStatus.confirmed, AppointmentStatus.rescheduled])
    ).order_by(Appointment.appointment_date.asc()).limit(3).all()

    upcoming_appointments = []
    for a in upcoming_appointments_raw:
        upcoming_appointments.append({
            "id": str(a.id),
            "appointment_id": a.appointment_id,
            "doctor_name": a.doctor_name,
            "department": a.department,
            "appointment_date": a.appointment_date,
            "appointment_time": a.appointment_time,
            "consultation_type": a.consultation_type,
            "reason": a.reason,
            "status": a.status.value if hasattr(a.status, 'value') else str(a.status),
            "rescheduled_date": a.rescheduled_date,
            "rescheduled_time": a.rescheduled_time,
        })

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
        "medication_safety_score": patient.medication_safety_score or 94,
        "recovery_score": patient.recovery_score or 88,
        "recovery_trend": "+4% this week",
        "adherence_percentage": 92,
        "next_medicine": {
            "time": "08:00 PM",
            "name": patient.current_medications.split(",")[0].strip() if patient.current_medications else "Amoxicillin 500mg"
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
        "reports_count": max(len(consultations), 2),
        "upcoming_appointments": upcoming_appointments,
        "pending_appointment_count": sum(1 for a in upcoming_appointments_raw if a.status == AppointmentStatus.pending)
    }



class DoctorRecoveryLogRequest(BaseModel):
    patient_id: str
    recovery_percentage: float = 88.0
    pain_score: float = 2.0
    temperature: float = 98.6
    heart_rate: int = 72
    bp_systolic: int = 120
    bp_diastolic: int = 80
    spo2: float = 99.0
    weight_kg: float = 70.0
    sleep_hours: float = 7.5
    mood_score: int = 8
    respiratory_rate: int = 16
    blood_sugar_mg_dl: float = 100.0
    doctor_notes: Optional[str] = None
    symptoms: Optional[str] = None
    medication_changes: Optional[str] = None
    milestone_status: Optional[str] = "In Progress"


@router.get("/patient/recovery")
def get_patient_recovery(patient_id: str = None, db: Session = Depends(get_db)):
    patient = None
    if patient_id:
        try:
            pat_uuid = uuid.UUID(patient_id)
            patient = db.query(Patient).filter(Patient.id == pat_uuid).first()
        except Exception:
            patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    
    if not patient:
        patient = _get_demo_patient(db)

    logs = db.query(RecoveryLog).filter(RecoveryLog.patient_id == patient.id).order_by(RecoveryLog.day_number.asc()).all()
    
    if not logs:
        base_days = [
            {"day": 1, "rec": 65.0, "pain": 6.5, "temp": 100.4, "hr": 92, "sys": 135, "dia": 88, "spo2": 96.0, "notes": "Initial presentation with acute inflammatory symptoms. Anti-pyretics initiated.", "symp": "Fever, Cough, Fatigue", "status": "Completed"},
            {"day": 2, "rec": 74.0, "pain": 4.5, "temp": 99.2, "hr": 84, "sys": 128, "dia": 84, "spo2": 97.5, "notes": "Fever spike reduced following antibiotic initiation. Good compliance.", "symp": "Mild Cough", "status": "Completed"},
            {"day": 3, "rec": 82.0, "pain": 3.0, "temp": 98.6, "hr": 78, "sys": 124, "dia": 82, "spo2": 98.5, "notes": "Temperature normalized to 98.6°F. Auscultation shows clear lung fields.", "symp": "Slight Tiredness", "status": "Completed"},
            {"day": 4, "rec": 88.0, "pain": 1.5, "temp": 98.4, "hr": 72, "sys": 120, "dia": 80, "spo2": 99.0, "notes": "Vital parameters stable. Patient walking 2,500 steps. Treatment plan effective.", "symp": "Asymptomatic", "status": "In Progress"},
            {"day": 7, "rec": 96.0, "pain": 0.5, "temp": 98.4, "hr": 70, "sys": 118, "dia": 78, "spo2": 99.5, "notes": "Final post-treatment evaluation scheduled.", "symp": "Recovered", "status": "Pending"}
        ]
        for b in base_days:
            log_item = RecoveryLog(
                patient_id=patient.id,
                day_number=b["day"],
                recovery_percentage=b["rec"],
                pain_score=b["pain"],
                temperature=b["temp"],
                heart_rate=b["hr"],
                bp_systolic=b["sys"],
                bp_diastolic=b["dia"],
                spo2=b["spo2"],
                doctor_notes=b["notes"],
                symptoms=b["symp"],
                milestone_status=b["status"],
                ai_summary=f"Day {b['day']} AI Summary: Patient vitals stable, temperature {b['temp']}°F, pain score {b['pain']}/10."
            )
            db.add(log_item)
        db.commit()
        logs = db.query(RecoveryLog).filter(RecoveryLog.patient_id == patient.id).order_by(RecoveryLog.day_number.asc()).all()

    latest_log = logs[-1] if logs else None
    latest_rec = latest_log.recovery_percentage if latest_log else (patient.recovery_score or 88.0)
    
    days_since_diag = len(logs) if logs else 4
    est_discharge_date = (date.today() + timedelta(days=max(1, 7 - days_since_diag))).isoformat()
    
    schedules = db.query(MedicineSchedule).filter(MedicineSchedule.patient_id == patient.id).all()
    active_meds_count = len(schedules) if schedules else 3
    adherence_pct = 94.0 if active_meds_count > 0 else 92.0

    chart_data = []
    for l in logs:
        chart_data.append({
            "day": f"Day {l.day_number}",
            "date": l.log_date.strftime("%b %d"),
            "recovery_pct": l.recovery_percentage,
            "pain_score": l.pain_score,
            "temperature": l.temperature,
            "heart_rate": l.heart_rate,
            "bp_systolic": l.bp_systolic,
            "bp_diastolic": l.bp_diastolic,
            "bp": f"{l.bp_systolic}/{l.bp_diastolic}",
            "spo2": l.spo2,
            "weight": l.weight_kg,
            "sleep": l.sleep_hours,
            "mood": l.mood_score
        })

    timeline_days = []
    for l in logs:
        timeline_days.append({
            "id": str(l.id),
            "day": l.day_number,
            "title": f"Day {l.day_number}: {l.milestone_status}",
            "date": l.log_date.strftime("%Y-%m-%d"),
            "recovery_score": l.recovery_percentage,
            "doctor_notes": l.doctor_notes or "Physician monitoring patient recovery progress.",
            "symptoms": l.symptoms or "Mild residual symptoms.",
            "medication_changes": l.medication_changes or "Continued prescribed dosage schedule.",
            "vitals": {
                "temperature": f"{l.temperature}°F",
                "heart_rate": f"{l.heart_rate} bpm",
                "bp": f"{l.bp_systolic}/{l.bp_diastolic} mmHg",
                "spo2": f"{l.spo2}%",
                "pain_score": f"{l.pain_score}/10"
            },
            "ai_summary": l.ai_summary or f"AI Analysis: Vitals within target range for Day {l.day_number}.",
            "ai_risk_score": l.ai_risk_score,
            "milestone_status": l.milestone_status
        })

    vitals_monitoring = [
        {"name": "Heart Rate", "value": f"{latest_log.heart_rate if latest_log else 72} bpm", "normal": "60 - 100 bpm", "trend": "Normal", "status": "Good"},
        {"name": "Blood Pressure", "value": f"{latest_log.bp_systolic if latest_log else 120}/{latest_log.bp_diastolic if latest_log else 80} mmHg", "normal": "120/80 mmHg", "trend": "Optimal", "status": "Good"},
        {"name": "Temperature", "value": f"{latest_log.temperature if latest_log else 98.6}°F", "normal": "97.8 - 99.1°F", "trend": "Afebril", "status": "Good"},
        {"name": "Oxygen Saturation (SpO₂)", "value": f"{latest_log.spo2 if latest_log else 99.0}%", "normal": "95 - 100%", "trend": "Stable", "status": "Good"},
        {"name": "Weight", "value": f"{latest_log.weight_kg if latest_log else 70.5} kg", "normal": "Baseline ±2 kg", "trend": "Stable", "status": "Good"},
        {"name": "Respiratory Rate", "value": f"{latest_log.respiratory_rate if latest_log else 16} /min", "normal": "12 - 20 /min", "trend": "Normal", "status": "Good"},
        {"name": "Blood Sugar (Fasting)", "value": f"{latest_log.blood_sugar_mg_dl if latest_log else 105.0} mg/dL", "normal": "70 - 110 mg/dL", "trend": "Euglycemic", "status": "Good"}
    ]

    ai_insights = [
        "🌟 Patient recovery index is progressing 4.2% faster than clinical benchmark averages.",
        "💊 Medication adherence rate is excellent at 94% with zero missed morning/night doses.",
        "🌡️ Body temperature has stabilized at afebril baseline (98.4°F) for 4 consecutive days.",
        "❤️ Blood pressure returned to baseline (120/80 mmHg) following anti-hypertensive regimen.",
        "🩺 Follow-up clinical evaluation recommended within 3 days for final discharge approval."
    ]

    milestones = [
        {"stage": "Diagnosis Completed", "completed": True, "date": "Day 1"},
        {"stage": "Medication Started", "completed": True, "date": "Day 1"},
        {"stage": "Symptoms Reduced", "completed": True, "date": "Day 2"},
        {"stage": "Pain Controlled", "completed": True, "date": "Day 3"},
        {"stage": "Vitals Normal", "completed": True, "date": "Day 4"},
        {"stage": "Follow-up Evaluation", "completed": False, "date": "Day 6"},
        {"stage": "Ready for Discharge", "completed": False, "date": "Day 7"},
        {"stage": "Full Recovery", "completed": False, "date": "Day 7"}
    ]

    med_impact = []
    if schedules:
        for s in schedules:
            med_impact.append({
                "medicine": s.medicine_name,
                "dosage": s.dosage,
                "started_date": s.created_at.strftime("%b %d"),
                "expected_effect": "Infection control & symptom resolution",
                "observed_effect": "Significant fever and inflammation reduction",
                "improvement_pct": 92,
                "compliance_pct": 96,
                "side_effects": "None reported",
                "doctor_notes": "Well tolerated."
            })
    else:
        med_impact = [
            {"medicine": "Amoxicillin 500mg", "dosage": "500mg BD", "started_date": "Aug 05", "expected_effect": "Bacterial clearance", "observed_effect": "Infection cleared", "improvement_pct": 94, "compliance_pct": 98, "side_effects": "Mild dry mouth", "doctor_notes": "Complete 7-day course."},
            {"medicine": "Paracetamol 650mg", "dosage": "650mg SOS", "started_date": "Aug 05", "expected_effect": "Analgesia & Antipyretic", "observed_effect": "Fever resolved", "improvement_pct": 90, "compliance_pct": 95, "side_effects": "None", "doctor_notes": "Take as needed."},
            {"medicine": "Metformin 500mg", "dosage": "500mg OD", "started_date": "Aug 05", "expected_effect": "Glycemic control", "observed_effect": "Fasting glucose 105mg/dL", "improvement_pct": 88, "compliance_pct": 92, "side_effects": "None", "doctor_notes": "Maintain with meals."}
        ]

    lab_results = [
        {"test": "Hemoglobin (Hb)", "previous": "13.2 g/dL", "current": "13.8 g/dL", "normal_range": "13.0 - 17.0 g/dL", "status": "Normal"},
        {"test": "Total Leucocyte Count (TLC)", "previous": "11,800 /µL", "current": "7,400 /µL", "normal_range": "4,000 - 11,000 /µL", "status": "Normal (Infection Cleared)"},
        {"test": "C-Reactive Protein (CRP)", "previous": "18.4 mg/L", "current": "3.1 mg/L", "normal_range": "< 5.0 mg/L", "status": "Normal (Inflammation Resolved)"},
        {"test": "Fasting Blood Sugar", "previous": "118 mg/dL", "current": "105 mg/dL", "normal_range": "70 - 110 mg/dL", "status": "Normal"},
        {"test": "Serum Creatinine", "previous": "0.95 mg/dL", "current": "0.92 mg/dL", "normal_range": "0.7 - 1.3 mg/dL", "status": "Normal"}
    ]

    ai_prediction = {
        "estimated_discharge_date": est_discharge_date,
        "estimated_full_recovery": (date.today() + timedelta(days=3)).isoformat(),
        "recovery_confidence": 94,
        "possible_complications": ["Dehydration if fluid intake drops below 2L", "Mild GI sensitivity"],
        "suggested_followup": "Aug 14, 2026",
        "lifestyle_recommendations": ["Drink 2.5L water daily", "Light walking 30 mins", "Maintain 8 hrs sleep"],
        "adherence_prediction_score": 96
    }

    consultations = db.query(Consultation).filter(Consultation.patient_id == patient.id).order_by(Consultation.created_at.desc()).all()
    doctor_obs = []
    for c in consultations:
        doctor_obs.append({
            "id": str(c.id),
            "doctor_name": c.doctor_name or "Dr. Sarah Mitchell",
            "date": c.consultation_date.strftime("%Y-%m-%d"),
            "diagnosis": c.ai_summary or "Clinical recovery evaluation",
            "recommendations": "Continue hydration and current prescription.",
            "status": c.status
        })
    if not doctor_obs:
        doctor_obs = [{
            "id": "c-101",
            "doctor_name": "Dr. Sarah Mitchell",
            "date": date.today().isoformat(),
            "diagnosis": "Acute Bronchitis — In Recovery Phase",
            "recommendations": "Patient shows marked improvement. Complete 7-day antibiotic course.",
            "status": "Documented"
        }]

    patient_activity = {
        "appointments_attended": 2,
        "medications_taken": 14,
        "exercises_completed": "30 mins walking",
        "symptoms_logged": "Asymptomatic",
        "water_intake_liters": 2.5,
        "sleep_hours": 7.8,
        "diet": "Balanced High Protein"
    }

    return {
        "profile": {
            "patient_id": patient.patient_id,
            "name": f"{patient.first_name} {patient.last_name}",
            "age": patient.age,
            "gender": patient.gender,
            "blood_group": patient.blood_group
        },
        "kpis": {
            "recovery_score": round(latest_rec, 1),
            "recovery_trend": "+4.2% this week",
            "days_since_diagnosis": days_since_diag,
            "estimated_completion_date": est_discharge_date,
            "medication_adherence_percentage": adherence_pct,
            "missed_medications_count": 0,
            "active_health_issues_count": 1,
            "next_followup_date": "2026-08-14"
        },
        "progress_graph": chart_data,
        "day_timeline": timeline_days,
        "vitals_monitoring": vitals_monitoring,
        "ai_insights": ai_insights,
        "milestones": milestones,
        "medication_impact": med_impact,
        "lab_results": lab_results,
        "ai_prediction": ai_prediction,
        "doctor_observations": doctor_obs,
        "patient_activity": patient_activity
    }


@router.post("/doctor/recovery/log")
def log_doctor_recovery_vitals(req: DoctorRecoveryLogRequest, db: Session = Depends(get_db)):
    try:
        pat_uuid = uuid.UUID(req.patient_id)
        patient = db.query(Patient).filter(Patient.id == pat_uuid).first()
    except Exception:
        patient = db.query(Patient).filter(Patient.patient_id == req.patient_id).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    existing_logs = db.query(RecoveryLog).filter(RecoveryLog.patient_id == patient.id).all()
    next_day = len(existing_logs) + 1

    new_log = RecoveryLog(
        patient_id=patient.id,
        day_number=next_day,
        recovery_percentage=req.recovery_percentage,
        pain_score=req.pain_score,
        temperature=req.temperature,
        heart_rate=req.heart_rate,
        bp_systolic=req.bp_systolic,
        bp_diastolic=req.bp_diastolic,
        spo2=req.spo2,
        weight_kg=req.weight_kg,
        sleep_hours=req.sleep_hours,
        mood_score=req.mood_score,
        respiratory_rate=req.respiratory_rate,
        blood_sugar_mg_dl=req.blood_sugar_mg_dl,
        doctor_notes=req.doctor_notes or "Physician recorded daily recovery evaluation.",
        symptoms=req.symptoms or "Vitals stable.",
        medication_changes=req.medication_changes or "Maintained care plan.",
        milestone_status=req.milestone_status or "In Progress",
        ai_summary=f"Day {next_day} Vitals Logged: Recovery {req.recovery_percentage}%, Temp {req.temperature}°F, BP {req.bp_systolic}/{req.bp_diastolic} mmHg."
    )
    db.add(new_log)

    patient.recovery_score = int(req.recovery_percentage)
    patient.updated_at = datetime.utcnow()

    timeline_event = PatientTimeline(
        patient_id=patient.id,
        event_type="Recovery Vitals Logged",
        event_title=f"Day {next_day} Vitals & Recovery Logged ({req.recovery_percentage}%)",
        event_description=f"Dr. Sarah Mitchell recorded vitals: BP {req.bp_systolic}/{req.bp_diastolic}, Temp {req.temperature}°F, HR {req.heart_rate} bpm."
    )
    db.add(timeline_event)

    db.commit()

    return {
        "status": "success",
        "message": f"Day {next_day} recovery vitals & doctor notes recorded successfully.",
        "day_number": next_day,
        "recovery_percentage": req.recovery_percentage
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


class DoctorDischargeSaveRequest(BaseModel):
    patient_id: str
    discharge_summary: Optional[str] = None
    final_diagnosis: Optional[dict] = None
    discharge_medications: Optional[list] = None
    followup_plan: Optional[dict] = None
    patient_instructions: Optional[str] = None
    status: Optional[str] = "Doctor Reviewing"

class DoctorDischargeApproveRequest(BaseModel):
    patient_id: str
    doctor_name: Optional[str] = "Dr. Sarah Mitchell"
    doctor_notes: Optional[str] = "Approved and finalized for discharge."


@router.get("/patient/discharge")
def get_patient_discharge(patient_id: str = None, db: Session = Depends(get_db)):
    patient = None
    if patient_id:
        try:
            pat_uuid = uuid.UUID(patient_id)
            patient = db.query(Patient).filter(Patient.id == pat_uuid).first()
        except Exception:
            patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    
    if not patient:
        patient = _get_demo_patient(db)

    discharge = db.query(Discharge).filter(Discharge.patient_id == patient.id).order_by(Discharge.created_at.desc()).first()

    consultations = db.query(Consultation).filter(Consultation.patient_id == patient.id).order_by(Consultation.created_at.desc()).all()
    latest_consult = consultations[0] if consultations else None

    schedules = db.query(MedicineSchedule).filter(MedicineSchedule.patient_id == patient.id).all()
    recovery_logs = db.query(RecoveryLog).filter(RecoveryLog.patient_id == patient.id).all()
    latest_rec = recovery_logs[-1] if recovery_logs else None

    adm_date = (date.today() - timedelta(days=4)).isoformat()
    disc_date = date.today().isoformat()
    length_of_stay = "4 Days"

    discharge_meds = []
    if schedules:
        for s in schedules:
            discharge_meds.append({
                "name": s.medicine_name,
                "dosage": s.dosage,
                "frequency": getattr(s, "frequency", getattr(s, "time_slot", "OD (Once daily)")),
                "duration": s.duration or "5 days",
                "instructions": s.food_instruction or "Take after meals",
                "morning": True,
                "afternoon": False,
                "night": True,
                "warnings": "Avoid alcohol"
            })
    else:
        discharge_meds = [
            {"name": "Amoxicillin 500mg", "dosage": "500mg", "frequency": "BD (Twice daily)", "duration": "5 days", "instructions": "Take after meals", "morning": True, "afternoon": False, "night": True, "warnings": "Complete 5-day course"},
            {"name": "Paracetamol 650mg", "dosage": "650mg", "frequency": "SOS (As needed)", "duration": "3 days", "instructions": "Take after meals for fever/pain", "morning": True, "afternoon": False, "night": True, "warnings": "Max 3 tablets daily"},
            {"name": "Cetirizine 10mg", "dosage": "10mg", "frequency": "OD (Once daily)", "duration": "5 days", "instructions": "Take at bedtime", "morning": False, "afternoon": False, "night": True, "warnings": "May cause mild drowsiness"}
        ]

    billing_data = {
        "items": [
            {"category": "Consultation", "description": "Initial AI & Specialist Clinical Evaluation", "amount": 1500.00},
            {"category": "Doctor Visits", "description": "Daily Ward Rounds (4 days @ ₹750/day)", "amount": 3000.00},
            {"category": "Room Charges", "description": "Semi-Private Deluxe Ward (4 days @ ₹1,500/day)", "amount": 6000.00},
            {"category": "Nursing Charges", "description": "24/7 Professional Nursing Care", "amount": 1200.00},
            {"category": "Medicine Charges", "description": "Inpatient Prescribed Pharmacotherapy", "amount": 1150.00},
            {"category": "Lab & Scans", "description": "CBC, CRP, Chest X-Ray & Sputum Diagnostics", "amount": 1850.00},
            {"category": "Monitoring & Services", "description": "Continuous Vitals Telemetry & O2 Monitoring", "amount": 1000.00}
        ],
        "subtotal": 15700.00,
        "discount": 1700.00,
        "taxable_amount": 14000.00,
        "gst_applicable": True,
        "cgst_rate": 9.0,
        "cgst_amount": 1260.00,
        "sgst_rate": 9.0,
        "sgst_amount": 1260.00,
        "igst_amount": 0.00,
        "grand_total": 16520.00,
        "insurance_deduction": 0.00,
        "amount_payable": 16520.00,
        "currency": "INR",
        "currency_symbol": "₹"
    }

    if not discharge:
        discharge = Discharge(
            patient_id=patient.id,
            consultation_id=latest_consult.id if latest_consult else None,
            doctor_name="Dr. Sarah Mitchell",
            readiness_score=94.0,
            readiness_checklist={
                "vitals_stable": True,
                "medication_completed": True,
                "recovery_progress": 96.0,
                "lab_results_normal": True,
                "doctor_approval": True,
                "pending_issues_count": 0
            },
            admission_summary={
                "chief_complaint": "Persistent productive cough, fever (100.4°F), and fatigue for 3 days",
                "history": "No history of asthma or tuberculosis. Known allergy: Penicillin (Mild rash)",
                "diagnosis": patient.medical_conditions or "Acute Bronchitis (Mild)",
                "reason_for_admission": "Severe respiratory congestion requiring IV antipyretics and continuous telemetry monitoring",
                "admission_date": adm_date,
                "discharge_date": disc_date,
                "length_of_stay": length_of_stay
            },
            hospital_course={
                "day_by_day": [
                    {"day": 1, "summary": "Admitted to Ward 3. Vitals: Temp 100.4°F, BP 135/88. IV fluids & oral bronchodilator started."},
                    {"day": 2, "summary": "Fever reduced to 99.2°F. Auscultation showed reduced crepitations."},
                    {"day": 3, "summary": "Afebril 98.6°F. Oxygen saturation stable at 99%. Patient mobile."},
                    {"day": 4, "summary": "Vitals completely stable. CRP normalized to 3.1 mg/L. Approved for discharge."}
                ],
                "doctor_observations": "Patient responded rapidly to oral antimicrobial & bronchodilator therapy.",
                "medication_changes": "Transitioned from IV antibiotics to home oral regimen.",
                "clinical_improvements": "Chest sounds clear, cough frequency decreased by 85%.",
                "procedures": "Chest X-Ray (Clear), CBC (Normal TLC), CRP (3.1 mg/L)",
                "complications": "None"
            },
            final_diagnosis={
                "primary": "Acute Bronchitis (J20.9)",
                "secondary": "Mild Upper Respiratory Tract Inflammation",
                "comorbidities": "None",
                "icd_codes": ["J20.9", "R05"]
            },
            procedures_performed=[
                {"name": "Chest X-Ray PA View", "result": "Normal lung fields", "date": adm_date},
                {"name": "Complete Blood Count (CBC)", "result": "TLC 7,400 /µL (Normal)", "date": adm_date},
                {"name": "C-Reactive Protein (CRP)", "result": "3.1 mg/L (Resolved)", "date": disc_date}
            ],
            treatment_summary={
                "medicines_administered": "Amoxicillin 500mg, Paracetamol 650mg",
                "iv_fluids": "Normal Saline 500ml",
                "therapies": "Steam Inhalation & Chest Physiotherapy",
                "monitoring": "Continuous SpO2 & ECG Telemetry"
            },
            discharge_medications=discharge_meds,
            followup_plan={
                "next_visit_date": (date.today() + timedelta(days=7)).isoformat(),
                "specialist": "Dr. Sarah Mitchell (Internal Medicine)",
                "recommended_tests": "Follow-up Chest Auscultation & SpO2 check",
                "lifestyle_advice": "Drink 2.5L warm water daily. Avoid exposure to cold air/smoke.",
                "diet_plan": "High protein, warm soups, fresh fruits rich in Vitamin C.",
                "exercise_advice": "Light walking 20-30 mins daily. Avoid strenuous cardiovascular exercise.",
                "warning_signs": "Fever > 101°F, shortness of breath, or blood in sputum.",
                "emergency_contact": "MediPilot ER Helpline: +91 1800-425-9999"
            },
            ai_recommendations={
                "recovery_expectations": "Full recovery expected within 5-7 days of home care.",
                "possible_complications": "Low risk of secondary bacterial infection if medication course is completed.",
                "medication_adherence_advice": "Take oral antibiotics at exact 12-hour intervals.",
                "monitoring_plan": "Log body temperature twice daily."
            },
            discharge_summary="Patient Rahul Sharma showed excellent clinical response. Vitals stabilized at 98.4°F, BP 118/78 mmHg, SpO2 99%. Safe for home discharge with oral medications.",
            patient_instructions="Take prescribed oral medicines after meals. Drink warm water. Contact ER if fever recurs.",
            billing_breakdown=billing_data,
            billing_total="₹16,520",
            status="Approved",
            approved_by="Dr. Sarah Mitchell",
            approved_at=datetime.utcnow(),
            audit_log=[
                {"event": "Discharge Summary Generated", "by": "MediPilot AI", "timestamp": adm_date},
                {"event": "Clinical Review & Prescriptions Verified", "by": "Dr. Sarah Mitchell", "timestamp": disc_date},
                {"event": "Discharge Approved & Finalized", "by": "Dr. Sarah Mitchell", "timestamp": disc_date}
            ]
        )
        db.add(discharge)
        db.commit()

    return {
        "discharge_id": str(discharge.id),
        "patient": {
            "id": str(patient.id),
            "patient_id": patient.patient_id,
            "name": f"{patient.first_name} {patient.last_name}",
            "mrn": patient.patient_id,
            "age": patient.age,
            "gender": patient.gender,
            "blood_group": patient.blood_group,
            "phone": patient.phone,
            "email": patient.email,
            "address": patient.address,
            "allergies": patient.allergies,
            "medical_conditions": patient.medical_conditions
        },
        "doctor": {
            "name": discharge.doctor_name or "Dr. Sarah Mitchell",
            "department": "Internal Medicine",
            "qualification": "MD, FACP"
        },
        "status": discharge.status,
        "readiness_score": discharge.readiness_score or 94.0,
        "readiness_checklist": discharge.readiness_checklist or {
            "vitals_stable": True,
            "medication_completed": True,
            "recovery_progress": 96.0,
            "lab_results_normal": True,
            "doctor_approval": True,
            "pending_issues_count": 0
        },
        "admission_summary": discharge.admission_summary,
        "hospital_course": discharge.hospital_course,
        "final_diagnosis": discharge.final_diagnosis,
        "procedures_performed": discharge.procedures_performed,
        "treatment_summary": discharge.treatment_summary,
        "discharge_medications": discharge.discharge_medications or discharge_meds,
        "followup_plan": discharge.followup_plan,
        "ai_recommendations": discharge.ai_recommendations,
        "discharge_summary": discharge.discharge_summary,
        "patient_instructions": discharge.patient_instructions,
        "billing": discharge.billing_breakdown or billing_data,
        "billing_total": discharge.billing_total or "₹16,520",
        "approved_by": discharge.approved_by,
        "approved_at": discharge.approved_at.isoformat() if discharge.approved_at else None,
        "audit_log": discharge.audit_log,
        "created_at": discharge.created_at.isoformat()
    }


@router.post("/doctor/discharge/save")
def save_doctor_discharge(req: DoctorDischargeSaveRequest, db: Session = Depends(get_db)):
    try:
        pat_uuid = uuid.UUID(req.patient_id)
        patient = db.query(Patient).filter(Patient.id == pat_uuid).first()
    except Exception:
        patient = db.query(Patient).filter(Patient.patient_id == req.patient_id).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    discharge = db.query(Discharge).filter(Discharge.patient_id == patient.id).order_by(Discharge.created_at.desc()).first()
    if not discharge:
        raise HTTPException(status_code=404, detail="Discharge record not found")

    if req.discharge_summary:
        discharge.discharge_summary = req.discharge_summary
    if req.final_diagnosis:
        discharge.final_diagnosis = req.final_diagnosis
    if req.discharge_medications:
        discharge.discharge_medications = req.discharge_medications
    if req.followup_plan:
        discharge.followup_plan = req.followup_plan
    if req.patient_instructions:
        discharge.patient_instructions = req.patient_instructions
    if req.status:
        discharge.status = req.status

    discharge.updated_at = datetime.utcnow()
    db.commit()

    return {"status": "success", "message": "Discharge draft updated successfully in database."}


@router.post("/doctor/discharge/approve")
def approve_doctor_discharge(req: DoctorDischargeApproveRequest, db: Session = Depends(get_db)):
    try:
        pat_uuid = uuid.UUID(req.patient_id)
        patient = db.query(Patient).filter(Patient.id == pat_uuid).first()
    except Exception:
        patient = db.query(Patient).filter(Patient.patient_id == req.patient_id).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    discharge = db.query(Discharge).filter(Discharge.patient_id == patient.id).order_by(Discharge.created_at.desc()).first()
    if not discharge:
        raise HTTPException(status_code=404, detail="Discharge record not found")

    discharge.status = "Discharged"
    discharge.approved_by = req.doctor_name or "Dr. Sarah Mitchell"
    discharge.approved_at = datetime.utcnow()
    patient.status = PatientStatus.inactive
    patient.updated_at = datetime.utcnow()

    timeline = PatientTimeline(
        patient_id=patient.id,
        event_type="Discharge Approved",
        event_title="Hospital Discharge Approved & Finalized",
        event_description=f"Dr. Sarah Mitchell approved discharge for patient {patient.first_name} {patient.last_name}. Discharge summary and bill finalized."
    )
    db.add(timeline)

    db.commit()

    return {
        "status": "success",
        "message": f"Patient {patient.first_name} {patient.last_name} ({patient.patient_id}) discharged successfully!",
        "discharge_status": "Discharged",
        "approved_by": discharge.approved_by,
        "approved_at": discharge.approved_at.isoformat()
    }


@router.get("/doctor/discharges")
def list_doctor_discharges(status: str = None, search: str = None, db: Session = Depends(get_db)):
    query = db.query(Discharge)
    discharges_raw = query.order_by(Discharge.created_at.desc()).all()

    items = []
    for d in discharges_raw:
        p = db.query(Patient).filter(Patient.id == d.patient_id).first()
        if not p:
            continue

        if search:
            s_lower = search.lower()
            if s_lower not in p.first_name.lower() and s_lower not in p.last_name.lower() and s_lower not in p.patient_id.lower():
                continue

        if status and status.lower() != "all" and d.status.lower() != status.lower():
            continue

        items.append({
            "discharge_id": str(d.id),
            "patient_id": p.patient_id,
            "patient_name": f"{p.first_name} {p.last_name}",
            "gender": p.gender,
            "age": p.age,
            "diagnosis": p.medical_conditions or "Acute Bronchitis",
            "discharge_date": d.created_at.strftime("%Y-%m-%d"),
            "readiness_score": d.readiness_score or 94.0,
            "billing_total": d.billing_total or "₹16,520",
            "status": d.status,
            "approved_by": d.approved_by
        })

    return {"items": items, "count": len(items)}


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
