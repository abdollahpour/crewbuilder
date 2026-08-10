from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.responses import Response

from app.builder import build_crewai_zip
from app.registry import fetch_crew

app = FastAPI(title="Crew Builder")
router = APIRouter(prefix="/api/v1/builders")


@router.post("/{name}")
def build_crew(name: str):
    crew = fetch_crew(name)

    try:
        filename, zip_bytes = build_crewai_zip(crew)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc

    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


app.include_router(router)
