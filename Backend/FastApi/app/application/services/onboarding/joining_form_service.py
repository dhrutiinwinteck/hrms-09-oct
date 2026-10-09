import json
import logging
import uuid

from datetime import date, datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.application.dtos.onboarding.joining_form import (
    JoiningEducationCreate,
    JoiningFormResponse,
    JoiningFormSendRequest,
    JoiningFormSendResponse,
    JoiningFormSubmitResponse,
    JoiningReferenceCreate,
    JoiningWorkExperienceCreate,
)

from app.infrastructure.email.email_service import (
    EmailService
)
from app.core.config import settings

from app.infrastructure.repositories.recruitment.job_application_repository import (
    JobApplicationRepository,
)

from app.infrastructure.repositories.onboarding.joining_form_repository import (
    JoiningFormRepository,
)


logger = logging.getLogger(__name__)


class JoiningFormService:

    SEND_SUBJECT = (
        "Complete Your Employee Joining Form - "
        "Inwinteck Private Limited"
    )

    SEND_MESSAGE = """Dear {candidate_name},

Greetings from Inwinteck Private Limited!

Congratulations on progressing to the joining stage.

Please complete your Employee Joining Form using the link below:

{joining_form_link}

You may complete the form using your mobile phone or laptop.

Please ensure that all information and required documents are accurate before submitting the form.

If you have any questions, please contact the HR team.

Best Regards,

HR Team
Inwinteck Private Limited
"""

    def __init__(self, db: Session):
        self.db = db

        self.repository = JoiningFormRepository(db)

        self.job_application_repository = JobApplicationRepository(
            db
        )

        self.email_service = EmailService()

        self.upload_dir = (
            Path(settings.UPLOAD_DIR)
            if hasattr(settings, "UPLOAD_DIR")
            else Path("uploads/joining_documents")
        )

        self.upload_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

    # ==========================================================
    # SEND JOINING FORM LINK
    # ==========================================================

    async def send_joining_form_link(
        self,
        request: JoiningFormSendRequest,
    ) -> JoiningFormSendResponse:

        application = (
            self.job_application_repository
            .get_application_by_id(
                request.application_id
            )
        )

        if application is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job application not found.",
            )

        joining_form_link = (
            f"{settings.FRONTEND_BASE_URL.rstrip('/')}"
            f"/onboarding/joining-form"
            f"?application_id={application.application_id}"
        )

        body = self.SEND_MESSAGE.format(
           candidate_name=" ".join(
                part.strip()
                for part in [
                    getattr(application, "first_name", None),
                    getattr(application, "last_name", None),
                ]
                if part and str(part).strip()
            ).strip() or "Candidate",
            joining_form_link=joining_form_link,
        )

        try:
            await self.email_service.send_email(
                recipient=application.email,
                subject=self.SEND_SUBJECT,
                body=body,
            )

            return JoiningFormSendResponse(
                success=True,
                message="Joining form link sent successfully.",
                application_id=application.application_id,
                recipient=application.email,
                joining_form_link=joining_form_link,
            )

        except Exception as exc:
            logger.exception(
                "Failed to send joining form link."
            )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to send joining form link.",
            ) from exc

    # ==========================================================
    # GET BY APPLICATION ID
    # ==========================================================
    def get_joining_form(
        self,
        application_id: int,
    ) -> JoiningFormResponse:

    # ==========================================================
    # 1. GET EXISTING JOINING FORM
    # ==========================================================

        joining_form = (
            self.repository.get_by_application_id(
                application_id
            )
        )

    # ==========================================================
    # 2. GET ORIGINAL JOB APPLICATION
    # ==========================================================

        application = (
            self.repository.get_job_application(
                application_id
            )
        )

    # ==========================================================
    # 3. APPLICATION NOT FOUND
    # ==========================================================

        if joining_form is None and application is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found.",
            )

    # ==========================================================
    # 4. EXISTING JOINING FORM
    # ==========================================================
    
        if joining_form is not None:

            job_application_data = (
                self._serialize_job_application(
                    application
                )
                if application is not None
                else self._serialize_joining_snapshot(
                    joining_form
                )
            )

            return JoiningFormResponse(
                success=True,
                message="Joining form fetched successfully.",
                data=self._build_response_data(
                    joining_form=joining_form,
                    job_application_data=job_application_data,
                    application=application,
                ),
            )

        # ==========================================================
        # 5. JOINING FORM DOES NOT EXIST YET
        # ==========================================================

        return JoiningFormResponse(
            success=True,
            message="Application data fetched for joining form.",
            data={
                "job_application": (
                    self._serialize_job_application(
                        application
                    )
                ),
                "joining_form": {},
                "work_experiences": (
                    self._serialize_application_work_experiences(
                        application
                    )
                ),
                "education": (
                    self._serialize_application_education(
                        application
                    )
                ),
                "emergency_contacts": (
                    self._serialize_application_emergency_contacts(
                        application
                    )
                ),
                "documents": [],
                "references": (
                    self._serialize_application_references(
                     application
                    )
                ),
            },
    )
    # ==========================================================
    # GET ALL
    # ==========================================================
    def get_all_joining_forms(
        self,
    ) -> Dict[str, Any]:
        joining_forms = self.repository.get_all()

        data: List[Dict[str, Any]] = []
        application_cache: Dict[int, Any] = {}

        for joining_form in joining_forms:
            application_id = joining_form.application_id

            if application_id not in application_cache:
                application_cache[application_id] = (
                    self.job_application_repository
                    .get_application_by_id(
                        application_id
                    )
                )

            application = application_cache[application_id]

            job_application_data = (
                self._serialize_job_application(
                    application
                )
                if application is not None
                else self._serialize_joining_snapshot(
                    joining_form
                )
            )

            data.append(
                self._build_response_data(
                    joining_form=joining_form,
                    job_application_data=job_application_data,
                    application=application,
                )
            )

        return {
            "success": True,
            "message": "Joining forms fetched successfully.",
            "data": data,
        }

    # ==========================================================
    # SUBMIT COMPLETE JOINING FORM
    # ==========================================================

    async def submit_joining_form(
        self,
        application_id: int,
        blood_group: str,
        date_of_joining: str,
        father_name: str,
        mother_name: str,
        religion: str,
        same_as_permanent_address: bool,
        uan_number: Optional[str],
        passport_number: Optional[str],
        marriage_date: Optional[str],

        # Work experience
        work_experience_1_company_name: Optional[str],
        work_experience_1_designation: Optional[str],
        work_experience_1_from_date: Optional[str],
        work_experience_1_to_date: Optional[str],
        work_experience_1_experience_order: Optional[int],
        # Work experience - additional fields
        work_experience_1_company_location: Optional[str],
        work_experience_1_company_country: Optional[str],
        work_experience_1_company_file: Optional[UploadFile],
        work_experience_1_project: Optional[str],
        work_experience_1_employment_type: Optional[str],
        work_experience_1_contract_period: Optional[str],
        work_experience_1_notice_period: Optional[str],

        # Education
        education_1_highest_qualification: str,
        education_1_specialization: str,
        education_1_institute: str,
        education_1_board_university: str,
        education_1_passing_year: int,
        education_1_percentage_cgpa: str,
        education_1_education_order: int,
        # Emergency contacts
        emergency_contacts_json: Optional[str],

        

        # Reference
        reference_1_full_name: Optional[str],
        reference_1_designation: Optional[str],
        reference_1_company_organization: Optional[str],
        reference_1_email_address: Optional[str],
        reference_1_phone_number: Optional[str],
        reference_1_relationship: Optional[str],
        reference_1_can_contact: bool,
        reference_1_reference_order: Optional[int],

        # Required documents
        address_proof: UploadFile,
        aadhaar_card_front: UploadFile,
        aadhaar_card_back: UploadFile,
        passport_photo: UploadFile,
        signature: UploadFile,
        educational_certificate: UploadFile,

        # Optional documents
        relieving_letter: Optional[UploadFile],
        experience_letter: Optional[UploadFile],
        last_3_months_salary: Optional[UploadFile],
        offer_letter: Optional[UploadFile],
    ) -> JoiningFormSubmitResponse:

        # ======================================================
        # 1. GET ORIGINAL JOB APPLICATION
        # ======================================================

        application = (
            self.job_application_repository
            .get_application_by_id(
                application_id
            )
        )

        if application is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job application not found.",
            )

        # ======================================================
        # 2. PARSE JOINING DATE
        # ======================================================

        try:
            parsed_joining_date = date.fromisoformat(
                date_of_joining
            )

        except ValueError as exc:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "date_of_joining must be in "
                    "YYYY-MM-DD format."
                ),
            ) from exc

        # ======================================================
        # 3. BUILD WORK EXPERIENCE
        # ======================================================

        work_experiences: List[
            Dict[str, Any]
        ] = []

        experience_fields = [
            work_experience_1_company_name,
            work_experience_1_designation,
            work_experience_1_from_date,
            work_experience_1_to_date,
            work_experience_1_experience_order,
        ]

        experience_started = any(
            value not in (None, "")
            for value in experience_fields
        )

        if experience_started:

            required_experience_fields = [
                work_experience_1_company_name,
                work_experience_1_designation,
                work_experience_1_from_date,
                work_experience_1_to_date,
                work_experience_1_experience_order,
            ]

            if any(
                value in (None, "")
                for value in required_experience_fields
            ):

                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "All work experience 1 fields "
                        "are required when experience "
                        "is provided."
                    ),
                )

            try:

                parsed_from_date = date.fromisoformat(
                    work_experience_1_from_date
                )

                parsed_to_date = date.fromisoformat(
                    work_experience_1_to_date
                )

            except ValueError as exc:

                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "Work experience dates must be "
                        "in YYYY-MM-DD format."
                    ),
                ) from exc

            if parsed_to_date < parsed_from_date:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "Work experience to_date cannot "
                        "be earlier than from_date."
                    ),
                )
            company_file_path = None

            if work_experience_1_company_file is not None:
                company_file_data = await self._save_document(
                    "company_file",
                    work_experience_1_company_file,
                )

                company_file_path = company_file_data["file_path"]

            work_experience = JoiningWorkExperienceCreate(
                company_name=work_experience_1_company_name,
                designation=work_experience_1_designation,
                from_date=parsed_from_date.isoformat(),
                to_date=parsed_to_date.isoformat(),
                experience_order=work_experience_1_experience_order,
                company_location=work_experience_1_company_location,
                company_country=work_experience_1_company_country,
                company_file=company_file_path,
                project=work_experience_1_project,
                employment_type=work_experience_1_employment_type,
                contract_period=work_experience_1_contract_period,
                notice_period=work_experience_1_notice_period,
            )

            work_experiences.append(
                work_experience.model_dump()
            )

        # ======================================================
        # 4. BUILD EDUCATION
        # ======================================================

        education = JoiningEducationCreate(
            highest_qualification=(
                education_1_highest_qualification
            ),
            specialization=(
                education_1_specialization
            ),
            institute=education_1_institute,
            board_university=(
                education_1_board_university
            ),
            passing_year=(
                education_1_passing_year
            ),
            percentage_cgpa=(
                education_1_percentage_cgpa
            ),
            education_order=(
                education_1_education_order
            ),
        )

        education_records = [
            education.model_dump()
        ]

        # ======================================================
        # 5. BUILD REFERENCE
        # ======================================================

        references: List[
            Dict[str, Any]
        ] = []

        reference_fields = [
            reference_1_full_name,
            reference_1_designation,
            reference_1_company_organization,
            reference_1_email_address,
            reference_1_phone_number,
            reference_1_relationship,
            reference_1_reference_order,
        ]

        reference_started = any(
            value not in (None, "")
            for value in reference_fields
        )

        if reference_started:

            required_reference_fields = [
                reference_1_full_name,
                reference_1_designation,
                reference_1_company_organization,
                reference_1_email_address,
                reference_1_phone_number,
                reference_1_relationship,
            ]

            if any(
                value in (None, "")
                for value in required_reference_fields
            ):

                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "All reference 1 fields are required "
                        "when reference information is provided."
                    ),
                )

            reference = JoiningReferenceCreate(
                full_name=reference_1_full_name,
                designation=reference_1_designation,
                company_organization=(
                    reference_1_company_organization
                ),
                email_address=(
                    reference_1_email_address
                ),
                phone_number=(
                    reference_1_phone_number
                ),
                relationship=(
                    reference_1_relationship
                ),
                can_contact=(
                    reference_1_can_contact
                ),
                reference_order=(
                    reference_1_reference_order or 1
                ),
            )

            references.append(
                reference.model_dump()
            )

        # ======================================================
        # 6. SAVE DOCUMENTS
        # ======================================================

        uploaded_documents: List[
            Dict[str, Any]
            ] = []

        try:

            required_documents = [
            (
                "ADDRESS_PROOF",
                address_proof,
            ),
            (
                "AADHAAR_CARD_FRONT",
                aadhaar_card_front,
            ),
            (
                "AADHAAR_CARD_BACK",
                aadhaar_card_back,
            ),
            (
                "PASSPORT_PHOTO",
                passport_photo,
            ),
            (
                "SIGNATURE",
                signature,
            ),
            (
                "EDUCATIONAL_CERTIFICATE",
                educational_certificate,
            ),
        ]
            for document_type, upload in required_documents:

                uploaded_documents.append(
                    await self._save_document(
                        document_type,
                        upload,
                    )
                )

            optional_documents = [
                (
                    "RELIEVING_LETTER",
                    relieving_letter,
                ),
                (
                    "EXPERIENCE_LETTER",
                    experience_letter,
                ),
                (
                    "LAST_3_MONTHS_SALARY",
                    last_3_months_salary,
                ),
                (
                    "OFFER_LETTER",
                    offer_letter,
                ),
            ]

            for document_type, upload in optional_documents:

                if upload is not None:

                    uploaded_documents.append(
                        await self._save_document(
                            document_type,
                            upload,
                        )
                    )

            # ==================================================
            # 7. APPLICATION SNAPSHOT
            # ==================================================

            application_snapshot = (
                self._build_application_snapshot(
                    application
                )
            )

            # ==================================================
            # 8. JOINING-SPECIFIC DATA
            # ==================================================

            permanent_address = (
                application.permanent_address
            )

            current_address = (
                permanent_address
                if same_as_permanent_address
                else application.current_address
            )

            joining_data = {
                "blood_group": blood_group,

                "date_of_joining": (
                    parsed_joining_date
                ),
                "marriage_date": marriage_date,

                "father_name": father_name,
                "mother_name": mother_name,
                "religion": religion,
                "uan_number": uan_number,
                "passport_number": passport_number,

                "permanent_address": (
                    permanent_address
                ),

                "current_address": (
                    current_address
                ),

                "same_as_permanent_address": (
                    same_as_permanent_address
                ),

                "submitted_at": datetime.utcnow(),
            }
            
            # ======================================================
            # 8.5 BUILD EMERGENCY CONTACTS
            # ======================================================

                        # ======================================================
            # 8.5 BUILD EMERGENCY CONTACTS
            # ======================================================

            emergency_contacts: List[Dict[str, Any]] = []

            if emergency_contacts_json:
                try:
                    parsed_contacts = json.loads(
                        emergency_contacts_json
                    )
                except json.JSONDecodeError as exc:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid emergency contacts JSON.",
                    ) from exc

                if not isinstance(parsed_contacts, list):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Emergency contacts must be a list.",
                    )

                for index, item in enumerate(
                    parsed_contacts,
                    start=1,
                ):
                    if not isinstance(item, dict):
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=(
                                "Each emergency contact must "
                                "be an object."
                            ),
                        )

                    full_name = str(
                        item.get("full_name") or ""
                    ).strip()

                    relationship = str(
                        item.get("relationship") or ""
                    ).strip()

                    phone_number = str(
                        item.get("phone_number") or ""
                    ).strip()

                    if not full_name or not relationship or not phone_number:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=(
                                "Full name, relationship, and "
                                "phone number are required."
                            ),
                        )

                    emergency_contacts.append(
                        {
                            "full_name": full_name,
                            "relationship": relationship,
                            "phone_number": phone_number,
                            "email_address": (
                                item.get("email_address") or None
                            ),
                            "address": item.get("address") or None,
                            "contact_order": (
                                item.get("contact_order") or index
                            ),
                        }
                    )
            # ==================================================
            # 9. SAVE COMPLETE JOINING FORM
            # ==================================================

            joining_form = (
                self.repository.create_or_update(
                    application_data=application_snapshot,
                    joining_data=joining_data,
                    work_experiences=work_experiences,
                    education=education_records,
                    documents=uploaded_documents,
                    references=references,
                    emergency_contacts=emergency_contacts,
                )
            )

            # ==================================================
            # 10. COMMIT
            # ==================================================

            self.db.commit()

            # ==================================================
            # 11. RESPONSE
            # ==================================================

            return JoiningFormSubmitResponse(
                success=True,
                message="Joining form submitted successfully.",
                data=self._build_response_data(
                joining_form=joining_form,
                job_application_data=(
                 self._serialize_job_application(
                application
               )
            ),
            application=application,
            ),
            )

        except HTTPException:

            self.db.rollback()

            self._delete_uploaded_files(
                uploaded_documents
            )

            raise

        except Exception as exc:

            self.db.rollback()

            self._delete_uploaded_files(
                uploaded_documents
            )

            logger.exception(
                "Failed to submit joining form for application_id=%s",
                application_id,
            )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Failed to submit joining form. "
                    f"Reason: {str(exc)}"
                ),
            ) from exc

    # ==========================================================
    # APPLICATION SNAPSHOT
    # ==========================================================

    @staticmethod
    def _build_application_snapshot(
        application,
    ) -> Dict[str, Any]:

        return {
            "application_id": (
                application.application_id
            ),

            "first_name": application.first_name,

            "last_name": application.last_name,

            "full_name": " ".join(
                part.strip()
                for part in [
                    application.first_name,
                    application.last_name,
                ]
                if part and str(part).strip()
            ).strip(),

            "email": application.email,

            "phone_number": (
                application.phone_number
            ),

            "alternate_phone_number": (
                application.alternate_phone_number
            ),

            "date_of_birth": (
                application.date_of_birth
            ),

            "gender": application.gender,

            "marital_status": (
                application.marital_status
            ),

            "position_applied_for": (
                application.position_applied_for
            ),

            "nationality": (
                application.nationality
            ),

            "aadhar_number": (
                application.aadhar_number
            ),

            "pan_number": (
                application.pan_number
            ),
        }

    # ==========================================================
    # GET RESPONSE DATE FORMATTER
    # ==========================================================

    @staticmethod
    def _format_date_ddmmyyyy(
        value: Optional[Any],
    ) -> Optional[str]:
        """
        Convert date/datetime values to DD-MM-YYYY.

        Examples:
            date(2022, 2, 2)
                -> 02-02-2022

            datetime(2026, 9, 7, 10, 30)
                -> 07-09-2026

        None remains None.
        """

        if value is None:
            return None

        if isinstance(value, datetime):
            return value.strftime("%d-%m-%Y")

        if isinstance(value, date):
            return value.strftime("%d-%m-%Y")

        return str(value)

    # ==========================================================
    # SAVE DOCUMENT
    # ==========================================================

    async def _save_document(
        self,
        document_type: str,
        upload: UploadFile,
    ) -> Dict[str, Any]:

        if not upload or not upload.filename:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"{document_type} document is required."
                ),
            )

        allowed_extensions = {
            ".jpg",
            ".jpeg",
            ".png",
            ".pdf",
        }

        extension = (
            Path(upload.filename)
            .suffix
            .lower()
        )

        if extension not in allowed_extensions:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Invalid document type for "
                    f"{document_type}. "
                    "Allowed: JPG, JPEG, PNG, PDF."
                ),
            )

        content = await upload.read()

        if len(content) > 5 * 1024 * 1024:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"{document_type} exceeds "
                    "the 5 MB limit."
                ),
            )

        stored_name = (
            f"{uuid.uuid4().hex}{extension}"
        )

        file_path = (
            self.upload_dir / stored_name
        )

        try:

            with file_path.open("wb") as buffer:
                buffer.write(content)

        except OSError as exc:

            logger.exception(
                "Failed to save document."
            )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    f"Failed to save {document_type}."
                ),
            ) from exc

        return {
            "document_type": document_type,
            "original_file_name": upload.filename,
            "stored_file_name": stored_name,
            "file_path": str(file_path),
        }
            # ==========================================================
    # DELETE UPLOADED FILES AFTER FAILURE
    # ==========================================================

    @staticmethod
    def _delete_uploaded_files(
        documents: List[Dict[str, Any]],
    ) -> None:

        for document in documents or []:

            try:
                file_path = document.get("file_path")

                if not file_path:
                    continue

                path = Path(file_path)

                if path.exists():
                    path.unlink()

            except OSError:
                logger.exception(
                    "Failed to remove uploaded document."
                )


    # ==========================================================
    # BUILD COMPLETE GET RESPONSE
    # ==========================================================

    def _build_response_data(
        self,
        joining_form,
        job_application_data,
        application=None,
    ) -> Dict[str, Any]:

        return {
            "job_application": job_application_data,

            "joining_form": {
                "joining_form_id": (
                    joining_form.joining_form_id
                ),

                "application_id": (
                    joining_form.application_id
                ),

                "full_name": " ".join(
                    filter(
                        None,
                        [
                            joining_form.first_name,
                            joining_form.last_name,
                        ],
                    )
                ),

                "email": joining_form.email,

                "phone_number": (
                    joining_form.phone_number
                ),

                "alternate_phone_number": (
                    joining_form.alternate_phone_number
                ),

                "date_of_birth": (
                    self._format_date_ddmmyyyy(
                        joining_form.date_of_birth
                    )
                ),

                "gender": joining_form.gender,

                "marital_status": (
                    joining_form.marital_status
                ),

                "position_applied_for": (
                    joining_form.position_applied_for
                ),

                "blood_group": (
                    joining_form.blood_group
                ),

                "date_of_joining": (
                    self._format_date_ddmmyyyy(
                        joining_form.date_of_joining
                    )
                ),

                "father_name": (
                    joining_form.father_name
                ),

                "mother_name": (
                    joining_form.mother_name
                ),

                "nationality": (
                    joining_form.nationality
                ),

                "religion": (
                    joining_form.religion
                ),

                "aadhar_number": (
                    joining_form.aadhar_number
                ),

                "pan_number": (
                    joining_form.pan_number
                ),

                "uan_number": (
                    joining_form.uan_number
                ),

                "passport_number": (
                    joining_form.passport_number
                ),

                "permanent_address": (
                    joining_form.permanent_address
                ),

                "current_address": (
                    joining_form.current_address
                ),

                "same_as_permanent_address": (
                    joining_form.same_as_permanent_address
                ),

                "submitted_at": (
                    joining_form.submitted_at
                ),

                "modified_date": (
                    joining_form.modified_date
                ),
            },

            "work_experiences": [
                {
                    "experience_id": (
                        item.experience_id
                    ),

                    "joining_form_id": (
                        item.joining_form_id
                    ),

                    "company_name": (
                        item.company_name
                    ),

                    "designation": (
                        item.designation
                    ),

                    "from_date": (
                        self._format_date_ddmmyyyy(
                            item.from_date
                        )
                    ),

                    "to_date": (
                        self._format_date_ddmmyyyy(
                            item.to_date
                        )
                    ),

                    
                    
                    "experience_order": (
                        item.experience_order
                    ),

                    "company_location": (
                        item.company_location
                    ),

                    "company_country": (
                        item.company_country
                    ),

                    "company_file": (
                        item.company_file
                    ),

                    "project": (
                        item.project
                    ),

                    "employment_type": (
                        item.employment_type
                    ),

                    "contract_period": (
                        item.contract_period
                    ),

                    "notice_period": (
                        item.notice_period
                    ),

                    "created_date": (
                        item.created_date
                    ),
                    
                }
                for item in joining_form.work_experiences
            ],

            "education": [
                {
                    "education_id": (
                        item.education_id
                    ),

                    "joining_form_id": (
                        item.joining_form_id
                    ),

                    "highest_qualification": (
                        item.highest_qualification
                    ),

                    "specialization": (
                        item.specialization
                    ),

                    "institute": item.institute,

                    "board_university": (
                        item.board_university
                    ),

                    "passing_year": (
                        item.passing_year
                    ),

                    "percentage_cgpa": (
                        item.percentage_cgpa
                    ),

                    "education_order": (
                        item.education_order
                    ),

                    "created_date": (
                        item.created_date
                    ),
                }
                for item in joining_form.education
            ],

           "emergency_contacts": (
                self._serialize_joining_emergency_contacts(
                    joining_form
                )
                if joining_form is not None
                else []
            ),

            "documents": [
                {
                    "document_id": (
                        item.document_id
                    ),

                    "joining_form_id": (
                        item.joining_form_id
                    ),

                    "document_type": (
                        item.document_type
                    ),

                    "original_file_name": (
                        item.original_file_name
                    ),

                    "stored_file_name": (
                        item.stored_file_name
                    ),

                    "file_path": (
                        item.file_path
                    ),

                    "created_date": (
                        item.created_date
                    ),
                }
                for item in joining_form.documents
            ],

            "references": [
                {
                    "reference_id": (
                        item.reference_id
                    ),

                    "joining_form_id": (
                        item.joining_form_id
                    ),

                    "full_name": (
                        item.full_name
                    ),

                    "designation": (
                        item.designation
                    ),

                    "company_organization": (
                        item.company_organization
                    ),

                    "email_address": (
                        item.email_address
                    ),

                    "phone_number": (
                        item.phone_number
                    ),

                    "relationship": (
                        item.relationship
                    ),

                    "can_contact": (
                        item.can_contact
                    ),

                    "created_date": (
                        item.created_date
                    ),
                }
                for item in joining_form.references
            ],
        }

    # ==========================================================
    # SERIALIZE JOB APPLICATION
    # ==========================================================

    @staticmethod
    def _serialize_job_application(
        application,
    ) -> Dict[str, Any]:

        if application is None:
            return {}

        return {
            "application_id": (
                application.application_id
            ),

            "first_name": application.first_name,

            "last_name": application.last_name,

            "full_name": " ".join(
                part.strip()
                for part in [
                    application.first_name,
                    application.last_name,
                ]
                if part and str(part).strip()
            ).strip(),

            "email": (
                application.email
            ),

            "phone_number": (
                application.phone_number
            ),

            "alternate_phone_number": (
                application.alternate_phone_number
            ),

            "position_applied_for": (
                application.position_applied_for
            ),

            "date_of_application": (
                JoiningFormService._format_date_ddmmyyyy(
                    application.date_of_application
                )
            ),

            # ==================================================
            # IMPORTANT:
            # This is the joining_date from job_applications.
            # It is NOT employee_joining_forms.date_of_joining.
            # ==================================================

            "joining_date": (
                JoiningFormService._format_date_ddmmyyyy(
                    application.joining_date
                )
            ),

            "resume_original_name": (
                application.resume_original_name
            ),

            "resume_stored_name": (
                application.resume_stored_name
            ),

            "resume_path": (
                application.resume_path
            ),

            "date_of_birth": (
                JoiningFormService._format_date_ddmmyyyy(
                    application.date_of_birth
                )
            ),

            "gender": (
                application.gender
            ),

            "marital_status": (
                application.marital_status
            ),

            "nationality": (
                application.nationality
            ),

            "aadhar_number": (
                application.aadhar_number
            ),

            "pan_number": (
                application.pan_number
            ),

            "current_address": (
                application.current_address
            ),

            "permanent_address": (
                application.permanent_address
            ),
        }

    # ==========================================================
    # FALLBACK SNAPSHOT
    # ==========================================================

    @staticmethod
    def _serialize_joining_snapshot(
        joining_form,
    ) -> Dict[str, Any]:

        return {
            "application_id": (
                joining_form.application_id
            ),

            "full_name": " ".join(
                    filter(
                        None,
                        [
                            joining_form.first_name,
                            joining_form.last_name,
                        ],
                    )
                ),
            "email": (
                joining_form.email
            ),

            "phone_number": (
                joining_form.phone_number
            ),

            "alternate_phone_number": (
                joining_form.alternate_phone_number
            ),

            "position_applied_for": (
                joining_form.position_applied_for
            ),

            "date_of_birth": (
                JoiningFormService._format_date_ddmmyyyy(
                    joining_form.date_of_birth
                )
            ),

            "gender": (
                joining_form.gender
            ),

            "marital_status": (
                joining_form.marital_status
            ),

            "nationality": (
                joining_form.nationality
            ),

            "aadhar_number": (
                joining_form.aadhar_number
            ),

            "pan_number": (
                joining_form.pan_number
            ),

            "current_address": (
                joining_form.current_address
            ),

            "permanent_address": (
                joining_form.permanent_address
            ),
        }

    # ==========================================================
    # DELETE UPLOADED FILES AFTER FAILURE
    # ==========================================================

    @staticmethod
    def _delete_uploaded_files(
        documents: List[Dict[str, Any]],
    ) -> None:

        for document in documents:

            try:

                path = Path(
                    document["file_path"]
                )

                if path.exists():
                    path.unlink()

            except OSError:

                logger.exception(
                    "Failed to remove uploaded document."
                )
    

    @staticmethod
    def _serialize_application_work_experiences(
        application,
    ) -> List[Dict[str, Any]]:

        if application is None:
            return []

        return [
            {
                "experience_id": item.experience_id,
                "application_id": item.application_id,
                "company_name": item.company_name,

                # Job Application uses job_title.
                # Joining Form uses designation.
                "designation": item.job_title,
                "job_title": item.job_title,

                "employee_type": item.employee_type,

                "from_date": (
                    item.from_date.strftime("%d-%m-%Y")
                    if item.from_date is not None
                    else None
                ),

                "to_date": (
                    item.to_date.strftime("%d-%m-%Y")
                    if item.to_date is not None
                    else None
                ),

                "currently_working_here": (
                    item.currently_working_here
                ),

                "key_responsibilities": (
                    item.key_responsibilities
                ),

                "experience_order": (
                    item.experience_order
                ),

                "is_fresher": item.is_fresher,

                "created_date": item.created_date,
            }
            for item in application.work_experiences
        ]

    @staticmethod
    def _serialize_application_education(
        application,
    ) -> List[Dict[str, Any]]:

        if application is None:
            return []

        return [
            {
                "education_id": item.education_id,
                "application_id": item.application_id,

                # Original Job Application field
                "qualification": item.qualification,

                # Joining Form field
                "highest_qualification": (
                    item.qualification
                ),

                # Original Job Application field
                "specification_stream": (
                    item.specification_stream
                ),

                # Joining Form field
                "specialization": (
                    item.specification_stream
                ),

                "institute": (
                    item.institute_university
                ),

                "board_university": None,

                "passing_year": item.passing_year,

                "percentage_cgpa": (
                    item.percentage_cgpa
                ),

                "currently_pursuing": (
                    item.currently_pursuing
                ),

                "education_order": (
                    item.education_order
                ),

                "created_date": item.created_date,
            }
            for item in application.education
        ]
    @staticmethod
    def _serialize_joining_emergency_contacts(
        joining_form,
    ) -> List[Dict[str, Any]]:
        return [
            {
                "emergency_contact_id": (
                    item.emergency_contact_id
                ),
                "joining_form_id": item.joining_form_id,
                "full_name": item.full_name,
                "relationship": item.relationship,
                "phone_number": item.phone_number,
                "email_address": item.email_address,
                "address": item.address,
                "contact_order": item.contact_order,
                "created_date": item.created_date,
            }
            for item in joining_form.emergency_contacts
        ]
    @staticmethod
    def _serialize_application_emergency_contacts(
        application,
    ) -> List[Dict[str, Any]]:

        if application is None:
            return []

        return [
            {
                "emergency_contact_id": (
                    item.emergency_contact_id
                ),

                "application_id": (
                    item.application_id
                ),

                "full_name": item.full_name,

                "relationship": (
                    item.contact_relationship
                ),

                "phone_number": (
                    item.phone_number
                ),

                "email_address": (
                    item.email_address
                ),

                "address": item.address,

                "contact_order": (
                    item.contact_order
                ),

                "created_date": item.created_date,
            }
            for item in application.emergency_contacts
        ]


    @staticmethod
    def _serialize_application_references(
        application,
    ) -> List[Dict[str, Any]]:

        if application is None:
            return []

        return [
            {
                "reference_id": item.reference_id,

                "application_id": (
                    item.application_id
                ),

                "full_name": item.full_name,

                "designation": item.designation,

                "company_organization": (
                    item.company_organization
                ),

                "email_address": (
                    item.email_address
                ),

                "phone_number": (
                    item.phone_number
                ),

                "relationship": (
                    item.relationship
                ),

                # can_contact exists only in Joining Form.
                # Original Job Application has no such field.
                "can_contact": False,

                "reference_order": (
                    item.reference_order
                ),

                "created_date": item.created_date,
            }
            for item in application.references
        ]