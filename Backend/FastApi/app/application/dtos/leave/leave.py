from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class LeaveRequest(BaseModel):
    emp_code: str
    leave_from: datetime
    leave_to: datetime
    no_of_days: float
    leave_type: str
    leave_reason: Optional[str] = None


class LeaveUpdateRequest(BaseModel):
    """Legacy EditLeave changes only the leave reason."""
    leave_reason: str


class LeaveStatusUpdate(BaseModel):
    leave_id: int
    status: int
    approved_by: Optional[int] = None


class LeaveBalanceCreateRequest(BaseModel):
    emp_id: str
    year: str
    remained_casual_leave: float = 0
    remained_paid_leave: float = 0
    remained_comp_off: float = 0
    leave_type: Optional[str] = None


class LeaveBalanceUpdateRequest(BaseModel):
    """Legacy LeaveBalance Edit exposes only Comp Off for editing."""
    remained_comp_off: float


class LeaveSettingUpdateRequest(BaseModel):
    leave_type: int
    leave_number: int
