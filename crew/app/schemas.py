from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CrewInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    model: str = Field(min_length=1)
    rules: str = Field(min_length=1)
    agents: list[str] = Field(default_factory=list)


class CrewResponse(BaseModel):
    name: str
    model: str
    rules: str
    agents: list[str] = Field(default_factory=list)
    updated_at: datetime
