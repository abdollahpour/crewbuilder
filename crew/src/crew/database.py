from sqlalchemy import create_engine

from .settings import settings

DATABASE_URL = (
    f"postgresql+psycopg://{settings.database_username}:"
    f"{settings.database_password}@{settings.database_connection_url}"
)

engine = create_engine(DATABASE_URL, future=True)
