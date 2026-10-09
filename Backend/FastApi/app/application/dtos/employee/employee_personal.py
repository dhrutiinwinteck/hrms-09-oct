from datetime import date, datetime
from typing import Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
)


class EmployeePersonalCreate(BaseModel):

    emp_id: int

    passport_no: Optional[str] = None
    passport_file: Optional[str] = None

    aadhar_no: Optional[str] = None
    aadhar_file_front: Optional[str] = None
    aadhar_file_back: Optional[str] = None

    date_of_birth: Optional[date] = None

    email: Optional[EmailStr] = None
    phone: Optional[str] = None

    current_address: Optional[str] = None
    permanent_address: Optional[str] = None

    marital_status: Optional[int] = None
    marriage_date: Optional[date] = None

    pan_no: Optional[str] = None
    pan_file: Optional[str] = None


class EmployeePersonalUpdate(BaseModel):

    passport_no: Optional[str] = None
    passport_file: Optional[str] = None

    aadhar_no: Optional[str] = None
    aadhar_file_front: Optional[str] = None
    aadhar_file_back: Optional[str] = None

    date_of_birth: Optional[date] = None

    email: Optional[EmailStr] = None
    phone: Optional[str] = None

    current_address: Optional[str] = None
    permanent_address: Optional[str] = None

    marital_status: Optional[int] = None
    marriage_date: Optional[date] = None

    pan_no: Optional[str] = None
    pan_file: Optional[str] = None


class EmployeePersonalResponse(BaseModel):

    id: int
    emp_id: int

    passport_no: Optional[str] = None
    passport_file: Optional[str] = None

    aadhar_no: Optional[str] = None
    aadhar_file_front: Optional[str] = None
    aadhar_file_back: Optional[str] = None

    date_of_birth: Optional[date] = None

    email: Optional[str] = None
    phone: Optional[str] = None

    current_address: Optional[str] = None
    permanent_address: Optional[str] = None

    marital_status: Optional[int] = None
    marriage_date: Optional[date] = None

    createdby: Optional[str] = None
    createdon: Optional[datetime] = None

    modifiedby: Optional[str] = None
    modifiedon: Optional[datetime] = None

    pan_no: Optional[str] = None
    pan_file: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)