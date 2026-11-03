# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    # only needed if you ever point DATABASE_URL at SQLite for quick tests
    connect_args = {"check_same_thread": False}
else:
    # Neon's pooled connection (pgbouncer) does not support prepared statements
    connect_args = {"prepare_threshold": None}

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()


def get_db():
    """FastAPI dependency: one database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
