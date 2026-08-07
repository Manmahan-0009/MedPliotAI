from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from uuid import UUID
from app.models.user import UserRole


class LoginRequest(BaseModel):
    email: str
    password: str


class DoctorSignupRequest(BaseModel):
    firebase_uid: str
    email: EmailStr
    password: Optional[str] = None
    full_name: str
    department: Optional[str] = None
    specialization: Optional[str] = None
    medical_registration_number: Optional[str] = None
    phone: Optional[str] = None


class PatientSignupRequest(BaseModel):
    firebase_uid: str
    email: EmailStr
    password: Optional[str] = None
    first_name: str
    last_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None


class UserProfileOut(BaseModel):
    id: UUID
    firebase_uid: str
    email: str
    role: UserRole
    created_at: datetime
    doctor_profile: Optional[dict] = None
    patient_profile: Optional[dict] = None

    class Config:
        from_attributes = True
