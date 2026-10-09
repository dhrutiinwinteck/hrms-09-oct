# from datetime import date, datetime
# from typing import Optional

# from pydantic import BaseModel, ConfigDict, Field, field_validator


# class LetterOfIntentSettingsUpdate(BaseModel):
#     letter_title: Optional[str] = Field(
#         default=None,
#         min_length=1,
#         max_length=255,
#     )

#     company_logo: Optional[str] = Field(
#         default=None,
#         max_length=500,
#     )

#     stamp_image_path: Optional[str] = Field(
#         default=None,
#         max_length=500,
#     )

#     company_name: Optional[str] = Field(
#         default=None,
#         min_length=1,
#         max_length=255,
#     )

#     registered_office_address: Optional[str] = Field(
#         default=None,
#         min_length=1,
#         max_length=1000,
#     )

#     letter_date: Optional[date] = None

#     position_role: Optional[str] = Field(
#         default=None,
#         max_length=255,
#     )

#     joining_date: Optional[date] = None

#     shift_timing: Optional[str] = Field(
#         default=None,
#         max_length=255,
#     )

#     probation_period_months: Optional[int] = Field(
#         default=None,
#         ge=0,
#         le=120,
#     )

#     hr_signatory_name: Optional[str] = Field(
#         default=None,
#         max_length=255,
#     )

#     hr_designation: Optional[str] = Field(
#         default=None,
#         max_length=255,
#     )

#     reference_contact: Optional[str] = Field(
#         default=None,
#         max_length=255,
#     )

#     letter_body: Optional[str] = Field(
#         default=None,
#         min_length=1,
#     )

#     show_company_logo: Optional[bool] = None

#     show_registered_office_footer: Optional[bool] = None

#     show_acceptance_instruction: Optional[bool] = None

#     show_hr_signature_section: Optional[bool] = None

#     page_size: Optional[str] = Field(
#         default=None,
#         max_length=20,
#     )

#     template_status: Optional[str] = Field(
#         default=None,
#         max_length=30,
#     )

#     @field_validator("page_size")
#     @classmethod
#     def validate_page_size(
#         cls,
#         value: Optional[str],
#     ) -> Optional[str]:
#         if value is None:
#             return None

#         normalized = value.strip().upper()

#         if normalized not in {"A4", "LETTER"}:
#             raise ValueError(
#                 "page_size must be either A4 or LETTER."
#             )

#         return normalized

#     @field_validator("template_status")
#     @classmethod
#     def validate_template_status(
#         cls,
#         value: Optional[str],
#     ) -> Optional[str]:
#         if value is None:
#             return None

#         normalized = value.strip().capitalize()

#         if normalized not in {"Active", "Inactive"}:
#             raise ValueError(
#                 "template_status must be either Active or Inactive."
#             )

#         return normalized


# class LetterOfIntentSettingsResponse(BaseModel):
#     model_config = ConfigDict(
#         from_attributes=True,
#     )

#     id: int
#     setting_key: str

#     letter_title: str
#     company_logo: Optional[str]
#     stamp_image_path: Optional[str]

#     company_name: str
#     registered_office_address: str

#     letter_date: Optional[date]
#     position_role: Optional[str]
#     joining_date: Optional[date]

#     shift_timing: Optional[str]
#     probation_period_months: int

#     hr_signatory_name: Optional[str]
#     hr_designation: Optional[str]
#     reference_contact: Optional[str]

#     letter_body: str

#     show_company_logo: bool
#     show_registered_office_footer: bool
#     show_acceptance_instruction: bool
#     show_hr_signature_section: bool

#     page_size: str
#     template_status: str

#     created_at: datetime
#     updated_at: datetime

#     created_by: Optional[str]
#     updated_by: Optional[str]




from datetime import date, datetime
from typing import Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)


class LetterOfIntentSettingsUpdate(BaseModel):
    letter_title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    company_logo: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    stamp_image_path: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    signature_image_path: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    company_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    registered_office_address: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=1000,
    )

    letter_date: Optional[date] = None

    position_role: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    joining_date: Optional[date] = None

    shift_timing: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    probation_period_months: Optional[int] = Field(
        default=None,
        ge=0,
        le=120,
    )

    hr_signatory_name: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    hr_designation: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    reference_contact: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    letter_body: Optional[str] = Field(
        default=None,
        min_length=1,
    )

    show_company_logo: Optional[bool] = None

    show_registered_office_footer: Optional[bool] = None

    show_acceptance_instruction: Optional[bool] = None

    show_hr_signature_section: Optional[bool] = None

    page_size: Optional[str] = Field(
        default=None,
        max_length=20,
    )

    template_status: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    @field_validator("page_size")
    @classmethod
    def validate_page_size(
        cls,
        value: Optional[str],
    ) -> Optional[str]:
        if value is None:
            return None

        normalized = value.strip().upper()

        if normalized not in {"A4", "LETTER"}:
            raise ValueError(
                "page_size must be either A4 or LETTER."
            )

        return normalized

    @field_validator("template_status")
    @classmethod
    def validate_template_status(
        cls,
        value: Optional[str],
    ) -> Optional[str]:
        if value is None:
            return None

        normalized = value.strip().capitalize()

        if normalized not in {
            "Active",
            "Inactive",
        }:
            raise ValueError(
                "template_status must be either Active or Inactive."
            )

        return normalized


class LetterOfIntentSettingsResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    setting_key: str

    letter_title: str
    company_logo: Optional[str]
    stamp_image_path: Optional[str]
    signature_image_path: Optional[str]

    company_name: str
    registered_office_address: str

    letter_date: Optional[date]
    position_role: Optional[str]
    joining_date: Optional[date]

    shift_timing: Optional[str]
    probation_period_months: int

    hr_signatory_name: Optional[str]
    hr_designation: Optional[str]
    reference_contact: Optional[str]

    letter_body: str

    show_company_logo: bool
    show_registered_office_footer: bool
    show_acceptance_instruction: bool
    show_hr_signature_section: bool

    page_size: str
    template_status: str

    created_at: datetime
    updated_at: datetime

    created_by: Optional[str]
    updated_by: Optional[str]