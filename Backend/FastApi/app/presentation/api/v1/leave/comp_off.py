from datetime import date
from typing import Optional

from sqlalchemy import func, text

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    Query,
    UploadFile,
)

from sqlalchemy.orm import Session

from app.application.dtos.leave.comp_off import (
    # CompOffApprovalRequest,
    CompOffCreateRequest,
    # CompOffRejectionRequest,
)

from app.application.services.leave.comp_off_service import (
    CompOffService,
)

from app.core.security import (
    get_current_username as authenticated_username,
)

from app.infrastructure.repositories.leave.comp_off_repository import (
    CompOffRepository,
)

from app.presentation.dependencies.database import (
    get_transactional_db,
)

from app.infrastructure.models.leave.leave_balance import (
    LeaveBalanceModel,
)


router = APIRouter(
    prefix="/comp-off",
    tags=["Comp Off"],
)


def get_comp_off_service(
    db: Session = Depends(get_transactional_db),
) -> CompOffService:

    return CompOffService(
        CompOffRepository(db)
    )


# ============================================================
# CREATE
# ============================================================

@router.post(
    "",
    status_code=201,
)
async def create_comp_off_request(
    worked_date: date = Form(...),
    day_type: str = Form(...),
    reason: str = Form(...),
    attachment: Optional[UploadFile] = File(
        default=None
    ),
    service: CompOffService = Depends(
        get_comp_off_service
    ),
    username: str = Depends(
        authenticated_username
    ),
):

    request = CompOffCreateRequest(
        worked_date=worked_date,
        day_type=day_type,
        reason=reason,
    )

    return await service.create_request(
        request=request,
        username=username,
        attachment=attachment,
    )


# ============================================================
# MY REQUESTS
# ============================================================

@router.get("/my")
def get_my_comp_off_requests(
    status: Optional[str] = Query(
        default=None
    ),
    day_type: Optional[str] = Query(
        default=None
    ),
    from_date: Optional[date] = Query(
        default=None
    ),
    to_date: Optional[date] = Query(
        default=None
    ),
    service: CompOffService = Depends(
        get_comp_off_service
    ),
    username: str = Depends(
        authenticated_username
    ),
):

    return service.get_my_requests(
        username=username,
        status=status,
        day_type=day_type,
        from_date=from_date,
        to_date=to_date,
    )


# ============================================================
# ALL REQUESTS
# ============================================================

@router.get("/all")
def get_all_comp_off_requests(
    status: Optional[str] = Query(
        default=None
    ),
    day_type: Optional[str] = Query(
        default=None
    ),
    from_date: Optional[date] = Query(
        default=None
    ),
    to_date: Optional[date] = Query(
        default=None
    ),
    service: CompOffService = Depends(
        get_comp_off_service
    ),
    username: str = Depends(
        authenticated_username
    ),
):

    return service.get_all_requests(
        status=status,
        day_type=day_type,
        from_date=from_date,
        to_date=to_date,
    )


# ============================================================
# PENDING
# ============================================================

@router.get("/pending")
def get_pending_comp_off_requests(
    service: CompOffService = Depends(
        get_comp_off_service
    ),
    username: str = Depends(
        authenticated_username
    ),
):

    return service.get_all_requests(
        status=CompOffService.STATUS_PENDING
    )

# ============================================================
# DEBUG DATABASE CONNECTION
# TEMPORARY DIAGNOSTIC ENDPOINT
# ============================================================

@router.get("/debug/database")
def debug_comp_off_database(
    db: Session = Depends(get_transactional_db),
):
    result = db.execute(
        text(
            """
            SELECT
                current_database() AS database_name,
                current_schema() AS schema_name,
                inet_server_addr()::text AS server_address,
                inet_server_port() AS server_port
            """
        )
    ).mappings().first()

    if not result:
        return {
            "found": False,
            "message": "Unable to read database connection information.",
        }

    return {
        "found": True,
        "database_name": result["database_name"],
        "schema_name": result["schema_name"],
        "server_address": result["server_address"],
        "server_port": result["server_port"],
    }

# ============================================================
# DEBUG LEAVE BALANCE
# TEMPORARY DIAGNOSTIC ENDPOINT
# ============================================================

@router.get("/debug/balance/{emp_code}/{year}")
def debug_comp_off_balance(
    emp_code: str,
    year: str,
    db: Session = Depends(get_transactional_db),
):
    balance = (
        db.query(LeaveBalanceModel)
        .filter(
            func.trim(LeaveBalanceModel.emp_id)
            == emp_code.strip(),
            func.trim(LeaveBalanceModel.year)
            == year.strip(),
        )
        .first()
    )

    if not balance:
        return {
            "found": False,
            "emp_code_received": emp_code,
            "year_received": year,
            "message": "Balance was not found from the FastAPI database session.",
        }

    return {
        "found": True,
        "id": balance.id,
        "emp_id": balance.emp_id,
        "year": balance.year,
        "remained_casual_leave": balance.remained_casual_leave,
        "remained_paid_leave": balance.remained_paid_leave,
        "remained_comp_off": balance.remained_comp_off,
    }


# ============================================================
# SINGLE
# ============================================================

@router.get("/{request_id}")
def get_comp_off_request(
    request_id: int,
    service: CompOffService = Depends(
        get_comp_off_service
    ),
    username: str = Depends(
        authenticated_username
    ),
):

    return service.get_request(
        request_id
    )


# ============================================================
# APPROVE
# ============================================================

# @router.put("/{request_id}/approve")
# def approve_comp_off_request(
#     request_id: int,
#     request: CompOffApprovalRequest,
#     service: CompOffService = Depends(
#         get_comp_off_service
#     ),
#     username: str = Depends(
#         authenticated_username
#     ),
# ):

#     return service.approve_request(
#         request_id=request_id,
#         request=request,
#         username=username,
#     )

# ============================================================
# APPROVE
# ============================================================

@router.put("/{request_id}/approve")
def approve_comp_off_request(
    request_id: int,
    service: CompOffService = Depends(
        get_comp_off_service
    ),
    username: str = Depends(
        authenticated_username
    ),
):

    return service.approve_request(
        request_id=request_id,
        username=username,
    )


# ============================================================
# REJECT
# ============================================================

@router.put("/{request_id}/reject")
def reject_comp_off_request(
    request_id: int,
    service: CompOffService = Depends(
        get_comp_off_service
    ),
    username: str = Depends(
        authenticated_username
    ),
):

    return service.reject_request(
        request_id=request_id,
        username=username,
    )