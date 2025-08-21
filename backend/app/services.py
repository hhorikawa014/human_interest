from __future__ import annotations
import random, secrets
from sqlalchemy.orm import Session
from fastapi import HTTPException
from . import models

# IIAS-eligible MCCs (medical/health) — approve
IIAS_ELIGIBLE_MCCS: set[str] = {
    "8011","8021","8031","8041","8042","8043","8049","8050","8062","8071","8099",
}

# Pharmacies & drug wholesalers (90% rule) — approve
NINETY_PERCENT_MCCS: set[str] = {
    "5912",  # Drug Stores and Pharmacies
    "5122",  # Drugs, Drug Proprietaries, and Druggist Sundries
}

QUALIFIED_MCCS: set[str] = IIAS_ELIGIBLE_MCCS | NINETY_PERCENT_MCCS

def create_account(db: Session, email: str, name: str) -> models.Account:
    existing = db.query(models.Account).filter(models.Account.email == email).first()
    if existing:
        return existing
    acc = models.Account(email=email, name=name, balance_cents=0)
    db.add(acc)
    db.commit()
    db.refresh(acc)
    return acc

def get_account(db: Session, account_id: int) -> models.Account:
    acc = db.query(models.Account).filter(models.Account.id == account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    return acc

def deposit(db: Session, account_id: int, amount_cents: int) -> models.Account:
    if amount_cents <= 0:
        raise HTTPException(status_code=400, detail="Amount must be > 0")

    # Make sure the account exists first
    acc = db.query(models.Account).filter(models.Account.id == account_id).first()
    if acc is None:
        raise HTTPException(status_code=404, detail="Account not found")

    # Atomic in-DB increment; avoids any Column/typing confusion
    db.query(models.Account).filter(models.Account.id == account_id).update(
        {models.Account.balance_cents: models.Account.balance_cents + int(amount_cents)},
        synchronize_session=False,
    )
    db.commit()

    # Return the fresh row
    acc = db.query(models.Account).filter(models.Account.id == account_id).first()
    return acc  # type: ignore[return-value]

def _unique_16_digit(db: Session) -> str:
    for _ in range(128):
        n = "".join(random.choices("0123456789", k=16))
        if not db.query(models.Card).filter(models.Card.card_number == n).first():
            return n
    raise HTTPException(status_code=500, detail="Could not generate unique card number")

def issue_card(db: Session, account_id: int) -> models.Card:
    _ = get_account(db, account_id)  # ensure account exists
    pan = _unique_16_digit(db)
    card = models.Card(
        account_id=account_id,
        card_number=pan,
        last4_digits=pan[-4:],       # keep as string (can be '0001')
        token=secrets.token_hex(16),
        is_active=True,
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card

def list_cards(db: Session, account_id: int) -> list[models.Card]:
    _ = get_account(db, account_id)
    return db.query(models.Card).filter(models.Card.account_id == account_id).order_by(models.Card.id.desc()).all()

def create_transaction(
    db: Session,
    account_id: int,
    card_id: int | None,
    merchant: str,
    mcc: str,
    amount_cents: int,
) -> models.Transaction:
    # 1) Load account (and optionally validate card belongs to account)
    acc = db.query(models.Account).filter(models.Account.id == account_id).first()
    if acc is None:
        raise ValueError("Account not found")

    if card_id is not None:
        card = db.query(models.Card).filter(
            models.Card.id == card_id,
            models.Card.account_id == account_id,
            models.Card.is_active == True
        ).first()
        if card is None:
            raise ValueError("Card not found or inactive")
    else:
        card = None

    # 2) Basic approval rule: only qualified MCCs
    qualified = mcc in QUALIFIED_MCCS
    rejection_reason = None
    is_approved = False

    if not qualified:
        rejection_reason = "Non-qualified expense"
    else:
        # 3) Funds check
        if acc.balance_cents < amount_cents:
            rejection_reason = "Insufficient funds"
        else:
            is_approved = True
            # ✅ mutate the instance with plain Python math (NOT a column expression)
            acc.balance_cents = int(acc.balance_cents) - int(amount_cents)

    # 4) Persist tx + account in one commit
    tx = models.Transaction(
        account_id=account_id,
        card_id=card.id if card else None,
        amount_cents=amount_cents,
        merchant=merchant,
        mcc=mcc,
        is_approved=is_approved,
        rejection_reason=rejection_reason,
    )
    db.add(tx)
    # acc is already tracked; no need to re-add
    db.commit()
    db.refresh(tx)
    db.refresh(acc)  # optional, but nice if caller wants fresh balance
    return tx

def list_transactions(db: Session, account_id: int):
    """
    Return all transactions for the given account, newest first.
    """
    # Optional: ensure the account exists for clear 404s
    account = db.query(models.Account).filter(models.Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    txs = (
        db.query(models.Transaction)
        .filter(models.Transaction.account_id == account_id)
        .order_by(models.Transaction.id.desc())
        .all()
    )
    return txs