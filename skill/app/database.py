from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.settings import settings

DATABASE_URL = (
    f"postgresql+psycopg://{settings.database_username}:"
    f"{settings.database_password}@{settings.database_connection_url}"
)

engine = create_engine(DATABASE_URL, future=True)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)
