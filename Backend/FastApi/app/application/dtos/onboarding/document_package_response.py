from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class DocumentItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    package_id: int
    document_type: str
    file_name: Optional[str]
    file_path: Optional[str]
    status: str
    generated_at: Optional[datetime]
    sent_at: Optional[datetime]
    error_message: Optional[str]
    created_at: datetime
    updated_at: datetime


class DocumentPackageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_application_id: int

    designation: Optional[str]
    department: Optional[str]
    location: Optional[str]
    reporting_manager: Optional[str]

    joining_date: Optional[date]
    interview_date: Optional[date]
    salary_from_month: Optional[date]

    annual_ctc: Optional[Decimal]

    basic_monthly: Optional[Decimal]
    basic_annual: Optional[Decimal]

    hra_monthly: Optional[Decimal]
    hra_annual: Optional[Decimal]

    conveyance_monthly: Optional[Decimal]
    conveyance_annual: Optional[Decimal]

    education_allowance_monthly: Optional[Decimal]
    education_allowance_annual: Optional[Decimal]

    special_allowance_monthly: Optional[Decimal]
    special_allowance_annual: Optional[Decimal]

    lta_monthly: Optional[Decimal]
    lta_annual: Optional[Decimal]

    medical_monthly: Optional[Decimal]
    medical_annual: Optional[Decimal]

    mediclaim_monthly: Optional[Decimal]
    mediclaim_annual: Optional[Decimal]

    professional_tax_monthly: Optional[Decimal]
    professional_tax_annual: Optional[Decimal]

    pf_monthly: Optional[Decimal]
    pf_annual: Optional[Decimal]

    gratuity_monthly: Optional[Decimal]
    gratuity_annual: Optional[Decimal]

    sub_total_1_monthly: Optional[Decimal]
    sub_total_1_annual: Optional[Decimal]

    sub_total_deduction_monthly: Optional[Decimal]
    sub_total_deduction_annual: Optional[Decimal]

    sub_total_monthly: Optional[Decimal]
    sub_total_annual: Optional[Decimal]

    gross_ctc_monthly: Optional[Decimal]
    gross_ctc_annual: Optional[Decimal]

    status: str

    created_by: Optional[int]
    updated_by: Optional[int]

    created_at: datetime
    updated_at: datetime

    generated_at: Optional[datetime]
    sent_at: Optional[datetime]

    email_status: Optional[str]
    email_error: Optional[str]

    items: List[DocumentItemResponse]