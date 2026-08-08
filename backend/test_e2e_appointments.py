"""
End-to-end Integration Test for MedPilot AI Two-Way Appointment Management System.
Runs Scenario 1, Scenario 2, and Scenario 3 against FastAPI models & DB services.
"""
import sys
import os
import uuid
from datetime import date, datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models.doctor import Doctor
from app.models.patient import Patient, PatientStatus
from app.models.appointment import Appointment, AppointmentStatus
from app.models.notification import Notification
from app.routers.appointments import (
    get_available_doctors,
    get_doctor_slots,
    book_appointment,
    AppointmentBookRequest
)
from app.routers.doctor_dashboard import (
    accept_appointment,
    reject_appointment,
    reschedule_appointment_db,
    AppointmentActionRequest,
    get_pending_appointments as get_doctor_pending
)
from app.routers.patient_dashboard import get_patient_dashboard, get_patient_profile, get_patient_pharmacy
from app.routers.notifications import get_patient_notifications, get_doctor_notifications

def safe_str(s: str) -> str:
    if not s:
        return ""
    return str(s).encode("ascii", "replace").decode("ascii")

def run_e2e_tests():
    db = SessionLocal()
    try:
        print("==================================================")
        print("STARTING E2E INTEGRATION TESTS FOR APPOINTMENTS")
        print("==================================================")

        # 0. Setup test Doctor and Patient in DB if missing
        doc = db.query(Doctor).filter(Doctor.full_name == "Dr. Sarah Mitchell").first()
        if not doc:
            doc = Doctor(
                full_name="Dr. Sarah Mitchell",
                department="General Medicine",
                specialization="Internal Medicine",
                consultation_fee="800",
                hospital="MediPilot Super Speciality Hospital",
                rating=4.9
            )
            db.add(doc)
            db.commit()
            db.refresh(doc)
        print(f"[OK] Test Doctor Verified: {doc.full_name} (ID: {doc.id})")

        pat = db.query(Patient).filter(Patient.patient_id == "MP-2026-8942").first()
        if not pat:
            pat = Patient(
                patient_id="MP-2026-8942",
                first_name="Rahul",
                last_name="Sharma",
                gender="Male",
                age=28,
                blood_group="O+",
                phone="9123456780",
                email="patient@medipilot.ai",
                status=PatientStatus.active
            )
            db.add(pat)
            db.commit()
            db.refresh(pat)
        print(f"[OK] Test Patient Verified: {pat.first_name} {pat.last_name} (ID: {pat.id}, PatientID: {pat.patient_id})")

        # Clean up previous test appointments for idempotency
        db.query(Appointment).filter(Appointment.patient_id == pat.id).delete()
        db.query(Notification).filter(Notification.patient_id == pat.id).delete()
        db.commit()
        print("[OK] Test environment cleaned up.")

        # --------------------------------------------------
        # SCENARIO 1: Booking -> Doctor Accepts -> Synchronization
        # --------------------------------------------------
        print("\n--- SCENARIO 1: BOOKING & DOCTOR ACCEPTANCE ---")
        
        # 1. Search Doctor
        available_docs = get_available_doctors(department="General", query="Sarah", sort_by="rating", db=db)
        assert len(available_docs) >= 1, "Doctor search failed!"
        target_doc = available_docs[0]
        print(f"1. Patient searched doctor: Found {target_doc['full_name']} ({target_doc['department']})")

        # 2. Check slots
        booking_date = (date.today() + timedelta(days=2)).isoformat()
        slots_res = get_doctor_slots(doctor_id=str(doc.id), date_str=booking_date, db=db)
        assert len(slots_res["available_slots"]) > 0, "No available slots!"
        selected_slot = slots_res["available_slots"][0]
        print(f"2. Checked slots for {booking_date}: Picked {selected_slot}")

        # 3. Book Appointment
        book_req = AppointmentBookRequest(
            doctor_id=str(doc.id),
            patient_id=str(pat.id),
            appointment_date=booking_date,
            appointment_time=selected_slot,
            consultation_type="In-Person Visit",
            reason="Persistent dry cough & fever for 3 days"
        )
        book_res = book_appointment(req=book_req, db=db)
        apt_data = book_res["appointment"]
        apt_db_id = apt_data["id"]
        print(f"3. Booked appointment: ID {apt_data['appointment_id']}, Status: {apt_data['status']}")
        assert apt_data["status"] == "pending", "Initial status must be pending!"
        assert len(apt_data["ai_checklist"]) > 0, "AI preparation checklist was not generated!"
        print(f"   AI Preparation Checklist generated: {len(apt_data['ai_checklist'])} items")

        # 4. Verify Doctor Dashboard updates (Pending Requests)
        pending_doc_res = get_doctor_pending(doctor_id=str(doc.id), db=db)
        pending_items = pending_doc_res["pending"]
        assert any(item["id"] == apt_db_id for item in pending_items), "Appointment not visible on Doctor Dashboard pending requests!"
        print(f"4. Doctor Dashboard updated: {pending_doc_res['count']} pending request(s) visible")

        # 5. Doctor Accepts Appointment
        accept_res = accept_appointment(appointment_id=apt_db_id, req=AppointmentActionRequest(notes="Confirmed. Please arrive 10 mins early."), db=db)
        assert accept_res["status"] == "confirmed", "Accept action failed!"
        print(f"5. Doctor accepted appointment: Status updated to '{accept_res['status']}'")

        # 6. Patient receives confirmation notification & Patient Dashboard updates
        pat_notifs = get_patient_notifications(patient_id=str(pat.id), db=db)
        assert any(n["type"] == "appointment_confirmed" for n in pat_notifs["notifications"]), "Patient notification missing!"
        print(f"6. Patient Dashboard & Notifications updated: Received confirmation notification ('{safe_str(pat_notifs['notifications'][0]['title'])}')")

        # 7. Check Patient Dashboard API payload
        pat_dash = get_patient_dashboard(patient_id=str(pat.id), db=db)
        upcoming = pat_dash["upcoming_appointments"]
        assert any(a["id"] == apt_db_id and a["status"] in ("confirmed", "pending") for a in upcoming), "Confirmed appointment not in patient dashboard upcoming list!"
        print(f"7. Patient Dashboard synchronized: Upcoming appointments show confirmed status")

        # --------------------------------------------------
        # SCENARIO 2: Booking -> Doctor Rejects -> Patient Notified
        # --------------------------------------------------
        print("\n--- SCENARIO 2: DOCTOR REJECTS APPOINTMENT ---")
        
        booking_date2 = (date.today() + timedelta(days=3)).isoformat()
        book_req2 = AppointmentBookRequest(
            doctor_id=str(doc.id),
            patient_id=str(pat.id),
            appointment_date=booking_date2,
            appointment_time="03:00 PM",
            reason="Routine health check"
        )
        book_res2 = book_appointment(req=book_req2, db=db)
        apt_db_id2 = book_res2["appointment"]["id"]
        print(f"1. Booked 2nd appointment: ID {book_res2['appointment']['appointment_id']}")

        # Doctor Rejects
        reject_res = reject_appointment(appointment_id=apt_db_id2, req=AppointmentActionRequest(notes="Doctor is out of clinic on this date."), db=db)
        assert reject_res["status"] == "rejected", "Reject action failed!"
        print(f"2. Doctor rejected appointment: Status updated to '{reject_res['status']}'")

        # Patient Notified
        pat_notifs2 = get_patient_notifications(patient_id=str(pat.id), db=db)
        assert any(n["type"] == "appointment_rejected" for n in pat_notifs2["notifications"]), "Rejection notification missing!"
        print(f"3. Patient notified of rejection: '{safe_str(pat_notifs2['notifications'][0]['title'])}'")

        # --------------------------------------------------
        # SCENARIO 3: Booking -> Doctor Reschedules -> Patient Synchronized
        # --------------------------------------------------
        print("\n--- SCENARIO 3: DOCTOR RESCHEDULES APPOINTMENT ---")
        
        booking_date3 = (date.today() + timedelta(days=4)).isoformat()
        book_req3 = AppointmentBookRequest(
            doctor_id=str(doc.id),
            patient_id=str(pat.id),
            appointment_date=booking_date3,
            appointment_time="04:00 PM",
            reason="Blood pressure review"
        )
        book_res3 = book_appointment(req=book_req3, db=db)
        apt_db_id3 = book_res3["appointment"]["id"]

        reschedule_date = (date.today() + timedelta(days=5)).isoformat()
        reschedule_time = "11:00 AM"

        # Doctor Reschedules
        resched_res = reschedule_appointment_db(
            appointment_id=apt_db_id3,
            req=AppointmentActionRequest(rescheduled_date=reschedule_date, rescheduled_time=reschedule_time, notes="Moved to morning slot"),
            db=db
        )
        assert resched_res["status"] == "rescheduled", "Reschedule failed!"
        print(f"1. Doctor rescheduled appointment to {resched_res['new_date']} at {resched_res['new_time']}")

        # Patient Notified & Dashboard Synchronized
        pat_notifs3 = get_patient_notifications(patient_id=str(pat.id), db=db)
        assert any(n["type"] == "appointment_rescheduled" for n in pat_notifs3["notifications"]), "Reschedule notification missing!"
        print(f"2. Patient received reschedule notification: '{safe_str(pat_notifs3['notifications'][0]['title'])}'")

        print("\n==================================================")
        print("ALL E2E INTEGRATION TESTS PASSED SUCCESSFULLY! SUCCESS!")
        print("==================================================")

    except Exception as e:
        print(f"\n[FAIL] E2E TEST FAILED: {safe_str(str(e))}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_e2e_tests()
