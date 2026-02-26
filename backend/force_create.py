import os
from sqlalchemy import create_engine
from app.database import Base, engine
from app.models.sqlalchemy_model import User, Profile, UserPhoto, Connection, ProfileView, Message
from app.models.astrology_model import Chart
from dotenv import load_dotenv

load_dotenv()

print("Creating all tables...")
Base.metadata.create_all(engine)
print("Tables created (if missing).")

from sqlalchemy import inspect
inspector = inspect(engine)
print(f"Current tables: {inspector.get_table_names()}")
