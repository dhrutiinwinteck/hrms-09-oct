from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional


# ============================================================
# OLD / EXISTING PUNCH REQUEST
# ============================================================

class PunchRequest(BaseModel):

    emp_id: int

    address: Optional[str] = None

    latitude: Optional[float] = None

    longitude: Optional[float] = None


# ============================================================
# ATTENDANCE UPDATE
# ============================================================

class AttendanceUpdate(BaseModel):

    punch_in: Optional[datetime] = None

    punch_out: Optional[datetime] = None

    total_break: Optional[float] = None


# ============================================================
# ATTENDANCE RESPONSE
# ============================================================

class AttendanceResponse(BaseModel):

    id: int

    emp_id: int

    date: date

    punch_in: Optional[datetime] = None

    punch_out: Optional[datetime] = None

    working_hrs: Optional[float] = None

    total_break: float = 0.0

    last_break_in: Optional[datetime] = None

    last_break_out: Optional[datetime] = None

    # ========================================================
    # PUNCH-IN LOCATION
    # ========================================================

    punch_in_latitude: Optional[float] = None

    punch_in_longitude: Optional[float] = None

    punch_in_accuracy: Optional[float] = None

    punch_in_address: Optional[str] = None

    punch_in_distance_from_office: Optional[float] = None

    punch_in_inside_office: Optional[bool] = None

    # ========================================================
    # PUNCH-OUT LOCATION
    # ========================================================

    punch_out_latitude: Optional[float] = None

    punch_out_longitude: Optional[float] = None

    punch_out_accuracy: Optional[float] = None

    punch_out_address: Optional[str] = None

    punch_out_distance_from_office: Optional[float] = None

    punch_out_inside_office: Optional[bool] = None

    class Config:
        from_attributes = True