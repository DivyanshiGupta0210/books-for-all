# auth / users router
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User
from schemas import Token, UserCreate, UserLogin, UserOut, UserUpdate
from services.auth_service import (
    login_user,
    register_user,
    update_profile as update_profile_service,
)

router = APIRouter()


@router.post("/register", response_model=Token, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    return register_user(user_data, db)


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    return login_user(credentials.identifier, credentials.password, db)


@router.post("/token", response_model=Token, include_in_schema=True)
def token_for_docs(
    form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """Form-based login so the Authorize button on /docs works."""
    return login_user(form.username, form.password, db)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserOut)
def update_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return update_profile_service(current_user, payload, db)
