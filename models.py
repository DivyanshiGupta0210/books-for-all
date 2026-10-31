# models.py
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    full_name = Column(String(120), nullable=True)
    profile_image = Column(Text, nullable=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=utcnow)

    wishlist_items = relationship(
        "Wishlist", back_populates="user", cascade="all, delete-orphan"
    )
    issued_books = relationship(
        "IssuedBook", back_populates="user", cascade="all, delete-orphan"
    )


class Book(Base):
    __tablename__ = "books"

    book_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    author = Column(String(255), nullable=False, index=True)
    genre = Column(String(100), nullable=False, index=True)
    language = Column(String(50), nullable=False, index=True)
    book_type = Column(String(50), nullable=False, index=True)
    publishing_year = Column(Integer, nullable=False)
    copies_available = Column(Integer, nullable=False, default=0)
    isbn = Column(String(30), nullable=False)
    summary = Column(Text, nullable=False)
    has_cover = Column(Boolean, nullable=False, default=False)
    cover_url = Column(Text, nullable=True)
    is_featured = Column(Boolean, nullable=False, default=False)
    is_new_arrival = Column(Boolean, nullable=False, default=False)

    wishlisted_by = relationship(
        "Wishlist", back_populates="book", cascade="all, delete-orphan"
    )
    issues = relationship(
        "IssuedBook", back_populates="book", cascade="all, delete-orphan"
    )


class Wishlist(Base):
    __tablename__ = "wishlists"
    __table_args__ = (
        UniqueConstraint("user_id", "book_id", name="unique_wishlist_item"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    book_id = Column(
        Integer, ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False
    )
    added_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="wishlist_items")
    book = relationship("Book", back_populates="wishlisted_by")


class IssuedBook(Base):
    __tablename__ = "issued_books"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    book_id = Column(
        Integer, ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False
    )
    issue_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    duration_days = Column(Integer, nullable=False)
    charge = Column(Numeric(8, 2), nullable=False)
    transaction_id = Column(String(40), unique=True, nullable=False)
    returned = Column(Boolean, nullable=False, default=False)
    return_date = Column(Date, nullable=True)

    user = relationship("User", back_populates="issued_books")
    book = relationship("Book", back_populates="issues")
    transaction = relationship(
        "Transaction",
        back_populates="issued_book",
        uselist=False,
        cascade="all, delete-orphan",
    )


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    issued_book_id = Column(
        Integer,
        ForeignKey("issued_books.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    transaction_id = Column(String(40), unique=True, nullable=False)
    amount = Column(Numeric(8, 2), nullable=False)
    payment_status = Column(String(20), default="completed")
    created_at = Column(DateTime, default=utcnow)

    issued_book = relationship("IssuedBook", back_populates="transaction")
