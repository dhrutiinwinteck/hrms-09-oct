from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.application.dtos.shifts.shift_pattern import (
    ShiftPatternCreateDto,
    ShiftPatternDeleteResponseDto,
    ShiftPatternResponseDto,
)

from app.application.services.shifts.shift_pattern_service import (
    ShiftPatternAlreadyExistsException,
    ShiftPatternInUseException,
    ShiftPatternNotFoundException,
    ShiftPatternService,
)

from app.presentation.dependencies.database import (
    get_transactional_db,
)

from app.infrastructure.repositories.shifts.shift_pattern_repository import (
    ShiftPatternRepository,
)


router = APIRouter()


def get_shift_pattern_service(
    db: Session = Depends(get_transactional_db),
) -> ShiftPatternService:
    """
    Dependency provider for ShiftPatternService.
    """

    repository = ShiftPatternRepository(db)

    return ShiftPatternService(
        db=db,
        repository=repository,
    )


@router.get(
    "",
    response_model=list[ShiftPatternResponseDto],
    status_code=status.HTTP_200_OK,
    summary="Get all shift patterns",
)
def get_shift_patterns(
    service: ShiftPatternService = Depends(
        get_shift_pattern_service
    ),
) -> list[ShiftPatternResponseDto]:

    patterns = service.get_all()

    return [
        ShiftPatternResponseDto(
            pattern_id=pattern.patternid,
            pattern_name=pattern.patternname,
            start_time=pattern.starttime,
            end_time=pattern.endtime,
            created_by=pattern.createdby,
            created_date=pattern.createddate,
            modified_by=pattern.modifiedby,
            modified_date=pattern.modifieddate,
        )
        for pattern in patterns
    ]


@router.post(
    "",
    response_model=ShiftPatternResponseDto,
    status_code=status.HTTP_201_CREATED,
    summary="Create a shift pattern",
)
def create_shift_pattern(
    dto: ShiftPatternCreateDto,
    service: ShiftPatternService = Depends(
        get_shift_pattern_service
    ),
) -> ShiftPatternResponseDto:

    try:
        # Replace this with the authenticated user's username
        # once your JWT dependency is connected to this module.
        created_by = "SYSTEM"

        pattern = service.create(
            dto=dto,
            created_by=created_by,
        )

        return ShiftPatternResponseDto(
            pattern_id=pattern.patternid,
            pattern_name=pattern.patternname,
            start_time=pattern.starttime,
            end_time=pattern.endtime,
            created_by=pattern.createdby,
            created_date=pattern.createddate,
            modified_by=pattern.modifiedby,
            modified_date=pattern.modifieddate,
        )

    except ShiftPatternAlreadyExistsException as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.delete(
    "/{pattern_id}",
    response_model=ShiftPatternDeleteResponseDto,
    status_code=status.HTTP_200_OK,
    summary="Delete a shift pattern",
)
def delete_shift_pattern(
    pattern_id: int,
    service: ShiftPatternService = Depends(
        get_shift_pattern_service
    ),
) -> ShiftPatternDeleteResponseDto:

    try:
        service.delete(pattern_id)

        return ShiftPatternDeleteResponseDto(
            message="Shift pattern deleted successfully.",
            pattern_id=pattern_id,
        )

    except ShiftPatternNotFoundException as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    except ShiftPatternInUseException as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc