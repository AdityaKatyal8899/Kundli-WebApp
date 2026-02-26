import os
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
inspector = inspect(engine)

print("--- TABLES START ---")
for table in inspector.get_table_names():
    print(f"TABLE: {table}")
print("--- TABLES END ---")
