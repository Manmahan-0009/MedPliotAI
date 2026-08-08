import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class AppointmentStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    rejected = "rejected"
    rescheduled = "rescheduled"
    cancelled = "cancelled"
    completed = "completed"


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    appointment_id = Column(String(50), unique=True, nullable=False, index=True)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    
    doctor_name = Column(String(255), nullable=False)
    patient_name = Column(String(255), nullable=False)
    department = Column(String(100), nullable=True)
    
    appointment_date = Column(String(50), nullable=False)
    appointment_time = Column(String(50), nullable=False)
    slot = Column(String(50), default="morning")
    consultation_type = Column(String(50), default="In-Person Visit")
    
    reason = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.pending, nullable=False)
    
    ai_checklist = Column(JSON, nullable=True)
    rescheduled_date = Column(String(50), nullable=True)
    rescheduled_time = Column(String(50), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    doctor = relationship("Doctor")
    patient = relationship("Patient")
