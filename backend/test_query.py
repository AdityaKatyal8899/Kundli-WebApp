import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        res = conn.execute(text("SELECT * FROM profiles LIMIT 1"))
        print("Success! Table 'profiles' exists.")
        print(f"Columns: {res.keys()}")
except Exception as e:
    print(f"Table 'profiles' does not exist or error: {e}")
