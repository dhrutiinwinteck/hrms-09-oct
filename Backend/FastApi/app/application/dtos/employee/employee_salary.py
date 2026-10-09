from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class EmployeeSalaryCreate(BaseModel):
    emp_id: int = Field(gt=0)

    salary: Optional[Decimal] = Field(
        default=None,
        ge=0,
        max_digits=12,
        decimal_places=2
    )

    mode_pay: Optional[int] = Field(
        default=None,
        ge=0
    )

    uan: Optional[str] = Field(
        default=None,
        max_length=100
    )

    esic: Optional[str] = Field(
        default=None,
        max_length=100
    )

    createdby: Optional[str] = Field(
        default=None,
        max_length=100
    )


class EmployeeSalaryUpdate(BaseModel):
    salary: Optional[Decimal] = Field(
        default=None,
        ge=0,
        max_digits=12,
        decimal_places=2
    )

    mode_pay: Optional[int] = Field(
        default=None,
        ge=0
    )

    uan: Optional[str] = Field(
        default=None,
        max_length=100
    )

    esic: Optional[str] = Field(
        default=None,
        max_length=100
    )

    modifiedby: Optional[str] = Field(
        default=None,
        max_length=100
    )


class EmployeeSalaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    emp_id: int
    salary: Optional[Decimal] = None
    mode_pay: Optional[int] = None
    uan: Optional[str] = None
    esic: Optional[str] = None
    createdby: Optional[str] = None
    createdon: Optional[datetime] = None
    modifiedby: Optional[str] = None
    modifiedon: Optional[datetime] = None