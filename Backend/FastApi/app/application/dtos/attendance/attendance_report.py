# from datetime import date, datetime
# from typing import List, Optional

# from pydantic import BaseModel, ConfigDict


# class AttendanceDailyRecord(BaseModel):
#     date: date
#     day_of_week: str

#     employee_id: int
#     employee_code: Optional[str] = None
#     employee_name: str

#     designation: Optional[str] = None
#     department: Optional[str] = None

#     shift: str = "Not Assigned"

#     status: str

#     leave_type: Optional[str] = None
#     holiday_name: Optional[str] = None

#     punch_in: Optional[datetime] = None
#     punch_out: Optional[datetime] = None

#     working_hours: float = 0.0
#     break_minutes: float = 0.0

#     late_minutes: int = 0


# class AttendanceEmployeeReport(BaseModel):
#     employee_id: int
#     employee_code: Optional[str] = None
#     employee_name: str

#     designation: Optional[str] = None
#     department: Optional[str] = None

#     month: str

#     total_days: int

#     present: float
#     week_off: float
#     public_holiday: float

#     pl: float
#     cl: float
#     co: float
#     lop: float

#     half_day_leave: float

#     late: int

#     paid_days: float

#     total_working_hours: float
#     total_break_minutes: float

#     daily_records: List[AttendanceDailyRecord]


# class AttendanceStatistics(BaseModel):
#     total_employees: int

#     present: float
#     week_off: float
#     public_holiday: float

#     pl: float
#     cl: float
#     co: float
#     lop: float

#     late: int

#     total_working_hours: float
#     total_break_minutes: float


# class AttendancePagination(BaseModel):
#     page: int
#     page_size: int

#     total_items: int
#     total_pages: int

#     has_previous: bool
#     has_next: bool


# class AttendanceHistoryResponse(BaseModel):
#     success: bool
#     message: str

#     filters: dict

#     statistics: AttendanceStatistics

#     pagination: AttendancePagination

#     employees: List[AttendanceEmployeeReport]

#     model_config = ConfigDict(from_attributes=True)











from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class MonthlyAttendanceNumberItem(BaseModel):
    employee_id: int
    employee_name: str

    # .NET MonthlyAttendanceNumbers
    n1: float = 0.0   # Present
    n2: float = 0.0   # Week Off
    n3: float = 0.0   # PL
    n4: float = 0.0   # CO
    n5: float = 0.0   # CL
    n6: float = 0.0   # HD-PL
    n7: float = 0.0   # HD-CL
    n8: float = 0.0   # HD-CO
    n9: float = 0.0   # Public Holiday
    n10: float = 0.0  # Absent
    n11: float = 0.0  # HD-LOP
    n12: float = 0.0  # HD-LWP / legacy late bucket

    late_count_15: int = 0


class MonthlyAttendanceNumbersResponse(BaseModel):
    success: bool = True
    from_date: date
    to_date: date
    data: List[MonthlyAttendanceNumberItem]


class AttendanceDailyRecord(BaseModel):
    date: date
    day_of_week: str
    employee_id: int
    employee_code: Optional[str] = None
    employee_name: str
    designation: Optional[str] = None
    department: Optional[str] = None
    shift: str = "Not Assigned"
    status: str
    leave_type: Optional[str] = None
    holiday_name: Optional[str] = None
    punch_in: Optional[datetime] = None
    punch_out: Optional[datetime] = None
    working_hours: float = 0.0
    break_minutes: float = 0.0
    late_minutes: int = 0


class AttendanceEmployeeReport(BaseModel):
    employee_id: int
    employee_code: Optional[str] = None
    employee_name: str
    designation: Optional[str] = None
    department: Optional[str] = None
    month: str
    total_days: int

    present: float = 0.0
    week_off: float = 0.0
    public_holiday: float = 0.0
    pl: float = 0.0
    cl: float = 0.0
    co: float = 0.0
    lop: float = 0.0
    half_day_leave: float = 0.0
    late: int = 0

    # Exact .NET buckets exposed without removing existing frontend fields.
    n1: float = 0.0
    n2: float = 0.0
    n3: float = 0.0
    n4: float = 0.0
    n5: float = 0.0
    n6: float = 0.0
    n7: float = 0.0
    n8: float = 0.0
    n9: float = 0.0
    n10: float = 0.0
    n11: float = 0.0
    n12: float = 0.0
    late_count_15: int = 0

    paid_days: float = 0.0
    total_working_hours: float = 0.0
    total_break_minutes: float = 0.0
    daily_records: List[AttendanceDailyRecord]

    model_config = ConfigDict(from_attributes=True)


class AttendanceStatistics(BaseModel):
    total_employees: int
    present: float
    week_off: float
    public_holiday: float
    pl: float
    cl: float
    co: float
    lop: float
    late: int
    total_working_hours: float
    total_break_minutes: float


class AttendancePagination(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int
    has_previous: bool
    has_next: bool


class AttendanceHistoryResponse(BaseModel):
    success: bool
    message: str
    filters: dict
    statistics: AttendanceStatistics
    pagination: AttendancePagination
    employees: List[AttendanceEmployeeReport]
    model_config = ConfigDict(from_attributes=True)
