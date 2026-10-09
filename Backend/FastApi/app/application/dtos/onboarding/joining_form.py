from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field


# ============================================================
# SEND LINK
# ============================================================


class JoiningFormSendRequest(BaseModel):
    application_id: int = Field(
        ...,
        gt=0,
        description="Existing job application ID.",
    )


class JoiningFormSendResponse(BaseModel):
    success: bool = True
    message: str
    application_id: int
    recipient: EmailStr
    joining_form_link: str


# ============================================================
# WORK EXPERIENCE
# ============================================================


# ============================================================
# WORK EXPERIENCE
# ============================================================

class JoiningWorkExperienceCreate(BaseModel):

    company_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    designation: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    from_date: str = Field(
        ...,
        description="YYYY-MM-DD",
    )

    to_date: str = Field(
        ...,
        description="YYYY-MM-DD",
    )

    experience_order: int = Field(
        ...,
        ge=1,
    )

    company_location: Optional[str] = Field(
        default=None,
        max_length=255,
    )
    # company_address: Optional[str] = Field(
    # default=None,
    # max_length=500,
    # )

    company_country: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    company_file: Optional[str] = Field(
        default=None,
        max_length=1000,
    )

    project: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    employment_type: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    contract_period: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    notice_period: Optional[str] = Field(
        default=None,
        max_length=100,
    )

# ============================================================
# EDUCATION
# ============================================================


class JoiningEducationCreate(BaseModel):
    highest_qualification: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    specialization: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    institute: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    board_university: Optional[str] = Field(
    default=None,
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

    education_order: int = Field(
        ...,
        ge=1,
    )


# ============================================================
# REFERENCE
# ============================================================

class JoiningReferenceCreate(BaseModel):
    full_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    designation: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    company_organization: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    email_address: EmailStr

    phone_number: str = Field(
        ...,
        min_length=1,
        max_length=50,
    )

    relationship: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    can_contact: bool = False

    reference_order: int = Field(
        ...,
        ge=1,
    )



# ============================================================
# COMPLETE RESPONSE DATA
# ============================================================


class JoiningFormResponseData(BaseModel):
    job_application: Dict[str, Any]
    joining_form: Dict[str, Any]
    work_experiences: List[Dict[str, Any]]
    education: List[Dict[str, Any]]
    emergency_contacts: List[Dict[str, Any]]
    documents: List[Dict[str, Any]]
    references: List[Dict[str, Any]]


# ============================================================
# GET BY ID
# ============================================================


class JoiningFormResponse(BaseModel):
    success: bool = True
    message: str
    data: JoiningFormResponseData


# ============================================================
# GET ALL
# ============================================================


class JoiningFormListResponse(BaseModel):
    success: bool = True
    message: str
    data: List[JoiningFormResponseData]


# ============================================================
# POST COMPLETE JOINING FORM
# ============================================================


class JoiningFormSubmitResponse(BaseModel):
    success: bool = True
    message: str
    data: JoiningFormResponseData