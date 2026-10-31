# wishlist service
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from models import Book, Wishlist


def get_user_wishlist(user_id: int, db: Session):
    return (
        db.query(Wishlist)
        .options(joinedload(Wishlist.book))
        .filter(Wishlist.user_id == user_id)
        .order_by(Wishlist.added_at.desc(), Wishlist.id.desc())
        .all()
    )


def add_to_wishlist(user_id: int, book_id: int, db: Session):
    if not db.query(Book.book_id).filter(Book.book_id == book_id).first():
        raise HTTPException(404, "Book not found")

    existing = (
        db.query(Wishlist.id)
        .filter(Wishlist.user_id == user_id, Wishlist.book_id == book_id)
        .first()
    )
    if existing:
        raise HTTPException(400, "Book is already in your wishlist")

    item = Wishlist(user_id=user_id, book_id=book_id)
    db.add(item)
    try:
        db.commit()
    except IntegrityError:  # double click / two tabs
        db.rollback()
        raise HTTPException(400, "Book is already in your wishlist")

    db.refresh(item)
    return item


def remove_from_wishlist(user_id: int, book_id: int, db: Session):
    item = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user_id, Wishlist.book_id == book_id)
        .first()
    )
    if not item:
        raise HTTPException(404, "Book is not in your wishlist")

    db.delete(item)
    db.commit()
    return {"message": "Removed from wishlist"}
