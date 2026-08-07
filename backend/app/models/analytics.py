import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Float, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class AnalyticsMetric(Base):
    __tablename__ = "analytics_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    metric_date = Column(DateTime, default=datetime.utcnow, index=True)
    
    total_consultations = Column(Integer, default=0)
    total_patients_treated = Column(Integer, default=0)
    total_reports_generated = Column(Integer, default=0)
    documentation_time_saved_hours = Column(Float, default=0.0)
    average_consultation_time_mins = Column(Float, default=0.0)
    
    adherence_rate_percentage = Column(Float, default=0.0)
    average_recovery_score = Column(Float, default=0.0)
    total_discharges = Column(Integer, default=0)
    
    department = Column(String(100), default="General", nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
