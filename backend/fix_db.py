import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.database import engine
from sqlalchemy import text

try:
    with engine.begin() as con:
        con.execute(text("ALTER TABLE consultations ADD COLUMN soap_notes JSON;"))
        print("Successfully added soap_notes column.")
except Exception as e:
    print(f"Error adding soap_notes: {e}")
