import os
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.medicine import MedicineCatalogue

# Create tables
Base.metadata.create_all(bind=engine)

medicines_data = [
    {
        "name": "Paracetamol 500mg",
        "generic_name": "Acetaminophen",
        "brand": "Tylenol",
        "manufacturer": "Johnson & Johnson",
        "price": 5.99,
        "availability": True,
        "rating": 4.8,
        "description": "Used to treat mild to moderate pain and reduce fever.",
        "composition": "Paracetamol 500mg",
        "uses": "Fever, Headache, Muscle ache",
        "side_effects": "Nausea, Rash (rare)",
        "dosage_info": "1-2 tablets every 4-6 hours as needed.",
        "storage_instructions": "Store below 30°C in a dry place.",
        "category": "Pain Relief",
        "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80"
    },
    {
        "name": "Metformin 500mg",
        "generic_name": "Metformin Hydrochloride",
        "brand": "Glucophage",
        "manufacturer": "Merck",
        "price": 12.50,
        "availability": True,
        "rating": 4.5,
        "description": "First-line medication for the treatment of type 2 diabetes.",
        "composition": "Metformin 500mg",
        "uses": "Type 2 Diabetes",
        "side_effects": "Nausea, Diarrhea, Stomach upset",
        "dosage_info": "500mg twice a day with meals.",
        "storage_instructions": "Store at room temperature away from moisture and heat.",
        "category": "Diabetes",
        "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80"
    },
    {
        "name": "Amlodipine 5mg",
        "generic_name": "Amlodipine Besylate",
        "brand": "Norvasc",
        "manufacturer": "Pfizer",
        "price": 15.00,
        "availability": True,
        "rating": 4.6,
        "description": "Calcium channel blocker used to treat high blood pressure and chest pain.",
        "composition": "Amlodipine 5mg",
        "uses": "Hypertension, Angina",
        "side_effects": "Swelling, Dizziness, Fatigue",
        "dosage_info": "5mg once daily.",
        "storage_instructions": "Store at room temperature.",
        "category": "Cardiology",
        "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80"
    },
    {
        "name": "Atorvastatin 20mg",
        "generic_name": "Atorvastatin Calcium",
        "brand": "Lipitor",
        "manufacturer": "Pfizer",
        "price": 18.20,
        "availability": True,
        "rating": 4.7,
        "description": "Statin medication used to prevent cardiovascular disease in those at high risk.",
        "composition": "Atorvastatin 20mg",
        "uses": "High Cholesterol, Cardiovascular risk reduction",
        "side_effects": "Muscle pain, Diarrhea, Joint pain",
        "dosage_info": "10-20mg once daily.",
        "storage_instructions": "Store at room temperature.",
        "category": "Cardiology",
        "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80"
    },
    {
        "name": "Azithromycin 500mg",
        "generic_name": "Azithromycin",
        "brand": "Zithromax",
        "manufacturer": "Pfizer",
        "price": 22.00,
        "availability": True,
        "rating": 4.4,
        "description": "Macrolide antibiotic used to treat various bacterial infections.",
        "composition": "Azithromycin 500mg",
        "uses": "Bacterial infections, Respiratory infections",
        "side_effects": "Nausea, Diarrhea, Abdominal pain",
        "dosage_info": "500mg on day 1, then 250mg once daily for 4 days.",
        "storage_instructions": "Store below 30°C.",
        "category": "Antibiotics",
        "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80"
    },
    {
        "name": "Omeprazole 20mg",
        "generic_name": "Omeprazole",
        "brand": "Prilosec",
        "manufacturer": "AstraZeneca",
        "price": 14.99,
        "availability": True,
        "rating": 4.8,
        "description": "Proton pump inhibitor used in the treatment of GERD and peptic ulcer disease.",
        "composition": "Omeprazole 20mg",
        "uses": "GERD, Acid reflux, Ulcers",
        "side_effects": "Headache, Nausea, Diarrhea",
        "dosage_info": "20mg once daily before a meal.",
        "storage_instructions": "Store at room temperature.",
        "category": "Gastroenterology",
        "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80"
    },
    {
        "name": "Cetirizine 10mg",
        "generic_name": "Cetirizine Hydrochloride",
        "brand": "Zyrtec",
        "manufacturer": "Johnson & Johnson",
        "price": 8.50,
        "availability": True,
        "rating": 4.7,
        "description": "Second-generation antihistamine used to treat allergic rhinitis and chronic hives.",
        "composition": "Cetirizine 10mg",
        "uses": "Allergies, Hay fever, Hives",
        "side_effects": "Drowsiness, Dry mouth",
        "dosage_info": "10mg once daily.",
        "storage_instructions": "Store at room temperature.",
        "category": "Allergy",
        "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80"
    },
    {
        "name": "Insulin Glargine",
        "generic_name": "Insulin Glargine",
        "brand": "Lantus",
        "manufacturer": "Sanofi",
        "price": 45.00,
        "availability": True,
        "rating": 4.9,
        "description": "Long-acting basal insulin analogue for blood sugar control.",
        "composition": "Insulin Glargine 100 units/mL",
        "uses": "Type 1 and Type 2 Diabetes",
        "side_effects": "Hypoglycemia, Weight gain",
        "dosage_info": "Individualized, usually once daily.",
        "storage_instructions": "Refrigerate before opening. Store below 30°C after opening.",
        "category": "Diabetes",
        "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80"
    },
    {
        "name": "Amoxicillin 500mg",
        "generic_name": "Amoxicillin",
        "brand": "Amoxil",
        "manufacturer": "GSK",
        "price": 10.00,
        "availability": True,
        "rating": 4.6,
        "description": "Penicillin antibiotic used to treat bacterial infections.",
        "composition": "Amoxicillin 500mg",
        "uses": "Bacterial infections",
        "side_effects": "Nausea, Rash, Diarrhea",
        "dosage_info": "500mg every 8 hours or 875mg every 12 hours.",
        "storage_instructions": "Store at room temperature.",
        "category": "Antibiotics",
        "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80"
    },
    {
        "name": "Lisinopril 10mg",
        "generic_name": "Lisinopril",
        "brand": "Prinivil",
        "manufacturer": "Merck",
        "price": 11.20,
        "availability": True,
        "rating": 4.5,
        "description": "ACE inhibitor used to treat high blood pressure, heart failure, and after heart attacks.",
        "composition": "Lisinopril 10mg",
        "uses": "Hypertension, Heart Failure",
        "side_effects": "Dry cough, Dizziness, Headache",
        "dosage_info": "10mg once daily.",
        "storage_instructions": "Store at room temperature.",
        "category": "Cardiology",
        "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80"
    }
]

# Generate more dummy data to hit ~100 items if needed, but 10 detailed ones + a loop is fine
prefixes = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"]
suffixes = ["pril", "statin", "mox", "fen", "cillin"]
categories = ["Pain Relief", "Antibiotics", "Cardiology", "Diabetes", "Gastroenterology"]

for i in range(11, 101):
    prefix = prefixes[i % len(prefixes)]
    suffix = suffixes[i % len(suffixes)]
    cat = categories[i % len(categories)]
    
    medicines_data.append({
        "name": f"{prefix}{suffix} {10 * (i % 5 + 1)}mg",
        "generic_name": f"{prefix.lower()}{suffix}",
        "brand": f"{prefix.capitalize()}brand",
        "manufacturer": "Generic Pharma",
        "price": round(5.0 + (i % 20) * 1.5, 2),
        "availability": i % 10 != 0, # 90% available
        "rating": round(3.5 + (i % 15) * 0.1, 1),
        "description": f"Generic medication for {cat.lower()} applications.",
        "composition": f"{prefix.lower()}{suffix} {10 * (i % 5 + 1)}mg",
        "uses": f"Treatment related to {cat.lower()}",
        "side_effects": "Mild drowsiness, headache",
        "dosage_info": "As directed by physician",
        "storage_instructions": "Store in a cool dry place.",
        "category": cat,
        "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80"
    })

def seed():
    db: Session = SessionLocal()
    try:
        # Check if catalogue is empty
        count = db.query(MedicineCatalogue).count()
        if count == 0:
            print("Seeding Medicine Catalogue...")
            for med in medicines_data:
                item = MedicineCatalogue(**med)
                db.add(item)
            db.commit()
            print(f"Successfully seeded {len(medicines_data)} medicines.")
        else:
            print(f"Medicine Catalogue already has {count} items. Skipping seed.")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
