from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    pass


db_url = settings.DATABASE_URL

# Render/Heroku provide "postgres://" but SQLAlchemy needs "postgresql://"
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# SQLite needs a local file, PostgreSQL/MySQL use a connection server
connect_args = {}
is_sqlite = db_url.startswith("sqlite")

if is_sqlite:
    connect_args["check_same_thread"] = False

engine = create_engine(
    db_url,
    pool_pre_ping=not is_sqlite,
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
