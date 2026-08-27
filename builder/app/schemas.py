from datetime import datetime

from pydantic import BaseModel, Field


class Agent(BaseModel):
    name: str
    model: str
    role: str
    goal: str
    backstory: str
    tools: list[str] = Field(default_factory=list)
    mcps: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    knowledge: list[str] = Field(default_factory=list)
    updated_at: datetime | None = None


class Skill(BaseModel):
    name: str
    description: str
    skill_md: str
    tools_required: list[str] = Field(default_factory=list)
    mcps: list[str] = Field(default_factory=list)
    knowledge: list[str] = Field(default_factory=list)
    updated_at: datetime | None = None


class Knowledge(BaseModel):
    name: str
    content: str
    updated_at: datetime | None = None


class McpServer(BaseModel):
    name: str
    config: dict = Field(default_factory=dict)


class Crew(BaseModel):
    name: str
    model: str
    role: str
    goal: str
    backstory: str
    agents: list[str] = Field(default_factory=list)
