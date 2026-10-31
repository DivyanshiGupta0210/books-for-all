# wishlist router
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User
from schemas import WishlistOut
from services.wishlist_service import (
    add_to_wishlist,
    get_user_wishlist,
    remove_from_wishlist,
)

router = APIRouter()


@router.get("", response_model=list[WishlistOut])
def get_wishlist(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return get_user_wishlist(current_user.id, db)


@router.post("/add/{book_id}", response_model=WishlistOut, status_code=201)
def add_book(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return add_to_wishlist(current_user.id, book_id, db)


@router.delete("/remove/{book_id}")
def remove_book(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return remove_from_wishlist(current_user.id, book_id, db)
