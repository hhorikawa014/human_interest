from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import schemas, services, models
from .db import get_db

router = APIRouter()

# ---- Accounts ----
@router.post("/accounts", response_model=schemas.AccountOut)
def create_account(payload: schemas.AccountCreate, db: Session = Depends(get_db)):
    acc = services.create_account(db, payload.email, payload.name)
    return acc

@router.get("/accounts/{account_id}", response_model=schemas.AccountOut)
def get_account(account_id: int, db: Session = Depends(get_db)):
    acc = services.get_account(db, account_id)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    return acc

@router.post("/accounts/{account_id}/deposit", response_model=schemas.AccountOut)
def deposit(account_id: int, body: schemas.DepositIn, db: Session = Depends(get_db)):
    return services.deposit(db, account_id, body.amount_cents)

# ---- Cards ----
@router.post("/accounts/{account_id}/cards", response_model=schemas.CardOut)
def issue_card(account_id: int, db: Session = Depends(get_db)):
    return services.issue_card(db, account_id)

@router.get("/accounts/{account_id}/cards", response_model=list[schemas.CardOut])
def list_cards(account_id: int, db: Session = Depends(get_db)):
    return services.list_cards(db, account_id)

# ---- Transactions ----
@router.post("/accounts/{account_id}/transactions", response_model=schemas.TransactionOut)
def create_tx(account_id: int, payload: schemas.TransactionCreate, db: Session = Depends(get_db)):
    return services.create_transaction(
        db,
        account_id=account_id,
        card_id=payload.card_id,
        merchant=payload.merchant,
        mcc=payload.mcc,
        amount_cents=payload.amount_cents,
    )

@router.get("/accounts/{account_id}/transactions", response_model=list[schemas.TransactionOut])
def list_txs(account_id: int, db: Session = Depends(get_db)):
    return services.list_transactions(db, account_id)
