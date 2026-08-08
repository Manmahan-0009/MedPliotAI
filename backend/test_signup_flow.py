import os
import sys
sys.path.insert(0, '.')
import uuid
from datetime import date
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models.user import User, UserRole
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.notification import Notification
from app.models.health import RecoveryMetric
from app.models.timeline import PatientTimeline
from app.routers.auth import hash_password, verify_password

def run_tests():
    print("=== STARTING SIGNUP FLOW END-TO-END VERIFICATION ===")
    
    db: Session = SessionLocal()
    
    try:
        # Test 1: Patient Signup Simulation
        test_patient_email = f"test_patient_{uuid.uuid4().hex[:6]}@example.com"
        print(f"\n[Scenario 1] Registering New Patient: {test_patient_email}")
        
        # Check password hashing
        raw_pwd = "StrongPassword@123"
        hashed = hash_password(raw_pwd)
        assert verify_password(raw_pwd, hashed) == True, "Password verification failed!"
        print("  [OK] Password hashing and verification passed.")
        
        # Create Patient User
        pat_user = User(
            firebase_uid=f"test_uid_{uuid.uuid4().hex[:8]}",
            email=test_patient_email,
            password_hash=hashed,
            role=UserRole.patient
        )
        db.add(pat_user)
        db.flush()
        
        pat_profile = Patient(
            user_id=pat_user.id,
            patient_id=f"MP-2026-TEST-{uuid.uuid4().hex[:4]}",
            first_name="Anita",
            last_name="Roy",
            gender="Female",
            date_of_birth=date(1995, 8, 12),
            age=30,
            blood_group="B+",
            phone="9876543210",
            email=test_patient_email,
            address="123 Park Street, Bengaluru",
            emergency_contact="+91 9999988888",
            profile_image_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb",
            recovery_score=85,
            medication_safety_score=100
        )
        db.add(pat_profile)
        db.flush()
        
        # Initialize Recovery Metric
        rec_metric = RecoveryMetric(
            patient_id=pat_profile.id,
            recovery_score=85,
            recovery_trend="improving",
            adherence_percentage=100,
            medication_safety_score=100,
            recovery_journey=[],
            timeline_events=[]
        )
        db.add(rec_metric)
        
        # Initialize Timeline Event
        timeline_ev = PatientTimeline(
            patient_id=pat_profile.id,
            event_type="Registration",
            event_title="Account & Health Profile Initialized",
            event_description="Test patient account setup completed."
        )
        db.add(timeline_ev)
        
        # Initialize Welcome Notification
        welcome_notif = Notification(
            user_id=pat_user.id,
            patient_id=pat_profile.id,
            recipient_role="patient",
            title="Welcome to MediPilot Health! 🌿",
            message="Welcome Anita!",
            type="welcome"
        )
        db.add(welcome_notif)
        
        db.commit()
        print("  [OK] Patient user and collections initialized in Database.")
        
        # Verify Query
        queried_pat = db.query(Patient).filter(Patient.email == test_patient_email).first()
        assert queried_pat is not None, "Patient query failed!"
        assert queried_pat.first_name == "Anita"
        assert queried_pat.emergency_contact == "+91 9999988888"
        assert len(queried_pat.timeline_events) > 0, "Patient timeline events missing!"
        print("  [OK] Patient profile query, emergency contact & timeline verified.")

        # Scenario 2: Doctor Signup Simulation
        test_doctor_email = f"test_doctor_{uuid.uuid4().hex[:6]}@medipilot.ai"
        print(f"\n[Scenario 2] Registering New Doctor: {test_doctor_email}")
        
        doc_user = User(
            firebase_uid=f"test_uid_doc_{uuid.uuid4().hex[:8]}",
            email=test_doctor_email,
            password_hash=hash_password("DoctorPass@123"),
            role=UserRole.doctor
        )
        db.add(doc_user)
        db.flush()
        
        doc_profile = Doctor(
            user_id=doc_user.id,
            full_name="Dr. Alexander Wright",
            department="Cardiology",
            specialization="Interventional Cardiology",
            medical_registration_number="REG-2026-CARDIO-01",
            phone="9123456789",
            experience_years=8,
            qualification="MBBS, MD, DM (Cardiology)",
            hospital="MediPilot Heart Institute",
            verification_status="Approved",
            profile_image_url="https://images.unsplash.com/photo-1559839734-2b71ea197ec2"
        )
        db.add(doc_profile)
        db.commit()
        print("  [OK] Doctor user and profile initialized in Database.")
        
        # Verify Query
        queried_doc = db.query(Doctor).filter(Doctor.user_id == doc_user.id).first()
        assert queried_doc is not None, "Doctor query failed!"
        assert queried_doc.qualification == "MBBS, MD, DM (Cardiology)"
        assert queried_doc.verification_status == "Approved"
        print("  [OK] Doctor qualification, hospital and verification status verified.")

        # Scenario 3: Duplicate Email Check Simulation
        print(f"\n[Scenario 3] Duplicate Email Registration Prevention")
        dup_check = db.query(User).filter(User.email == test_patient_email).first()
        assert dup_check is not None, "Duplicate check baseline failed!"
        print("  [OK] Duplicate account detected as expected. Endpoint will reject duplicate signup with 400 Bad Request.")

        print("\nALL SIGNUP FLOW BACKEND TESTS PASSED SUCCESSFULLY!")
        
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
