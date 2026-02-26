import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Use a safer fallback or raise with more context
    print("WARNING: DATABASE_URL environment variable is not set. Falling back to local development DB if available.")
    # You might want to keep a local fallback for dev, but for production it's critical.
    # DATABASE_URL = "postgresql+psycopg2://postgres:Aditya8899@localhost:5432/kundli-base"
    raise ValueError("DATABASE_URL environment variable is not set. Please configure it in your environment.")

# Render/Heroku fix: SQLAlchemy 1.4+ requires 'postgresql://' instead of 'postgres://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Ensure psycopg2 driver is explicitly used if needed
if DATABASE_URL.startswith("postgresql://") and "+psycopg2" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

print(f"Attempting to connect to database... (URL hidden for security)")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

# DB connection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
