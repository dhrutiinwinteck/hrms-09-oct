from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class OfferLetterBaseDto(BaseModel):
    offer_letter_title: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    company_logo: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    company_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    office_address: Optional[str] = None

    singapore_os_address: Optional[str] = None

    offer_date: Optional[date] = None

    candidate_name: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    candidate_address: Optional[str] = None

    candidate_contact_no: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    candidate_email: Optional[str] = Field(
        default=None,
        max_length=320,
    )

    position: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    reporting_manager: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    reporting_manager_designation: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    joining_date: Optional[date] = None

    probation_period: Optional[int] = Field(
        default=None,
        ge=0,
    )

    probation_period_unit: str = Field(
        default="Months",
        max_length=50,
    )

    total_ctc: Optional[Decimal] = Field(
        default=None,
        ge=0,
        max_digits=18,
        decimal_places=2,
    )

    job_duties: Optional[str] = None

    acceptance_text: Optional[str] = None

    hr_signatory_name: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    hr_designation: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    signature_file_name: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    signature_file_path: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    stamp_file_name: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    stamp_file_path: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    letter_body_template: str = Field(
        ...,
        min_length=1,
    )

    show_company_logo: bool = True

    show_office_address_footer: bool = True

    show_singapore_address: bool = True

    show_candidate_acceptance: bool = True

    page_size: str = Field(
        default="A4",
        max_length=20,
    )

    @field_validator(
        "offer_letter_title",
        "company_name",
        "position",
        "reporting_manager",
    )
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Value cannot be empty.")

        return value

    @field_validator("probation_period_unit")
    @classmethod
    def validate_probation_unit(cls, value: str) -> str:
        value = value.strip().title()

        if value not in {"Days", "Weeks", "Months"}:
            raise ValueError(
                "probation_period_unit must be one of: Days, Weeks, Months."
            )

        return value

    @field_validator("page_size")
    @classmethod
    def validate_page_size(cls, value: str) -> str:
        value = value.strip().upper()

        if value not in {
            "A4",
            "A3",
            "A5",
            "LETTER",
            "LEGAL",
        }:
            raise ValueError(
                "page_size must be one of: A4, A3, A5, LETTER, LEGAL."
            )

        return value


class OfferLetterCreateDto(OfferLetterBaseDto):
    pass


class OfferLetterUpdateDto(BaseModel):
    offer_letter_title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    company_logo: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    company_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    office_address: Optional[str] = None

    singapore_os_address: Optional[str] = None

    offer_date: Optional[date] = None

    candidate_name: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    candidate_address: Optional[str] = None

    candidate_contact_no: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    candidate_email: Optional[str] = Field(
        default=None,
        max_length=320,
    )

    position: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    reporting_manager: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    reporting_manager_designation: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    joining_date: Optional[date] = None

    probation_period: Optional[int] = Field(
        default=None,
        ge=0,
    )

    probation_period_unit: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    total_ctc: Optional[Decimal] = Field(
        default=None,
        ge=0,
        max_digits=18,
        decimal_places=2,
    )

    job_duties: Optional[str] = None

    acceptance_text: Optional[str] = None

    hr_signatory_name: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    hr_designation: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    signature_file_name: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    signature_file_path: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    stamp_file_name: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    stamp_file_path: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    letter_body_template: Optional[str] = Field(
        default=None,
        min_length=1,
    )

    show_company_logo: Optional[bool] = None

    show_office_address_footer: Optional[bool] = None

    show_singapore_address: Optional[bool] = None

    show_candidate_acceptance: Optional[bool] = None

    page_size: Optional[str] = Field(
        default=None,
        max_length=20,
    )

    @field_validator(
        "offer_letter_title",
        "company_name",
        "position",
        "reporting_manager",
        "letter_body_template",
    )
    @classmethod
    def validate_text(
        cls,
        value: Optional[str],
    ) -> Optional[str]:

        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError("Value cannot be empty.")

        return value

    @field_validator("probation_period_unit")
    @classmethod
    def validate_probation_unit(
        cls,
        value: Optional[str],
    ) -> Optional[str]:

        if value is None:
            return None

        value = value.strip().title()

        if value not in {
            "Days",
            "Weeks",
            "Months",
        }:
            raise ValueError(
                "probation_period_unit must be one of: Days, Weeks, Months."
            )

        return value

    @field_validator("page_size")
    @classmethod
    def validate_page_size(
        cls,
        value: Optional[str],
    ) -> Optional[str]:

        if value is None:
            return None

        value = value.strip().upper()

        if value not in {
            "A4",
            "A3",
            "A5",
            "LETTER",
            "LEGAL",
        }:
            raise ValueError(
                "page_size must be one of: A4, A3, A5, LETTER, LEGAL."
            )

        return value


class OfferLetterResponseDto(OfferLetterBaseDto):

    model_config = ConfigDict(from_attributes=True)

    id: int

    created_by: Optional[int] = None

    created_on: datetime

    modified_by: Optional[int] = None

    modified_on: Optional[datetime] = None

    is_active: bool


class OfferLetterListResponseDto(BaseModel):

    id: int

    offer_letter_title: str

    company_name: str

    position: str

    page_size: str

    is_active: bool

    model_config = ConfigDict(from_attributes=True)