from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class HolidayCreate(BaseModel):
    holiday_name: str
    holiday_date: date
    createdby: str

class HolidayUpdate(BaseModel):
    holiday_name: Optional[str] = None
    holiday_date: Optional[date] = None
    status: Optional[int] = None
    modifiedby: str

class HolidayResponse(BaseModel):
    id: int
    holiday_name: str
    holiday_date: date
    status: int
    createdby: Optional[str]
    createdon: Optional[datetime]

    class Config:
        from_attributes = True