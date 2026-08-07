from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, EmailStr, field_validator
import uuid


# ─── Request Schemas ──────────────────────────────────────────────────────────

class PatientCreate(BaseModel):
    first_name: str
    last_name: str
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    allergies: Optional[str] = None
    medical_conditions: Optional[str] = None
    current_medications: Optional[str] = None


class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    allergies: Optional[str] = None
    medical_conditions: Optional[str] = None
    current_medications: Optional[str] = None


# ─── Response Schemas ─────────────────────────────────────────────────────────

class ConsultationOut(BaseModel):
    id: uuid.UUID
    consultation_id: str
    doctor_name: Optional[str]
    consultation_date: datetime
    transcript: Optional[str]
    ai_summary: Optional[str]
    pdf_path: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class PatientOut(BaseModel):
    id: uuid.UUID
    patient_id: str
    first_name: str
    last_name: str
    gender: Optional[str]
    date_of_birth: Optional[date]
    age: Optional[int]
    blood_group: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    address: Optional[str]
    emergency_contact: Optional[str]
    allergies: Optional[str]
    medical_conditions: Optional[str]
    current_medications: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PatientWithConsultations(PatientOut):
    consultations: List[ConsultationOut] = []
