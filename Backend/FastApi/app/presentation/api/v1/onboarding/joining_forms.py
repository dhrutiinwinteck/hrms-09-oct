from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    UploadFile,
)
from sqlalchemy.orm import Session

from app.application.dtos.onboarding.joining_form import (
    JoiningFormListResponse,
    JoiningFormResponse,
    JoiningFormSendRequest,
    JoiningFormSendResponse,
    JoiningFormSubmitResponse,
)

from app.application.services.onboarding.joining_form_service import (
    JoiningFormService,
)

from app.presentation.dependencies.database import (
    get_transactional_db,
)


router = APIRouter()


# ==========================================================
# GET ALL
# ==========================================================


@router.get(
    "/joining-forms",
    response_model=JoiningFormListResponse,
    summary="Get All Joining Forms",
)
async def get_all_joining_forms(
    db: Session = Depends(get_transactional_db),
):
    service = JoiningFormService(db)

    return service.get_all_joining_forms()


# ==========================================================
# GET BY APPLICATION ID
# ==========================================================


@router.get(
    "/joining-forms/{application_id}",
    response_model=JoiningFormResponse,
    summary="Get Joining Form By Application ID",
    description=(
        "Returns the complete joining form. "
        "Common fields are automatically fetched from "
        "the original job application."
    ),
)
async def get_joining_form(
    application_id: int,
    db: Session = Depends(get_transactional_db),
):
    service = JoiningFormService(db)

    return service.get_joining_form(
        application_id
    )


# ==========================================================
# SEND LINK
# ==========================================================

# DO NOT CHANGE THIS API

@router.put(
    "/joining-forms/send",
    response_model=JoiningFormSendResponse,
    summary="Send Joining Form Link",
    description=(
        "Sends the joining-form link to the candidate. "
        "Only application_id is required. "
        "Candidate email is fetched from job_applications."
    ),
)
async def send_joining_form(
    request: JoiningFormSendRequest,
    db: Session = Depends(get_transactional_db),
):
    service = JoiningFormService(db)

    return await service.send_joining_form_link(
        request
    )


# ==========================================================
# SUBMIT COMPLETE JOINING FORM
# ==========================================================


@router.post(
    "/joining-forms/{application_id}",
    response_model=JoiningFormSubmitResponse,
    summary="Submit Complete Joining Form",
    description=(
        "Submits the complete employee joining form. "
        "The application_id identifies the original job "
        "application. Common fields are fetched automatically "
        "from job_applications and should not be trusted from "
        "the submitted form."
    ),
)
async def submit_joining_form(
    application_id: int,

    # ======================================================
    # COMMON APPLICATION FIELDS
    # ======================================================
    # These are intentionally present in Swagger so the
    # frontend contract is visible.
    #
    # Backend DOES NOT use these values.
    # It fetches the real values using application_id.
    # ======================================================

    full_name: Optional[str] = Form(
        None,
        description="Auto-fetched from job application.",
    ),

    email: Optional[str] = Form(
        None,
        description="Auto-fetched from job application.",
    ),

    phone_number: Optional[str] = Form(
        None,
        description="Auto-fetched from job application.",
    ),

    alternate_phone_number: Optional[str] = Form(
        None,
        description="Auto-fetched from job application.",
    ),

    date_of_birth: Optional[str] = Form(
        None,
        description="Auto-fetched from job application.",
    ),

    gender: Optional[str] = Form(
        None,
        description="Auto-fetched from job application.",
    ),

    marital_status: Optional[str] = Form(
        None,
        description="Auto-fetched from job application.",
    ),

    marriage_date: Optional[str] = Form(
    None,
    description="Marriage date.",
    ),

    position_applied_for: Optional[str] = Form(
        None,
        description="Auto-fetched from job application.",
    ),

    nationality: Optional[str] = Form(
        None,
        description="Auto-fetched from job application.",
    ),

    aadhar_number: Optional[str] = Form(
        None,
        description="Auto-fetched from job application.",
    ),

    pan_number: Optional[str] = Form(
        None,
        description="Auto-fetched from job application.",
    ),

    permanent_address: Optional[str] = Form(
        None,
        description="Auto-fetched from job application.",
    ),

    current_address: Optional[str] = Form(
        None,
        description="Auto-fetched from job application.",
    ),

    # ======================================================
    # JOINING FORM SPECIFIC FIELDS
    # ======================================================

    blood_group: str = Form(
        ...,
        description="Candidate blood group.",
    ),

    date_of_joining: str = Form(
        ...,
        description="Date of joining in YYYY-MM-DD format.",
    ),

    father_name: str = Form(
        ...,
        description="Father's name.",
    ),

    mother_name: str = Form(
        ...,
        description="Mother's name.",
    ),

    religion: str = Form(
        ...,
        description="Religion.",
    ),

    uan_number: Optional[str] = Form(
        None,
        description="UAN number.",
    ),

    passport_number: Optional[str] = Form(
        None,
        description="Passport number.",
    ),

    same_as_permanent_address: bool = Form(
        False,
        description=(
            "True when current address is same as permanent address."
        ),
    ),

    # ======================================================
    # WORK EXPERIENCE - RECORD 1
    # ======================================================

    work_experience_1_company_name: Optional[str] = Form(
        None,
        description="Company name.",
    ),

    work_experience_1_designation: Optional[str] = Form(
        None,
        description="Designation.",
    ),

    work_experience_1_from_date: Optional[str] = Form(
        None,
        description="YYYY-MM-DD.",
    ),

    work_experience_1_to_date: Optional[str] = Form(
        None,
        description="YYYY-MM-DD.",
    ),

    work_experience_1_experience_order: Optional[int] = Form(
        None,
        description="1 for first experience.",
    ),
        work_experience_1_company_location: Optional[str] = Form(
        None,
        description="Company location.",
    ),

    work_experience_1_company_country: Optional[str] = Form(
        None,
        description="Company country.",
    ),

    work_experience_1_company_file: Optional[UploadFile] = File(
    None,
    description="Company document.",
    ),

    work_experience_1_project: Optional[str] = Form(
        None,
        description="Project name.",
    ),

    work_experience_1_employment_type: Optional[str] = Form(
        None,
        description="Employment type.",
    ),

    work_experience_1_contract_period: Optional[str] = Form(
        None,
        description="Contract period.",
    ),

    work_experience_1_notice_period: Optional[str] = Form(
        None,
        description="Notice period.",
    ),

    # ======================================================
    # EDUCATION - RECORD 1
    # ======================================================

    education_1_highest_qualification: str = Form(
        ...,
        description="Highest qualification.",
    ),

    education_1_specialization: str = Form(
        ...,
        description="Specialization.",
    ),

    education_1_institute: str = Form(
        ...,
        description="Institute.",
    ),

    education_1_board_university: Optional[str] = Form(
    None,
    description="Board / University.",
    ),

    education_1_passing_year: int = Form(
        ...,
        description="Passing year.",
    ),

    education_1_percentage_cgpa: str = Form(
        ...,
        description="Percentage / CGPA.",
    ),

    education_1_education_order: int = Form(
        ...,
        description="Education order.",
    ),

    # ======================================================
    # EMERGENCY CONTACTS
    # ======================================================

    emergency_contacts_json: Optional[str] = Form(
        None,
        description="Emergency contacts JSON data.",
    ),

    # ======================================================
    # REFERENCE - RECORD 1
    # ======================================================

    reference_1_full_name: Optional[str] = Form(
        None,
        description="Reference full name.",
    ),

    reference_1_designation: Optional[str] = Form(
        None,
        description="Reference designation.",
    ),

    reference_1_company_organization: Optional[str] = Form(
        None,
        description="Reference company / organization.",
    ),

    reference_1_email_address: Optional[str] = Form(
        None,
        description="Reference email.",
    ),

    reference_1_phone_number: Optional[str] = Form(
        None,
        description="Reference phone number.",
    ),

    reference_1_can_contact: bool = Form(
        False,
    description="Whether the reference may be contacted.",
    ),

    reference_1_relationship: Optional[str] = Form(
        None,
        description="Relationship with reference.",
    ),

   


    # This is shown in Swagger for frontend compatibility.
    # It is NOT stored because the DB currently has no
    # reference_order column.
    reference_1_reference_order: Optional[int] = Form(
        None,
        description=(
            "Reference order. Display only; "
            "not stored in the database."
        ),
    ),

    # ======================================================
    # REQUIRED DOCUMENTS
    # ======================================================

    address_proof: UploadFile = File(
        ...,
        description=(
            "Address proof. JPG, JPEG, PNG or PDF. Max 5 MB."
        ),
    ),

    aadhaar_card_front: UploadFile = File(
    ...,
    description="Aadhaar Card Front. JPG, JPEG, PNG or PDF. Max 5 MB.",
    ),

    aadhaar_card_back: UploadFile = File(
        ...,
        description="Aadhaar Card Back. JPG, JPEG, PNG or PDF. Max 5 MB.",
    ),
    passport_photo: UploadFile = File(
        ...,
        description=(
            "Passport size photo. JPG, JPEG, PNG or PDF. Max 5 MB."
        ),
    ),

    signature: UploadFile = File(
        ...,
        description=(
            "Signature. JPG, JPEG, PNG or PDF. Max 5 MB."
        ),
    ),

    educational_certificate: UploadFile = File(
        ...,
        description=(
            "Educational certificate. JPG, JPEG, PNG or PDF. Max 5 MB."
        ),
    ),

    # ======================================================
    # OPTIONAL DOCUMENTS
    # ======================================================

    relieving_letter: Optional[UploadFile] = File(
        None,
        description="Optional relieving letter.",
    ),

    experience_letter: Optional[UploadFile] = File(
        None,
        description="Optional experience letter.",
    ),

    last_3_months_salary: Optional[UploadFile] = File(
        None,
        description="Optional last 3 months salary document.",
    ),

    offer_letter: Optional[UploadFile] = File(
        None,
        description="Optional offer letter.",
    ),

    db: Session = Depends(get_transactional_db),
):
    service = JoiningFormService(db)

    return await service.submit_joining_form(
        application_id=application_id,

        # Joining-specific fields
        blood_group=blood_group,
        date_of_joining=date_of_joining,
        father_name=father_name,
        mother_name=mother_name,
        religion=religion,
        same_as_permanent_address=(
            same_as_permanent_address
        ),
        uan_number=uan_number,
        passport_number=passport_number,
        marriage_date=marriage_date,

        # Work experience
                
        work_experience_1_company_name=(
            work_experience_1_company_name
        ),
        work_experience_1_designation=(
            work_experience_1_designation
        ),
        work_experience_1_from_date=(
            work_experience_1_from_date
        ),
        work_experience_1_to_date=(
            work_experience_1_to_date
        ),
        work_experience_1_experience_order=(
            work_experience_1_experience_order
        ),

        work_experience_1_company_location=(
            work_experience_1_company_location
        ),
        work_experience_1_company_country=(
            work_experience_1_company_country
        ),

        work_experience_1_company_file=(
            work_experience_1_company_file
        ),

        work_experience_1_project=(
            work_experience_1_project
        ),

        work_experience_1_employment_type=(
            work_experience_1_employment_type
        ),

        work_experience_1_contract_period=(
            work_experience_1_contract_period
        ),

        work_experience_1_notice_period=(
            work_experience_1_notice_period
        ),

        # Education
        education_1_highest_qualification=(
            education_1_highest_qualification
        ),
        education_1_specialization=(
            education_1_specialization
        ),
        education_1_institute=(
            education_1_institute
        ),
        education_1_board_university=(
            education_1_board_university
        ),
        education_1_passing_year=(
            education_1_passing_year
        ),
        education_1_percentage_cgpa=(
            education_1_percentage_cgpa
        ),
        education_1_education_order=(
            education_1_education_order
        ),

        emergency_contacts_json=emergency_contacts_json,

        # Reference
        reference_1_full_name=reference_1_full_name,
        reference_1_designation=reference_1_designation,
        reference_1_company_organization=(
            reference_1_company_organization
        ),
        reference_1_email_address=(
            reference_1_email_address
        ),
        reference_1_phone_number=(
            reference_1_phone_number
        ),
        reference_1_relationship=(
            reference_1_relationship
        ),
        reference_1_can_contact=(
            reference_1_can_contact
        ),
        reference_1_reference_order=(
            reference_1_reference_order
        ),

        # Required documents
        address_proof=address_proof,
        aadhaar_card_front=aadhaar_card_front,
        aadhaar_card_back=aadhaar_card_back,
        passport_photo=passport_photo,
        signature=signature,
        educational_certificate=educational_certificate,

        # Optional documents
        relieving_letter=relieving_letter,
        experience_letter=experience_letter,
        last_3_months_salary=last_3_months_salary,
        offer_letter=offer_letter,
    )