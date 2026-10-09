from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class EmployeeExperienceInfoBase(BaseModel):
    emp_id: int = Field(
        ...,
        gt=0,
        description="Existing employee ID.",
    )

    company_name: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    company_address: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    exp_year_from: Optional[datetime] = None

    exp_year_to: Optional[datetime] = None

    designation: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    company_file: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    @field_validator(
        "company_name",
        "company_address",
        "designation",
        "company_file",
        mode="before",
    )
    @classmethod
    def normalize_strings(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None

        if not isinstance(value, str):
            return value

        value = value.strip()

        return value if value else None

    @field_validator("exp_year_to")
    @classmethod
    def validate_experience_dates(
        cls,
        value: Optional[datetime],
        info,
    ) -> Optional[datetime]:
        exp_year_from = info.data.get("exp_year_from")

        if (
            value is not None
            and exp_year_from is not None
            and value < exp_year_from
        ):
            raise ValueError(
                "Experience end date cannot be earlier than start date."
            )

        return value


class EmployeeExperienceInfoCreate(
    EmployeeExperienceInfoBase
):
    createdby: Optional[str] = Field(
        default=None,
        max_length=255,
    )


class EmployeeExperienceInfoUpdate(BaseModel):
    company_name: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    company_address: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    exp_year_from: Optional[datetime] = None

    exp_year_to: Optional[datetime] = None

    designation: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    company_file: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    modifiedby: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    @field_validator(
        "company_name",
        "company_address",
        "designation",
        "company_file",
        "modifiedby",
        mode="before",
    )
    @classmethod
    def normalize_strings(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None

        if not isinstance(value, str):
            return value

        value = value.strip()

        return value if value else None

    @field_validator("exp_year_to")
    @classmethod
    def validate_experience_dates(
        cls,
        value: Optional[datetime],
        info,
    ) -> Optional[datetime]:
        exp_year_from = info.data.get("exp_year_from")

        if (
            value is not None
            and exp_year_from is not None
            and value < exp_year_from
        ):
            raise ValueError(
                "Experience end date cannot be earlier than start date."
            )

        return value


class EmployeeExperienceInfoResponse(
    EmployeeExperienceInfoBase
):
    id: int
    createdby: Optional[str] = None
    createdon: Optional[datetime] = None
    modifiedby: Optional[str] = None
    modifiedon: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True,
    )


class EmployeeExperienceInfoListResponse(BaseModel):
    success: bool = True
    message: str
    data: list[EmployeeExperienceInfoResponse]