from sqlalchemy import Column, DateTime, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Agent(Base):
    __tablename__ = "agents"

    name = Column(Text, primary_key=True)
    model = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    rules = Column(Text, nullable=False)
    tools = Column(JSONB, nullable=False, server_default="[]")
    mcps = Column(JSONB, nullable=False, server_default="[]")
    skills = Column(JSONB, nullable=False, server_default="[]")
    knowledge = Column(JSONB, nullable=False, server_default="[]")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
