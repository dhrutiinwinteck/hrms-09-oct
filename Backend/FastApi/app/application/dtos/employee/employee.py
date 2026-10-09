from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class EmployeeCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

    # Frontend sends designation name
    designation: str

    reporting_manager: Optional[int] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    doj: Optional[datetime] = None
    photo: Optional[str] = None
    emp_type: Optional[str] = None
    company_name: Optional[str] = None
    company_location: Optional[str] = None
    company_country: Optional[str] = None
    project: Optional[str] = None
    contract_period: Optional[datetime] = None
    notice_period: Optional[int] = None
    personal_email: Optional[EmailStr] = None


class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    gender: Optional[str] = None

    # Frontend sends designation name
    designation: Optional[str] = None

    reporting_manager: Optional[int] = None
    doj: Optional[datetime] = None
    photo: Optional[str] = None
    emp_type: Optional[str] = None
    company_name: Optional[str] = None
    company_location: Optional[str] = None
    company_country: Optional[str] = None
    project: Optional[str] = None
    contract_period: Optional[datetime] = None
    notice_period: Optional[int] = None
    personal_email: Optional[EmailStr] = None
    is_remove: Optional[int] = None


class EmployeeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    emp_code: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    photo: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    doj: Optional[datetime] = None
    reporting_manager: Optional[str] = None
    createdon: Optional[datetime] = None
    createdby: Optional[str] = None
    modifiedby: Optional[str] = None
    modifiedon: Optional[datetime] = None
    is_remove: int
    emp_type: Optional[str] = None
    company_name: Optional[str] = None
    company_location: Optional[str] = None
    company_country: Optional[str] = None
    project: Optional[str] = None
    contract_period: Optional[datetime] = None
    notice_period: Optional[int] = None
    personal_email: Optional[str] = None