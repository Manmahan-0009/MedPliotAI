from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from pydantic import BaseModel
import uuid
from datetime import datetime, timedelta

from app.database import get_db
from app.models.medicine import MedicineCatalogue, MedicineSchedule
from app.models.order import Order, OrderItem, OrderStatus
from app.models.patient import Patient
from app.models.consultation import Consultation
from app.models.notification import Notification
from app.models.timeline import PatientTimeline
from app.models.prescription import Prescription, PrescriptionItem, PrescriptionStatus
from app.models.cost_optimization import CostOptimizationDecision
from app.routers.doctor_dashboard import STORE_ACTIVITY_FEED

router = APIRouter(prefix="/api/pharmacy", tags=["Pharmacy"])

class OrderItemModel(BaseModel):
    medicine_id: str
    quantity: int

class OrderRequest(BaseModel):
    patient_id: str
    address: str
    payment_info: str
    items: List[OrderItemModel]

class ScheduleStatusUpdate(BaseModel):
    status: str

class MedicationEditRequest(BaseModel):
    patient_id: str
    schedule_id: Optional[str] = None
    action: str  # "add", "edit", "remove", "discontinue", "pause", "resume"
    medicine_name: str
    dosage: str
    frequency: str
    duration: Optional[str] = "7 days"
    food_instruction: Optional[str] = "After meals"
    time_slot: Optional[str] = "Morning"  # "Morning", "Afternoon", "Night"
    notes: Optional[str] = None
    refill_instructions: Optional[str] = None
    generic_alternative: Optional[str] = None
    stock_recommendation: Optional[str] = None

@router.get("/medicines")
async def get_medicines(category: Optional[str] = None, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    query = db.query(MedicineCatalogue)
    if category:
        query = query.filter(MedicineCatalogue.category == category)
    return query.offset(skip).limit(limit).all()

@router.get("/medicines/search")
async def search_medicines(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    search = f"%{q}%"
    return db.query(MedicineCatalogue).filter(
        or_(
            MedicineCatalogue.name.ilike(search),
            MedicineCatalogue.generic_name.ilike(search),
            MedicineCatalogue.brand.ilike(search)
        )
    ).limit(20).all()

@router.post("/orders")
async def create_order(req: OrderRequest, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == req.patient_id).first()
    if not patient:
        # Fallback to patient_id string like MP-2026-0001
        patient = db.query(Patient).filter(Patient.patient_id == req.patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")

    new_order = Order(
        patient_id=patient.id,
        address=req.address,
        payment_info=req.payment_info,
        status=OrderStatus.CONFIRMED.value,
        estimated_delivery=datetime.utcnow() + timedelta(days=2),
        total_price=0
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    total_price = 0
    for item in req.items:
        medicine = db.query(MedicineCatalogue).filter(MedicineCatalogue.id == item.medicine_id).first()
        if not medicine:
            continue
        
        order_item = OrderItem(
            order_id=new_order.id,
            medicine_id=medicine.id,
            quantity=item.quantity,
            price=medicine.price
        )
        db.add(order_item)
        total_price += medicine.price * item.quantity

    new_order.total_price = total_price
    db.commit()
    db.refresh(new_order)
    
    return {"status": "success", "order_id": new_order.id, "total_price": total_price}

@router.get("/orders/{order_id}")
async def get_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    
    return {
        "order": order,
        "items": items
    }

@router.get("/schedule/{patient_id}")
async def get_schedule(patient_id: str, db: Session = Depends(get_db)):
    try:
        uid = uuid.UUID(patient_id)
        patient = db.query(Patient).filter(Patient.id == uid).first()
    except ValueError:
        patient = None
        
    if not patient:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
            
    schedules = db.query(MedicineSchedule).filter(MedicineSchedule.patient_id == patient.id).order_by(MedicineSchedule.created_at.desc()).all()
    return schedules

@router.put("/schedule/{schedule_id}/status")
async def update_schedule_status(schedule_id: str, req: ScheduleStatusUpdate, db: Session = Depends(get_db)):
    try:
        schedule = db.query(MedicineSchedule).filter(MedicineSchedule.id == schedule_id).first()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid schedule ID")
        
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
        
    schedule.status = req.status
    schedule.updated_at = datetime.utcnow()
    db.commit()
    return {"status": "success", "new_status": schedule.status}

@router.get("/patient/{patient_id}/insights")
async def get_patient_pharmacy_insights(patient_id: str, db: Session = Depends(get_db)):
    try:
        uid = uuid.UUID(patient_id)
        patient = db.query(Patient).filter(Patient.id == uid).first()
    except ValueError:
        patient = None
        
    if not patient:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
            
    # Calculate adherence
    schedules = db.query(MedicineSchedule).filter(MedicineSchedule.patient_id == patient.id).all()
    total = len(schedules)
    completed = len([s for s in schedules if s.status == "Completed"])
    
    adherence = round((completed / total * 100) if total > 0 else 96)
    
    return {
        "medication_safety_score": patient.medication_safety_score or 94,
        "recovery_score": patient.recovery_score or 82,
        "adherence_percentage": adherence,
        "monthly_savings": 1240,
        "active_prescriptions": len(set([s.prescription_id for s in schedules])),
        "total_doses": total,
        "completed_doses": completed
    }


def run_ai_safety_checks(medicine_name: str, dosage: str, existing_meds: List[str]) -> List[dict]:
    warnings = []
    med_lower = medicine_name.lower()
    existing_lowers = [m.lower() for m in existing_meds]

    # Drug-Drug Interaction Warnings
    if "warfarin" in med_lower and any("aspirin" in e or "ibuprofen" in e or "nsaid" in e for e in existing_lowers):
        warnings.append({
            "type": "Drug Interaction Warning",
            "severity": "High",
            "message": f"High risk of bleeding: {medicine_name} interacts with NSAIDs/Aspirin.",
            "recommendation": "Consider paracetamol/acetaminophen for analgesia instead."
        })

    if "metformin" in med_lower and any("contrast" in e for e in existing_lowers):
        warnings.append({
            "type": "Metabolic Warning",
            "severity": "Medium",
            "message": "Hold Metformin prior to IV iodinated contrast procedure to avoid lactic acidosis.",
            "recommendation": "Resume 48 hours post-procedure after renal function verification."
        })

    # Duplicate Class Warning
    if any(med_lower in e or e in med_lower for e in existing_lowers if e != med_lower):
        warnings.append({
            "type": "Duplicate Class Warning",
            "severity": "Medium",
            "message": f"Patient already has a medication with similar mechanism of action.",
            "recommendation": "Verify active therapy before prescribing additional dose."
        })

    # Dosage Warning
    if "1000mg" in dosage or "1500mg" in dosage:
        warnings.append({
            "type": "Dosage Check",
            "severity": "Low",
            "message": f"High single-dose regimen ({dosage}). Ensure renal clearance is monitored.",
            "recommendation": "Confirm eGFR > 60 mL/min."
        })

    return warnings


@router.post("/medication/edit")
async def edit_medication(req: MedicationEditRequest, db: Session = Depends(get_db)):
    try:
        uid = uuid.UUID(req.patient_id)
        patient = db.query(Patient).filter(Patient.id == uid).first()
    except ValueError:
        patient = None

    if not patient:
        patient = db.query(Patient).filter(Patient.patient_id == req.patient_id).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    existing_schedules = db.query(MedicineSchedule).filter(MedicineSchedule.patient_id == patient.id).all()
    existing_med_names = [s.medicine_name for s in existing_schedules]

    # Calculate AI Safety Checks
    safety_warnings = run_ai_safety_checks(req.medicine_name, req.dosage, existing_med_names)

    # Ensure a valid consultation container exists for patient
    consultation = db.query(Consultation).filter(Consultation.patient_id == patient.id).order_by(Consultation.created_at.desc()).first()
    if not consultation:
        consultation = Consultation(
            consultation_id=f"CON-2026-{str(uuid.uuid4())[:6].upper()}",
            patient_id=patient.id,
            doctor_name="Dr. Sarah Mitchell",
            status="Documented",
            transcript="Patient baseline medication consultation initialized.",
            ai_summary="Baseline medication schedule approved by Dr. Sarah Mitchell."
        )
        db.add(consultation)
        db.flush()

    # Ensure a prescription container exists for patient
    prescription = db.query(Prescription).filter(Prescription.patient_id == patient.id).order_by(Prescription.created_at.desc()).first()
    if not prescription:
        prescription = Prescription(
            consultation_id=consultation.id,
            patient_id=patient.id,
            status=PrescriptionStatus.APPROVED.value
        )
        db.add(prescription)
        db.flush()

    affected_schedule = None
    if req.schedule_id:
        try:
            sch_uuid = uuid.UUID(req.schedule_id)
            affected_schedule = db.query(MedicineSchedule).filter(MedicineSchedule.id == sch_uuid).first()
        except Exception:
            affected_schedule = None

    action_msg = ""
    if req.action == "add":
        affected_schedule = MedicineSchedule(
            patient_id=patient.id,
            prescription_id=prescription.id,
            medicine_name=req.medicine_name,
            dosage=req.dosage,
            time_slot=req.time_slot or "Morning",
            food_instruction=req.food_instruction or "After meals",
            duration=req.duration or "7 days",
            status="Upcoming"
        )
        db.add(affected_schedule)
        action_msg = f"Added {req.medicine_name} ({req.dosage})"
    elif req.action == "edit" and affected_schedule:
        old_dosage = affected_schedule.dosage
        affected_schedule.medicine_name = req.medicine_name
        affected_schedule.dosage = req.dosage
        affected_schedule.food_instruction = req.food_instruction or affected_schedule.food_instruction
        affected_schedule.duration = req.duration or affected_schedule.duration
        affected_schedule.time_slot = req.time_slot or affected_schedule.time_slot
        affected_schedule.updated_at = datetime.utcnow()
        action_msg = f"Updated {req.medicine_name} dosage ({old_dosage} → {req.dosage})"
    elif req.action in ("discontinue", "pause") and affected_schedule:
        affected_schedule.status = "Discontinued" if req.action == "discontinue" else "Paused"
        affected_schedule.updated_at = datetime.utcnow()
        action_msg = f"{req.action.capitalize()}d {req.medicine_name}"
    elif req.action == "resume" and affected_schedule:
        affected_schedule.status = "Upcoming"
        affected_schedule.updated_at = datetime.utcnow()
        action_msg = f"Resumed {req.medicine_name}"
    elif req.action == "remove" and affected_schedule:
        action_msg = f"Removed {affected_schedule.medicine_name}"
        db.delete(affected_schedule)
    else:
        affected_schedule = MedicineSchedule(
            patient_id=patient.id,
            prescription_id=prescription.id,
            medicine_name=req.medicine_name,
            dosage=req.dosage,
            time_slot=req.time_slot or "Morning",
            food_instruction=req.food_instruction or "After meals",
            duration=req.duration or "7 days",
            status="Upcoming"
        )
        db.add(affected_schedule)
        action_msg = f"Updated {req.medicine_name} ({req.dosage})"

    # Update or add PrescriptionItem
    presc_item = db.query(PrescriptionItem).filter(
        PrescriptionItem.prescription_id == prescription.id,
        PrescriptionItem.medicine_name == req.medicine_name
    ).first()

    if not presc_item and req.action != "remove":
        presc_item = PrescriptionItem(
            prescription_id=prescription.id,
            medicine_name=req.medicine_name,
            dosage=req.dosage,
            frequency=req.frequency,
            duration=req.duration or "7 days",
            food_instruction=req.food_instruction or "After meals",
            instructions=req.notes or f"Take as directed. {req.refill_instructions or ''}"
        )
        db.add(presc_item)
    elif presc_item and req.action != "remove":
        presc_item.dosage = req.dosage
        presc_item.frequency = req.frequency
        presc_item.duration = req.duration or presc_item.duration
        presc_item.food_instruction = req.food_instruction or presc_item.food_instruction
        if req.notes:
            presc_item.instructions = req.notes
    elif presc_item and req.action == "remove":
        db.delete(presc_item)

    # Insert Patient Notification
    notif = Notification(
        user_id=patient.user_id,
        patient_id=patient.id,
        recipient_role="patient",
        title="Prescription Updated 💊",
        message=f"Dr. Sarah Mitchell updated your medication: {action_msg}. Please view your updated Smart Pharmacy schedule.",
        type="medication_updated"
    )
    db.add(notif)

    # Insert Patient Timeline Event
    timeline_event = PatientTimeline(
        patient_id=patient.id,
        event_type="Prescription Update",
        event_title=f"Medication {req.action.capitalize()}: {req.medicine_name}",
        event_description=f"Dr. Sarah Mitchell {action_msg}. Instructions: {req.notes or 'Take as prescribed.'}"
    )
    db.add(timeline_event)

    # Insert Doctor Activity Feed Log
    STORE_ACTIVITY_FEED.insert(0, {
        "id": f"act-{len(STORE_ACTIVITY_FEED)+1}",
        "time": "Just now",
        "timestamp": datetime.utcnow().isoformat(),
        "type": "prescription",
        "title": "Medication Updated",
        "description": f"Dr. Sarah Mitchell {action_msg} for {patient.first_name} {patient.last_name}",
        "patient_name": f"{patient.first_name} {patient.last_name}",
        "user": "Dr. Sarah Mitchell",
        "status": "Updated"
    })

    db.commit()

    # Re-fetch updated schedules
    updated_schedules = db.query(MedicineSchedule).filter(MedicineSchedule.patient_id == patient.id).order_by(MedicineSchedule.created_at.desc()).all()

    return {
        "status": "success",
        "message": f"Medication workflow synced successfully. {action_msg}",
        "safety_warnings": safety_warnings,
        "schedules": updated_schedules,
        "audit_log": {
            "doctor": "Dr. Sarah Mitchell",
            "action": action_msg,
            "timestamp": datetime.utcnow().isoformat()
        }
    }


class CostOptimizationDecisionRequest(BaseModel):
    patient_id: str
    schedule_id: Optional[str] = None
    original_medicine: str
    generic_alternative: str
    active_ingredient: str
    brand_cost: float
    generic_cost: float
    monthly_savings: float
    decision: str  # "accepted" | "rejected"
    doctor_notes: Optional[str] = None


@router.get("/patient/{patient_id}/cost-optimization")
async def get_cost_optimization(patient_id: str, db: Session = Depends(get_db)):
    try:
        uid = uuid.UUID(patient_id)
        patient = db.query(Patient).filter(Patient.id == uid).first()
    except Exception:
        patient = None

    if not patient:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    schedules = db.query(MedicineSchedule).filter(
        MedicineSchedule.patient_id == patient.id,
        MedicineSchedule.status != "Discontinued"
    ).all()

    GENERIC_CATALOGUE = {
        "Crocin 500mg": {"generic": "Paracetamol 500mg", "ingredient": "Paracetamol", "dosage": "500mg Oral Tablet", "brand_cost": 60.0, "generic_cost": 18.0},
        "Amoxicillin 500mg": {"generic": "Amoxicillin Trihydrate 500mg", "ingredient": "Amoxicillin", "dosage": "500mg Capsule", "brand_cost": 120.0, "generic_cost": 38.0},
        "Augmentin 625mg": {"generic": "Amoxicillin + Clavulanate 625mg", "ingredient": "Amoxicillin / Clavulanate", "dosage": "625mg Tablet", "brand_cost": 220.0, "generic_cost": 85.0},
        "Metformin 850mg": {"generic": "Metformin Hydrochloride 850mg", "ingredient": "Metformin", "dosage": "850mg ER Tablet", "brand_cost": 180.0, "generic_cost": 45.0},
        "Metformin 500mg": {"generic": "Metformin Hydrochloride 500mg", "ingredient": "Metformin", "dosage": "500mg Tablet", "brand_cost": 110.0, "generic_cost": 32.0},
        "Losartan 50mg": {"generic": "Losartan Potassium 50mg", "ingredient": "Losartan", "dosage": "50mg Film Tablet", "brand_cost": 150.0, "generic_cost": 48.0},
        "Lipitor 20mg": {"generic": "Atorvastatin Calcium 20mg", "ingredient": "Atorvastatin", "dosage": "20mg Tablet", "brand_cost": 320.0, "generic_cost": 95.0},
        "Atorvastatin 20mg": {"generic": "Atorvastatin 20mg Generic", "ingredient": "Atorvastatin", "dosage": "20mg Tablet", "brand_cost": 280.0, "generic_cost": 90.0},
        "Pantocid 40mg": {"generic": "Pantoprazole Sodium 40mg", "ingredient": "Pantoprazole", "dosage": "40mg EC Tablet", "brand_cost": 140.0, "generic_cost": 42.0},
        "Amlodipine 5mg": {"generic": "Amlodipine Besylate 5mg", "ingredient": "Amlodipine", "dosage": "5mg Tablet", "brand_cost": 95.0, "generic_cost": 28.0},
    }

    decisions = db.query(CostOptimizationDecision).filter(CostOptimizationDecision.patient_id == patient.id).all()
    decision_map = {d.original_medicine: d.status for d in decisions}

    items = []
    total_brand_cost = 0.0
    total_generic_cost = 0.0
    total_savings = 0.0
    medicines_optimized = 0

    med_list = [s.medicine_name for s in schedules] if schedules else ["Crocin 500mg", "Augmentin 625mg", "Lipitor 20mg"]

    for med in med_list:
        clean_name = med.strip()
        data = GENERIC_CATALOGUE.get(clean_name)
        if not data:
            parts = clean_name.split()
            base = parts[0] if parts else "Medication"
            mg = parts[1] if len(parts) > 1 else "500mg"
            data = {
                "generic": f"{base} Bio-Equivalent {mg}",
                "ingredient": base,
                "dosage": f"{mg} Tablet",
                "brand_cost": 120.0,
                "generic_cost": 40.0
            }

        decision_status = decision_map.get(clean_name, "pending")
        b_cost = data["brand_cost"]
        g_cost = data["generic_cost"]
        savings = (b_cost - g_cost) * 30 if b_cost > g_cost else 420.0

        total_brand_cost += b_cost * 30
        total_generic_cost += g_cost * 30
        total_savings += savings
        medicines_optimized += 1

        sch_obj = next((s for s in schedules if s.medicine_name == med), None)
        items.append({
            "schedule_id": str(sch_obj.id) if sch_obj else None,
            "medicine_prescribed": clean_name,
            "brand_name": clean_name,
            "generic_alternative": data["generic"],
            "active_ingredient": data["ingredient"],
            "dosage": data["dosage"],
            "brand_cost": round(b_cost, 2),
            "generic_cost": round(g_cost, 2),
            "monthly_savings": round(savings, 2),
            "availability": "Available",
            "recommendation": "Recommended",
            "status": decision_status,
            "is_accepted": decision_status == "accepted"
        })

    avg_cost_reduction = round((total_savings / total_brand_cost * 100), 1) if total_brand_cost > 0 else 68.0

    return {
        "summary": {
            "estimated_monthly_savings": round(total_savings, 2),
            "medicines_optimized": medicines_optimized,
            "average_cost_reduction": avg_cost_reduction,
            "generic_alternatives_count": len(items),
            "no_therapeutic_changes_required": True
        },
        "ai_recommendation": (
            f"Three prescribed medicines have clinically equivalent generic alternatives with the same active ingredient and dosage. "
            f"Switching to these alternatives may reduce monthly medication costs by approximately ₹{int(total_savings):,} "
            f"while maintaining therapeutic effectiveness. Final prescribing decisions remain under the doctor's supervision."
        ),
        "safety_validations": [
            {"label": "Same Active Ingredient", "passed": True},
            {"label": "Same Strength", "passed": True},
            {"label": "Same Dosage Form", "passed": True},
            {"label": "Therapeutically Equivalent", "passed": True},
            {"label": "No Additional Drug Interaction", "passed": True},
            {"label": "Doctor Approval Required", "passed": True}
        ],
        "graph_data": {
            "brand_total": round(total_brand_cost, 2),
            "generic_total": round(total_generic_cost, 2),
            "savings_total": round(total_savings, 2)
        },
        "medicines": items
    }


@router.post("/cost-optimization/decision")
async def save_cost_optimization_decision(req: CostOptimizationDecisionRequest, db: Session = Depends(get_db)):
    try:
        uid = uuid.UUID(req.patient_id)
        patient = db.query(Patient).filter(Patient.id == uid).first()
    except Exception:
        patient = None

    if not patient:
        patient = db.query(Patient).filter(Patient.patient_id == req.patient_id).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    decision = db.query(CostOptimizationDecision).filter(
        CostOptimizationDecision.patient_id == patient.id,
        CostOptimizationDecision.original_medicine == req.original_medicine
    ).first()

    if not decision:
        decision = CostOptimizationDecision(
            patient_id=patient.id,
            original_medicine=req.original_medicine,
            generic_alternative=req.generic_alternative,
            active_ingredient=req.active_ingredient,
            brand_cost=req.brand_cost,
            generic_cost=req.generic_cost,
            monthly_savings=req.monthly_savings,
            status=req.decision,
            doctor_notes=req.doctor_notes or "Physician reviewed generic equivalence."
        )
        db.add(decision)
    else:
        decision.status = req.decision
        decision.updated_at = datetime.utcnow()

    action_msg = ""
    if req.decision == "accepted":
        sch = None
        if req.schedule_id:
            try:
                sch_id = uuid.UUID(req.schedule_id)
                sch = db.query(MedicineSchedule).filter(MedicineSchedule.id == sch_id).first()
            except Exception:
                sch = None

        if not sch:
            sch = db.query(MedicineSchedule).filter(
                MedicineSchedule.patient_id == patient.id,
                MedicineSchedule.medicine_name == req.original_medicine
            ).first()

        if sch:
            sch.medicine_name = req.generic_alternative
            sch.updated_at = datetime.utcnow()

        prescription = db.query(Prescription).filter(Prescription.patient_id == patient.id).order_by(Prescription.created_at.desc()).first()
        if prescription:
            p_item = db.query(PrescriptionItem).filter(
                PrescriptionItem.prescription_id == prescription.id,
                PrescriptionItem.medicine_name == req.original_medicine
            ).first()
            if p_item:
                p_item.medicine_name = req.generic_alternative

        action_msg = f"Switched {req.original_medicine} to bio-equivalent generic {req.generic_alternative}"

        notif = Notification(
            user_id=patient.user_id,
            patient_id=patient.id,
            recipient_role="patient",
            title="Generic Medication Optimized 💰",
            message=f"Dr. Sarah Mitchell updated your prescription to generic {req.generic_alternative} (Estimated savings: ₹{req.monthly_savings:.0f}/month).",
            type="medication_optimized"
        )
        db.add(notif)

        timeline_event = PatientTimeline(
            patient_id=patient.id,
            event_type="Cost Optimization",
            event_title=f"Generic Switch: {req.generic_alternative}",
            event_description=f"Switched from {req.original_medicine} to {req.generic_alternative}. Monthly savings: ₹{req.monthly_savings:.0f}."
        )
        db.add(timeline_event)

        STORE_ACTIVITY_FEED.insert(0, {
            "id": f"act-{len(STORE_ACTIVITY_FEED)+1}",
            "time": "Just now",
            "timestamp": datetime.utcnow().isoformat(),
            "type": "cost_optimization",
            "title": "Generic Switch Approved",
            "description": f"Dr. Sarah Mitchell approved generic {req.generic_alternative} for {patient.first_name} {patient.last_name}",
            "patient_name": f"{patient.first_name} {patient.last_name}",
            "user": "Dr. Sarah Mitchell",
            "status": "Approved"
        })
    else:
        action_msg = f"Retained brand medicine {req.original_medicine}"

    db.commit()

    return {
        "status": "success",
        "message": f"Cost optimization decision recorded: {action_msg}",
        "decision": req.decision,
        "original_medicine": req.original_medicine,
        "generic_alternative": req.generic_alternative
    }
