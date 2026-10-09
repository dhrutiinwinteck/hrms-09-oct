from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class MonthlySalaryQuery(BaseModel):
    """
    Query parameters for the Monthly Salary Sheet.
    """

    month: int = Field(
        ...,
        ge=1,
        le=12,
        description="Salary month (1-12)",
    )

    year: int = Field(
        ...,
        ge=2000,
        le=2100,
        description="Salary year",
    )


class MonthlySalaryResponse(BaseModel):
    """
    Monthly Salary Sheet response.
    """

    model_config = ConfigDict(
        from_attributes=True
    )

    employee_id: int
    employee_name: str

    uan: Optional[str] = None
    esic: Optional[str] = None

    bank_name: Optional[str] = None
    account_no: Optional[str] = None
    ifsc: Optional[str] = None

    net_salary: Optional[Decimal] = None


class MonthlySalaryListResponse(BaseModel):
    """
    Monthly Salary Sheet API response.
    """

    month: int
    year: int
    total_records: int

    data: list[MonthlySalaryResponse]