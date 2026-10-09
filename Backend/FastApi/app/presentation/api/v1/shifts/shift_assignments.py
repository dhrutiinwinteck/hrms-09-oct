from __future__ import annotations

import logging
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.application.dtos.shifts.shift_assignment import (
    AssignedShiftListItem,
    CreateShiftAssignmentRequest,
    PatchShiftAssignmentRequest,
    ShiftAssignmentResponse,
    ShiftPatternOption,
    UpdateShiftAssignmentRequest,
)

from app.application.services.shifts.shift_assignment_service import (
    ShiftAssignmentService,
)

from app.domain.interfaces.shifts.shift_assignment_interface import (
    IShiftAssignmentRepository,
)

from app.infrastructure.repositories.shifts.shift_assignment_repository import (
    ShiftAssignmentRepository,
)

from app.presentation.dependencies.database import (
    get_transactional_db,
)


logger = logging.getLogger(__name__)


router = APIRouter(
    tags=["Shift Assignments"],
)


def get_shift_assignment_service(
    db: Session = Depends(
        get_transactional_db
    ),
) -> ShiftAssignmentService:

    repository: IShiftAssignmentRepository = (
        ShiftAssignmentRepository(db)
    )

    return ShiftAssignmentService(
        repository
    )


def get_current_user_name() -> Optional[str]:
    return None


@router.get(
    "/employees",
    response_model=list[dict],
    status_code=status.HTTP_200_OK,
)
def get_active_employees(
    service: ShiftAssignmentService = Depends(
        get_shift_assignment_service
    ),
):
    try:

        return service.get_employees()

    except Exception as exc:

        logger.exception(
            "Failed to retrieve employees: %s",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve employees.",
        ) from exc


@router.get(
    "/patterns",
    response_model=list[
        ShiftPatternOption
    ],
    status_code=status.HTTP_200_OK,
)
def get_shift_patterns(
    service: ShiftAssignmentService = Depends(
        get_shift_assignment_service
    ),
):
    try:

        return service.get_shift_patterns()

    except Exception as exc:

        logger.exception(
            "Failed to retrieve shift patterns: %s",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve shift patterns.",
        ) from exc


@router.post(
    "",
    response_model=list[
        ShiftAssignmentResponse
    ],
    status_code=status.HTTP_201_CREATED,
)
def create_shift_assignment(
    request: CreateShiftAssignmentRequest,
    db: Session = Depends(
        get_transactional_db
    ),
    service: ShiftAssignmentService = Depends(
        get_shift_assignment_service
    ),
):
    try:

        result = service.create_assignment(
            request=request,
            current_user=get_current_user_name(),
        )

        db.commit()

        return result

    except ValueError as exc:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except Exception as exc:

        db.rollback()

        logger.exception(
            "Failed to create shift assignment: %s",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create shift assignment.",
        ) from exc


@router.get(
    "",
    response_model=list[
        AssignedShiftListItem
    ],
    status_code=status.HTTP_200_OK,
)
def get_all_shift_assignments(
    service: ShiftAssignmentService = Depends(
        get_shift_assignment_service
    ),
):
    try:

        return service.get_all_assignments()

    except Exception as exc:

        logger.exception(
            "Failed to retrieve shift assignments: %s",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve shift assignments.",
        ) from exc


# -------------------------------------------------------------------------
# GET COMPLETE EDIT PAYLOAD
# -------------------------------------------------------------------------
# IMPORTANT:
# This endpoint is declared BEFORE /{assignment_id}.
#
# Example:
# GET /shift-assignments/6/edit-payload
#
# It returns the complete PUT-ready payload for assignment 6.
# -------------------------------------------------------------------------


# -------------------------------------------------------------------------
# PATCH PARTIAL ASSIGNMENT UPDATE
# -------------------------------------------------------------------------

@router.patch(
    "/{assignment_id}",
    response_model=ShiftAssignmentResponse,
    status_code=status.HTTP_200_OK,
)
def patch_shift_assignment(
    assignment_id: int,
    request: PatchShiftAssignmentRequest,
    db: Session = Depends(
        get_transactional_db
    ),
    service: ShiftAssignmentService = Depends(
        get_shift_assignment_service
    ),
):
    if assignment_id <= 0:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assignment ID must be greater than zero.",
        )

    try:

        result = service.patch_assignment(
            assignment_id=assignment_id,
            request=request,
        )

        db.commit()

        return result

    except ValueError as exc:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except Exception as exc:

        db.rollback()

        logger.exception(
            "Failed to patch shift assignment: %s",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update shift assignment.",
        ) from exc


# -------------------------------------------------------------------------
# GET COMPLETE ASSIGNMENT
# -------------------------------------------------------------------------

@router.get(
    "/{assignment_id}",
    response_model=ShiftAssignmentResponse,
    status_code=status.HTTP_200_OK,
)
def get_shift_assignment(
    assignment_id: int,
    service: ShiftAssignmentService = Depends(
        get_shift_assignment_service
    ),
):
    if assignment_id <= 0:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assignment ID must be greater than zero.",
        )

    try:

        result = service.get_assignment(
            assignment_id
        )

        if result is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shift assignment not found.",
            )

        return result

    except HTTPException:

        raise

    except Exception as exc:

        logger.exception(
            "Failed to retrieve shift assignment: %s",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve shift assignment.",
        ) from exc


# -------------------------------------------------------------------------
# PUT COMPLETE ASSIGNMENT UPDATE
# -------------------------------------------------------------------------

@router.put(
    "/{assignment_id}",
    response_model=ShiftAssignmentResponse,
    status_code=status.HTTP_200_OK,
)
def update_shift_assignment(
    assignment_id: int,
    request: UpdateShiftAssignmentRequest,
    db: Session = Depends(
        get_transactional_db
    ),
    service: ShiftAssignmentService = Depends(
        get_shift_assignment_service
    ),
):
    if assignment_id <= 0:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assignment ID must be greater than zero.",
        )

    try:

        result = service.update_assignment(
            assignment_id=assignment_id,
            request=request,
            current_user=get_current_user_name(),
        )

        db.commit()

        return result

    except ValueError as exc:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except Exception as exc:

        db.rollback()

        logger.exception(
            "Failed to update shift assignment: %s",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update shift assignment.",
        ) from exc


# -------------------------------------------------------------------------
# DELETE ASSIGNMENT
# -------------------------------------------------------------------------

@router.delete(
    "/{assignment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_shift_assignment(
    assignment_id: int,
    db: Session = Depends(
        get_transactional_db
    ),
    service: ShiftAssignmentService = Depends(
        get_shift_assignment_service
    ),
):
    if assignment_id <= 0:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assignment ID must be greater than zero.",
        )

    try:

        deleted = service.delete_assignment(
            assignment_id
        )

        if not deleted:

            db.rollback()

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shift assignment not found.",
            )

        db.commit()

        return None

    except HTTPException:

        raise

    except Exception as exc:

        db.rollback()

        logger.exception(
            "Failed to delete shift assignment: %s",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete shift assignment.",
        ) from exc