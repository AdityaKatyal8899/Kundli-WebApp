from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from .database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, profile, search, connection, chat, astrology, photos, users

app = FastAPI()


app.add_middleware(
    CORSMiddleware, 
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(search.router)
app.include_router(connection.router)
app.include_router(chat.router)
app.include_router(astrology.router)
app.include_router(photos.router)
app.include_router(users.router)
print("Google route hit")

Base.metadata.create_all(engine) 