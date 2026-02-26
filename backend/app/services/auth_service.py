from google.oauth2 import id_token
from google.auth.transport import requests
import os
from app.services.user_service import get_user_by_email, create_user
from app.JWT_token import create_access_token

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


def verify_google_token(token: str):
    try:
        id_info = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10
        )
        print(id_info)
        return id_info
    except Exception as e:
        print(e)
        return None


def google_login(id_token_str: str, db):
    print(f"[AUTH SERVICE] Verifying token for CLIENT_ID: {GOOGLE_CLIENT_ID}")
    id_info = verify_google_token(id_token_str)

    if not id_info:
        return None

    email = id_info.get("email")
    name = id_info.get("name")
    google_id = id_info.get("sub")

    user = get_user_by_email(db, email)

    if not user:
        user = create_user(
            db=db,
            email=email,
            password=None,
            provider="google",
            provider_id=google_id,
            name=name
        )

    access_token = create_access_token({"sub": str(user.id)})

    return access_token