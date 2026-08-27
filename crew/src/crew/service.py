from __future__ import annotations

from fastapi import HTTPException

from .database import engine
from .generated.api.models import (
    CrewInput,
    CrewListResponse,
    CrewNameResponse,
    CrewResponse,
    ProbeOk,
    ReferenceListResponse,
)
from .generated.db import Querier
from .mapper import (
    crew_input_to_db,
    crew_name_to_response,
    crew_to_response,
    crews_to_list_response,
    names_to_reference_list,
)


def list_crews() -> CrewListResponse:
    with engine.connect() as connection:
        rows = list(Querier(connection).list_crews())
    return crews_to_list_response(rows)


def list_agent_usage(agent_name: str) -> ReferenceListResponse:
    with engine.connect() as connection:
        names = list(
            Querier(connection).list_crew_names_for_agent(agent_name=agent_name)
        )
    return names_to_reference_list(names)


def get_crew(name: str) -> CrewResponse:
    with engine.connect() as connection:
        crew = Querier(connection).get_crew(name=name)
    if not crew:
        raise HTTPException(404, "Crew not found")
    return crew_to_response(crew)


def create_crew(name: str, body: CrewInput) -> CrewNameResponse:
    with engine.begin() as connection:
        created = Querier(connection).create_crew(
            name=name,
            model=body.model,
            role=body.role,
            goal=body.goal,
            backstory=body.backstory,
            **crew_input_to_db(body),
        )
    if created is None:
        raise HTTPException(409, "Crew already exists")
    return crew_name_to_response(name)


def update_crew(name: str, body: CrewInput) -> CrewNameResponse:
    with engine.begin() as connection:
        updated = Querier(connection).update_crew(
            name=name,
            model=body.model,
            role=body.role,
            goal=body.goal,
            backstory=body.backstory,
            **crew_input_to_db(body),
        )
    if updated is None:
        raise HTTPException(404, "Crew not found")
    return crew_name_to_response(name)


def delete_crew(name: str) -> None:
    with engine.begin() as connection:
        deleted = Querier(connection).delete_crew(name=name)
    if deleted is None:
        raise HTTPException(404, "Crew not found")


def probe() -> ProbeOk:
    with engine.connect() as connection:
        Querier(connection).check_database()
    return ProbeOk(service="ok", database="ok")
