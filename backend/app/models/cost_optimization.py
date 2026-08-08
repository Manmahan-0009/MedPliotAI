import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class CostOptimizationDecision(Base):
    __tablename__ = "cost_optimization_decisions"
    __table_args__ = {'extend_existing': True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    prescription_id = Column(UUID(as_uuid=True), ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=True, index=True)
    
    original_medicine = Column(String(250), nullable=False)
    generic_alternative = Column(String(250), nullable=False)
    active_ingredient = Column(String(250), nullable=True)
    
    brand_cost = Column(Float, default=0.0)
    generic_cost = Column(Float, default=0.0)
    monthly_savings = Column(Float, default=0.0)
    
    status = Column(String(50), default="accepted") # accepted, rejected, pending
    doctor_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", backref="cost_decisions")
    prescription = relationship("Prescription", backref="cost_decisions")
