from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query

from sqlalchemy.orm import Session

from app.application.dtos.roster.roster import (
    WeeklyRosterResponse,
)

from app.application.services.roster.roster_service import (
    RosterService,
)

from app.infrastructure.repositories.roster.roster_repository import (
    RosterRepository,
)

from app.presentation.dependencies.database import (
    get_transactional_db,
)


router = APIRouter(
    prefix="/roster",
    tags=["Roster"],
)


# ================================================================
# DEPENDENCY
# ================================================================

def get_roster_service(
    db: Session = Depends(get_transactional_db),
) -> RosterService:
    """
    Create the RosterService with its repository.
    """

    repository = RosterRepository(db)

    return RosterService(repository)


# ================================================================
# GET WEEKLY ROSTER
# ================================================================

@router.get(
    "",
    response_model=WeeklyRosterResponse,
    summary="Get weekly roster",
    description=(
        "Returns the read-only employee roster for a "
        "Monday-Sunday week."
    ),
)
def get_weekly_roster(
    week_start: date = Query(
        ...,
        description=(
            "Monday of the requested roster week. "
            "Format: YYYY-MM-DD."
        ),
    ),
    service: RosterService = Depends(
        get_roster_service
    ),
) -> WeeklyRosterResponse:

    try:

        return service.get_weekly_roster(
            week_start=week_start
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to load weekly roster."
            ),
        ) from exc