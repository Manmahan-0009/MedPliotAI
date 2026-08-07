from dataclasses import dataclass
from typing import Optional

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.firebase import verify_firebase_token
from app.database import get_db
from app.models.user import User, UserRole


@dataclass
class AuthenticatedUser:
    user: User
    firebase_uid: str
    email: Optional[str]


def _load_user(decoded_token: dict, db: Session) -> User:
    uid = decoded_token.get("uid")
    if not uid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user = db.query(User).filter(User.firebase_uid == uid).first()
    if not user:
        email = decoded_token.get("email")
        if email:
            user = db.query(User).filter(User.email == email).first()
            if user and not user.firebase_uid:
                user.firebase_uid = uid
                db.commit()
                db.refresh(user)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found. Please complete registration.",
        )

    return user


def get_current_user(
    decoded_token: dict = Depends(verify_firebase_token),
    db: Session = Depends(get_db),
) -> AuthenticatedUser:
    user = _load_user(decoded_token, db)
    return AuthenticatedUser(
        user=user,
        firebase_uid=decoded_token.get("uid", user.firebase_uid),
        email=decoded_token.get("email", user.email),
    )


def require_doctor(
    current: AuthenticatedUser = Depends(get_current_user),
) -> AuthenticatedUser:
    if current.user.role != UserRole.doctor:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Doctor access required")
    return current


def require_patient(
    current: AuthenticatedUser = Depends(get_current_user),
) -> AuthenticatedUser:
    if current.user.role != UserRole.patient:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patient access required")
    return current
