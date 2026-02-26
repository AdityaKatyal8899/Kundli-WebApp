import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found")
    exit(1)

engine = create_engine(DATABASE_URL)

alter_queries = [
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS salary INTEGER;",
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS community VARCHAR(100);",
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;",
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;"
]

with engine.connect() as conn:
    for query in alter_queries:
        try:
            conn.execute(text(query))
            conn.commit()
            print(f"Executed: {query}")
        except Exception as e:
            print(f"Error executing {query}: {e}")

print("Migration complete.")
