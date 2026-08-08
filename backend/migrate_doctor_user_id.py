from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE doctors ALTER COLUMN user_id DROP NOT NULL;"))
        conn.commit()
        print("OK: user_id is now nullable in doctors table.")
    except Exception as e:
        print("Notice:", e)
