from __future__ import annotations

from pathlib import Path
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import sqlite3

REPO_ROOT = Path(__file__).resolve().parents[2]
DB_FILE_PATH = REPO_ROOT / "hsa.db"
INIT_SQL_PATH = REPO_ROOT / "database" / "init.sql"

# SQLAlchemy engine for SQLite
DB_URL = f"sqlite:///{DB_FILE_PATH.as_posix()}"
engine = create_engine(DB_URL, connect_args={"check_same_thread": False}, pool_pre_ping=True)

@event.listens_for(engine, "connect")
def _set_sqlite_pragma(dbapi_connection: sqlite3.Connection, connection_record) -> None:
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

class Base(DeclarativeBase):
    pass

def _run_init_sql_if_exist() -> None:
    if not INIT_SQL_PATH.exists():
        return
    
    try:
        with sqlite3.connect(DB_FILE_PATH.as_posix()) as conn:
            conn.executescript(INIT_SQL_PATH.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"[db:init] Warning: failed to run init.sql: {e}")
    
def init_db() -> None:
    from . import models
    Base.metadata.create_all(bind=engine)
    _run_init_sql_if_exist()
    
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
init_db()