from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.database import get_db
from app.models.prescription import Prescription, PrescriptionItem, PrescriptionStatus
from app.models.patient import Patient
from app.models.medicine import MedicineSchedule, ScheduleStatus

router = APIRouter(prefix="/api/prescriptions", tags=["Prescriptions"])

class PrescriptionItemModel(BaseModel):
    id: Optional[str] = None
    medicine_name: str
    strength: Optional[str] = None
    dosage: str
    frequency: str
    duration: str
    food_instruction: Optional[str] = None
    purpose: Optional[str] = None
    instructions: Optional[str] = None

class PrescriptionUpdateRequest(BaseModel):
    status: Optional[str] = None
    items: Optional[List[PrescriptionItemModel]] = None

@router.get("/{patient_id}")
async def get_patient_prescriptions(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
    
    prescriptions = db.query(Prescription).filter(Prescription.patient_id == patient.id).order_by(Prescription.created_at.desc()).all()
    
    result = []
    for p in prescriptions:
        items = db.query(PrescriptionItem).filter(PrescriptionItem.prescription_id == p.id).all()
        result.append({
            "id": p.id,
            "consultation_id": p.consultation_id,
            "status": p.status,
            "created_at": p.created_at,
            "items": items
        })
    return result

@router.put("/{prescription_id}")
async def update_prescription(prescription_id: str, req: PrescriptionUpdateRequest, db: Session = Depends(get_db)):
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    if req.status:
        # If it's being approved, generate the Medicine Schedule
        if req.status == PrescriptionStatus.APPROVED.value and prescription.status != PrescriptionStatus.APPROVED.value:
            items = db.query(PrescriptionItem).filter(PrescriptionItem.prescription_id == prescription.id).all()
            for item in items:
                # Naive frequency mapping to time slots
                slots = []
                freq = item.frequency.lower()
                if "twice" in freq or "bd" in freq or "b.i.d" in freq:
                    slots = ["Morning", "Night"]
                elif "thrice" in freq or "tds" in freq or "t.i.d" in freq:
                    slots = ["Morning", "Afternoon", "Night"]
                else:
                    slots = ["Morning"]
                
                for slot in slots:
                    schedule = MedicineSchedule(
                        patient_id=prescription.patient_id,
                        prescription_id=prescription.id,
                        medicine_name=item.medicine_name,
                        dosage=item.dosage,
                        time_slot=slot,
                        food_instruction=item.food_instruction,
                        duration=item.duration,
                        status=ScheduleStatus.UPCOMING.value
                    )
                    db.add(schedule)
                    
        prescription.status = req.status

    if req.items is not None:
        # Clear existing and add new
        db.query(PrescriptionItem).filter(PrescriptionItem.prescription_id == prescription.id).delete()
        
        for med in req.items:
            item = PrescriptionItem(
                prescription_id=prescription.id,
                medicine_name=med.medicine_name,
                strength=med.strength,
                dosage=med.dosage,
                frequency=med.frequency,
                duration=med.duration,
                food_instruction=med.food_instruction,
                purpose=med.purpose,
                instructions=med.instructions
            )
            db.add(item)

    db.commit()
    db.refresh(prescription)
    
    updated_items = db.query(PrescriptionItem).filter(PrescriptionItem.prescription_id == prescription.id).all()
    
    return {
        "status": "success",
        "prescription": {
            "id": prescription.id,
            "status": prescription.status,
            "items": updated_items
        }
    }
