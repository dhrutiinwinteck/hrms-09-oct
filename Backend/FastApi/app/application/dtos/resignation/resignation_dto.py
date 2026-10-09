from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ResignationCreate(BaseModel):

    emp_id: int

    reason: str = Field(
        ...,
        max_length=500
    )

    is_resignation: int = 1

    is_termination: int = 0

    from_date: datetime

    notice_period: int


class ResignationUpdate(BaseModel):

    reason: Optional[str] = Field(
        default=None,
        max_length=500
    )

    from_date: Optional[datetime] = None

    notice_period: Optional[int] = None

    # 0 = Pending
    # 1 = Approved
    # 2 = Rejected
    hr_status: Optional[int] = None

    # 0 = Pending
    # 1 = Approved
    # 2 = Rejected
    promoter_status: Optional[int] = None


# ============================================================
# EMPLOYEE SUMMARY
# ============================================================

class ResignationEmployeeResponse(BaseModel):

    id: int

    first_name: Optional[str] = None

    last_name: Optional[str] = None

    full_name: Optional[str] = None

    emp_code: Optional[str] = None

    class Config:
        from_attributes = True


# ============================================================
# RESIGNATION RESPONSE
# ============================================================

class ResignationResponse(BaseModel):

    id: int

    emp_id: int

    employee: Optional[ResignationEmployeeResponse] = None

    reason: Optional[str] = None

    is_resignation: Optional[int] = None

    is_termination: Optional[int] = None

    from_date: Optional[datetime] = None

    notice_period: Optional[int] = None

    hr_status: Optional[int] = None

    promoter_status: Optional[int] = None

    createdon: Optional[datetime] = None

    class Config:
        from_attributes = True