from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


# ============================================================
# DATABASE ENGINE
# ============================================================

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
)


# ============================================================
# DATABASE SESSION
# ============================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ============================================================
# DATABASE DEPENDENCY
# ============================================================

def get_db_session():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()