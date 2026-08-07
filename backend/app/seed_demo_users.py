"""
Seed script for Demo Users:
Creates Firebase Auth accounts (if available) and Supabase DB entries with hashed passwords for:
- Doctor: doctor@medipilot.ai / Doctor@123
- Patient: patient@medipilot.ai / Patient@123
"""
import sys
import os
import hashlib
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.doctor import Doctor
from app.models.patient import Patient, PatientStatus

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

service_account_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "firebase-service-account.json")
if not os.path.exists(service_account_path):
    service_account_path = "firebase-service-account.json"

if not firebase_admin._apps:
    try:
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Firebase init warning: {e}")

Base.metadata.create_all(bind=engine)


def get_or_create_firebase_user(email: str, password: str, display_name: str):
    try:
        fb_user = firebase_auth.create_user(
            email=email,
            password=password,
            display_name=display_name
        )
        print(f"Created Firebase user: {email} (UID: {fb_user.uid})")
        return fb_user
    except firebase_auth.EmailAlreadyExistsError:
        try:
            fb_user = firebase_auth.get_user_by_email(email)
            print(f"Firebase user already exists: {email} (UID: {fb_user.uid})")
            return fb_user
        except Exception:
            pass
    except Exception as e:
        print(f"Firebase Admin Notice for {email}: {e}")
    import uuid
    class MockUser:
        uid = f"mock_{uuid.uuid4().hex[:12]}"
    return MockUser()


def seed_demo_users():
    db = SessionLocal()
    try:
        # 1. Doctor Demo Account
        doc_fb = get_or_create_firebase_user("doctor@medipilot.ai", "Doctor@123", "Dr. Sarah Mitchell")
        doc_user = db.query(User).filter(User.email == "doctor@medipilot.ai").first()
        doc_pwd_hash = hash_password("Doctor@123")
        
        if not doc_user:
            doc_user = User(
                firebase_uid=doc_fb.uid,
                email="doctor@medipilot.ai",
                password_hash=doc_pwd_hash,
                role=UserRole.doctor
            )
            db.add(doc_user)
            db.flush()

            doctor_profile = Doctor(
                user_id=doc_user.id,
                full_name="Dr. Sarah Mitchell",
                department="General Medicine",
                specialization="Internal Medicine",
                medical_registration_number="REG-2026-9901",
                phone="9876543200"
            )
            db.add(doctor_profile)
            db.commit()
            print("Created Doctor DB record for doctor@medipilot.ai with password verification")
        else:
            doc_user.password_hash = doc_pwd_hash
            if not doc_user.firebase_uid:
                doc_user.firebase_uid = doc_fb.uid
            db.commit()
            print("Updated Doctor password_hash in DB for doctor@medipilot.ai")

        # 2. Patient Demo Account
        pat_fb = get_or_create_firebase_user("patient@medipilot.ai", "Patient@123", "Rahul Sharma")
        pat_user = db.query(User).filter(User.email == "patient@medipilot.ai").first()
        pat_pwd_hash = hash_password("Patient@123")

        if not pat_user:
            pat_user = User(
                firebase_uid=pat_fb.uid,
                email="patient@medipilot.ai",
                password_hash=pat_pwd_hash,
                role=UserRole.patient
            )
            db.add(pat_user)
            db.flush()

            patient_profile = Patient(
                user_id=pat_user.id,
                patient_id="MP-2026-8942",
                first_name="Rahul",
                last_name="Sharma",
                gender="Male",
                date_of_birth=date(1998, 5, 14),
                age=28,
                blood_group="O+",
                phone="9123456780",
                email="patient@medipilot.ai",
                address="Bengaluru, Karnataka",
                status=PatientStatus.active
            )
            db.add(patient_profile)
            db.commit()
            print("Created Patient DB record for patient@medipilot.ai with password verification")
        else:
            pat_user.password_hash = pat_pwd_hash
            if not pat_user.firebase_uid:
                pat_user.firebase_uid = pat_fb.uid
            db.commit()
            print("Updated Patient password_hash in DB for patient@medipilot.ai")

        print("Demo Users seeding complete!")

    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_users()
