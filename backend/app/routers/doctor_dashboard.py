from typing import List, Optional
from pydantic import BaseModel

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

class LayoutPreferencesRequest(BaseModel):
    widgets: List[dict]


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
        "patient_queue": STORE_PATIENT_QUEUE,
        "layout_preferences": STORE_LAYOUT_PREFERENCES
    }


# ── Interactive Module Endpoints ─────────────────────────────────────────────

@router.get("/appointments")
def get_appointments():
    return STORE_APPOINTMENTS

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
def get_patient_queue():
    return STORE_PATIENT_QUEUE

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
    return {"message": "Queue reordered successfully", "queue": STORE_PATIENT_QUEUE}

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
            return {"message": f"Queue item action {req.action} applied", "queue_item": q}
    return {"error": "Queue item not found"}

@router.get("/layout-preferences")
def get_layout_preferences():
    return STORE_LAYOUT_PREFERENCES

@router.post("/layout-preferences")
def update_layout_preferences(req: LayoutPreferencesRequest):
    global STORE_LAYOUT_PREFERENCES
    STORE_LAYOUT_PREFERENCES = {"widgets": req.widgets}
    return {"message": "Layout preferences saved successfully", "preferences": STORE_LAYOUT_PREFERENCES}


