from fastapi import (
    APIRouter,
    Depends,
)
from sqlalchemy.orm import Session

from app.application.dtos.onboarding.joining_approval import (
    JoiningApprovalActionResponse,
)

from app.application.services.onboarding.joining_approval_service import (
    JoiningApprovalService,
)

from app.presentation.dependencies.database import (
    get_transactional_db,
)
from app.core.security import get_current_username


router = APIRouter()


# ==============================================================
# ACCEPT
# ==============================================================

@router.put(
    "/joining-approvals/{application_id}/accept",
    response_model=JoiningApprovalActionResponse,
    summary="Approve Joining Application",
)
async def accept_joining_application(
    application_id: int,
    employee_code: str = Depends(
        get_current_username
    ),
    db: Session = Depends(
        get_transactional_db
    ),
):

    service = JoiningApprovalService(db)

    return await service.approve_application(
        application_id=application_id,
        employee_code=employee_code,
    )


# ==============================================================
# ON HOLD
# ==============================================================

@router.put(
    "/joining-approvals/{application_id}/on-hold",
    response_model=JoiningApprovalActionResponse,
    summary="Put Joining Application On Hold",
)
async def hold_joining_application(
    application_id: int,
    employee_code: str = Depends(
        get_current_username
    ),
    db: Session = Depends(
        get_transactional_db
    ),
):

    service = JoiningApprovalService(db)

    return await service.hold_application(
    application_id=application_id,
    employee_code=employee_code,
    )


# ==============================================================
# REJECT
# ==============================================================

@router.put(
    "/joining-approvals/{application_id}/reject",
    response_model=JoiningApprovalActionResponse,
    summary="Reject Joining Application",
)
async def reject_joining_application(
    application_id: int,
    employee_code: str = Depends(
        get_current_username
    ),
    db: Session = Depends(
        get_transactional_db
    ),
):

    service = JoiningApprovalService(db)

    return await service.reject_application(
    application_id=application_id,
    employee_code=employee_code,
)