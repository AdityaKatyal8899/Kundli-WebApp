import os
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Connecting to: {DATABASE_URL}")
engine = create_engine(DATABASE_URL)
inspector = inspect(engine)

tables = inspector.get_table_names()
print(f"Tables found: {len(tables)}")
for table in tables:
    columns = [c['name'] for c in inspector.get_columns(table)]
    print(f"Table: {table}, Columns: {columns}")
