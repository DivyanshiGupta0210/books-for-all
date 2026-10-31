# issue service
import secrets
from datetime import date, timedelta

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from config import ISSUE_PLANS, LATE_FEE_PER_DAY
from models import Book, IssuedBook, Transaction
from schemas import IssueCreate


def get_plans() -> dict:
    return {
        "plans": [
            {"days": days, "label": label, "price": price}
            for days, (label, price) in ISSUE_PLANS.items()
        ],
        "late_fee_per_day": LATE_FEE_PER_DAY,
    }


def _new_transaction_id(db: Session, today: date) -> str:
    # e.g. TXN-20250720-12345
    for _ in range(25):
        candidate = f"TXN-{today:%Y%m%d}-{secrets.randbelow(100000):05d}"
        exists = (
            db.query(IssuedBook.id)
            .filter(IssuedBook.transaction_id == candidate)
            .first()
        )
        if not exists:
            return candidate
    raise HTTPException(500, "Could not generate a transaction id, please retry")


def issue_book(user_id: int, payload: IssueCreate, db: Session) -> IssuedBook:
    if payload.duration_days not in ISSUE_PLANS:
        raise HTTPException(400, "Invalid issue duration")

    book = db.query(Book).filter(Book.book_id == payload.book_id).first()
    if not book:
        raise HTTPException(404, "Book not found")

    already = (
        db.query(IssuedBook.id)
        .filter(
            IssuedBook.user_id == user_id,
            IssuedBook.book_id == payload.book_id,
            IssuedBook.returned.is_(False),
        )
        .first()
    )
    if already:
        raise HTTPException(400, "You have already issued this book")

    # Take one copy atomically: the UPDATE only succeeds while a copy is left,
    # so two people can never both grab the last one.
    taken = (
        db.query(Book)
        .filter(Book.book_id == payload.book_id, Book.copies_available > 0)
        .update(
            {Book.copies_available: Book.copies_available - 1},
            synchronize_session=False,
        )
    )
    if not taken:
        db.rollback()
        raise HTTPException(400, "Sorry, no copies of this book are available right now")

    today = date.today()
    _, charge = ISSUE_PLANS[payload.duration_days]
    transaction_id = _new_transaction_id(db, today)

    issue = IssuedBook(
        user_id=user_id,
        book_id=payload.book_id,
        issue_date=today,
        due_date=today + timedelta(days=payload.duration_days),
        duration_days=payload.duration_days,
        charge=charge,
        transaction_id=transaction_id,
        returned=False,
    )
    issue.transaction = Transaction(transaction_id=transaction_id, amount=charge)

    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue


def get_my_books(user_id: int, db: Session):
    return (
        db.query(IssuedBook)
        .options(joinedload(IssuedBook.book))
        .filter(IssuedBook.user_id == user_id)
        .order_by(IssuedBook.issue_date.desc(), IssuedBook.id.desc())
        .all()
    )


def get_receipt(transaction_id: str, user_id: int, db: Session) -> dict:
    # Filtering by user_id means nobody can read someone else's receipt.
    issue = (
        db.query(IssuedBook)
        .options(joinedload(IssuedBook.book))
        .filter(
            IssuedBook.transaction_id == transaction_id,
            IssuedBook.user_id == user_id,
        )
        .first()
    )
    if not issue:
        raise HTTPException(404, "Receipt not found")

    return {
        "transaction_id": issue.transaction_id,
        "book_title": issue.book.title,
        "issue_date": issue.issue_date,
        "due_date": issue.due_date,
        "duration_days": issue.duration_days,
        "amount": float(issue.charge),
    }


def return_book(user_id: int, issue_id: int, db: Session) -> dict:
    issue = (
        db.query(IssuedBook)
        .filter(IssuedBook.id == issue_id, IssuedBook.user_id == user_id)
        .first()
    )
    if not issue:
        raise HTTPException(404, "Issue record not found")
    if issue.returned:
        raise HTTPException(400, "This book has already been returned")

    today = date.today()
    issue.returned = True
    issue.return_date = today
    db.query(Book).filter(Book.book_id == issue.book_id).update(
        {Book.copies_available: Book.copies_available + 1},
        synchronize_session=False,
    )
    db.commit()

    late_days = max((today - issue.due_date).days, 0)
    return {
        "message": "Book returned successfully",
        "late_days": late_days,
        "late_fee": float(late_days * LATE_FEE_PER_DAY),
    }
