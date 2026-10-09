from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class EmployeeBankBase(BaseModel):
    emp_id: int
    bank_name: Optional[str] = None
    account_no: Optional[str] = None
    ifsc_code: Optional[str] = None


class EmployeeBankCreate(EmployeeBankBase):
    createdby: Optional[str] = None


class EmployeeBankUpdate(BaseModel):
    emp_id: Optional[int] = None
    bank_name: Optional[str] = None
    account_no: Optional[str] = None
    ifsc_code: Optional[str] = None
    modifiedby: Optional[str] = None


class EmployeeBankResponse(EmployeeBankBase):
    id: int

    createdby: Optional[str] = None
    createdon: Optional[datetime] = None

    modifiedby: Optional[str] = None
    modifiedon: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)