from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class EmployeeEmergencyContactCreate(BaseModel):
    emp_id: int = Field(
        ...,
        gt=0,
        description="Employee ID",
    )

    p_name: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    p_relationship: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    p_phone: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    p_alt_phone: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    s_name: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    s_relationship: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    s_phone: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    s_alt_phone: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    createdby: Optional[str] = Field(
        default=None,
        max_length=255,
    )


class EmployeeEmergencyContactUpdate(BaseModel):
    emp_id: Optional[int] = Field(
        default=None,
        gt=0,
    )

    p_name: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    p_relationship: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    p_phone: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    p_alt_phone: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    s_name: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    s_relationship: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    s_phone: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    s_alt_phone: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    modifiedby: Optional[str] = Field(
        default=None,
        max_length=255,
    )


class EmployeeEmergencyContactResponse(BaseModel):
    id: int
    emp_id: int

    p_name: Optional[str] = None
    p_relationship: Optional[str] = None
    p_phone: Optional[str] = None
    p_alt_phone: Optional[str] = None

    s_name: Optional[str] = None
    s_relationship: Optional[str] = None
    s_phone: Optional[str] = None
    s_alt_phone: Optional[str] = None

    createdby: Optional[str] = None
    createdon: Optional[datetime] = None

    modifiedby: Optional[str] = None
    modifiedon: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True,
    )