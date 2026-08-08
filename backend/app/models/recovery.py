import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, Integer, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class RecoveryLog(Base):
    __tablename__ = "recovery_logs"
    __table_args__ = {'extend_existing': True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id", ondelete="SET NULL"), nullable=True, index=True)
    
    log_date = Column(DateTime, default=datetime.utcnow)
    day_number = Column(Integer, default=1)
    
    # Core Metrics
    recovery_percentage = Column(Float, default=85.0)
    pain_score = Column(Float, default=2.0)
    temperature = Column(Float, default=98.6)
    heart_rate = Column(Integer, default=72)
    bp_systolic = Column(Integer, default=120)
    bp_diastolic = Column(Integer, default=80)
    spo2 = Column(Float, default=99.0)
    weight_kg = Column(Float, default=70.0)
    sleep_hours = Column(Float, default=7.5)
    mood_score = Column(Integer, default=8)
    respiratory_rate = Column(Integer, default=16)
    blood_sugar_mg_dl = Column(Float, default=100.0)
    
    # Clinical Content
    doctor_notes = Column(Text, nullable=True)
    symptoms = Column(Text, nullable=True)
    medication_changes = Column(Text, nullable=True)
    ai_risk_score = Column(Float, default=12.0)
    ai_summary = Column(Text, nullable=True)
    milestone_status = Column(String(100), default="In Progress")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", backref="recovery_logs")
    doctor = relationship("Doctor", backref="recovery_logs")
