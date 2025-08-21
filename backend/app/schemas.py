from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class AccountCreate(BaseModel):
    email: EmailStr
    name: str

class AccountOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    balance_cents: int
    created_at: datetime

    class Config:
        from_attributes = True

class DepositIn(BaseModel):
    amount_cents: int = Field(gt=0)

class CardOut(BaseModel):
    id: int
    account_id: int
    card_number: str
    last4_digits: str
    token: str
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class TransactionCreate(BaseModel):
    card_id: int
    merchant: str
    mcc: str
    amount_cents: int = Field(gt=0)

class TransactionOut(BaseModel):
    id: int
    account_id: int
    card_id: Optional[int]
    amount_cents: int
    merchant: str
    mcc: str
    is_approved: bool
    rejection_reason: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True
