from sqlalchemy import Column, DateTime, Text, func
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Knowledge(Base):
    __tablename__ = "knowledge"

    name = Column(Text, primary_key=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
