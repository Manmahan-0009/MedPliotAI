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

router = APIRouter(prefix="/api/pharmacy", tags=["Pharmacy"])

class OrderItemModel(BaseModel):
    medicine_id: str
    quantity: int

class OrderRequest(BaseModel):
    patient_id: str
    address: str
    payment_info: str
    items: List[OrderItemModel]

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
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
            
    schedules = db.query(MedicineSchedule).filter(MedicineSchedule.patient_id == patient.id).all()
    return schedules
