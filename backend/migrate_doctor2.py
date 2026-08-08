from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    stmts = [
        "ALTER TABLE doctors ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 5",
        "ALTER TABLE doctors ADD COLUMN IF NOT EXISTS consultation_fee VARCHAR(50) DEFAULT '500'",
    ]
    for stmt in stmts:
        conn.execute(text(stmt))
        print("OK:", stmt[:60])
    conn.commit()
print("Done.")
