# schemas.py
import re
from datetime import date, datetime
from typing import Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    computed_field,
    field_validator,
    model_validator,
)

from config import LATE_FEE_PER_DAY

USERNAME_RE = re.compile(r"^[a-z0-9_.]{3,30}$")


# ------------------------------ Users ------------------------------

class UserCreate(BaseModel):
    full_name: str = Field(max_length=120)
    username: str
    email: EmailStr
    password: str
    confirm_password: str

    @field_validator("full_name")
    @classmethod
    def clean_name(cls, v: str) -> str:
        v = " ".join(v.split())
        if not v:
            raise ValueError("Name is required")
        return v

    @field_validator("username")
    @classmethod
    def clean_username(cls, v: str) -> str:
        v = v.strip().lower()
        if not USERNAME_RE.match(v):
            raise ValueError(
                "Username must be 3-30 characters: letters, numbers, dot or underscore"
            )
        return v

    @field_validator("email")
    @classmethod
    def clean_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("password")
    @classmethod
    def check_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password is too long (72 bytes maximum)")
        return v

    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class UserLogin(BaseModel):
    identifier: str = Field(min_length=1)  # username or email
    password: str = Field(min_length=1)


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, max_length=120)
    email: Optional[EmailStr] = None

    @field_validator("full_name")
    @classmethod
    def clean_name(cls, v):
        if v is None:
            return v
        v = " ".join(v.split())
        if not v:
            raise ValueError("Name cannot be empty")
        return v

    @field_validator("email")
    @classmethod
    def clean_email(cls, v):
        return v.strip().lower() if v else v


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    profile_image: Optional[str] = None
    created_at: Optional[datetime] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ------------------------------ Books ------------------------------

class BookOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    book_id: int
    title: str
    author: str
    genre: str
    language: str
    book_type: str
    publishing_year: int
    copies_available: int
    isbn: str
    summary: str
    has_cover: bool
    cover_url: Optional[str] = None
    is_featured: bool
    is_new_arrival: bool


class BookMeta(BaseModel):
    genres: list[str]
    languages: list[str]
    book_types: list[str]


# ----------------------------- Wishlist ----------------------------

class WishlistOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    added_at: Optional[datetime] = None
    book: BookOut


# ------------------------------ Issues -----------------------------

class IssueCreate(BaseModel):
    book_id: int
    duration_days: int


class IssueOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    issue_date: date
    due_date: date
    duration_days: int
    charge: float
    transaction_id: str
    returned: bool
    return_date: Optional[date] = None
    book: BookOut

    @computed_field
    @property
    def late_days(self) -> int:
        end = self.return_date or date.today()
        return max((end - self.due_date).days, 0)

    @computed_field
    @property
    def late_fee(self) -> float:
        return float(self.late_days * LATE_FEE_PER_DAY)


class ReceiptOut(BaseModel):
    transaction_id: str
    book_title: str
    issue_date: date
    due_date: date
    duration_days: int
    amount: float


class ReturnOut(BaseModel):
    message: str
    late_days: int
    late_fee: float


class PlanOut(BaseModel):
    days: int
    label: str
    price: int


class PlansOut(BaseModel):
    plans: list[PlanOut]
    late_fee_per_day: int
