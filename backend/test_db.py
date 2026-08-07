import sys
sys.path.insert(0, '.')
from app.database import engine, Base
import app.models  # noqa
try:
    with engine.connect() as conn:
        print("DB connection OK")
    Base.metadata.create_all(bind=engine)
    print("Tables created/verified OK")
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
