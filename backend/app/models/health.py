import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Integer, Float, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_name = Column(String(200), nullable=True)
    prescription_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="active")
    items = Column(JSONB, nullable=False, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("Patient", back_populates="prescriptions")


class RecoveryMetric(Base):
    __tablename__ = "recovery_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, unique=True)
    recovery_score = Column(Integer, default=0)
    recovery_trend = Column(String(50), default="stable")
    adherence_percentage = Column(Integer, default=0)
    medication_safety_score = Column(Integer, default=0)
    recovery_journey = Column(JSONB, nullable=False, default=list)
    timeline_events = Column(JSONB, nullable=False, default=list)
    next_follow_up = Column(String(100), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("Patient", back_populates="recovery_metric")


class Discharge(Base):
    __tablename__ = "discharges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_name = Column(String(200), nullable=True)
    discharge_summary = Column(Text, nullable=True)
    discharge_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("Patient", back_populates="discharges")
    invoices = relationship("Invoice", back_populates="discharge", cascade="all, delete-orphan")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    discharge_id = Column(UUID(as_uuid=True), ForeignKey("discharges.id", ondelete="SET NULL"), nullable=True)
    invoice_number = Column(String(50), unique=True, nullable=False)
    invoice_type = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False, default=0)
    status = Column(String(50), default="Pending")
    invoice_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="invoices")
    discharge = relationship("Discharge", back_populates="invoices")


class MedicineCatalog(Base):
    __tablename__ = "medicine_catalog"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    generic_name = Column(String(200), nullable=True)
    price = Column(Float, nullable=False, default=0)
    interaction_warnings = Column(JSONB, nullable=True, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
