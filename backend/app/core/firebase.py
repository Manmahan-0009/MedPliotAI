import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Header
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin SDK once
_firebase_initialized = False

def _init_firebase():
    global _firebase_initialized
    if not _firebase_initialized:
        service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "firebase-service-account.json")
        # Resolve relative to this file's directory
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        full_path = os.path.join(base_dir, "backend", service_account_path)
        if not os.path.exists(full_path):
            # Try relative to cwd
            full_path = service_account_path
        cred = credentials.Certificate(full_path)
        firebase_admin.initialize_app(cred)
        _firebase_initialized = True


def verify_firebase_token(authorization: Optional[str] = Header(None)) -> dict:
    """
    FastAPI dependency. Extracts and verifies Firebase JWT from Authorization header.
    Returns decoded token dict with uid, email, etc.
    """
    _init_firebase()

    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format. Expected 'Bearer <token>'")

    token = authorization.split(" ", 1)[1]

    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Firebase token expired")
    except auth.InvalidIdTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Firebase token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")


def optional_verify_firebase_token(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """
    Same as verify_firebase_token but doesn't raise if no token is provided.
    Useful for endpoints that work with or without auth.
    """
    if not authorization:
        return None
    try:
        return verify_firebase_token(authorization)
    except HTTPException:
        return None
