from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

from rag import search_knowledge


class KnowledgeSearchInput(BaseModel):
    knowledge: str = Field(..., description="Knowledge base name to search")
    query: str = Field(..., description="Search query")
    top_k: int = Field(default=5, description="Number of relevant passages to return")


class KnowledgeSearchTool(BaseTool):
    name: str = "knowledge_search"
    description: str = (
        "Search a knowledge base by name. "
        "Pass the knowledge name and a query to retrieve relevant passages."
    )
    args_schema: Type[BaseModel] = KnowledgeSearchInput

    def _run(self, knowledge: str, query: str, top_k: int = 5) -> str:
        return search_knowledge(knowledge, query, top_k=top_k)
