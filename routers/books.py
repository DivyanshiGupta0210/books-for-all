# books router
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from schemas import BookMeta, BookOut
from services.book_service import (
    get_book_by_id,
    get_book_meta,
    get_featured_books,
    get_new_arrivals,
    list_books,
)

router = APIRouter()


# GET /api/books?q=harry&genre=Fantasy&language=English&book_type=Novel
# All parameters are optional; an empty list means "Book not available".
@router.get("", response_model=list[BookOut])
def books(
    q: str | None = Query(None, description="Search title or author"),
    genre: str | None = Query(None),
    language: str | None = Query(None),
    book_type: str | None = Query(None),
    db: Session = Depends(get_db),
):
    return list_books(db, q, genre, language, book_type)


@router.get("/featured", response_model=list[BookOut])
def featured(db: Session = Depends(get_db)):
    return get_featured_books(db)


@router.get("/new-arrivals", response_model=list[BookOut])
def new_arrivals(db: Session = Depends(get_db)):
    return get_new_arrivals(db)


# values for the Genre / Book Type / Language dropdowns
@router.get("/meta", response_model=BookMeta)
def meta(db: Session = Depends(get_db)):
    return get_book_meta(db)


@router.get("/{book_id}", response_model=BookOut)
def book_detail(book_id: int, db: Session = Depends(get_db)):
    book = get_book_by_id(book_id, db)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book
