from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    stmts = [
        "ALTER TABLE notifications ALTER COLUMN user_id DROP NOT NULL;",
        "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS patient_id UUID;",
        "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS doctor_id UUID;",
        "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS recipient_role VARCHAR(50) DEFAULT 'patient';",
        "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS reference_id VARCHAR(100);",
    ]
    for stmt in stmts:
        try:
            conn.execute(text(stmt))
            print("OK:", stmt[:60])
        except Exception as e:
            print("ERR:", e)
    conn.commit()
print("Notifications schema migration completed successfully.")
