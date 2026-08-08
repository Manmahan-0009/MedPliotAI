from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    stmts = [
        "ALTER TABLE doctors ADD COLUMN IF NOT EXISTS hospital VARCHAR(255) DEFAULT 'MediPilot Super Speciality Hospital'",
        "ALTER TABLE doctors ADD COLUMN IF NOT EXISTS rating FLOAT DEFAULT 4.8",
        "ALTER TABLE doctors ADD COLUMN IF NOT EXISTS profile_image_url TEXT",
        "ALTER TABLE doctors ADD COLUMN IF NOT EXISTS availability_status VARCHAR(50) DEFAULT 'Available Today'",
        "ALTER TABLE doctors ADD COLUMN IF NOT EXISTS available_slots TEXT",
    ]
    for stmt in stmts:
        try:
            conn.execute(text(stmt))
            print('OK:', stmt[:70])
        except Exception as e:
            print('ERR:', str(e)[:100])
    conn.commit()
print('Done.')
