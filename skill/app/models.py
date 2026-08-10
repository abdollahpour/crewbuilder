from sqlalchemy import Column, DateTime, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Skill(Base):
    __tablename__ = "skills"

    name = Column(Text, primary_key=True)
    description = Column(Text, nullable=False)
    skill_md = Column(Text, nullable=False)
    tools_required = Column(JSONB, nullable=False, server_default="[]")
    mcps = Column(JSONB, nullable=False, server_default="[]")
    knowledge = Column(JSONB, nullable=False, server_default="[]")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
