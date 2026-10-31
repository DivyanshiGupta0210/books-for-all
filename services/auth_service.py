# auth service
from fastapi import HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from auth import DUMMY_HASH, create_access_token, hash_password, verify_password
from models import User
from schemas import UserCreate, UserUpdate


def _token_response(user: User) -> dict:
    return {
        "access_token": create_access_token({"sub": str(user.id)}),
        "token_type": "bearer",
        "user": user,
    }


def register_user(user_data: UserCreate, db: Session):
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Username is already taken")
    if db.query(User).filter(func.lower(User.email) == user_data.email).first():
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "An account with this email already exists"
        )

    user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        password_hash=hash_password(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _token_response(user)


def authenticate(identifier: str, password: str, db: Session) -> User:
    identifier = identifier.strip().lower()
    user = (
        db.query(User)
        .filter(or_(User.username == identifier, func.lower(User.email) == identifier))
        .first()
    )

    # Always run one bcrypt check so timing doesn't reveal which accounts exist.
    ok = verify_password(password, user.password_hash if user else DUMMY_HASH)
    if not user or not ok:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid username or password")
    return user


def login_user(identifier: str, password: str, db: Session):
    return _token_response(authenticate(identifier, password, db))


def update_profile(user: User, payload: UserUpdate, db: Session) -> User:
    if payload.full_name is not None:
        user.full_name = payload.full_name

    if payload.email is not None and payload.email != user.email:
        taken = (
            db.query(User)
            .filter(func.lower(User.email) == payload.email, User.id != user.id)
            .first()
        )
        if taken:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, "That email is already in use"
            )
        user.email = payload.email

    db.commit()
    db.refresh(user)
    return user
