from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ShiftSwapRequestType(str, Enum):
    SPECIFIC_DAY = "SpecificDay"


class ShiftSwapStatus(str, Enum):
    PENDING_TARGET_ACCEPTANCE = "PendingTargetAcceptance"
    PENDING_MANAGER_APPROVAL = "PendingManagerApproval"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class CreateShiftSwapRequest(BaseModel):
    """
    Request used by Employee A to create a shift swap request.

    requested_by_emp_id is intentionally NOT accepted from the frontend.
    The backend determines the requester from the authenticated user.
    """

    requested_to_emp_id: int = Field(
        ...,
        gt=0,
        description="Employee ID of the employee with whom the requester wants to swap.",
    )

    request_type: ShiftSwapRequestType = Field(
        default=ShiftSwapRequestType.SPECIFIC_DAY,
    )

    swap_date: date

    model_config = ConfigDict(
        extra="forbid",
    )

    @field_validator("requested_to_emp_id")
    @classmethod
    def validate_requested_to_emp_id(
        cls,
        value: int,
    ) -> int:

        if value <= 0:
            raise ValueError(
                "Requested employee ID must be greater than zero."
            )

        return value


class EligibleEmployeeDto(BaseModel):
    """
    Employee that can be selected as Employee B.
    """

    employee_id: int

    employee_code: Optional[str] = None

    employee_name: str

    swap_date: date

    day_of_week: str

    is_week_off: bool

    is_leave: bool

    has_shift_date_record: bool = True

    model_config = ConfigDict(
        from_attributes=True,
    )


class ShiftStateDto(BaseModel):
    """
    Date-level shift state.
    """

    employee_id: int

    swap_date: date

    pattern_id: Optional[int] = None

    is_week_off: bool

    is_leave: bool

    day_of_week: Optional[str] = None


class ShiftSwapListItemDto(BaseModel):
    """
    Shift swap list item.
    """

    swap_requested_id: int

    requested_by_emp_id: int

    requested_to_emp_id: int

    requested_by_name: str

    requested_to_name: str

    request_type: str

    swap_date: date

    status: str

    created_date: datetime

    reporting_manager_id: Optional[int] = None

    reporting_manager_name: Optional[str] = None

    approved_by: Optional[str] = None

    approved_on: Optional[datetime] = None


class ShiftSwapResponseDto(BaseModel):
    """
    Complete shift swap request response.
    """

    swap_requested_id: int

    requested_by_emp_id: int

    requested_to_emp_id: int

    requested_by_name: str

    requested_to_name: str

    request_type: str

    swap_date: date

    status: str

    created_date: datetime

    reporting_manager_id: Optional[int] = None

    reporting_manager_name: Optional[str] = None

    approved_by: Optional[str] = None

    approved_on: Optional[datetime] = None

    requester_shift: Optional[ShiftStateDto] = None

    target_shift: Optional[ShiftStateDto] = None


class ShiftSwapActionResponseDto(BaseModel):
    """
    Response returned after accept/reject/approve operations.
    """

    success: bool

    message: str

    swap_requested_id: int

    status: str


class ShiftSwapEligibleEmployeeResponse(BaseModel):
    """
    Response for the eligible employee API.
    """

    success: bool

    swap_date: date

    employees: List[EligibleEmployeeDto]