from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    pass


db_url = settings.DATABASE_URL if settings.DATABASE_URL else "sqlite:///./Ankit Travels.db"

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    db_url,
    pool_pre_ping=True if not db_url.startswith("sqlite") else False,
    connect_args=connect_args,
)


SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
