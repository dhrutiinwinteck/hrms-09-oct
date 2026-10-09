from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class BirthdayEmployee(BaseModel):
    emp_code: str
    full_name: str
    photo: Optional[str]

class DashboardStats(BaseModel):
    total_employees: int
    present_today: int
    on_leave_today: int
    birthdays_today: List[BirthdayEmployee]
    server_time: datetime