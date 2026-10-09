from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class DocumentPackageCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    job_application_id: int = Field(gt=0)

    designation: Optional[str] = Field(default=None, max_length=255)
    department: Optional[str] = Field(default=None, max_length=255)
    location: Optional[str] = Field(default=None, max_length=255)
    reporting_manager: Optional[str] = Field(default=None, max_length=255)

    joining_date: Optional[date] = None
    interview_date: Optional[date] = None
    salary_from_month: Optional[date] = None

    annual_ctc: Optional[Decimal] = Field(
        default=None,
        ge=0,
        max_digits=15,
        decimal_places=2,
    )

    basic_monthly: Optional[Decimal] = Field(default=None, ge=0)
    basic_annual: Optional[Decimal] = Field(default=None, ge=0)

    hra_monthly: Optional[Decimal] = Field(default=None, ge=0)
    hra_annual: Optional[Decimal] = Field(default=None, ge=0)

    conveyance_monthly: Optional[Decimal] = Field(default=None, ge=0)
    conveyance_annual: Optional[Decimal] = Field(default=None, ge=0)

    education_allowance_monthly: Optional[Decimal] = Field(default=None, ge=0)
    education_allowance_annual: Optional[Decimal] = Field(default=None, ge=0)

    special_allowance_monthly: Optional[Decimal] = Field(default=None, ge=0)
    special_allowance_annual: Optional[Decimal] = Field(default=None, ge=0)

    lta_monthly: Optional[Decimal] = Field(default=None, ge=0)
    lta_annual: Optional[Decimal] = Field(default=None, ge=0)

    medical_monthly: Optional[Decimal] = Field(default=None, ge=0)
    medical_annual: Optional[Decimal] = Field(default=None, ge=0)

    mediclaim_monthly: Optional[Decimal] = Field(default=None, ge=0)
    mediclaim_annual: Optional[Decimal] = Field(default=None, ge=0)

    professional_tax_monthly: Optional[Decimal] = Field(default=None, ge=0)
    professional_tax_annual: Optional[Decimal] = Field(default=None, ge=0)

    pf_monthly: Optional[Decimal] = Field(default=None, ge=0)
    pf_annual: Optional[Decimal] = Field(default=None, ge=0)

    gratuity_monthly: Optional[Decimal] = Field(default=None, ge=0)
    gratuity_annual: Optional[Decimal] = Field(default=None, ge=0)

    sub_total_1_monthly: Optional[Decimal] = Field(default=None, ge=0)
    sub_total_1_annual: Optional[Decimal] = Field(default=None, ge=0)

    sub_total_deduction_monthly: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )
    sub_total_deduction_annual: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    sub_total_monthly: Optional[Decimal] = Field(default=None, ge=0)
    sub_total_annual: Optional[Decimal] = Field(default=None, ge=0)

    gross_ctc_monthly: Optional[Decimal] = Field(default=None, ge=0)
    gross_ctc_annual: Optional[Decimal] = Field(default=None, ge=0)