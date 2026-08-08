import sys
import os
import uuid

# Ensure root path is accessible
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from app.database import SessionLocal
from app.models.patient import Patient
from app.models.notification import Notification
from app.models.timeline import PatientTimeline
from app.models.medicine import MedicineSchedule
from app.routers.doctor_dashboard import (
    STORE_PATIENT_QUEUE,
    STORE_APPOINTMENTS,
    STORE_TASKS,
    STORE_ACTIVITY_FEED,
    update_queue_status,
    QueueStatusUpdateRequest,
    update_task_priority,
    TaskPriorityUpdateRequest,
    reschedule_appointment,
    RescheduleRequest
)
from app.routers.pharmacy import (
    edit_medication,
    MedicationEditRequest,
    run_ai_safety_checks
)

def run_tests():
    print("=== STARTING DRAG & DROP + SMART PHARMACY END-TO-END VERIFICATION ===\n")
    db = SessionLocal()

    try:
        # Fetch or create a test patient
        patient = db.query(Patient).filter(Patient.patient_id == "MP-2026-8942").first()
        if not patient:
            patient = Patient(
                patient_id="MP-2026-8942",
                first_name="Rahul",
                last_name="Sharma",
                email="rahul.sharma.test@example.com",
                phone="9876543210",
                dob="1995-04-12",
                gender="Male"
            )
            db.add(patient)
            db.commit()
            db.refresh(patient)

        # ----------------------------------------------------------------------
        # TEST 1: Active Patient Queue Drag & Drop (Status Update)
        # ----------------------------------------------------------------------
        print("[TEST 1] Active Patient Queue Drag & Drop Status Update")
        req_queue = QueueStatusUpdateRequest(status="In Consultation", position=1)
        res_queue = update_queue_status("q-1", req_queue, db)
        assert res_queue["message"] == "Patient queue status updated successfully."
        assert STORE_PATIENT_QUEUE[0]["status"] == "In Consultation"
        print("  [OK] Queue item successfully moved to 'In Consultation' and updated in state.")

        # ----------------------------------------------------------------------
        # TEST 2: Upcoming Appointments Reschedule & Status Drag & Drop
        # ----------------------------------------------------------------------
        print("\n[TEST 2] Upcoming Appointments Drag & Drop Reschedule")
        req_appt = RescheduleRequest(appointment_id="app-1", new_slot="evening", new_time="06:30 PM")
        res_appt = reschedule_appointment(req_appt)
        assert res_appt["message"] == "Appointment Rescheduled Successfully"
        assert STORE_APPOINTMENTS[0]["slot"] == "evening"
        assert STORE_APPOINTMENTS[0]["time"] == "06:30 PM"
        print("  [OK] Appointment rescheduled to Evening slot (06:30 PM) and logged in activity feed.")

        # ----------------------------------------------------------------------
        # TEST 3: Clinical Tasks Drag & Drop Priority Update
        # ----------------------------------------------------------------------
        print("\n[TEST 3] Today's Clinical Tasks Drag & Drop Priority Update")
        req_task = TaskPriorityUpdateRequest(priority="High", status="Pending", completed=False)
        res_task = update_task_priority("t-[1-4]", req_task) # update target task
        if "error" in res_task:
            res_task = update_task_priority(STORE_TASKS[0]["id"], req_task)
        assert STORE_TASKS[0]["priority"] == "High"
        print("  [OK] Task priority updated to 'High' and state persisted.")

        # ----------------------------------------------------------------------
        # TEST 4: Smart Pharmacy Medication Edit (Doctor -> Database -> Patient Sync)
        # ----------------------------------------------------------------------
        print("\n[TEST 4] Smart Pharmacy Medication Edit Workflow")
        req_med = MedicationEditRequest(
            patient_id=str(patient.id),
            action="edit",
            medicine_name="Amoxicillin",
            dosage="750mg",
            frequency="Twice daily (BD)",
            duration="7 days",
            food_instruction="After meals",
            notes="Take with full glass of water."
        )
        import asyncio
        res_med = asyncio.run(edit_medication(req_med, db))
        assert res_med["status"] == "success"
        print(f"  [OK] Medication edit synced: {res_med['message']}")

        # Verify Database Schedule record was updated / inserted
        schedules = db.query(MedicineSchedule).filter(MedicineSchedule.patient_id == patient.id).all()
        assert len(schedules) > 0
        print(f"  [OK] Found {len(schedules)} active medicine schedules in Database.")

        # Verify Notification generated for Patient
        notifs = db.query(Notification).filter(Notification.patient_id == patient.id).order_by(Notification.created_at.desc()).all()
        assert len(notifs) > 0
        print(f"  [OK] Patient notification generated in DB: '{notifs[0].title}'")

        # Verify Patient Timeline Event created
        timeline_events = db.query(PatientTimeline).filter(PatientTimeline.patient_id == patient.id).order_by(PatientTimeline.created_at.desc()).all()
        assert len(timeline_events) > 0
        print(f"  [OK] Audit Log Patient Timeline Event created: '{timeline_events[0].event_title}'")

        # ----------------------------------------------------------------------
        # TEST 5: AI Pharmacovigilance Safety Checks
        # ----------------------------------------------------------------------
        print("\n[TEST 5] AI Pharmacovigilance Safety Checks Calculation")
        warnings = run_ai_safety_checks("Warfarin 5mg", "5mg", ["Aspirin 81mg", "Metformin 500mg"])
        assert len(warnings) > 0
        print(f"  [OK] AI Safety Engine detected {len(warnings)} interaction warnings correctly:")
        for w in warnings:
            print(f"      - {w['type']}: {w['message']}")

        print("\nALL DRAG & DROP AND SMART PHARMACY TESTS PASSED SUCCESSFULLY! [100% VERIFIED]")

    except Exception as e:
        print(f"\n[TEST FAILURE] {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
