from __future__ import annotations

from datetime import date, time
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class RosterDayResponse(BaseModel):
    """
    Represents one day in the selected roster week.
    """

    date: date
    day: str


class RosterShiftResponse(BaseModel):
    """
    Represents one employee's roster state for one date.
    """

    date: date
    day: str

    pattern_id: Optional[int] = None
    pattern_name: Optional[str] = None

    start_time: Optional[time] = None
    end_time: Optional[time] = None

    shift: Optional[str] = None

    is_week_off: bool = False
    is_leave: bool = False


class RosterEmployeeResponse(BaseModel):
    """
    Represents one employee and their seven-day roster.
    """

    employee_id: int
    employee_code: Optional[str] = None
    employee_name: str

    shifts: List[RosterShiftResponse]


class WeeklyRosterResponse(BaseModel):
    """
    Complete Monday-Sunday roster response.
    """

    model_config = ConfigDict(from_attributes=True)

    week_start: date
    week_end: date

    days: List[RosterDayResponse]

    employees: List[RosterEmployeeResponse]