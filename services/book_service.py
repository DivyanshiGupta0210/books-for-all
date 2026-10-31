# book service
from sqlalchemy import or_
from sqlalchemy.orm import Session

from models import Book


def _escape_like(text: str) -> str:
    return text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def list_books(
    db: Session,
    q: str | None = None,
    genre: str | None = None,
    language: str | None = None,
    book_type: str | None = None,
):
    """All books, optionally narrowed by a text search and/or filters."""
    query = db.query(Book)

    if q and q.strip():
        pattern = f"%{_escape_like(q.strip())}%"
        query = query.filter(
            or_(
                Book.title.ilike(pattern, escape="\\"),
                Book.author.ilike(pattern, escape="\\"),
            )
        )
    if genre:
        query = query.filter(Book.genre == genre)
    if language:
        query = query.filter(Book.language == language)
    if book_type:
        query = query.filter(Book.book_type == book_type)

    return query.order_by(Book.title).all()


def get_book_by_id(book_id: int, db: Session):
    return db.query(Book).filter(Book.book_id == book_id).first()


def get_featured_books(db: Session):
    return (
        db.query(Book).filter(Book.is_featured.is_(True)).order_by(Book.book_id).all()
    )


def get_new_arrivals(db: Session):
    return (
        db.query(Book)
        .filter(Book.is_new_arrival.is_(True))
        .order_by(Book.book_id)
        .all()
    )


def get_book_meta(db: Session) -> dict:
    def distinct(column):
        rows = db.query(column).distinct().order_by(column).all()
        return [r[0] for r in rows if r[0]]

    return {
        "genres": distinct(Book.genre),
        "languages": distinct(Book.language),
        "book_types": distinct(Book.book_type),
    }
