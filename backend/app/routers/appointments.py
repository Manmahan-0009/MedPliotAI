import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date, timedelta
import uuid

from app.database import get_db
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.appointment import Appointment, AppointmentStatus
from app.models.notification import Notification

router = APIRouter(prefix="/api", tags=["Appointments"])

# Default slots used if doctor has no custom available_slots set
DEFAULT_SLOTS = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
                 "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
                 "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"]

# ── Pydantic Schemas ─────────────────────────────────────────────────────────

class AppointmentBookRequest(BaseModel):
    doctor_id: str
    patient_id: str
    appointment_date: str
    appointment_time: str
    slot: Optional[str] = "morning"
    consultation_type: Optional[str] = "In-Person Visit"
    reason: Optional[str] = "General Health Consultation"


class AppointmentStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None
    rescheduled_date: Optional[str] = None
    rescheduled_time: Optional[str] = None


# ── AI Checklist Helper ──────────────────────────────────────────────────────

def _generate_ai_checklist(department: str, reason: str) -> list:
    checklist = [
        "Bring previous blood test reports & medical history documents",
        "Keep current medication packaging or prescription list ready",
        "Estimated consultation duration: 20-30 minutes"
    ]
    dept_lower = (department or "").lower()
    reason_lower = (reason or "").lower()

    if "cardio" in dept_lower or "heart" in reason_lower or "bp" in reason_lower:
        checklist.append("Fasting required 8 hours prior if lipid profile test is scheduled")
        checklist.append("Avoid heavy caffeine 2 hours before BP reading")
    elif "diabet" in dept_lower or "sugar" in reason_lower:
        checklist.append("Fasting blood sugar log required (Fast for 8-10 hours)")
        checklist.append("Log your morning glucose reading if available")
    elif "ortho" in dept_lower or "joint" in reason_lower or "bone" in reason_lower:
        checklist.append("Bring recent X-Ray or MRI scans if available")
    elif "derma" in dept_lower or "skin" in reason_lower:
        checklist.append("Avoid applying creams or makeup to affected area 24 hrs before visit")
    elif "neuro" in dept_lower or "headache" in reason_lower or "seizure" in reason_lower:
        checklist.append("Log frequency & duration of symptoms in a headache diary")
    elif "gastro" in dept_lower or "stomach" in reason_lower or "digest" in reason_lower:
        checklist.append("Fast for 6 hours prior if endoscopy or abdominal scan is planned")

    return checklist


def _serialize_appointment(a: Appointment) -> dict:
    """Serialize a single appointment to dict."""
    status_val = a.status.value if hasattr(a.status, 'value') else str(a.status)
    return {
        "id": str(a.id),
        "appointment_id": a.appointment_id,
        "doctor_id": str(a.doctor_id),
        "patient_id": str(a.patient_id),
        "doctor_name": a.doctor_name,
        "patient_name": a.patient_name,
        "department": a.department,
        "appointment_date": a.appointment_date,
        "appointment_time": a.appointment_time,
        "slot": a.slot,
        "consultation_type": a.consultation_type,
        "reason": a.reason,
        "notes": a.notes,
        "status": status_val,
        "ai_checklist": a.ai_checklist or [],
        "rescheduled_date": a.rescheduled_date,
        "rescheduled_time": a.rescheduled_time,
        "created_at": a.created_at.isoformat()
    }


# ── Endpoints ──────────────────────────────────────────────────────────────

@router.get("/doctors/available")
def get_available_doctors(
    department: Optional[str] = None,
    query: Optional[str] = None,
    sort_by: Optional[str] = "name",  # name | rating | fee | experience
    db: Session = Depends(get_db)
):
    """Return all doctors from the database with their profile metadata."""
    doctors_query = db.query(Doctor)
    if department and department.lower() != "all":
        doctors_query = doctors_query.filter(Doctor.department.ilike(f"%{department}%"))
    if query:
        doctors_query = doctors_query.filter(
            (Doctor.full_name.ilike(f"%{query}%")) |
            (Doctor.specialization.ilike(f"%{query}%")) |
            (Doctor.department.ilike(f"%{query}%"))
        )

    doctors = doctors_query.all()

    # Fallback defaults for doctors that have null in new optional columns
    fallback_hospitals = [
        "MediPilot Super Speciality Hospital",
        "MediPilot Care Center",
        "MediPilot AI Clinical Wing",
    ]
    fallback_fees = ["₹800", "₹650", "₹1,000", "₹750", "₹500"]
    fallback_ratings = [4.9, 4.8, 5.0, 4.7, 4.6]
    fallback_slots = [
        ["09:00 AM", "10:30 AM", "02:00 PM", "04:30 PM"],
        ["10:00 AM", "11:30 AM", "03:00 PM", "05:30 PM"],
        ["08:30 AM", "11:00 AM", "01:30 PM", "06:00 PM"],
    ]

    result = []
    for idx, d in enumerate(doctors):
        # Resolve slots
        slots = DEFAULT_SLOTS[:8]
        if d.available_slots:
            try:
                slots = json.loads(d.available_slots)
            except Exception:
                slots = fallback_slots[idx % len(fallback_slots)]
        else:
            slots = fallback_slots[idx % len(fallback_slots)]

        result.append({
            "id": str(d.id),
            "full_name": d.full_name,
            "department": d.department or "General Medicine",
            "specialization": d.specialization or "Consultant Physician",
            "medical_registration_number": d.medical_registration_number,
            "phone": d.phone,
            "experience": f"{d.experience_years or (5 + idx % 15)} Years",
            "consultation_fee": d.consultation_fee or fallback_fees[idx % len(fallback_fees)],
            "hospital": d.hospital or fallback_hospitals[idx % len(fallback_hospitals)],
            "rating": d.rating or fallback_ratings[idx % len(fallback_ratings)],
            "today_slots": slots,
            "availability": d.availability_status or "Available Today",
            "profile_image_url": d.profile_image_url,
        })

    # Sort
    if sort_by == "rating":
        result.sort(key=lambda x: x["rating"] or 0, reverse=True)
    elif sort_by == "experience":
        result.sort(key=lambda x: int(str(x["experience"]).split()[0]) if x["experience"] else 0, reverse=True)
    elif sort_by == "fee":
        def fee_sort(item):
            try:
                return int(str(item["consultation_fee"]).replace("₹", "").replace(",", ""))
            except Exception:
                return 999999
        result.sort(key=fee_sort)
    else:
        result.sort(key=lambda x: x["full_name"] or "")

    return result


@router.get("/doctors/{doctor_id}/slots")
def get_doctor_slots(doctor_id: str, date_str: Optional[str] = Query(None, alias="date"), db: Session = Depends(get_db)):
    """Return available time slots for a doctor on a given date (excluding already-booked slots)."""
    try:
        doc_uuid = uuid.UUID(doctor_id)
        doctor = db.query(Doctor).filter(Doctor.id == doc_uuid).first()
    except Exception:
        doctor = db.query(Doctor).first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Get all slots
    all_slots = DEFAULT_SLOTS[:8]
    if doctor.available_slots:
        try:
            all_slots = json.loads(doctor.available_slots)
        except Exception:
            pass

    # Remove already booked slots for that date
    if date_str:
        booked = db.query(Appointment).filter(
            Appointment.doctor_id == doctor.id,
            Appointment.appointment_date == date_str,
            Appointment.status.in_([AppointmentStatus.pending, AppointmentStatus.confirmed])
        ).all()
        booked_times = {a.appointment_time for a in booked}
        all_slots = [s for s in all_slots if s not in booked_times]

    return {"doctor_id": doctor_id, "date": date_str, "available_slots": all_slots}


@router.post("/appointments/book")
def book_appointment(req: AppointmentBookRequest, db: Session = Depends(get_db)):
    # 1. Validate doctor
    doctor = None
    try:
        doc_uuid = uuid.UUID(req.doctor_id)
        doctor = db.query(Doctor).filter(Doctor.id == doc_uuid).first()
    except Exception:
        pass
    if not doctor:
        doctor = db.query(Doctor).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found in database")

    # 2. Validate patient
    patient = None
    try:
        pat_uuid = uuid.UUID(req.patient_id)
        patient = db.query(Patient).filter(Patient.id == pat_uuid).first()
    except Exception:
        patient = db.query(Patient).filter(Patient.patient_id == req.patient_id).first()
    if not patient:
        patient = db.query(Patient).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found in database")

    # 3. Prevent double booking on same slot
    existing = db.query(Appointment).filter(
        Appointment.doctor_id == doctor.id,
        Appointment.appointment_date == req.appointment_date,
        Appointment.appointment_time == req.appointment_time,
        Appointment.status.in_([AppointmentStatus.pending, AppointmentStatus.confirmed])
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="This time slot is already booked. Please select another slot.")

    # 4. Prevent booking in the past
    try:
        apt_date = datetime.strptime(req.appointment_date, "%Y-%m-%d").date()
        if apt_date < date.today():
            raise HTTPException(status_code=400, detail="Cannot book appointments in the past.")
    except ValueError:
        pass  # Non-standard date format — allow

    # 5. Prevent duplicate active appointment (same patient+doctor+date)
    duplicate = db.query(Appointment).filter(
        Appointment.doctor_id == doctor.id,
        Appointment.patient_id == patient.id,
        Appointment.appointment_date == req.appointment_date,
        Appointment.status.in_([AppointmentStatus.pending, AppointmentStatus.confirmed])
    ).first()
    if duplicate:
        raise HTTPException(status_code=400, detail="You already have an appointment with this doctor on this date.")

    # 6. Generate AI Checklist
    ai_checklist = _generate_ai_checklist(doctor.department or "General Medicine", req.reason or "")

    apt_id_str = f"APT-2026-{uuid.uuid4().hex[:6].upper()}"

    appointment = Appointment(
        appointment_id=apt_id_str,
        doctor_id=doctor.id,
        patient_id=patient.id,
        doctor_name=doctor.full_name,
        patient_name=f"{patient.first_name} {patient.last_name}",
        department=doctor.department or "General Medicine",
        appointment_date=req.appointment_date,
        appointment_time=req.appointment_time,
        slot=req.slot or "morning",
        consultation_type=req.consultation_type or "In-Person Visit",
        reason=req.reason,
        status=AppointmentStatus.pending,
        ai_checklist=ai_checklist
    )

    db.add(appointment)

    # 7. Notify Doctor
    doctor_notif = Notification(
        user_id=doctor.user_id if hasattr(doctor, 'user_id') else None,
        doctor_id=doctor.id,
        recipient_role="doctor",
        title="New Appointment Request 📅",
        message=f"{patient.first_name} {patient.last_name} requested an appointment on {req.appointment_date} at {req.appointment_time}. Reason: {req.reason or 'General Consultation'}",
        type="appointment_booked",
        reference_id=apt_id_str
    )
    db.add(doctor_notif)

    # 8. Notify Patient
    patient_notif = Notification(
        patient_id=patient.id,
        recipient_role="patient",
        title="Appointment Request Sent ✅",
        message=f"Your appointment request with {doctor.full_name} on {req.appointment_date} at {req.appointment_time} has been sent. Status: Pending confirmation.",
        type="appointment_booked",
        reference_id=apt_id_str
    )
    db.add(patient_notif)

    db.commit()
    db.refresh(appointment)

    return {
        "message": "Appointment Booked Successfully",
        "appointment": _serialize_appointment(appointment),
        "doctor": {
            "full_name": doctor.full_name,
            "department": doctor.department,
            "specialization": doctor.specialization,
            "hospital": doctor.hospital or "MediPilot Super Speciality Hospital",
            "consultation_fee": doctor.consultation_fee or "₹500",
        }
    }


@router.get("/appointments/patient/{patient_id}")
def get_patient_appointments(patient_id: str, db: Session = Depends(get_db)):
    patient = None
    try:
        pat_uuid = uuid.UUID(patient_id)
        patient = db.query(Patient).filter(Patient.id == pat_uuid).first()
    except Exception:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        patient = db.query(Patient).first()

    appointments = []
    if patient:
        appointments = db.query(Appointment).filter(
            Appointment.patient_id == patient.id
        ).order_by(Appointment.created_at.desc()).all()

    return [_serialize_appointment(a) for a in appointments]


@router.get("/appointments/patient/{patient_id}/stats")
def get_patient_appointment_stats(patient_id: str, db: Session = Depends(get_db)):
    """Stats summary for patient dashboard widget."""
    patient = None
    try:
        pat_uuid = uuid.UUID(patient_id)
        patient = db.query(Patient).filter(Patient.id == pat_uuid).first()
    except Exception:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        patient = db.query(Patient).first()

    if not patient:
        return {"pending": 0, "confirmed": 0, "total": 0, "upcoming": []}

    appointments = db.query(Appointment).filter(
        Appointment.patient_id == patient.id
    ).order_by(Appointment.appointment_date.asc()).all()

    pending = sum(1 for a in appointments if a.status == AppointmentStatus.pending)
    confirmed = sum(1 for a in appointments if a.status == AppointmentStatus.confirmed)

    upcoming = [
        _serialize_appointment(a) for a in appointments
        if a.status in [AppointmentStatus.pending, AppointmentStatus.confirmed]
    ][:3]

    return {
        "pending": pending,
        "confirmed": confirmed,
        "total": len(appointments),
        "upcoming": upcoming
    }


@router.get("/appointments/doctor/{doctor_id}")
def get_doctor_appointments(doctor_id: str, db: Session = Depends(get_db)):
    doctor = None
    try:
        doc_uuid = uuid.UUID(doctor_id)
        doctor = db.query(Doctor).filter(Doctor.id == doc_uuid).first()
    except Exception:
        doctor = db.query(Doctor).first()

    appointments = []
    if doctor:
        appointments = db.query(Appointment).filter(
            Appointment.doctor_id == doctor.id
        ).order_by(Appointment.created_at.desc()).all()

    result = {
        "pending": [], "confirmed": [], "rescheduled": [],
        "rejected": [], "completed": [], "cancelled": [], "all": []
    }

    for a in appointments:
        item = _serialize_appointment(a)
        st = item["status"]
        result["all"].append(item)
        if st in result:
            result[st].append(item)

    return result


@router.get("/appointments/doctor/{doctor_id}/pending")
def get_doctor_pending_appointments(doctor_id: str, db: Session = Depends(get_db)):
    """Fast endpoint for the pending requests badge/widget on doctor dashboard."""
    doctor = None
    try:
        doc_uuid = uuid.UUID(doctor_id)
        doctor = db.query(Doctor).filter(Doctor.id == doc_uuid).first()
    except Exception:
        doctor = db.query(Doctor).first()

    if not doctor:
        return {"pending": [], "count": 0}

    pending = db.query(Appointment).filter(
        Appointment.doctor_id == doctor.id,
        Appointment.status == AppointmentStatus.pending
    ).order_by(Appointment.created_at.desc()).all()

    return {
        "pending": [_serialize_appointment(a) for a in pending],
        "count": len(pending)
    }


@router.get("/appointments/{appointment_id}")
def get_appointment_detail(appointment_id: str, db: Session = Depends(get_db)):
    """Single appointment detail."""
    appt = None
    try:
        apt_uuid = uuid.UUID(appointment_id)
        appt = db.query(Appointment).filter(Appointment.id == apt_uuid).first()
    except Exception:
        appt = db.query(Appointment).filter(Appointment.appointment_id == appointment_id).first()

    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    data = _serialize_appointment(appt)

    # Enrich with patient details
    patient = db.query(Patient).filter(Patient.id == appt.patient_id).first()
    if patient:
        data["patient_details"] = {
            "age": patient.age,
            "gender": patient.gender,
            "blood_group": patient.blood_group,
            "phone": patient.phone,
            "email": patient.email,
            "allergies": patient.allergies,
            "medical_conditions": patient.medical_conditions,
            "current_medications": patient.current_medications,
        }

    # Enrich with doctor details
    doctor = db.query(Doctor).filter(Doctor.id == appt.doctor_id).first()
    if doctor:
        data["doctor_details"] = {
            "specialization": doctor.specialization,
            "department": doctor.department,
            "hospital": doctor.hospital,
            "consultation_fee": doctor.consultation_fee,
            "rating": doctor.rating,
        }

    return data


@router.put("/appointments/{appointment_id}/status")
def update_appointment_status(appointment_id: str, req: AppointmentStatusUpdate, db: Session = Depends(get_db)):
    appt = None
    try:
        apt_uuid = uuid.UUID(appointment_id)
        appt = db.query(Appointment).filter(Appointment.id == apt_uuid).first()
    except Exception:
        appt = db.query(Appointment).filter(Appointment.appointment_id == appointment_id).first()

    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    new_status = req.status.lower()
    if new_status in ("confirmed", "accepted"):
        appt.status = AppointmentStatus.confirmed
        notif_title = "Appointment Confirmed ✅"
        notif_msg = f"Dr. {appt.doctor_name} has confirmed your appointment on {appt.appointment_date} at {appt.appointment_time}."
    elif new_status == "rejected":
        appt.status = AppointmentStatus.rejected
        notif_title = "Appointment Rejected ❌"
        notif_msg = f"Dr. {appt.doctor_name} has rejected your appointment request for {appt.appointment_date}. Please book another slot."
    elif new_status == "rescheduled":
        appt.status = AppointmentStatus.rescheduled
        if req.rescheduled_date:
            appt.rescheduled_date = req.rescheduled_date
        if req.rescheduled_time:
            appt.rescheduled_time = req.rescheduled_time
        new_date = req.rescheduled_date or appt.appointment_date
        new_time = req.rescheduled_time or appt.appointment_time
        notif_title = "Appointment Rescheduled 📅"
        notif_msg = f"Dr. {appt.doctor_name} has rescheduled your appointment to {new_date} at {new_time}."
    elif new_status == "completed":
        appt.status = AppointmentStatus.completed
        notif_title = "Consultation Completed 🎉"
        notif_msg = f"Your consultation with Dr. {appt.doctor_name} on {appt.appointment_date} has been marked as completed."
    elif new_status == "cancelled":
        appt.status = AppointmentStatus.cancelled
        notif_title = "Appointment Cancelled"
        notif_msg = f"Your appointment with Dr. {appt.doctor_name} on {appt.appointment_date} has been cancelled."
    else:
        raise HTTPException(status_code=400, detail=f"Invalid status: {req.status}")

    if req.notes:
        appt.notes = req.notes

    # Notify patient
    pat_notif = Notification(
        patient_id=appt.patient_id,
        recipient_role="patient",
        title=notif_title,
        message=notif_msg,
        type=f"appointment_{appt.status.value}",
        reference_id=appt.appointment_id
    )
    db.add(pat_notif)

    db.commit()
    db.refresh(appt)

    return {"message": "Appointment status updated successfully", "status": appt.status.value, "appointment": _serialize_appointment(appt)}


@router.put("/appointments/{appointment_id}/cancel")
def cancel_appointment(appointment_id: str, db: Session = Depends(get_db)):
    appt = None
    try:
        apt_uuid = uuid.UUID(appointment_id)
        appt = db.query(Appointment).filter(Appointment.id == apt_uuid).first()
    except Exception:
        appt = db.query(Appointment).filter(Appointment.appointment_id == appointment_id).first()

    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appt.status = AppointmentStatus.cancelled

    # Notify doctor
    doc_notif = Notification(
        doctor_id=appt.doctor_id,
        recipient_role="doctor",
        title="Appointment Cancelled by Patient",
        message=f"{appt.patient_name} has cancelled their appointment scheduled for {appt.appointment_date} at {appt.appointment_time}.",
        type="appointment_cancelled",
        reference_id=appt.appointment_id
    )
    db.add(doc_notif)

    # Also notify patient
    pat_notif = Notification(
        patient_id=appt.patient_id,
        recipient_role="patient",
        title="Appointment Cancelled",
        message=f"Your appointment with Dr. {appt.doctor_name} on {appt.appointment_date} has been cancelled.",
        type="appointment_cancelled",
        reference_id=appt.appointment_id
    )
    db.add(pat_notif)

    db.commit()
    return {"message": "Appointment cancelled successfully"}
