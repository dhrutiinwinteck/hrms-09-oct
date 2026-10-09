from datetime import date
from enum import Enum
from typing import List, Optional

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    field_validator,
    model_validator,
)


# ============================================================
# ENUMS
# ============================================================

class GenderEnum(str, Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"


# ============================================================
# EMERGENCY CONTACT
# ============================================================

class EmergencyContactCreate(BaseModel):
    full_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    relationship: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    phone_number: str = Field(
        ...,
        min_length=1,
        max_length=50,
    )

    email_address: Optional[EmailStr] = None

    address: str = Field(
        ...,
        min_length=1,
    )

    contact_order: int = Field(
        ...,
        ge=1,
        le=3,
    )


# ============================================================
# WORK EXPERIENCE
# ============================================================

class WorkExperienceCreate(BaseModel):
    company_name: Optional[str] = Field(
        None,
        max_length=255,
    )

    job_title: Optional[str] = Field(
        None,
        max_length=255,
    )

    employee_type: Optional[str] = Field(
        None,
        max_length=100,
    )

    from_date: Optional[date] = None

    to_date: Optional[date] = None

    currently_working_here: bool = False

    key_responsibilities: Optional[str] = None

    experience_order: int = Field(
        ...,
        ge=0,
    )

    is_fresher: bool = False

    @model_validator(mode="after")
    def validate_experience(self):

        # ----------------------------------------------------
        # FRESHER
        # ----------------------------------------------------
        if self.is_fresher:

            if self.experience_order != 0:
                raise ValueError(
                    "A fresher must have experience_order = 0."
                )

            if any(
                value not in (None, "")
                for value in (
                    self.company_name,
                    self.job_title,
                    self.employee_type,
                    self.from_date,
                    self.to_date,
                    self.key_responsibilities,
                )
            ):
                raise ValueError(
                    "A fresher cannot provide work experience details."
                )

            return self

        # ----------------------------------------------------
        # NON-FRESHER
        # ----------------------------------------------------

        if self.experience_order < 1:
            raise ValueError(
                "A non-fresher experience_order must be at least 1."
            )

        required_fields = {
            "company_name": self.company_name,
            "job_title": self.job_title,
            "employee_type": self.employee_type,
            "from_date": self.from_date,
            "key_responsibilities": self.key_responsibilities,
        }

        for field_name, value in required_fields.items():

            if value is None or (
                isinstance(value, str)
                and not value.strip()
            ):
                raise ValueError(
                    f"{field_name} is required for a non-fresher."
                )

        if self.currently_working_here:

            if self.to_date is not None:
                raise ValueError(
                    "to_date must be empty when currently_working_here is true."
                )

        else:

            if self.to_date is None:
                raise ValueError(
                    "to_date is required when currently_working_here is false."
                )

        if (
            self.from_date is not None
            and self.to_date is not None
            and self.to_date < self.from_date
        ):
            raise ValueError(
                "to_date must be after from_date."
            )

        return self


# ============================================================
# EDUCATION
# ============================================================

class EducationCreate(BaseModel):

    qualification: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    specification_stream: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    institute_university: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    passing_year: int = Field(
        ...,
        ge=1900,
        le=2100,
    )

    percentage_cgpa: str = Field(
        ...,
        min_length=1,
        max_length=50,
    )

    currently_pursuing: bool = False

    education_order: int = Field(
        ...,
        ge=1,
    )


# ============================================================
# REFERENCE
# ============================================================

class ReferenceCreate(BaseModel):

    full_name: Optional[str] = Field(
        None,
        max_length=255,
    )

    designation: Optional[str] = Field(
        None,
        max_length=255,
    )

    company_organization: Optional[str] = Field(
        None,
        max_length=255,
    )

    email_address: Optional[EmailStr] = None

    phone_number: Optional[str] = Field(
        None,
        max_length=50,
    )

    relationship: Optional[str] = Field(
        None,
        max_length=100,
    )

    reference_order: int = Field(
        ...,
        ge=1,
    )


# ============================================================
# MAIN APPLICATION
# ============================================================

class JobApplicationSubmit(BaseModel):

    first_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    last_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    email: EmailStr

    phone_number: str = Field(
        ...,
        min_length=1,
        max_length=50,
    )

    alternate_phone_number: Optional[str] = Field(
        None,
        max_length=50,
    )

    position_applied_for: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    date_of_birth: date

    gender: GenderEnum

    marital_status: str = Field(
        ...,
        min_length=1,
        max_length=50,
    )

    nationality: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    aadhar_number: Optional[str] = Field(
        None,
        min_length=12,
        max_length=12,
    )

    pan_number: Optional[str] = Field(
        None,
        min_length=10,
        max_length=10,
    )

    current_address: str = Field(
        ...,
        min_length=1,
    )

    permanent_address: str = Field(
        ...,
        min_length=1,
    )

    emergency_contacts: List[EmergencyContactCreate] = Field(
        ...,
        min_length=1,
        max_length=3,
    )

    education: List[EducationCreate] = Field(
        ...,
        min_length=1,
    )

    work_experiences: List[WorkExperienceCreate] = Field(
        ...,
        min_length=1,
    )

    references: List[ReferenceCreate] = Field(
        default_factory=list,
    )

    @field_validator("aadhar_number")
    @classmethod
    def validate_aadhar(
        cls,
        value: Optional[str],
    ):
        if value is not None:

            if not value.isdigit():
                raise ValueError(
                    "Aadhar number must contain only digits."
                )

            if len(value) != 12:
                raise ValueError(
                    "Aadhar number must be exactly 12 digits."
                )

        return value

    @field_validator("pan_number")
    @classmethod
    def validate_pan(
        cls,
        value: Optional[str],
    ):
        if value is not None:

            import re

            value = value.upper()

            if not re.fullmatch(
                r"[A-Z]{5}[0-9]{4}[A-Z]",
                value,
            ):
                raise ValueError(
                    "Invalid PAN number format."
                )

        return value

    @model_validator(mode="after")
    def validate_work_experience_collection(self):

        fresher_records = [
            record
            for record in self.work_experiences
            if record.is_fresher
        ]

        experienced_records = [
            record
            for record in self.work_experiences
            if not record.is_fresher
        ]

        # ----------------------------------------------------
        # Fresher
        # ----------------------------------------------------
        if fresher_records:

            if experienced_records:
                raise ValueError(
                    "A candidate cannot have both fresher and "
                    "experienced work records."
                )

            if len(fresher_records) != 1:
                raise ValueError(
                    "Only one fresher record is allowed."
                )

        # ----------------------------------------------------
        # Experienced
        # ----------------------------------------------------
        else:

            if not experienced_records:
                raise ValueError(
                    "At least one work experience is required "
                    "for a non-fresher."
                )

        return self


  # ============================================================
# UPDATE JOB APPLICATION JOINING DETAILS change by rohit 
# ============================================================

class JobApplicationUpdate(BaseModel):

    position_applied_for: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    joining_date: Optional[date] = None

    remark: Optional[str] = Field(
        None,
        max_length=500,
    )

    # ============================================================
    # APPROVAL STATUS DETAILS
    # ============================================================

    reporting_manager_status: Optional[str] = Field(
        None,
        max_length=30,
    )

    reporting_manager_remark: Optional[str] = Field(
        None,
        max_length=500,
    )

    team_manager_status: Optional[str] = Field(
        None,
        max_length=30,
    )

    team_manager_remark: Optional[str] = Field(
        None,
        max_length=500,
    )

    hr_status: Optional[str] = Field(
        None,
        max_length=30,
    )

    hr_remark: Optional[str] = Field(
        None,
        max_length=500,
    )



# ============================================================
# RESPONSE DTOs
# ============================================================


class JobApplicationResponseData(BaseModel):
    job_application: dict
    education: List[dict]
    emergency_contacts: List[dict]
    work_experiences: List[dict]
    references: List[dict]


class JobApplicationSubmitResponse(BaseModel):
    success: bool = True
    message: str
    data: JobApplicationResponseData


class JobApplicationListResponse(BaseModel):
    success: bool = True
    message: str
    data: List[JobApplicationResponseData]


class JobApplicationDeleteResponse(BaseModel):
    success: bool = True
    message: str
    application_id: int

# ============================================================
# GET RESPONSE DTOs
# ============================================================

class JobApplicationListResponse(BaseModel):
    success: bool = True
    message: str
    data: List[dict]


class JobApplicationSingleResponse(BaseModel):
    success: bool = True
    message: str
    data: dict


class JobApplicationDeleteResponse(BaseModel):
    success: bool = True
    message: str
    application_id: int