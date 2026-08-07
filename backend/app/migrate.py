import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")

def run_migrations():
    print(f"Connecting to {db_url}")
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # 1. Alter patients
    try:
        cur.execute("ALTER TABLE patients ADD COLUMN recovery_score INTEGER DEFAULT 0;")
        print("Added recovery_score to patients")
    except psycopg2.errors.DuplicateColumn:
        print("recovery_score already exists")
        conn.rollback()
    
    try:
        cur.execute("ALTER TABLE patients ADD COLUMN medication_safety_score INTEGER DEFAULT 100;")
        print("Added medication_safety_score to patients")
    except psycopg2.errors.DuplicateColumn:
        print("medication_safety_score already exists")
        conn.rollback()

    # 2. Alter consultations
    try:
        cur.execute("ALTER TABLE consultations ADD COLUMN clinical_notes JSON;")
        print("Added clinical_notes to consultations")
    except psycopg2.errors.DuplicateColumn:
        print("clinical_notes already exists")
        conn.rollback()
        
    try:
        cur.execute("ALTER TABLE consultations ADD COLUMN status VARCHAR(50) DEFAULT 'Pending' NOT NULL;")
        print("Added status to consultations")
    except psycopg2.errors.DuplicateColumn:
        print("status already exists")
        conn.rollback()

    conn.commit()
    cur.close()
    conn.close()
    print("Migrations complete.")

if __name__ == "__main__":
    run_migrations()
