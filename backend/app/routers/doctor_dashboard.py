from datetime import date, datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.patient import Patient, PatientStatus
from app.models.consultation import Consultation
from app.models.appointment import Appointment, AppointmentStatus
from app.models.doctor import Doctor
from app.models.notification import Notification

router = APIRouter(prefix="/api/doctor", tags=["Doctor Dashboard"])


# Persistent In-Memory State Store for Interactive Modules
STORE_APPOINTMENTS = [
    {
        "id": "app-1",
        "patient_name": "Rahul Sharma",
        "patient_id": "MP-2026-8942",
        "time": "11:30 AM",
        "slot": "morning",
        "type": "Follow-up",
        "status": "In Consultation",
        "priority": "High",
        "duration": "30 mins",
        "date": date.today().isoformat()
    },
    {
        "id": "app-2",
        "patient_name": "Ananya Roy",
        "patient_id": "MP-2026-8943",
        "time": "02:15 PM",
        "slot": "afternoon",
        "type": "General Checkup",
        "status": "Scheduled",
        "priority": "Routine",
        "duration": "20 mins",
        "date": date.today().isoformat()
    },
    {
        "id": "app-3",
        "patient_name": "Vikram Malhotra",
        "patient_id": "MP-2026-8944",
        "time": "04:00 PM",
        "slot": "afternoon",
        "type": "Lab Report Review",
        "status": "Scheduled",
        "priority": "High",
        "duration": "15 mins",
        "date": date.today().isoformat()
    },
    {
        "id": "app-4",
        "patient_name": "Priya Verma",
        "patient_id": "MP-2026-8945",
        "time": "05:30 PM",
        "slot": "evening",
        "type": "Prescription Refill",
        "status": "Checked In",
        "priority": "Routine",
        "duration": "15 mins",
        "date": date.today().isoformat()
    }
]

STORE_TASKS = [
    {
        "id": "t-1",
        "title": "Review AI SOAP draft for MP-2026-8942 (Rahul Sharma)",
        "completed": False,
        "priority": "High",
        "estimated_time": "10 mins",
        "patient_name": "Rahul Sharma",
        "due_time": "12:00 PM",
        "task_type": "SOAP Review",
        "status": "Pending"
    },
    {
        "id": "t-2",
        "title": "Sign off discharge summary for Ward 3 Patient MP-2026-0003",
        "completed": False,
        "priority": "High",
        "estimated_time": "15 mins",
        "patient_name": "Suresh Patel",
        "due_time": "01:30 PM",
        "task_type": "Discharge Requests",
        "status": "Pending"
    },
    {
        "id": "t-3",
        "title": "Approve generic substitution savings for Pharmacy",
        "completed": True,
        "priority": "Medium",
        "estimated_time": "5 mins",
        "patient_name": "Pharmacy",
        "due_time": "10:30 AM",
        "task_type": "Medication Approval",
        "status": "Completed"
    },
    {
        "id": "t-4",
        "title": "Check evening vitals log for post-op patients",
        "completed": False,
        "priority": "Medium",
        "estimated_time": "10 mins",
        "patient_name": "Post-op Recovery",
        "due_time": "04:30 PM",
        "task_type": "Follow-up Patients",
        "status": "Pending"
    }
]

STORE_AI_RECOMMENDED_TASKS = [
    {"id": "ai-t-1", "title": "Review diabetic patient HbA1c elevation (>8.5%) for MP-2026-8943", "type": "Lab Review", "priority": "High", "patient_name": "Ananya Roy"},
    {"id": "ai-t-2", "title": "Follow up abnormal ECG rhythm alert for Ward 2 Patient", "type": "High Risk", "priority": "High", "patient_name": "Vikram Malhotra"},
    {"id": "ai-t-3", "title": "Medication interaction review: Warfarin + NSAID warning", "type": "Safety Review", "priority": "High", "patient_name": "Priya Verma"}
]

STORE_ACTIVITY_FEED = [
    {
        "id": "act-1",
        "time": "10 minutes ago",
        "timestamp": datetime.utcnow().isoformat(),
        "type": "consultation",
        "title": "Consultation Completed",
        "description": "AI SOAP notes generated for Rahul Sharma (MP-2026-8942)",
        "patient_name": "Rahul Sharma",
        "user": "Dr. Sarah Mitchell",
        "status": "Approved"
    },
    {
        "id": "act-2",
        "time": "45 minutes ago",
        "timestamp": (datetime.utcnow() - timedelta(minutes=45)).isoformat(),
        "type": "prescription",
        "title": "Prescription Approved",
        "description": "Amoxicillin & Paracetamol dosage finalized for Priya Verma",
        "patient_name": "Priya Verma",
        "user": "Dr. Sarah Mitchell",
        "status": "Completed"
    },
    {
        "id": "act-3",
        "time": "2 hours ago",
        "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
        "type": "discharge",
        "title": "Smart Discharge Approved",
        "description": "Discharge checklist validated for Patient MP-2026-0003",
        "patient_name": "Suresh Patel",
        "user": "Dr. Sarah Mitchell",
        "status": "Signed"
    },
    {
        "id": "act-4",
        "time": "3 hours ago",
        "timestamp": (datetime.utcnow() - timedelta(hours=3)).isoformat(),
        "type": "lab",
        "title": "Lab Report Uploaded",
        "description": "CBC and Electrolyte panel uploaded for Ananya Roy",
        "patient_name": "Ananya Roy",
        "user": "Lab System",
        "status": "Ready"
    }
]

STORE_PATIENT_QUEUE = [
    {
        "id": "q-1",
        "queue_number": 1,
        "patient_id": "MP-2026-8942",
        "patient_name": "Rahul Sharma",
        "waiting_time": "8 mins",
        "appointment_time": "11:30 AM",
        "priority": "High",
        "type": "Follow-up",
        "status": "In Consultation"
    },
    {
        "id": "q-2",
        "queue_number": 2,
        "patient_id": "MP-2026-8945",
        "patient_name": "Priya Verma",
        "waiting_time": "14 mins",
        "appointment_time": "01:00 PM",
        "priority": "Routine",
        "type": "Prescription Refill",
        "status": "Checked In"
    },
    {
        "id": "q-3",
        "queue_number": 3,
        "patient_id": "MP-2026-8943",
        "patient_name": "Ananya Roy",
        "waiting_time": "2 mins",
        "appointment_time": "02:15 PM",
        "priority": "High",
        "type": "General Checkup",
        "status": "Waiting"
    },
    {
        "id": "q-4",
        "queue_number": 4,
        "patient_id": "MP-2026-8944",
        "patient_name": "Vikram Malhotra",
        "waiting_time": "0 mins",
        "appointment_time": "04:00 PM",
        "priority": "Routine",
        "type": "Lab Report Review",
        "status": "Scheduled"
    }
]

STORE_LAYOUT_PREFERENCES = {
    "widgets": [
        {"id": "stat_cards", "visible": True, "collapsed": False, "order": 1},
        {"id": "patient_queue", "visible": True, "collapsed": False, "order": 2},
        {"id": "upcoming_appointments", "visible": True, "collapsed": False, "order": 3},
        {"id": "todays_tasks", "visible": True, "collapsed": False, "order": 4},
        {"id": "recent_activity", "visible": True, "collapsed": False, "order": 5}
    ]
}

# Request Schemas
class RescheduleRequest(BaseModel):
    appointment_id: str
    new_slot: str
    new_time: Optional[str] = None
    new_date: Optional[str] = None

class TaskStatusUpdate(BaseModel):
    status: str
    completed: Optional[bool] = None

class QueueReorderRequest(BaseModel):
    queue_ids: List[str]

class QueueActionRequest(BaseModel):
    action: str  # "start" | "skip" | "complete" | "move_up" | "move_down"

class QueueStatusUpdateRequest(BaseModel):
    status: str  # "Waiting" | "Ready" | "In Consultation" | "Follow-up" | "Completed" | "Skipped"
    position: Optional[int] = None

class TaskPriorityUpdateRequest(BaseModel):
    priority: str  # "High" | "Medium" | "Low"
    status: Optional[str] = None
    completed: Optional[bool] = None

class LayoutPreferencesRequest(BaseModel):
    widgets: List[dict]

# Helper to generate live dynamic patient queue from database
def build_dynamic_patient_queue(db: Session) -> List[dict]:
    global STORE_PATIENT_QUEUE
    patients = db.query(Patient).filter(Patient.status == PatientStatus.active).all()
    if not patients:
        return STORE_PATIENT_QUEUE

    # Map database patients into queue records if custom reorder store is empty
    if not STORE_PATIENT_QUEUE or len(STORE_PATIENT_QUEUE) < len(patients):
        statuses = ["In Consultation", "Checked In", "Ready for Consultation", "Waiting", "Waiting"]
        priorities = ["High", "Routine", "High", "Routine", "High"]
        types = ["Follow-up", "Prescription Refill", "General Checkup", "Lab Report Review", "Follow-up"]
        times = ["11:30 AM", "01:00 PM", "02:15 PM", "04:00 PM", "05:30 PM"]

        dynamic_queue = []
        for idx, p in enumerate(patients[:6]):
            dynamic_queue.append({
                "id": f"q-{p.patient_id}",
                "queue_number": idx + 1,
                "patient_id": p.patient_id,
                "patient_name": f"{p.first_name} {p.last_name}",
                "age": p.age or 28,
                "gender": p.gender or "Male",
                "waiting_time": f"{(idx + 1) * 6} mins",
                "appointment_time": times[idx % len(times)],
                "priority": priorities[idx % len(priorities)],
                "type": types[idx % len(types)],
                "status": statuses[idx % len(statuses)] if idx < len(statuses) else "Waiting"
            })
        STORE_PATIENT_QUEUE = dynamic_queue

    return STORE_PATIENT_QUEUE



def _get_pending_request_count(db: Session) -> int:
    """Count of pending appointment requests for first doctor in DB."""
    try:
        doctor = db.query(Doctor).first()
        if not doctor:
            return 0
        return db.query(Appointment).filter(
            Appointment.doctor_id == doctor.id,
            Appointment.status == AppointmentStatus.pending
        ).count()
    except Exception:
        return 0


def _get_db_appointments_summary(db: Session) -> dict:
    """Get today's and upcoming DB appointments for dashboard widget."""
    try:
        doctor = db.query(Doctor).first()
        if not doctor:
            return {"today": [], "upcoming": [], "pending": []}

        today_str = date.today().isoformat()
        tomorrow_str = (date.today() + timedelta(days=1)).isoformat()
        week_end_str = (date.today() + timedelta(days=7)).isoformat()

        all_apts = db.query(Appointment).filter(
            Appointment.doctor_id == doctor.id
        ).order_by(Appointment.appointment_date.asc(), Appointment.appointment_time.asc()).all()

        def serialize(a):
            return {
                "id": str(a.id),
                "appointment_id": a.appointment_id,
                "patient_name": a.patient_name,
                "patient_id": str(a.patient_id),
                "appointment_date": a.appointment_date,
                "appointment_time": a.appointment_time,
                "consultation_type": a.consultation_type,
                "department": a.department,
                "reason": a.reason,
                "status": a.status.value if hasattr(a.status, 'value') else str(a.status),
                "rescheduled_date": a.rescheduled_date,
                "rescheduled_time": a.rescheduled_time,
            }

        today_apts = [serialize(a) for a in all_apts if a.appointment_date == today_str]
        upcoming_apts = [serialize(a) for a in all_apts if today_str < a.appointment_date <= week_end_str and a.status.value in ("confirmed", "pending")]
        pending_apts = [serialize(a) for a in all_apts if a.status.value == "pending"]

        return {"today": today_apts, "upcoming": upcoming_apts, "pending": pending_apts}
    except Exception as e:
        return {"today": [], "upcoming": [], "pending": []}


@router.get("/dashboard")
def get_doctor_dashboard_data(db: Session = Depends(get_db)):
    """Compute and return doctor dashboard statistics, activity timeline, tasks, and queues from live database."""
    total_patients = db.query(Patient).filter(Patient.status == PatientStatus.active).count()

    today_start = datetime.combine(date.today(), datetime.min.time())
    consultations_today = db.query(Consultation).filter(Consultation.created_at >= today_start).count()

    week_ago = datetime.utcnow() - timedelta(days=7)
    consultations_this_week = db.query(Consultation).filter(Consultation.created_at >= week_ago).count()
    total_consultations = db.query(Consultation).count()

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
            "blood_group": p.blood_group,
            "phone": p.phone,
            "medical_conditions": p.medical_conditions,
            "last_consultation": p.consultations[-1].created_at.isoformat() if p.consultations else p.created_at.isoformat()
        }
        for p in patients_raw
    ]

    completed_tasks_count = sum(1 for t in STORE_TASKS if t.get("completed"))
    total_tasks_count = len(STORE_TASKS)

    active_queue = build_dynamic_patient_queue(db)

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
            "consultations_today": consultations_today,
            "pending_reports": max(1, consultations_today),
            "recovery_monitoring": max(total_patients, 5),
            "discharges_today": 2,
            "ai_reports_generated": max(total_consultations, 18),
            "tasks_completed_today": completed_tasks_count,
            "tasks_total_today": total_tasks_count
        },
        "recent_activity": STORE_ACTIVITY_FEED,
        "upcoming_appointments": STORE_APPOINTMENTS,
        "todays_tasks": STORE_TASKS,
        "ai_recommended_tasks": STORE_AI_RECOMMENDED_TASKS,
        "patient_queue": active_queue,
        "layout_preferences": STORE_LAYOUT_PREFERENCES,
        "pending_request_count": _get_pending_request_count(db),
        "db_appointments": _get_db_appointments_summary(db)
    }


# ── Interactive Module Endpoints ─────────────────────────────────────────────

@router.get("/appointments")
def get_appointments(db: Session = Depends(get_db)):
    """Return DB-backed appointments for the doctor (first doctor in DB for demo, replace with auth-aware doctor_id)."""
    doctor = db.query(Doctor).first()
    if not doctor:
        return {"pending": [], "confirmed": [], "rescheduled": [], "rejected": [], "completed": [], "cancelled": [], "all": []}

    appointments = db.query(Appointment).filter(
        Appointment.doctor_id == doctor.id
    ).order_by(Appointment.created_at.desc()).all()

    result = {"pending": [], "confirmed": [], "rescheduled": [], "rejected": [], "completed": [], "cancelled": [], "all": []}
    for a in appointments:
        st = a.status.value if hasattr(a.status, 'value') else str(a.status)
        item = {
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
            "status": st,
            "ai_checklist": a.ai_checklist or [],
            "rescheduled_date": a.rescheduled_date,
            "rescheduled_time": a.rescheduled_time,
            "created_at": a.created_at.isoformat()
        }
        result["all"].append(item)
        if st in result:
            result[st].append(item)

    # Also include legacy in-memory appointments for backward compat (merge)
    return result


@router.get("/appointments/pending")
def get_pending_appointments(doctor_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Fast endpoint specifically for pending requests widget."""
    if doctor_id:
        try:
            doc_uuid = uuid.UUID(doctor_id)
            doctor = db.query(Doctor).filter(Doctor.id == doc_uuid).first()
        except Exception:
            doctor = db.query(Doctor).filter(Doctor.full_name.ilike(f"%{doctor_id}%")).first()
    else:
        doctor = db.query(Doctor).filter(Doctor.full_name == "Dr. Sarah Mitchell").first() or db.query(Doctor).first()

    if doctor:
        pending = db.query(Appointment).filter(
            Appointment.doctor_id == doctor.id,
            Appointment.status == AppointmentStatus.pending
        ).order_by(Appointment.created_at.desc()).all()
    else:
        pending = db.query(Appointment).filter(
            Appointment.status == AppointmentStatus.pending
        ).order_by(Appointment.created_at.desc()).all()
    items = []
    for a in pending:
        patient = db.query(Patient).filter(Patient.id == a.patient_id).first()
        item = {
            "id": str(a.id),
            "appointment_id": a.appointment_id,
            "patient_name": a.patient_name,
            "patient_id": str(a.patient_id),
            "department": a.department,
            "appointment_date": a.appointment_date,
            "appointment_time": a.appointment_time,
            "consultation_type": a.consultation_type,
            "reason": a.reason,
            "status": "pending",
            "created_at": a.created_at.isoformat(),
            "patient_age": patient.age if patient else None,
            "patient_gender": patient.gender if patient else None,
            "patient_blood_group": patient.blood_group if patient else None,
            "patient_phone": patient.phone if patient else None,
            "patient_conditions": patient.medical_conditions if patient else None,
        }
        items.append(item)
    return {"pending": items, "count": len(items)}


class AppointmentActionRequest(BaseModel):
    notes: Optional[str] = None
    rescheduled_date: Optional[str] = None
    rescheduled_time: Optional[str] = None


@router.post("/appointments/{appointment_id}/accept")
def accept_appointment(appointment_id: str, req: AppointmentActionRequest = AppointmentActionRequest(), db: Session = Depends(get_db)):
    import uuid as _uuid
    appt = None
    try:
        apt_uuid = _uuid.UUID(appointment_id)
        appt = db.query(Appointment).filter(Appointment.id == apt_uuid).first()
    except Exception:
        appt = db.query(Appointment).filter(Appointment.appointment_id == appointment_id).first()

    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appt.status = AppointmentStatus.confirmed
    if req.notes:
        appt.notes = req.notes

    notif = Notification(
        patient_id=appt.patient_id,
        recipient_role="patient",
        title="Appointment Confirmed ✅",
        message=f"Dr. {appt.doctor_name} has confirmed your appointment on {appt.appointment_date} at {appt.appointment_time}.",
        type="appointment_confirmed",
        reference_id=appt.appointment_id
    )
    db.add(notif)

    STORE_ACTIVITY_FEED.insert(0, {
        "id": f"act-{len(STORE_ACTIVITY_FEED)+1}",
        "time": "Just now",
        "timestamp": datetime.utcnow().isoformat(),
        "type": "appointment",
        "title": "Appointment Accepted",
        "description": f"Appointment with {appt.patient_name} on {appt.appointment_date} at {appt.appointment_time} confirmed.",
        "patient_name": appt.patient_name,
        "user": appt.doctor_name,
        "status": "Confirmed"
    })

    db.commit()
    return {"message": "Appointment confirmed", "status": "confirmed"}


@router.post("/appointments/{appointment_id}/reject")
def reject_appointment(appointment_id: str, req: AppointmentActionRequest = AppointmentActionRequest(), db: Session = Depends(get_db)):
    import uuid as _uuid
    appt = None
    try:
        apt_uuid = _uuid.UUID(appointment_id)
        appt = db.query(Appointment).filter(Appointment.id == apt_uuid).first()
    except Exception:
        appt = db.query(Appointment).filter(Appointment.appointment_id == appointment_id).first()

    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appt.status = AppointmentStatus.rejected
    if req.notes:
        appt.notes = req.notes

    notif = Notification(
        patient_id=appt.patient_id,
        recipient_role="patient",
        title="Appointment Not Available ❌",
        message=f"Dr. {appt.doctor_name} is unable to take your appointment on {appt.appointment_date}. Please choose another slot.",
        type="appointment_rejected",
        reference_id=appt.appointment_id
    )
    db.add(notif)

    db.commit()
    return {"message": "Appointment rejected", "status": "rejected"}


@router.post("/appointments/{appointment_id}/reschedule")
def reschedule_appointment_db(appointment_id: str, req: AppointmentActionRequest, db: Session = Depends(get_db)):
    import uuid as _uuid
    if not req.rescheduled_date or not req.rescheduled_time:
        raise HTTPException(status_code=400, detail="rescheduled_date and rescheduled_time are required")

    appt = None
    try:
        apt_uuid = _uuid.UUID(appointment_id)
        appt = db.query(Appointment).filter(Appointment.id == apt_uuid).first()
    except Exception:
        appt = db.query(Appointment).filter(Appointment.appointment_id == appointment_id).first()

    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appt.status = AppointmentStatus.rescheduled
    appt.rescheduled_date = req.rescheduled_date
    appt.rescheduled_time = req.rescheduled_time
    if req.notes:
        appt.notes = req.notes

    notif = Notification(
        patient_id=appt.patient_id,
        recipient_role="patient",
        title="Appointment Rescheduled 📅",
        message=f"Dr. {appt.doctor_name} has rescheduled your appointment to {req.rescheduled_date} at {req.rescheduled_time}.",
        type="appointment_rescheduled",
        reference_id=appt.appointment_id
    )
    db.add(notif)

    db.commit()
    return {"message": "Appointment rescheduled", "status": "rescheduled", "new_date": req.rescheduled_date, "new_time": req.rescheduled_time}

@router.post("/appointments/reschedule")
def reschedule_appointment(req: RescheduleRequest):
    for app in STORE_APPOINTMENTS:
        if app["id"] == req.appointment_id:
            app["slot"] = req.new_slot
            if req.new_time:
                app["time"] = req.new_time
            if req.new_date:
                app["date"] = req.new_date
            
            # Log activity
            STORE_ACTIVITY_FEED.insert(0, {
                "id": f"act-{len(STORE_ACTIVITY_FEED)+1}",
                "time": "Just now",
                "timestamp": datetime.utcnow().isoformat(),
                "type": "appointment",
                "title": "Appointment Rescheduled",
                "description": f"{app['patient_name']} rescheduled to {app['slot'].title()} slot ({app['time']})",
                "patient_name": app["patient_name"],
                "user": "Dr. Sarah Mitchell",
                "status": "Rescheduled"
            })
            return {"message": "Appointment Rescheduled Successfully", "appointment": app}
    return {"error": "Appointment not found"}

@router.get("/tasks")
def get_tasks():
    return {
        "tasks": STORE_TASKS,
        "ai_recommendations": STORE_AI_RECOMMENDED_TASKS,
        "completed_count": sum(1 for t in STORE_TASKS if t.get("completed")),
        "total_count": len(STORE_TASKS)
    }

@router.post("/tasks/{task_id}/status")
def update_task_status(task_id: str, req: TaskStatusUpdate):
    for t in STORE_TASKS:
        if t["id"] == task_id:
            t["status"] = req.status
            if req.completed is not None:
                t["completed"] = req.completed
            elif req.status == "Completed":
                t["completed"] = True
            
            STORE_ACTIVITY_FEED.insert(0, {
                "id": f"act-{len(STORE_ACTIVITY_FEED)+1}",
                "time": "Just now",
                "timestamp": datetime.utcnow().isoformat(),
                "type": "task",
                "title": f"Task {req.status}",
                "description": f"Task '{t['title']}' updated to {req.status}",
                "patient_name": t.get("patient_name", "Clinical"),
                "user": "Dr. Sarah Mitchell",
                "status": req.status
            })
            return {"message": f"Task status updated to {req.status}", "task": t}
    return {"error": "Task not found"}

@router.get("/activity")
def get_activity_feed(filter_type: Optional[str] = "all"):
    if filter_type == "today":
        return [a for a in STORE_ACTIVITY_FEED if "minutes" in a["time"] or "Just now" in a["time"] or "hours" in a["time"]]
    return STORE_ACTIVITY_FEED

@router.get("/queue")
def get_patient_queue(db: Session = Depends(get_db)):
    return build_dynamic_patient_queue(db)

@router.post("/queue/reorder")
def reorder_queue(req: QueueReorderRequest):
    global STORE_PATIENT_QUEUE
    item_map = {item["id"]: item for item in STORE_PATIENT_QUEUE}
    new_queue = []
    for idx, q_id in enumerate(req.queue_ids):
        if q_id in item_map:
            item = item_map[q_id]
            item["queue_number"] = idx + 1
            new_queue.append(item)
    STORE_PATIENT_QUEUE = new_queue
    return {"message": "Patient queue updated successfully.", "queue": STORE_PATIENT_QUEUE}

@router.post("/queue/{queue_id}/move-to-top")
def move_queue_to_top(queue_id: str):
    global STORE_PATIENT_QUEUE
    target_item = None
    remaining = []
    for q in STORE_PATIENT_QUEUE:
        if q["id"] == queue_id:
            target_item = q
        else:
            remaining.append(q)
    if target_item:
        STORE_PATIENT_QUEUE = [target_item] + remaining
        for idx, q in enumerate(STORE_PATIENT_QUEUE):
            q["queue_number"] = idx + 1
        return {"message": "Patient queue updated successfully.", "queue": STORE_PATIENT_QUEUE}
    return {"error": "Queue item not found"}

@router.post("/tasks/{task_id}/priority")
def update_task_priority(task_id: str, req: TaskPriorityUpdateRequest):
    for t in STORE_TASKS:
        if t["id"] == task_id:
            t["priority"] = req.priority # "High", "Medium", "Low"
            if req.status:
                t["status"] = req.status
            if req.completed is not None:
                t["completed"] = req.completed
            elif req.priority == "Completed" or req.status == "Completed":
                t["completed"] = True
                t["status"] = "Completed"
            
            STORE_ACTIVITY_FEED.insert(0, {
                "id": f"act-{len(STORE_ACTIVITY_FEED)+1}",
                "time": "Just now",
                "timestamp": datetime.utcnow().isoformat(),
                "type": "task",
                "title": f"Task Priority Set to {req.priority}",
                "description": f"Task '{t['title']}' moved to {req.priority} priority",
                "patient_name": t.get("patient_name", "Clinical"),
                "user": "Dr. Sarah Mitchell",
                "status": req.priority
            })
            return {"message": f"Task priority updated to {req.priority}", "task": t}
    return {"error": "Task not found"}

@router.post("/queue/{queue_id}/status")
def update_queue_status(queue_id: str, req: QueueStatusUpdateRequest, db: Session = Depends(get_db)):
    global STORE_PATIENT_QUEUE
    target = None
    for q in STORE_PATIENT_QUEUE:
        if q["id"] == queue_id:
            q["status"] = req.status
            if req.position is not None:
                q["queue_number"] = req.position
            target = q
            break

    if not target:
        # Create or update fallback item
        target = {
            "id": queue_id,
            "queue_number": req.position or (len(STORE_PATIENT_QUEUE) + 1),
            "patient_id": queue_id.replace("q-", ""),
            "patient_name": "Patient",
            "waiting_time": "5 mins",
            "appointment_time": "12:00 PM",
            "priority": "Routine",
            "type": "Follow-up",
            "status": req.status
        }
        STORE_PATIENT_QUEUE.append(target)

    # Log Activity
    STORE_ACTIVITY_FEED.insert(0, {
        "id": f"act-{len(STORE_ACTIVITY_FEED)+1}",
        "time": "Just now",
        "timestamp": datetime.utcnow().isoformat(),
        "type": "queue",
        "title": f"Patient Queue Status Updated",
        "description": f"{target.get('patient_name', 'Patient')} moved to {req.status}",
        "patient_name": target.get('patient_name', 'Patient'),
        "user": "Dr. Sarah Mitchell",
        "status": req.status
    })

    return {"message": "Patient queue status updated successfully.", "queue_item": target, "queue": STORE_PATIENT_QUEUE}

@router.post("/queue/{queue_id}/action")
def queue_action(queue_id: str, req: QueueActionRequest):
    for q in STORE_PATIENT_QUEUE:
        if q["id"] == queue_id:
            if req.action == "start":
                q["status"] = "In Consultation"
            elif req.action == "complete":
                q["status"] = "Completed"
            elif req.action == "skip":
                q["status"] = "Skipped"
            return {"message": f"Patient queue updated successfully.", "queue_item": q}
    return {"error": "Queue item not found"}

@router.get("/layout-preferences")
def get_layout_preferences():
    return STORE_LAYOUT_PREFERENCES

@router.post("/layout-preferences")
def update_layout_preferences(req: LayoutPreferencesRequest):
    global STORE_LAYOUT_PREFERENCES
    STORE_LAYOUT_PREFERENCES = {"widgets": req.widgets}
    return {"message": "Layout preferences saved successfully", "preferences": STORE_LAYOUT_PREFERENCES}



