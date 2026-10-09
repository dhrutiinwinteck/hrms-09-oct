from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class AttendanceHistoryItem(BaseModel):

    id: int

    emp_id: int

    emp_code: Optional[str] = None

    employee_name: str

    department_id: Optional[int] = None

    department_name: Optional[str] = None

    date: date

    punch_in: Optional[datetime] = None

    punch_out: Optional[datetime] = None

    working_hrs: float = 0.0

    total_break: float = 0.0

    status: str

    late_minutes: int = 0

    shift_start: Optional[str] = None

    shift_end: Optional[str] = None

    punch_in_address: Optional[str] = None

    punch_out_address: Optional[str] = None

    punch_in_inside_office: Optional[bool] = None

    punch_out_inside_office: Optional[bool] = None


class AttendancePagination(BaseModel):

    page: int

    page_size: int

    total_records: int

    total_pages: int

    has_next: bool

    has_previous: bool


class AttendanceHistoryResponse(BaseModel):

    success: bool = True

    data: list[AttendanceHistoryItem]

    pagination: AttendancePagination


class AttendanceEmployeeItem(BaseModel):

    id: int

    emp_code: Optional[str] = None

    employee_name: str


class AttendanceEmployeesResponse(BaseModel):

    success: bool = True

    data: list[AttendanceEmployeeItem]


class AttendanceSummaryResponse(BaseModel):

    success: bool = True

    total_employees: int = 0

    present: int = 0

    absent: int = 0

    half_day: int = 0

    week_off: int = 0

    holiday: int = 0

    leave: int = 0

    late: int = 0

    open_sessions: int = 0

    total_working_hours: float = 0.0

    average_working_hours: float = 0.0


class AttendanceOverviewItem(BaseModel):

    date: date

    present: int = 0

    absent: int = 0

    half_day: int = 0

    week_off: int = 0

    holiday: int = 0

    leave: int = 0

    late: int = 0


class AttendanceOverviewResponse(BaseModel):

    success: bool = True

    data: list[AttendanceOverviewItem]


class AttendanceFilterResponse(BaseModel):

    success: bool = True

    employees: list[AttendanceEmployeeItem]

    departments: list[dict]

    months: list[dict]


class LateMarkRequest(BaseModel):

    from_date: date

    to_date: date

    emp_id: Optional[int] = None

    grace_minutes: int = Field(
        default=15,
        ge=0,
        le=120,
    )


class LateMarkItem(BaseModel):

    attendance_id: int

    emp_id: int

    emp_code: Optional[str] = None

    employee_name: str

    date: date

    punch_in: Optional[datetime] = None

    shift_start: Optional[str] = None

    late_minutes: int

    is_late: bool


class LateMarkResponse(BaseModel):

    success: bool = True

    from_date: date

    to_date: date

    grace_minutes: int

    total_late_records: int

    data: list[LateMarkItem]