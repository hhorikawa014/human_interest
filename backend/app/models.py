from __future__ import annotations

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from .db import Base

class Account(Base):
    __tablename__ = "accounts"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    balance_cents = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, server_default=func.datetime("now"))

    cards = relationship("Card", back_populates="account", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")

class Card(Base):
    __tablename__ = "cards"
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    card_number = Column(String, nullable=False)         # 16-digit PAN-like (random)
    last4_digits = Column(String, nullable=False)        # TEXT to preserve leading zeros
    token = Column(String, nullable=False)               # opaque token
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, server_default=func.datetime("now"))

    account = relationship("Account", back_populates="cards")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    card_id = Column(Integer, ForeignKey("cards.id", ondelete="SET NULL"), nullable=True)
    amount_cents = Column(Integer, nullable=False)
    merchant = Column(String, nullable=False)
    mcc = Column(String, nullable=False)                 # keep as string like '5912'
    is_approved = Column(Boolean, nullable=False)
    rejection_reason = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.datetime("now"))

    account = relationship("Account", back_populates="transactions")
