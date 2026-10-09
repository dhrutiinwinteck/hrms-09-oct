from __future__ import annotations

from datetime import date
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.orm import Session

from app.application.dtos.shifts.shift_swap import (
    CreateShiftSwapRequest,
    ShiftSwapActionResponseDto,
    ShiftSwapEligibleEmployeeResponse,
    ShiftSwapListItemDto,
    ShiftSwapResponseDto,
)

from app.application.services.shifts.shift_swap_service import (
    ShiftSwapService,
)

from app.core.security import get_current_username

from app.infrastructure.repositories.shifts.shift_swap_repository import (
    ShiftSwapRepository,
)

from app.presentation.dependencies.database import (
    get_transactional_db,
)


router = APIRouter(
    prefix="/shift-swaps",
    tags=["Shift Swaps"],
)


def get_shift_swap_service(
    db: Session = Depends(get_transactional_db),
) -> ShiftSwapService:

    repository = ShiftSwapRepository(
        db
    )

    return ShiftSwapService(
        repository
    )


# ================================================================
# 1. GET ELIGIBLE EMPLOYEES
# ================================================================

@router.get(
    "/eligible-employees",
    response_model=ShiftSwapEligibleEmployeeResponse,
    summary="Get Eligible Employees",
)
def get_eligible_employees(
    swap_date: date = Query(
        ...,
        description="Date on which the shift swap is requested.",
    ),
    current_user_name: str = Depends(
        get_current_username
    ),
    service: ShiftSwapService = Depends(
        get_shift_swap_service
    ),
) -> ShiftSwapEligibleEmployeeResponse:

    try:
        return service.get_eligible_employees(
            login_name=current_user_name,
            swap_date=swap_date,
        )

    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


# ================================================================
# 2. CREATE REQUEST
# ================================================================

@router.post(
    "",
    response_model=ShiftSwapResponseDto,
    status_code=status.HTTP_201_CREATED,
    summary="Create Shift Swap Request",
)
def create_shift_swap(
    request: CreateShiftSwapRequest,
    current_user_name: str = Depends(
        get_current_username
    ),
    service: ShiftSwapService = Depends(
        get_shift_swap_service
    ),
) -> ShiftSwapResponseDto:

    try:
        return service.create_request(
            request=request,
            login_name=current_user_name,
        )

    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


# ================================================================
# 3. MY REQUESTS
# ================================================================

@router.get(
    "/my",
    response_model=List[ShiftSwapListItemDto],
    summary="Get My Shift Swap Requests",
)
def get_my_shift_swaps(
    current_user_name: str = Depends(
        get_current_username
    ),
    service: ShiftSwapService = Depends(
        get_shift_swap_service
    ),
) -> List[ShiftSwapListItemDto]:

    try:
        return service.get_my_requests(
            login_name=current_user_name
        )

    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


# ================================================================
# 4. ALL REQUESTS
# ================================================================

@router.get(
    "",
    response_model=List[ShiftSwapListItemDto],
    summary="Get All Shift Swap Requests",
)
def get_all_shift_swaps(
    service: ShiftSwapService = Depends(
        get_shift_swap_service
    ),
) -> List[ShiftSwapListItemDto]:

    try:
        return service.get_all_requests()

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


# ================================================================
# 5. REQUEST DETAILS
# ================================================================

@router.get(
    "/{swap_requested_id}",
    response_model=ShiftSwapResponseDto,
    summary="Get Shift Swap Request Details",
)
def get_shift_swap(
    swap_requested_id: int = Path(
        ...,
        gt=0,
    ),
    service: ShiftSwapService = Depends(
        get_shift_swap_service
    ),
) -> ShiftSwapResponseDto:

    try:
        return service.get_request(
            swap_requested_id
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


# ================================================================
# 6. TARGET ACCEPT
# ================================================================

@router.post(
    "/{swap_requested_id}/accept",
    response_model=ShiftSwapActionResponseDto,
    summary="Accept Shift Swap Request",
)
def accept_shift_swap(
    swap_requested_id: int = Path(
        ...,
        gt=0,
    ),
    current_user_name: str = Depends(
        get_current_username
    ),
    service: ShiftSwapService = Depends(
        get_shift_swap_service
    ),
) -> ShiftSwapActionResponseDto:

    try:
        return service.accept_request(
            swap_requested_id=swap_requested_id,
            login_name=current_user_name,
        )

    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


# ================================================================
# 7. TARGET REJECT
# ================================================================

@router.post(
    "/{swap_requested_id}/reject",
    response_model=ShiftSwapActionResponseDto,
    summary="Reject Shift Swap Request",
)
def reject_shift_swap(
    swap_requested_id: int = Path(
        ...,
        gt=0,
    ),
    current_user_name: str = Depends(
        get_current_username
    ),
    service: ShiftSwapService = Depends(
        get_shift_swap_service
    ),
) -> ShiftSwapActionResponseDto:

    try:
        return service.reject_request(
            swap_requested_id=swap_requested_id,
            login_name=current_user_name,
        )

    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


# ================================================================
# 8. MANAGER APPROVE
# ================================================================

@router.post(
    "/{swap_requested_id}/approve",
    response_model=ShiftSwapActionResponseDto,
    summary="Approve Shift Swap Request",
)
def approve_shift_swap(
    swap_requested_id: int = Path(
        ...,
        gt=0,
    ),
    current_user_name: str = Depends(
        get_current_username
    ),
    service: ShiftSwapService = Depends(
        get_shift_swap_service
    ),
) -> ShiftSwapActionResponseDto:

    try:
        return service.approve_request(
            swap_requested_id=swap_requested_id,
            login_name=current_user_name,
        )

    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


# ================================================================
# 9. MANAGER REJECT
# ================================================================

@router.post(
    "/{swap_requested_id}/manager-reject",
    response_model=ShiftSwapActionResponseDto,
    summary="Reject Shift Swap Request By Reporting Manager",
)
def manager_reject_shift_swap(
    swap_requested_id: int = Path(
        ...,
        gt=0,
    ),
    current_user_name: str = Depends(
        get_current_username
    ),
    service: ShiftSwapService = Depends(
        get_shift_swap_service
    ),
) -> ShiftSwapActionResponseDto:

    try:
        return service.manager_reject_request(
            swap_requested_id=swap_requested_id,
            login_name=current_user_name,
        )

    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc