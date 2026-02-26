"""
Seed script for taxonomy tables.
Run: python seed_taxonomy.py
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models.sqlalchemy_model import Religion, EducationLevel, OccupationType, SalaryRange

# Create tables if they don't exist yet
Base.metadata.create_all(bind=engine)

db = SessionLocal()

def seed_if_empty(model, items, label_field="name"):
    if db.query(model).first():
        print(f"[skip] {model.__tablename__} already has data.")
        return
    for i, item in enumerate(items):
        db.add(model(display_order=i, **item))
    db.commit()
    print(f"[ok]   Seeded {len(items)} rows into {model.__tablename__}.")


# ── Religions ──────────────────────────────────
seed_if_empty(Religion, [
    {"name": "Hindu"},
    {"name": "Muslim"},
    {"name": "Sikh"},
    {"name": "Christian"},
    {"name": "Jain"},
    {"name": "Buddhist"},
    {"name": "Other"},
])

# ── Education Levels ───────────────────────────
seed_if_empty(EducationLevel, [
    {"name": "High School"},
    {"name": "Diploma"},
    {"name": "Bachelors"},
    {"name": "Masters"},
    {"name": "MBA"},
    {"name": "PhD"},
    {"name": "Other"},
])

# ── Occupation Types ───────────────────────────
seed_if_empty(OccupationType, [
    {"name": "Student"},
    {"name": "IT Professional"},
    {"name": "Business"},
    {"name": "Government Job"},
    {"name": "Healthcare"},
    {"name": "Education"},
    {"name": "Finance"},
    {"name": "Defense"},
    {"name": "Arts"},
    {"name": "Other"},
])

# ── Salary Ranges ──────────────────────────────
seed_if_empty(SalaryRange, [
    {"label": "Below ₹3 LPA",           "min_value": 0,        "max_value": 300000},
    {"label": "₹3–6 LPA",               "min_value": 300000,   "max_value": 600000},
    {"label": "₹6–10 LPA",              "min_value": 600000,   "max_value": 1000000},
    {"label": "₹10–20 LPA",             "min_value": 1000000,  "max_value": 2000000},
    {"label": "₹20+ LPA",               "min_value": 2000000,  "max_value": None},
    {"label": "Prefer not to disclose", "min_value": None,     "max_value": None},
])

db.close()
print("\n✅ Taxonomy seeding complete.")
