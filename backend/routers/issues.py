# issues router
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User
from schemas import IssueCreate, IssueOut, PlansOut, ReceiptOut, ReturnOut
from services.issue_service import (
    get_my_books,
    get_plans,
    get_receipt,
    issue_book,
    return_book,
)

router = APIRouter()


# durations + prices + late fee (shown on the Issue page)
@router.get("/plans", response_model=PlansOut)
def plans():
    return get_plans()


@router.post("", response_model=IssueOut, status_code=201)
def issue(
    payload: IssueCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return issue_book(current_user.id, payload, db)


@router.get("/my-books", response_model=list[IssueOut])
def my_books(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return get_my_books(current_user.id, db)


@router.get("/receipt/{transaction_id}", response_model=ReceiptOut)
def receipt(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_receipt(transaction_id, current_user.id, db)


@router.post("/return/{issue_id}", response_model=ReturnOut)
def return_issue(
    issue_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return return_book(current_user.id, issue_id, db)
