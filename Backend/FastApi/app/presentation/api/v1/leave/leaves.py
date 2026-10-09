from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.application.dtos.leave.leave import (
    LeaveBalanceCreateRequest,
    LeaveBalanceUpdateRequest,
    LeaveRequest,
    LeaveSettingUpdateRequest,
    LeaveStatusUpdate,
    LeaveUpdateRequest,
)
from app.application.services.leave.leave_service import LeaveService
from app.core.security import get_current_username as authenticated_username
from app.infrastructure.repositories.leave.leave_repository import LeaveRepository
from app.presentation.dependencies.database import get_transactional_db

router = APIRouter(prefix="/leave", tags=["Leaves"])


def get_leave_service(db: Session = Depends(get_transactional_db)) -> LeaveService:
    return LeaveService(LeaveRepository(db))


def normalize_year(year: Optional[str]) -> Optional[str]:
    if not year:
        return None
    year = year.strip()
    if len(year) == 4 and year.isdigit():
        start_year = int(year)
        return f"{start_year}-{start_year + 1}"
    return year


def normalize_status(status_value: Optional[str]) -> Optional[int]:
    if status_value is None:
        return None
    value = status_value.strip().lower()
    mapping = {
        "pending": 0,
        "approved": 1,
        "rejected": 2,
        "0": 0,
        "1": 1,
        "2": 2,
    }
    if value not in mapping:
        raise HTTPException(
            status_code=422,
            detail="Invalid leave status. Use Pending, Approved or Rejected.",
        )
    return mapping[value]


def normalize_leave_type(leave_type: Optional[str]) -> Optional[str]:
    if not leave_type:
        return None
    value = leave_type.strip().lower()
    mapping = {
        "pl": "Paid Leave",
        "paid leave": "Paid Leave",
        "cl": "Casual Leave",
        "casual leave": "Casual Leave",
        "co": "Comp off",
        "comp off": "Comp off",
        "lop": "LOP",
    }
    return mapping.get(value, leave_type)


@router.get("/employees/active")
def get_active_employees(service: LeaveService = Depends(get_leave_service)):
    return service.get_active_employees()

@router.get("/employees")
def get_all_employees(
    service: LeaveService = Depends(get_leave_service),
):
    return service.get_all_employees()


@router.get("/balances")
def get_leave_balances(
    year: Optional[str] = Query(default=None),
    service: LeaveService = Depends(get_leave_service),
):
    return service.get_all_balances(normalize_year(year))


@router.get("/balance/{emp_code}")
def get_employee_balance(
    emp_code: str,
    year: Optional[str] = Query(default=None),
    service: LeaveService = Depends(get_leave_service),
):
    return service.get_balance(emp_code, normalize_year(year))


@router.post("/balances")
def create_leave_balance(
    request: LeaveBalanceCreateRequest,
    service: LeaveService = Depends(get_leave_service),
    username: str = Depends(authenticated_username),
):
    return service.create_balance(request, username)


@router.put("/balances/{balance_id}")
def update_leave_balance(
    balance_id: int,
    request: LeaveBalanceUpdateRequest,
    service: LeaveService = Depends(get_leave_service),
    username: str = Depends(authenticated_username),
):
    return service.update_balance(balance_id, request, username)


@router.get("/settings")
def get_leave_settings(service: LeaveService = Depends(get_leave_service)):
    return service.get_leave_setting()


@router.put("/settings")
def update_leave_settings(
    request: LeaveSettingUpdateRequest,
    service: LeaveService = Depends(get_leave_service),
    username: str = Depends(authenticated_username),
):
    return service.update_leave_setting(request, username)


@router.post("/apply")
def apply_leave(
    request: LeaveRequest,
    service: LeaveService = Depends(get_leave_service),
    username: str = Depends(authenticated_username),
):
    return service.apply_leave(request, username)


@router.get("/all")
def get_all_leaves(
    emp_code: Optional[str] = Query(default=None),
    status_value: Optional[str] = Query(default=None, alias="status"),
    leave_type: Optional[str] = Query(default=None),
    service: LeaveService = Depends(get_leave_service),
):
    return service.get_all_leaves(
        emp_code=emp_code,
        status=normalize_status(status_value),
        leave_type=normalize_leave_type(leave_type),
    )


@router.get("/my/{emp_code}")
def get_my_leaves(
    emp_code: str,
    service: LeaveService = Depends(get_leave_service),
):
    return service.get_all_leaves(emp_code=emp_code)


@router.get("/pending")
def get_pending_leaves(service: LeaveService = Depends(get_leave_service)):
    return service.get_all_leaves(status=0)


@router.get("/approved")
def get_approved_leaves(service: LeaveService = Depends(get_leave_service)):
    return service.get_all_leaves(status=1)


@router.get("/rejected")
def get_rejected_leaves(service: LeaveService = Depends(get_leave_service)):
    return service.get_all_leaves(status=2)


@router.get("/{leave_id}")
def get_leave(
    leave_id: int,
    service: LeaveService = Depends(get_leave_service),
):
    return service.get_leave(leave_id)


@router.put("/{leave_id}")
def update_leave(
    leave_id: int,
    request: LeaveUpdateRequest,
    service: LeaveService = Depends(get_leave_service),
    username: str = Depends(authenticated_username),
):
    return service.update_leave(leave_id, request, username)


@router.delete("/{leave_id}")
def delete_leave(
    leave_id: int,
    service: LeaveService = Depends(get_leave_service),
):
    return service.delete_leave(leave_id)


@router.post("/approve")
def approve_leave(
    request: LeaveStatusUpdate,
    service: LeaveService = Depends(get_leave_service),
    username: str = Depends(authenticated_username),
):
    return service.approve_leave(request, username)


@router.post("/reject")
def reject_leave(
    request: LeaveStatusUpdate,
    service: LeaveService = Depends(get_leave_service),
    username: str = Depends(authenticated_username),
):
    return service.reject_leave(request, username)
