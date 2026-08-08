from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
import uuid

from app.database import get_db
from app.models.notification import Notification

router = APIRouter(prefix="/api", tags=["Notifications"])


@router.get("/notifications/doctor/{doctor_id}")
def get_doctor_notifications(doctor_id: str, db: Session = Depends(get_db)):
    try:
        doc_uuid = uuid.UUID(doctor_id)
        notifications = db.query(Notification).filter(
            Notification.doctor_id == doc_uuid,
            Notification.recipient_role == "doctor"
        ).order_by(Notification.created_at.desc()).limit(30).all()
    except Exception:
        notifications = db.query(Notification).filter(
            Notification.recipient_role == "doctor"
        ).order_by(Notification.created_at.desc()).limit(30).all()

    result = []
    for n in notifications:
        result.append({
            "id": str(n.id),
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "reference_id": n.reference_id,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat()
        })

    unread_count = sum(1 for n in result if not n["is_read"])
    return {"notifications": result, "unread_count": unread_count}


@router.get("/notifications/patient/{patient_id}")
def get_patient_notifications(patient_id: str, db: Session = Depends(get_db)):
    try:
        pat_uuid = uuid.UUID(patient_id)
        notifications = db.query(Notification).filter(
            Notification.patient_id == pat_uuid,
            Notification.recipient_role == "patient"
        ).order_by(Notification.created_at.desc()).limit(30).all()
    except Exception:
        notifications = db.query(Notification).filter(
            Notification.recipient_role == "patient"
        ).order_by(Notification.created_at.desc()).limit(30).all()

    result = []
    for n in notifications:
        result.append({
            "id": str(n.id),
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "reference_id": n.reference_id,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat()
        })

    unread_count = sum(1 for n in result if not n["is_read"])
    return {"notifications": result, "unread_count": unread_count}


@router.put("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: str, db: Session = Depends(get_db)):
    try:
        notif_uuid = uuid.UUID(notification_id)
        notification = db.query(Notification).filter(Notification.id == notif_uuid).first()
        if notification:
            notification.is_read = True
            db.commit()
            return {"message": "Notification marked as read"}
    except Exception:
        pass
    return {"message": "Notification not found"}


@router.put("/notifications/read-all/doctor/{doctor_id}")
def mark_all_doctor_notifications_read(doctor_id: str, db: Session = Depends(get_db)):
    try:
        doc_uuid = uuid.UUID(doctor_id)
        db.query(Notification).filter(
            Notification.doctor_id == doc_uuid,
            Notification.recipient_role == "doctor",
            Notification.is_read == False
        ).update({"is_read": True})
        db.commit()
    except Exception:
        pass
    return {"message": "All notifications marked as read"}


@router.put("/notifications/read-all/patient/{patient_id}")
def mark_all_patient_notifications_read(patient_id: str, db: Session = Depends(get_db)):
    try:
        pat_uuid = uuid.UUID(patient_id)
        db.query(Notification).filter(
            Notification.patient_id == pat_uuid,
            Notification.recipient_role == "patient",
            Notification.is_read == False
        ).update({"is_read": True})
        db.commit()
    except Exception:
        pass
    return {"message": "All notifications marked as read"}
