from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class CompOffCreateRequest(BaseModel):

    worked_date: date

    day_type: str

    reason: str = Field(
        ...,
        min_length=3,
        max_length=1000,
    )


class CompOffApprovalRequest(BaseModel):

    comp_off_date: date

    remarks: Optional[str] = Field(
        default=None,
        max_length=1000,
    )


class CompOffRejectionRequest(BaseModel):

    rejection_reason: str = Field(
        ...,
        min_length=3,
        max_length=1000,
    )