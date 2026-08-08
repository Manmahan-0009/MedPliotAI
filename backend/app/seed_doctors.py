"""
Seed script for multi-department Doctors in database.
Run with: python -m app.seed_doctors
"""
import sys
import os
import json
import uuid
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app.models.doctor import Doctor
from app.models.user import User, UserRole

DEFAULT_SLOTS = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"]

DEMO_DOCTORS = [
    {
        "full_name": "Dr. Sarah Mitchell",
        "department": "General Medicine",
        "specialization": "Internal Medicine",
        "medical_registration_number": "REG-2026-9901",
        "phone": "9876543200",
        "experience_years": 12,
        "consultation_fee": "₹800",
        "hospital": "MediPilot Super Speciality Hospital",
        "rating": 4.9,
        "availability_status": "Available Today",
        "available_slots": json.dumps(["09:00 AM", "09:30 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "04:00 PM"]),
        "profile_image_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"
    },
    {
        "full_name": "Dr. Rajesh Varma",
        "department": "Cardiology",
        "specialization": "Interventional Cardiologist",
        "medical_registration_number": "REG-2026-8812",
        "phone": "9876543201",
        "experience_years": 18,
        "consultation_fee": "₹1,200",
        "hospital": "MediPilot Heart & Vascular Institute",
        "rating": 5.0,
        "availability_status": "Available Today",
        "available_slots": json.dumps(["10:00 AM", "10:30 AM", "11:00 AM", "02:30 PM", "03:00 PM", "04:30 PM"]),
        "profile_image_url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300"
    },
    {
        "full_name": "Dr. Priya Ananth",
        "department": "Dermatology",
        "specialization": "Cosmetic Dermatologist",
        "medical_registration_number": "REG-2026-7734",
        "phone": "9876543202",
        "experience_years": 8,
        "consultation_fee": "₹700",
        "hospital": "MediPilot Skin & Aesthetics Clinic",
        "rating": 4.8,
        "availability_status": "Available Today",
        "available_slots": json.dumps(["09:30 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]),
        "profile_image_url": "https://images.unsplash.com/photo-1594824813566-88855ce78964?auto=format&fit=crop&q=80&w=300"
    },
    {
        "full_name": "Dr. Vikram Kulkarni",
        "department": "Orthopedics",
        "specialization": "Joint Replacement Specialist",
        "medical_registration_number": "REG-2026-6645",
        "phone": "9876543203",
        "experience_years": 15,
        "consultation_fee": "₹1,000",
        "hospital": "MediPilot Bone & Joint Center",
        "rating": 4.9,
        "availability_status": "Available Today",
        "available_slots": json.dumps(["10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "04:30 PM"]),
        "profile_image_url": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300"
    },
    {
        "full_name": "Dr. Ananya Sen",
        "department": "Neurology",
        "specialization": "Clinical Neurophysiologist",
        "medical_registration_number": "REG-2026-5511",
        "phone": "9876543204",
        "experience_years": 11,
        "consultation_fee": "₹950",
        "hospital": "MediPilot Neuro Care Center",
        "rating": 4.7,
        "availability_status": "Available Today",
        "available_slots": json.dumps(["09:00 AM", "10:30 AM", "11:30 AM", "02:30 PM", "04:00 PM"]),
        "profile_image_url": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300"
    },
    {
        "full_name": "Dr. Rohan Mehta",
        "department": "Pediatrics",
        "specialization": "Pediatrician & Child Health",
        "medical_registration_number": "REG-2026-4422",
        "phone": "9876543205",
        "experience_years": 9,
        "consultation_fee": "₹650",
        "hospital": "MediPilot Children's Care Wing",
        "rating": 4.9,
        "availability_status": "Available Today",
        "available_slots": json.dumps(["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]),
        "profile_image_url": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300"
    }
]

def seed_doctors():
    db = SessionLocal()
    try:
        Base.metadata.create_all(bind=engine)
        
        main_user = db.query(User).filter(User.email == "doctor@medipilot.ai").first()
        
        for data in DEMO_DOCTORS:
            existing = db.query(Doctor).filter(Doctor.full_name == data["full_name"]).first()
            if existing:
                for k, v in data.items():
                    setattr(existing, k, v)
                if data["full_name"] == "Dr. Sarah Mitchell" and main_user:
                    existing.user_id = main_user.id
                print(f"Updated existing doctor: {data['full_name']}")
            else:
                user_id_val = main_user.id if (data["full_name"] == "Dr. Sarah Mitchell" and main_user) else None
                doc = Doctor(**data, user_id=user_id_val)
                db.add(doc)
                print(f"Created doctor: {data['full_name']} ({data['department']})")
        
        db.commit()
        print("Doctor seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Failed to seed doctors: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_doctors()
