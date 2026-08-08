import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, DateTime, Date, Integer, Text, Enum as SAEnum, Boolean, ForeignKey

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class PatientStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    discharged = "discharged"


class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    patient_id = Column(String(20), unique=True, nullable=False, index=True)  # MP-2026-0001
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    gender = Column(String(20), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    age = Column(Integer, nullable=True)
    blood_group = Column(String(10), nullable=True)
    phone = Column(String(20), nullable=True, index=True)
    email = Column(String(255), nullable=True, index=True)
    address = Column(Text, nullable=True)
    emergency_contact = Column(String(255), nullable=True)
    profile_image_url = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    medical_conditions = Column(Text, nullable=True)
    current_medications = Column(Text, nullable=True)
    status = Column(SAEnum(PatientStatus), nullable=False, default=PatientStatus.active)
    
    # AI Generated Scores
    recovery_score = Column(Integer, default=0, nullable=True)
    medication_safety_score = Column(Integer, default=100, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="patient_profile")
    consultations = relationship("Consultation", back_populates="patient", cascade="all, delete-orphan")
    prescriptions = relationship("Prescription", back_populates="patient", cascade="all, delete-orphan")
    discharges = relationship("Discharge", back_populates="patient", cascade="all, delete-orphan")
    timeline_events = relationship("PatientTimeline", back_populates="patient", cascade="all, delete-orphan")
    recovery_metric = relationship("RecoveryMetric", back_populates="patient", uselist=False, cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="patient", cascade="all, delete-orphan")
