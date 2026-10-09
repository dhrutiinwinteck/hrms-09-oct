from datetime import date
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from app.core.security import get_current_username
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.application.dtos.recruitment.job_application import (
    EducationCreate,
    EmergencyContactCreate,
    JobApplicationDeleteResponse,
    JobApplicationListResponse,
    JobApplicationSubmit,
    JobApplicationSubmitResponse,
    JobApplicationUpdate,
    ReferenceCreate,
    WorkExperienceCreate,
)

from app.application.services.recruitment.job_application_service import (
    JobApplicationService,
)

from app.presentation.dependencies.database import (
    get_transactional_db,
)


router = APIRouter()


# ==============================================================
# COMPLETE JOB APPLICATION
# ==============================================================


@router.post(
    "/job-applications",
    response_model=JobApplicationSubmitResponse,
    summary="Submit Complete Job Application",
    description=(
        "Creates the complete candidate application in one request. "
        "Basic information, personal details, resume, emergency "
        "contact, education, work experience and references are "
        "saved together."
    ),
)
async def submit_job_application(
    # ==========================================================
    # BASIC INFORMATION
    # ==========================================================

    full_name: str = Form(
        ...,
        description="Candidate full name.",
    ),

    email: str = Form(
        ...,
        description="Candidate email address.",
    ),

    phone_number: str = Form(
        ...,
        description="Candidate primary phone number.",
    ),

    alternate_phone_number: Optional[str] = Form(
        None,
        description="Candidate alternate phone number.",
    ),

    position_applied_for: str = Form(
    ...,
    description="Position applied for.",
),

# ==========================================================
# REFERRAL
# OPTIONAL
# ==========================================================

referral_token: Optional[str] = Form(
    None,
    alias="referralToken",
    description="Optional employee referral token.",
),

# ==========================================================
# PERSONAL DETAILS
# ==========================================================

date_of_birth: str = Form(
    ...,
    description="Date of birth in YYYY-MM-DD format.",
),

    gender: str = Form(
        ...,
        description="Gender: Male, Female, or Other.",
    ),

    marital_status: str = Form(
        ...,
        description="Marital status.",
    ),

    nationality: str = Form(
        ...,
        description="Nationality.",
    ),

    aadhar_number: Optional[str] = Form(
        None,
        description="12 digit Aadhar number.",
    ),

    pan_number: Optional[str] = Form(
        None,
        description="10 character PAN number.",
    ),

    current_address: str = Form(
        ...,
        description="Current residential address.",
    ),

    permanent_address: str = Form(
        ...,
        description="Permanent residential address.",
    ),

    # ==========================================================
    # RESUME
    # ==========================================================

    resume: UploadFile = File(
        ...,
        description="Resume file. PDF, DOC or DOCX.",
    ),

    # ==========================================================
    # EMERGENCY CONTACT 1
    # REQUIRED
    # ==========================================================

    emergency_contact_1_full_name: str = Form(
        ...,
        description="Emergency contact 1 full name.",
    ),

    emergency_contact_1_relationship: str = Form(
        ...,
        description="Emergency contact 1 relationship.",
    ),

    emergency_contact_1_phone_number: str = Form(
        ...,
        description="Emergency contact 1 phone number.",
    ),

    emergency_contact_1_email_address: Optional[str] = Form(
        None,
        description="Emergency contact 1 email.",
    ),

    emergency_contact_1_address: str = Form(
        ...,
        description="Emergency contact 1 address.",
    ),

    # ==========================================================
    # EMERGENCY CONTACT 2
    # OPTIONAL
    # ==========================================================

    emergency_contact_2_full_name: Optional[str] = Form(
        None,
        description="Emergency contact 2 full name.",
    ),

    emergency_contact_2_relationship: Optional[str] = Form(
        None,
        description="Emergency contact 2 relationship.",
    ),

    emergency_contact_2_phone_number: Optional[str] = Form(
        None,
        description="Emergency contact 2 phone number.",
    ),

    emergency_contact_2_email_address: Optional[str] = Form(
        None,
        description="Emergency contact 2 email.",
    ),

    emergency_contact_2_address: Optional[str] = Form(
        None,
        description="Emergency contact 2 address.",
    ),

    # ==========================================================
    # EMERGENCY CONTACT 3
    # OPTIONAL
    # ==========================================================

    emergency_contact_3_full_name: Optional[str] = Form(
        None,
        description="Emergency contact 3 full name.",
    ),

    emergency_contact_3_relationship: Optional[str] = Form(
        None,
        description="Emergency contact 3 relationship.",
    ),

    emergency_contact_3_phone_number: Optional[str] = Form(
        None,
        description="Emergency contact 3 phone number.",
    ),

    emergency_contact_3_email_address: Optional[str] = Form(
        None,
        description="Emergency contact 3 email.",
    ),

    emergency_contact_3_address: Optional[str] = Form(
        None,
        description="Emergency contact 3 address.",
    ),

    # ==========================================================
    # WORK EXPERIENCE
    #
    # FRESHER:
    #     is_fresher = true
    #     experience_order = 0
    #     other experience fields remain empty
    #
    # EXPERIENCED:
    #     is_fresher = false
    #     experience_order >= 1
    #     work experience details are required
    # ==========================================================

    is_fresher: bool = Form(
        ...,
        description=(
            "True if candidate is a fresher. "
            "False if candidate has work experience."
        ),
    ),

    experience_company_name: Optional[str] = Form(
        None,
        description="Company name.",
    ),

    experience_job_title: Optional[str] = Form(
        None,
        description="Job title.",
    ),

    experience_employee_type: Optional[str] = Form(
        None,
        description="Employee type.",
    ),

    experience_from_date: Optional[str] = Form(
        None,
        description="Experience start date in YYYY-MM-DD format.",
    ),

    experience_to_date: Optional[str] = Form(
        None,
        description="Experience end date in YYYY-MM-DD format.",
    ),

    experience_currently_working_here: bool = Form(
        False,
        description="True if currently working there.",
    ),

    experience_key_responsibilities: Optional[str] = Form(
        None,
        description="Key responsibilities.",
    ),

    experience_order: int = Form(
        ...,
        description=(
            "0 for fresher, 1 or more for actual experience."
        ),
    ),

    # ==========================================================
    # EDUCATION
    # ==========================================================

    education_qualification: str = Form(
        ...,
        description="Qualification.",
    ),

    education_specification_stream: str = Form(
        ...,
        description="Specification / stream.",
    ),

    education_institute_university: str = Form(
        ...,
        description="Institute / university.",
    ),

    education_passing_year: int = Form(
        ...,
        description="Passing year.",
    ),

    education_percentage_cgpa: str = Form(
        ...,
        description="Percentage or CGPA.",
    ),

    education_currently_pursuing: bool = Form(
        False,
        description="True if currently pursuing.",
    ),

    education_order: int = Form(
        ...,
        description="Education order.",
    ),

    # ==========================================================
    # REFERENCE
    # OPTIONAL
    # ==========================================================

    reference_full_name: Optional[str] = Form(
        None,
        description="Reference full name.",
    ),

    reference_designation: Optional[str] = Form(
        None,
        description="Reference designation.",
    ),

    reference_company_organization: Optional[str] = Form(
        None,
        description="Reference company / organization.",
    ),

    reference_email_address: Optional[str] = Form(
        None,
        description="Reference email.",
    ),

    reference_phone_number: Optional[str] = Form(
        None,
        description="Reference phone number.",
    ),

    reference_relationship: Optional[str] = Form(
        None,
        description="Relationship with reference.",
    ),

    reference_order: Optional[int] = Form(
        None,
        description="Reference order.",
    ),

    # ==========================================================
    # DATABASE
    # ==========================================================

    db: Session = Depends(get_transactional_db),
):
    try:
        # ======================================================
        # 1. PARSE DATE OF BIRTH
        # ======================================================

        try:
            parsed_date_of_birth = date.fromisoformat(
                date_of_birth
            )
        except ValueError as exc:
            raise HTTPException(
                status_code=400,
                detail=(
                    "date_of_birth must be in "
                    "YYYY-MM-DD format."
                ),
            ) from exc

        # ======================================================
        # 2. BUILD EMERGENCY CONTACTS
        # ======================================================

        emergency_contacts = []

        # ------------------------------------------------------
        # Contact 1 - Required
        # ------------------------------------------------------

        emergency_contacts.append(
            EmergencyContactCreate(
                full_name=emergency_contact_1_full_name,
                relationship=(
                    emergency_contact_1_relationship
                ),
                phone_number=(
                    emergency_contact_1_phone_number
                ),
                email_address=(
                    emergency_contact_1_email_address
                ),
                address=emergency_contact_1_address,
                contact_order=1,
            )
        )

        # ------------------------------------------------------
        # Contact 2 - Optional
        # ------------------------------------------------------

        contact_2_values = (
            emergency_contact_2_full_name,
            emergency_contact_2_relationship,
            emergency_contact_2_phone_number,
            emergency_contact_2_email_address,
            emergency_contact_2_address,
        )

        if any(
            value not in (None, "")
            for value in contact_2_values
        ):
            required_contact_2_values = (
                emergency_contact_2_full_name,
                emergency_contact_2_relationship,
                emergency_contact_2_phone_number,
                emergency_contact_2_address,
            )

            if not all(
                value not in (None, "")
                for value in required_contact_2_values
            ):
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Please provide all required fields "
                        "for emergency contact 2."
                    ),
                )

            emergency_contacts.append(
                EmergencyContactCreate(
                    full_name=(
                        emergency_contact_2_full_name
                    ),
                    relationship=(
                        emergency_contact_2_relationship
                    ),
                    phone_number=(
                        emergency_contact_2_phone_number
                    ),
                    email_address=(
                        emergency_contact_2_email_address
                    ),
                    address=(
                        emergency_contact_2_address
                    ),
                    contact_order=2,
                )
            )

        # ------------------------------------------------------
        # Contact 3 - Optional
        # ------------------------------------------------------

        contact_3_values = (
            emergency_contact_3_full_name,
            emergency_contact_3_relationship,
            emergency_contact_3_phone_number,
            emergency_contact_3_email_address,
            emergency_contact_3_address,
        )

        if any(
            value not in (None, "")
            for value in contact_3_values
        ):
            required_contact_3_values = (
                emergency_contact_3_full_name,
                emergency_contact_3_relationship,
                emergency_contact_3_phone_number,
                emergency_contact_3_address,
            )

            if not all(
                value not in (None, "")
                for value in required_contact_3_values
            ):
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Please provide all required fields "
                        "for emergency contact 3."
                    ),
                )

            emergency_contacts.append(
                EmergencyContactCreate(
                    full_name=(
                        emergency_contact_3_full_name
                    ),
                    relationship=(
                        emergency_contact_3_relationship
                    ),
                    phone_number=(
                        emergency_contact_3_phone_number
                    ),
                    email_address=(
                        emergency_contact_3_email_address
                    ),
                    address=(
                        emergency_contact_3_address
                    ),
                    contact_order=3,
                )
            )

        # ======================================================
        # 3. BUILD WORK EXPERIENCE
        # ======================================================

        try:
            parsed_from_date = (
                date.fromisoformat(
                    experience_from_date
                )
                if experience_from_date
                else None
            )

            parsed_to_date = (
                date.fromisoformat(
                    experience_to_date
                )
                if experience_to_date
                else None
            )

        except ValueError as exc:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Experience dates must be in "
                    "YYYY-MM-DD format."
                ),
            ) from exc

        work_experiences = [
            WorkExperienceCreate(
                company_name=experience_company_name,
                job_title=experience_job_title,
                employee_type=experience_employee_type,
                from_date=parsed_from_date,
                to_date=parsed_to_date,
                currently_working_here=(
                    experience_currently_working_here
                ),
                key_responsibilities=(
                    experience_key_responsibilities
                ),
                experience_order=experience_order,
                is_fresher=is_fresher,
            )
        ]

        # ======================================================
        # 4. BUILD EDUCATION
        # ======================================================

        education = [
            EducationCreate(
                qualification=education_qualification,
                specification_stream=(
                    education_specification_stream
                ),
                institute_university=(
                    education_institute_university
                ),
                passing_year=education_passing_year,
                percentage_cgpa=(
                    education_percentage_cgpa
                ),
                currently_pursuing=(
                    education_currently_pursuing
                ),
                education_order=education_order,
            )
        ]

        # ======================================================
        # 5. BUILD REFERENCES
        # ======================================================

        references = []

        reference_values = (
            reference_full_name,
            reference_designation,
            reference_company_organization,
            reference_email_address,
            reference_phone_number,
            reference_relationship,
            reference_order,
        )

        if any(
            value not in (None, "")
            for value in reference_values
        ):
            if reference_order is None:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "reference_order is required when "
                        "reference details are provided."
                    ),
                )

            references.append(
                ReferenceCreate(
                    full_name=reference_full_name,
                    designation=reference_designation,
                    company_organization=(
                        reference_company_organization
                    ),
                    email_address=(
                        reference_email_address
                    ),
                    phone_number=(
                        reference_phone_number
                    ),
                    relationship=(
                        reference_relationship
                    ),
                    reference_order=reference_order,
                )
            )

        # ======================================================
        # 6. BUILD COMPLETE DTO
        # ======================================================

        application_data = JobApplicationSubmit(
            full_name=full_name,
            email=email,
            phone_number=phone_number,
            alternate_phone_number=(
                alternate_phone_number
            ),
            position_applied_for=(
                position_applied_for
            ),
            date_of_birth=parsed_date_of_birth,
            gender=gender,
            marital_status=marital_status,
            nationality=nationality,
            aadhar_number=aadhar_number,
            pan_number=pan_number,
            current_address=current_address,
            permanent_address=permanent_address,
            emergency_contacts=emergency_contacts,
            education=education,
            work_experiences=work_experiences,
            references=references,
        )

        # ======================================================
        # 7. SAVE COMPLETE APPLICATION
        # ======================================================

        service = JobApplicationService(db)

        return service.submit_application(
        form_data=application_data,
        resume_file=resume,
        referral_token=referral_token
        )

    except HTTPException:
        raise

    except ValidationError as exc:
        raise HTTPException(
            status_code=400,
            detail=exc.errors(),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "An error occurred while submitting "
                "the application."
            ),
        ) from exc


# ==============================================================
# GET ALL JOB APPLICATIONS
# ==============================================================


@router.get(
    "/job-applications",
    response_model=JobApplicationListResponse,
    summary="Get All Job Applications",
    description=(
        "Returns all job applications together with "
        "education, emergency contacts, work experiences "
        "and references."
    ),
)
async def get_all_job_applications(
    employee_code: str = Depends(get_current_username),
    db: Session = Depends(get_transactional_db),
):
    service = JobApplicationService(db)

    return service.get_all_applications(
        employee_code=employee_code
    )


# ==============================================================
# GET JOB APPLICATION BY ID
# ==============================================================


@router.get(
    "/job-applications/{application_id}",
    response_model=JobApplicationSubmitResponse,
    summary="Get Job Application By ID",
    description=(
        "Returns one complete job application together "
        "with all related records."
    ),
)
async def get_job_application_by_id(
    application_id: int,
    db: Session = Depends(get_transactional_db),
):
    service = JobApplicationService(db)

    return service.get_application_by_id(
        application_id
    )


# ==============================================================
# UPDATE JOB APPLICATION JOINING DETAILS change by Rohit 
# ==============================================================


@router.put(
    "/job-applications/{application_id}",
)
async def update_job_application(
    application_id: int,
    payload: JobApplicationUpdate,
    db: Session = Depends(get_transactional_db),
):
    service = JobApplicationService(db)

    return service.update_application_details(
    application_id=application_id,
    position_applied_for=payload.position_applied_for,
    joining_date=payload.joining_date,
    remark=payload.remark,

    reporting_manager_status=payload.reporting_manager_status,
    reporting_manager_remark=payload.reporting_manager_remark,

    team_manager_status=payload.team_manager_status,
    team_manager_remark=payload.team_manager_remark,

    hr_status=payload.hr_status,
    hr_remark=payload.hr_remark,
)

# ==============================================================
# UPDATE JOB APPLICATION JOINING DETAILS  End 
# ==============================================================
# ==============================================================
# DELETE JOB APPLICATION
# ==============================================================


@router.delete(
    "/job-applications/{application_id}",
    response_model=JobApplicationDeleteResponse,
    summary="Delete Job Application",
    description=(
        "Deletes the complete job application and its "
        "related records."
    ),
)
async def delete_job_application(
    application_id: int,
    db: Session = Depends(get_transactional_db),
):
    service = JobApplicationService(db)

    return service.delete_application(
        application_id
    )