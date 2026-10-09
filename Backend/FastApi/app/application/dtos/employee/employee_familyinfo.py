from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class EmployeeFamilyInfoCreate(BaseModel):
    emp_id: int = Field(..., gt=0)

    name: Optional[str] = None

    relationship: Optional[str] = None

    dob: Optional[datetime] = None

    phone: Optional[str] = None


class EmployeeFamilyInfoUpdate(BaseModel):
    name: Optional[str] = None

    relationship: Optional[str] = None

    dob: Optional[datetime] = None

    phone: Optional[str] = None


class EmployeeFamilyInfoResponse(BaseModel):
    id: int

    emp_id: int

    name: Optional[str] = None

    relationship: Optional[str] = None

    dob: Optional[datetime] = None

    phone: Optional[str] = None

    createdby: Optional[str] = None

    createdon: Optional[datetime] = None

    modifiedby: Optional[str] = None

    modifiedon: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True
    )