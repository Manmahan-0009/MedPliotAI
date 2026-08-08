import hashlib
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime, date

from app.database import get_db
from app.models.user import User, UserRole
from app.models.doctor import Doctor
from app.models.patient import Patient, PatientStatus
from app.models.notification import Notification
from app.models.health import RecoveryMetric
from app.models.timeline import PatientTimeline
from app.schemas.auth import DoctorSignupRequest, PatientSignupRequest, UserProfileOut, LoginRequest
from app.core.firebase import verify_firebase_token, optional_verify_firebase_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    if hash_password(plain_password) == hashed_password:
        return True

    # Flexible password matching for demo ease (case-insensitive):
    pat_hash = hash_password("Patient@123")
    doc_hash = hash_password("Doctor@123")
    
    clean_p_lower = plain_password.strip().lower()
    valid_pat_passwords = {"patient@123", "patient123", "patient", "password", "password123", "123456"}
    valid_doc_passwords = {"doctor@123", "doctor123", "doctor", "password", "password123", "123456"}

    if hashed_password == pat_hash and clean_p_lower in valid_pat_passwords:
        return True
    if hashed_password == doc_hash and clean_p_lower in valid_doc_passwords:
        return True

    return False


def _generate_patient_id(db: Session) -> str:
    year = datetime.utcnow().year
    count = db.query(Patient).filter(
        Patient.patient_id.like(f"MP-{year}-%")
    ).count()
    return f"MP-{year}-{count + 1:04d}"


def _calculate_age(dob: date) -> int:
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


def _ensure_demo_user(email: str, db: Session) -> User | None:
    if email == "doctor@medipilot.ai":
        doc_user = User(
            firebase_uid="demo_doctor_uid",
            email="doctor@medipilot.ai",
            password_hash=hash_password("Doctor@123"),
            role=UserRole.doctor
        )
        db.add(doc_user)
        db.flush()
        doc_profile = Doctor(
            user_id=doc_user.id,
            full_name="Dr. Sarah Mitchell",
            department="General Medicine",
            specialization="Internal Medicine",
            medical_registration_number="REG-2026-9901",
            phone="9876543200"
        )
        db.add(doc_profile)
        db.commit()
        db.refresh(doc_user)
        return doc_user
    elif email == "patient@medipilot.ai":
        pat_user = User(
            firebase_uid="demo_patient_uid",
            email="patient@medipilot.ai",
            password_hash=hash_password("Patient@123"),
            role=UserRole.patient
        )
        db.add(pat_user)
        db.flush()
        patient_id = _generate_patient_id(db)
        pat_profile = Patient(
            user_id=pat_user.id,
            patient_id=patient_id,
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
        db.add(pat_profile)
        db.commit()
        db.refresh(pat_user)
        return pat_user
    return None


@router.post("/login", response_model=UserProfileOut)
async def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    clean_email = req.email.strip().lower()
    if "@" not in clean_email:
        clean_email = f"{clean_email}@medipilot.ai"

    user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if not user and clean_email in ["doctor@medipilot.ai", "patient@medipilot.ai"]:
        user = _ensure_demo_user(clean_email, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if user.password_hash:
        if not verify_password(req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
    else:
        user.password_hash = hash_password(req.password)
        db.commit()

    doc_data = None
    if user.doctor_profile:
        doc = user.doctor_profile
        doc_data = {
            "id": str(doc.id),
            "full_name": doc.full_name,
            "department": doc.department,
            "specialization": doc.specialization,
            "medical_registration_number": doc.medical_registration_number,
            "phone": doc.phone,
        }

    pat_data = None
    if user.patient_profile:
        pat = user.patient_profile
        pat_data = {
            "id": str(pat.id),
            "patient_id": pat.patient_id,
            "first_name": pat.first_name,
            "last_name": pat.last_name,
            "email": pat.email,
            "phone": pat.phone,
        }

    return {
        "id": user.id,
        "firebase_uid": user.firebase_uid,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at,
        "doctor_profile": doc_data,
        "patient_profile": pat_data
    }


@router.post("/register-doctor", response_model=UserProfileOut, status_code=201)
async def register_doctor(req: DoctorSignupRequest, db: Session = Depends(get_db)):
    import json
    import uuid as _uuid

    clean_email = req.email.strip().lower()
    firebase_uid = req.firebase_uid or f"uid_doc_{_uuid.uuid4().hex[:12]}"

    existing_user = db.query(User).filter(
        (User.firebase_uid == firebase_uid) | (func.lower(User.email) == clean_email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="An account with this email address already exists. Please sign in."
        )

    pwd_hash = hash_password(req.password) if req.password else hash_password("Doctor@123")

    user = User(
        firebase_uid=firebase_uid,
        email=clean_email,
        password_hash=pwd_hash,
        role=UserRole.doctor
    )
    db.add(user)
    db.flush()

    default_slots = json.dumps(["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"])

    doctor = Doctor(
        user_id=user.id,
        full_name=req.full_name,
        department=req.department or "General Medicine",
        specialization=req.specialization or "Consultant Physician",
        medical_registration_number=req.medical_registration_number or f"REG-2026-{_uuid.uuid4().hex[:4].upper()}",
        phone=req.phone or "9876543200",
        experience_years=req.experience_years or 5,
        qualification=req.qualification or "MBBS, MD",
        hospital=req.hospital or "MediPilot Super Speciality Hospital",
        verification_status="Approved",
        consultation_fee="₹800",
        rating=4.9,
        availability_status="Available Today",
        available_slots=default_slots,
        profile_image_url=req.profile_photo or "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"
    )
    db.add(doctor)

    # Initialize Welcome Notification
    welcome_notif = Notification(
        user_id=user.id,
        doctor_id=doctor.id,
        recipient_role="doctor",
        title="Welcome to MediPilot AI! 🩺",
        message=f"Welcome {req.full_name}! Your clinical dashboard, availability schedule, and AI workspace have been initialized.",
        type="welcome"
    )
    db.add(welcome_notif)

    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "firebase_uid": user.firebase_uid,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at,
        "doctor_profile": {
            "id": str(doctor.id),
            "full_name": doctor.full_name,
            "department": doctor.department,
            "specialization": doctor.specialization,
            "medical_registration_number": doctor.medical_registration_number,
            "phone": doctor.phone,
            "qualification": doctor.qualification,
            "hospital": doctor.hospital,
            "verification_status": doctor.verification_status,
        },
        "patient_profile": None
    }


@router.post("/register-patient", response_model=UserProfileOut, status_code=201)
async def register_patient(req: PatientSignupRequest, db: Session = Depends(get_db)):
    import uuid as _uuid

    clean_email = req.email.strip().lower()
    firebase_uid = req.firebase_uid or f"uid_pat_{_uuid.uuid4().hex[:12]}"

    existing_user = db.query(User).filter(
        (User.firebase_uid == firebase_uid) | (func.lower(User.email) == clean_email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="An account with this email address already exists. Please sign in."
        )

    pwd_hash = hash_password(req.password) if req.password else hash_password("Patient@123")

    user = User(
        firebase_uid=firebase_uid,
        email=clean_email,
        password_hash=pwd_hash,
        role=UserRole.patient
    )
    db.add(user)
    db.flush()

    patient_id = _generate_patient_id(db)
    age = _calculate_age(req.date_of_birth) if req.date_of_birth else 28

    patient = Patient(
        user_id=user.id,
        patient_id=patient_id,
        first_name=req.first_name,
        last_name=req.last_name,
        gender=req.gender or "Male",
        date_of_birth=req.date_of_birth or date(1998, 5, 14),
        age=age,
        blood_group=req.blood_group or "O+",
        phone=req.phone or "9123456780",
        email=clean_email,
        address=req.address or "Bengaluru, Karnataka",
        emergency_contact=req.emergency_contact,
        profile_image_url=req.profile_photo or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
        status=PatientStatus.active,
        recovery_score=85,
        medication_safety_score=100
    )
    db.add(patient)
    db.flush()

    # Initialize Baseline Recovery Metric
    recovery = RecoveryMetric(
        patient_id=patient.id,
        recovery_score=85,
        recovery_trend="improving",
        adherence_percentage=100,
        medication_safety_score=100,
        recovery_journey=[{
            "day": 1,
            "status": "Account Initialized",
            "score": 85,
            "notes": "Patient profile and health records created."
        }],
        timeline_events=[{
            "title": "Welcome to MediPilot Health",
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
            "category": "Onboarding"
        }]
    )
    db.add(recovery)

    # Initialize Timeline Event
    timeline_event = PatientTimeline(
        patient_id=patient.id,
        event_type="Registration",
        event_title="Account & Health Profile Initialized",
        event_description=f"Welcome {req.first_name}! Your MediPilot AI patient account has been created."
    )
    db.add(timeline_event)

    # Initialize Welcome Notification
    welcome_notif = Notification(
        user_id=user.id,
        patient_id=patient.id,
        recipient_role="patient",
        title="Welcome to MediPilot Health! 🌿",
        message=f"Welcome {req.first_name}! Your personal health portal, appointments, and medication tracker have been initialized.",
        type="welcome"
    )
    db.add(welcome_notif)

    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "firebase_uid": user.firebase_uid,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at,
        "doctor_profile": None,
        "patient_profile": {
            "id": str(patient.id),
            "patient_id": patient.patient_id,
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "email": patient.email,
            "phone": patient.phone,
        }
    }


@router.get("/me", response_model=UserProfileOut)
async def get_current_user_profile(
    decoded_token: dict = Depends(verify_firebase_token),
    db: Session = Depends(get_db)
):
    uid = decoded_token.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = db.query(User).filter(User.firebase_uid == uid).first()
    if not user:
        email = decoded_token.get("email")
        if email:
            clean_email = email.strip().lower()
            user = db.query(User).filter(func.lower(User.email) == clean_email).first()
            if user and user.firebase_uid != uid:
                user.firebase_uid = uid
                db.commit()
                db.refresh(user)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User profile not found in database. Please complete registration."
        )

    doc_data = None
    if user.doctor_profile:
        doc = user.doctor_profile
        doc_data = {
            "id": str(doc.id),
            "full_name": doc.full_name,
            "department": doc.department,
            "specialization": doc.specialization,
            "medical_registration_number": doc.medical_registration_number,
            "phone": doc.phone,
        }

    pat_data = None
    if user.patient_profile:
        pat = user.patient_profile
        pat_data = {
            "id": str(pat.id),
            "patient_id": pat.patient_id,
            "first_name": pat.first_name,
            "last_name": pat.last_name,
            "email": pat.email,
            "phone": pat.phone,
        }

    return {
        "id": user.id,
        "firebase_uid": user.firebase_uid,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at,
        "doctor_profile": doc_data,
        "patient_profile": pat_data
    }
