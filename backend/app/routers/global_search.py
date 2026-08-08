from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Dict, Any, List
import uuid

from app.database import get_db
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.models.consultation import Consultation
from app.models.medicine import MedicineCatalogue

router = APIRouter(prefix="/api/global-search", tags=["Global Search"])

@router.get("", response_model=Dict[str, Any])
def global_search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    """
    Global multi-entity search endpoint across Patients, Doctors, Appointments, Reports, and Medicines.
    """
    search_term = f"%{q.strip()}%"
    
    # 1. Search Patients
    patients = db.query(Patient).filter(
        or_(
            Patient.first_name.ilike(search_term),
            Patient.last_name.ilike(search_term),
            Patient.patient_id.ilike(search_term),
            Patient.phone.ilike(search_term),
            Patient.email.ilike(search_term)
        )
    ).limit(6).all()
    
    patient_results = [
        {
            "id": str(p.id),
            "title": f"{p.first_name} {p.last_name}",
            "subtitle": f"MRN: {p.patient_id} • Age: {p.age or 'N/A'} • {p.gender or ''}",
            "type": "Patient",
            "link": f"/patients/{p.id}",
            "badge": p.status.value if hasattr(p.status, 'value') else str(p.status)
        }
        for p in patients
    ]
    
    # 2. Search Doctors
    doctors = db.query(Doctor).filter(
        or_(
            Doctor.full_name.ilike(search_term),
            Doctor.department.ilike(search_term),
            Doctor.specialization.ilike(search_term)
        )
    ).limit(5).all()
    
    doctor_results = [
        {
            "id": str(d.id),
            "title": d.full_name,
            "subtitle": f"{d.specialization} • {d.department}",
            "type": "Doctor",
            "link": "/patient/appointments/book",
            "badge": d.verification_status or "Approved"
        }
        for d in doctors
    ]
    
    # 3. Search Appointments
    appointments = db.query(Appointment).filter(
        or_(
            Appointment.appointment_id.ilike(search_term),
            Appointment.patient_name.ilike(search_term),
            Appointment.doctor_name.ilike(search_term),
            Appointment.reason.ilike(search_term)
        )
    ).limit(5).all()
    
    appointment_results = [
        {
            "id": str(a.id),
            "title": f"Appointment: {a.patient_name} with {a.doctor_name}",
            "subtitle": f"Date: {a.appointment_date} • Time: {a.appointment_time} • {a.reason or ''}",
            "type": "Appointment",
            "link": "/doctor/dashboard",
            "badge": a.status.value if hasattr(a.status, 'value') else str(a.status)
        }
        for a in appointments
    ]
    
    # 4. Search Reports / Consultations
    consultations = db.query(Consultation).filter(
        or_(
            Consultation.consultation_id.ilike(search_term),
            Consultation.doctor_name.ilike(search_term),
            Consultation.summary.ilike(search_term),
            Consultation.transcript.ilike(search_term)
        )
    ).limit(5).all()
    
    report_results = [
        {
            "id": str(c.id),
            "title": f"Consultation Report #{c.consultation_id[:8]}",
            "subtitle": f"Doctor: {c.doctor_name} • Date: {c.created_at.strftime('%Y-%m-%d') if c.created_at else ''}",
            "type": "Report",
            "link": f"/consultation?id={c.id}",
            "badge": "Completed"
        }
        for c in consultations
    ]
    
    # 5. Search Medicines
    medicines = db.query(MedicineCatalogue).filter(
        or_(
            MedicineCatalogue.name.ilike(search_term),
            MedicineCatalogue.generic_name.ilike(search_term),
            MedicineCatalogue.brand.ilike(search_term),
            MedicineCatalogue.category.ilike(search_term)
        )
    ).limit(5).all()
    
    medicine_results = [
        {
            "id": str(m.id),
            "title": m.name,
            "subtitle": f"Generic: {m.generic_name} • Category: {m.category or 'Pharmacy'}",
            "type": "Medicine",
            "link": "/patient/smart-pharmacy",
            "badge": f"₹{m.price}" if m.price else "In Stock"
        }
        for m in medicines
    ]
    
    total_count = len(patient_results) + len(doctor_results) + len(appointment_results) + len(report_results) + len(medicine_results)
    
    return {
        "query": q,
        "total": total_count,
        "results": {
            "patients": patient_results,
            "doctors": doctor_results,
            "appointments": appointment_results,
            "reports": report_results,
            "medicines": medicine_results
        }
    }
