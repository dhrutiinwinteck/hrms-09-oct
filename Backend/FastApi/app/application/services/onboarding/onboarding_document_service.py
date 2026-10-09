from __future__ import annotations

import logging
import mimetypes
import shutil
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.application.dtos.onboarding.document_package import (
    DocumentPackageCreateRequest,
)

from app.application.dtos.onboarding.document_package_response import (
    DocumentPackageResponse,
)

from app.infrastructure.email.email_service import EmailAttachment

from app.infrastructure.models.onboarding.onboarding_document_item import (
    OnboardingDocumentItem,
)

from app.infrastructure.repositories.onboarding.onboarding_document_repository import (
    OnboardingDocumentRepository,
)

from app.infrastructure.repositories.recruitment.job_application_repository import (
    JobApplicationRepository,
)

from app.infrastructure.email.document_email_service import (
    DocumentEmailService,
)

from app.infrastructure.documents.offer_letter_pdf_service import (
    OfferLetterPdfService,
)

from app.infrastructure.documents.appointment_letter_pdf_service import (
    AppointmentLetterPdfService,
)

from app.core.config import settings


logger = logging.getLogger(__name__)


class OnboardingDocumentService:

    # ==========================================================
    # CONFIGURATION
    # ==========================================================

    # Keep the raw attachment size below Gmail's effective
    # message-size limit because MIME/base64 encoding increases
    # the final email size.
    MAX_EMAIL_ATTACHMENT_BYTES = 18 * 1024 * 1024

    # ==========================================================
    # STATIC MASTER DOCUMENTS
    # ==========================================================

    # IMPORTANT:
    # Offer Letter is intentionally NOT present here.
    #
    # Offer Letter is generated dynamically by
    # OfferLetterPdfService and saved as:
    #
    # uploads/onboarding/{application_id}/Offer Letter.pdf
    #
    

    MASTER_DOCUMENTS = (
    {
        "document_type": "HR_POLICY",
        "source": (
            "policies",
            "HUMAN RESOURCES POLICY.docx",
        ),
    },
    {
        "document_type": "LEAVE_POLICY",
        "source": (
            "policies",
            "LEAVE POLICY.docx",
        ),
    },
    {
        "document_type": "COMPANY_INTRODUCTION",
        "source": (
            "company",
            "Inwinteck - Company Presentation.pdf",
        ),
    },
)

    # These are the ONLY document types this package should contain.
    ALLOWED_DOCUMENT_TYPES = {
        "OFFER_LETTER",
        "APPOINTMENT_LETTER",
        "HR_POLICY",
        "LEAVE_POLICY",
        "COMPANY_INTRODUCTION",
    }

    # ==========================================================
    # INIT
    # ==========================================================

    def __init__(self, db: Session) -> None:
        self.db = db

        self.repository = OnboardingDocumentRepository(db)

        self.job_application_repository = (
            JobApplicationRepository(db)
        )

        self.document_email_service = DocumentEmailService()

        self.offer_letter_pdf_service = OfferLetterPdfService(db)

        self.appointment_letter_pdf_service = AppointmentLetterPdfService()

        self.master_documents_dir = (
            Path(settings.BASE_DIR)
            / "templates"
            / "documents"
        )

        self.onboarding_documents_dir = (
            Path(settings.BASE_DIR)
            / "uploads"
            / "onboarding"
        )

    # ==========================================================
    # GET BY APPLICATION ID
    # ==========================================================

    def get_by_application_id(
        self,
        job_application_id: int,
    ) -> DocumentPackageResponse:

        package = self.repository.get_by_application_id(
            job_application_id
        )

        if package is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "Onboarding document package was not "
                    "found for this candidate."
                ),
            )

        # ------------------------------------------------------
        # Always expose the dynamic Offer Letter
        # ------------------------------------------------------

        dynamic_offer_path = (
            self.onboarding_documents_dir
            / str(job_application_id)
            / "Offer Letter.pdf"
        )

        if dynamic_offer_path.exists():

            offer_items = [
                item
                for item in package.items
                if item.document_type == "OFFER_LETTER"
            ]

            if offer_items:
                # Keep only the first logical Offer Letter item.
                offer_item = offer_items[0]

                offer_item.file_name = "Offer Letter.pdf"

                offer_item.file_path = (
                    f"uploads/onboarding/"
                    f"{job_application_id}/"
                    f"Offer Letter.pdf"
                )

                offer_item.status = "READY"

                # Remove duplicate Offer Letter rows from
                # the in-memory relationship.
                for duplicate in offer_items[1:]:
                    self.db.delete(duplicate)

                self.db.flush()

        return DocumentPackageResponse.model_validate(
            package
        )

    # ==========================================================
    # GET BY PACKAGE ID
    # ==========================================================

    def get_by_id(
        self,
        package_id: int,
    ) -> DocumentPackageResponse:

        package = self.repository.get_by_id(package_id)

        if package is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "Onboarding document package was not found."
                ),
            )

        return DocumentPackageResponse.model_validate(
            package
        )

    # ==========================================================
    # CREATE / UPDATE + SEND EMAIL
    # ==========================================================

    async def create_or_update(
        self,
        data: DocumentPackageCreateRequest,
        user_id: Optional[int],
    ) -> DocumentPackageResponse:

        # ======================================================
        # 1. FIND JOB APPLICATION
        # ======================================================

        application = (
            self.job_application_repository
            .get_application_by_id(
                data.job_application_id
            )
        )

        if application is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job application not found.",
            )

        # ======================================================
        # 2. VALIDATE CANDIDATE EMAIL
        # ======================================================

        candidate_email = (
            getattr(application, "email", None)
            or ""
        ).strip()

        if not candidate_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Candidate email is not available "
                    "for this job application."
                ),
            )

        # ======================================================
        # 3. CANDIDATE NAME
        # ======================================================

        candidate_name = (
            getattr(application, "full_name", None)
            or ""
        ).strip()

        if not candidate_name:

            first_name = (
                getattr(application, "first_name", None)
                or ""
            ).strip()

            last_name = (
                getattr(application, "last_name", None)
                or ""
            ).strip()

            candidate_name = (
                f"{first_name} {last_name}"
            ).strip()

        candidate_name = candidate_name or "Candidate"

        # ======================================================
        # 4. CREATE OR UPDATE PACKAGE
        # ======================================================

        package = self.repository.get_by_application_id(
            data.job_application_id
        )

        if package is None:

            package = self.repository.create(
                data=data,
                user_id=user_id,
            )

        else:

            package = self.repository.update(
                package=package,
                data=data,
                user_id=user_id,
            )

        # ======================================================
        # 5. PACKAGE STATE
        # ======================================================

        package.status = "DRAFT"
        package.email_status = "PENDING"
        package.email_error = None
        package.sent_at = None

        self.db.flush()

        # ======================================================
        # 6. CLEAN DUPLICATE / LEGACY DOCUMENT ITEMS
        # ======================================================
        #
        # We DO NOT blindly delete every document item.
        #
        # Instead:
        # - keep one item for each document_type
        # - remove duplicate rows
        # - remove obsolete document types
        #
        # This is what prevents multiple OFFER_LETTER rows.
        # ======================================================

        existing_by_type: dict[
            str,
            OnboardingDocumentItem,
        ] = {}

        for item in list(package.items):

            document_type = item.document_type

            # Remove unknown / obsolete document types.
            if document_type not in self.ALLOWED_DOCUMENT_TYPES:
                self.db.delete(item)
                continue

            # Keep the first item of each type.
            if document_type not in existing_by_type:

                existing_by_type[document_type] = item

            else:

                # Duplicate row.
                self.db.delete(item)

        self.db.flush()

        # ======================================================
        # 7. CANDIDATE FOLDER
        # ======================================================

        candidate_folder = (
            self.onboarding_documents_dir
            / str(data.job_application_id)
        )

        candidate_folder.mkdir(
            parents=True,
            exist_ok=True,
        )

        # Old static Offer Letter from the previous implementation
        # must never be used again.
        old_offer_letter = (
            candidate_folder
            / "Offer Letter Draft (1).pdf"
        )

        if old_offer_letter.exists():
            try:
                old_offer_letter.unlink()
            except OSError:
                logger.warning(
                    "Could not remove old Offer Letter file: %s",
                    old_offer_letter,
                )

        # ======================================================
        # 8. PREPARE DOCUMENTS
        # ======================================================

        attachments: list[EmailAttachment] = []

        created_items: list[OnboardingDocumentItem] = []

        try:

            # ==================================================
            # 8A. DYNAMIC OFFER LETTER
            # ==================================================

            offer_letter_path = (
                candidate_folder
                / "Offer Letter.pdf"
            )

            # IMPORTANT:
            #
            # This uses ONE fixed physical file.
            #
            # When the Offer Letter data changes, the PDF is
            # regenerated into the SAME file.
            #
            # It does NOT create:
            #
            # Offer Letter (1).pdf
            # Offer Letter (2).pdf
            # etc.
            #
            self.offer_letter_pdf_service.generate(
                package=package,
                application=application,
                destination_path=offer_letter_path,
                candidate_name=candidate_name,
            )

            offer_letter_content = (
                offer_letter_path.read_bytes()
            )

            attachments.append(
                EmailAttachment(
                    filename=offer_letter_path.name,
                    content_type="application/pdf",
                    content=offer_letter_content,
                )
            )

            # --------------------------------------------------
            # Reuse existing OFFER_LETTER DB row if available.
            # Otherwise create exactly ONE.
            # --------------------------------------------------

            offer_letter_item = existing_by_type.get(
                "OFFER_LETTER"
            )

            if offer_letter_item is None:

                offer_letter_item = OnboardingDocumentItem(
                    document_type="OFFER_LETTER",
                    file_name="Offer Letter.pdf",
                    file_path=(
                        f"uploads/onboarding/"
                        f"{data.job_application_id}/"
                        f"Offer Letter.pdf"
                    ),
                    status="READY",
                    generated_at=datetime.utcnow(),
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )

                package.items.append(
                    offer_letter_item
                )

                created_items.append(
                    offer_letter_item
                )

            else:

                # Reuse the SAME database row.
                offer_letter_item.file_name = (
                    "Offer Letter.pdf"
                )

                offer_letter_item.file_path = (
                    f"uploads/onboarding/"
                    f"{data.job_application_id}/"
                    f"Offer Letter.pdf"
                )

                offer_letter_item.status = "READY"
                offer_letter_item.generated_at = (
                    datetime.utcnow()
                )
                offer_letter_item.updated_at = (
                    datetime.utcnow()
                )

                if offer_letter_item not in created_items:
                    created_items.append(
                        offer_letter_item
                    )

            # ==================================================
            # 8B. DYNAMIC APPOINTMENT LETTER
            # ==================================================

            appointment_letter_path = (
                candidate_folder
                / "Appointment Letter Draft.pdf"
            )

            self.appointment_letter_pdf_service.generate(
                package=package,
                application=application,
                destination_path=appointment_letter_path,
                candidate_name=candidate_name,
            )

            appointment_letter_content = (
                appointment_letter_path.read_bytes()
            )

            attachments.append(
                EmailAttachment(
                    filename=appointment_letter_path.name,
                    content_type="application/pdf",
                    content=appointment_letter_content,
                )
            )
            # --------------------------------------------------
            # Reuse existing APPOINTMENT_LETTER DB row if available.
            # Otherwise create exactly ONE.
            # --------------------------------------------------

            appointment_letter_item = existing_by_type.get(
                "APPOINTMENT_LETTER"
            )

            if appointment_letter_item is None:

                appointment_letter_item = OnboardingDocumentItem(
                    document_type="APPOINTMENT_LETTER",
                    file_name="Appointment Letter Draft.pdf",
                    file_path=(
                        f"uploads/onboarding/"
                        f"{data.job_application_id}/"
                        f"Appointment Letter Draft.pdf"
                    ),
                    status="READY",
                    generated_at=datetime.utcnow(),
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )

                package.items.append(
                    appointment_letter_item
                )

                created_items.append(
                    appointment_letter_item
                )

            else:

                # Reuse the SAME database row.
                appointment_letter_item.file_name = (
                    "Appointment Letter Draft.pdf"
                )

                appointment_letter_item.file_path = (
                    f"uploads/onboarding/"
                    f"{data.job_application_id}/"
                    f"Appointment Letter Draft.pdf"
                )

                appointment_letter_item.status = "READY"

                appointment_letter_item.generated_at = (
                    datetime.utcnow()
                )

                appointment_letter_item.updated_at = (
                    datetime.utcnow()
                )

                if appointment_letter_item not in created_items:
                    created_items.append(
                        appointment_letter_item
                    )
            # ==================================================
            # 8C. STATIC DOCUMENTS
            # ==================================================

            for document in self.MASTER_DOCUMENTS:

                document_type = document["document_type"]

                folder_name, file_name = (
                    document["source"]
                )

                source_path = (
                    self.master_documents_dir
                    / folder_name
                    / file_name
                )

                if not source_path.exists():
                    raise FileNotFoundError(
                        "Master onboarding document not found: "
                        f"{source_path}"
                    )

                destination_path = (
                    candidate_folder
                    / file_name
                )

                # Copy/update the SAME candidate file.
                shutil.copy2(
                    source_path,
                    destination_path,
                )

                content_type, _ = (
                    mimetypes.guess_type(
                        destination_path.name
                    )
                )

                content_type = (
                    content_type
                    or "application/octet-stream"
                )

                file_content = (
                    destination_path.read_bytes()
                )

                attachments.append(
                    EmailAttachment(
                        filename=destination_path.name,
                        content_type=content_type,
                        content=file_content,
                    )
                )

                # --------------------------------------------------
                # Reuse existing database row.
                # --------------------------------------------------

                item = existing_by_type.get(
                    document_type
                )

                if item is None:

                    item = OnboardingDocumentItem(
                        document_type=document_type,
                        file_name=destination_path.name,
                        file_path=str(
                            destination_path.relative_to(
                                settings.BASE_DIR
                            )
                        ).replace("\\", "/"),
                        status="READY",
                        generated_at=datetime.utcnow(),
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow(),
                    )

                    package.items.append(item)

                    created_items.append(item)

                else:

                    item.file_name = (
                        destination_path.name
                    )

                    item.file_path = str(
                        destination_path.relative_to(
                            settings.BASE_DIR
                        )
                    ).replace("\\", "/")

                    item.status = "READY"
                    item.generated_at = (
                        datetime.utcnow()
                    )
                    item.updated_at = (
                        datetime.utcnow()
                    )

                    if item not in created_items:
                        created_items.append(item)

            self.db.flush()

        except Exception as exc:

            logger.exception(
                "Failed to prepare onboarding documents "
                "for application_id=%s",
                data.job_application_id,
            )

            package.status = "DRAFT"
            package.email_status = "FAILED"
            package.email_error = (
                f"Document preparation failed: {str(exc)}"
            )

            self.db.commit()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Unable to prepare onboarding documents."
                ),
            ) from exc

        # ======================================================
        # 9. SPLIT EMAIL INTO SAFE BATCHES
        # ======================================================

        try:

            attachment_batches: list[
                list[EmailAttachment]
            ] = []

            current_batch: list[
                EmailAttachment
            ] = []

            current_batch_size = 0

            for attachment in attachments:

                attachment_size = len(
                    attachment.content
                )

                # One individual document is too large.
                if (
                    attachment_size
                    > self.MAX_EMAIL_ATTACHMENT_BYTES
                ):
                    raise RuntimeError(
                        f"Document '{attachment.filename}' "
                        "is too large to send as an "
                        "email attachment."
                    )

                # Start another email before exceeding
                # our safe threshold.
                if (
                    current_batch
                    and (
                        current_batch_size
                        + attachment_size
                        > self.MAX_EMAIL_ATTACHMENT_BYTES
                    )
                ):

                    attachment_batches.append(
                        current_batch
                    )

                    current_batch = []
                    current_batch_size = 0

                current_batch.append(
                    attachment
                )

                current_batch_size += (
                    attachment_size
                )

            if current_batch:
                attachment_batches.append(
                    current_batch
                )

            logger.info(
                "Sending onboarding documents in %s "
                "email(s) for application_id=%s",
                len(attachment_batches),
                data.job_application_id,
            )

            # ==================================================
            # 10. SEND ALL EMAIL BATCHES
            # ==================================================

            for batch_number, batch in enumerate(
                attachment_batches,
                start=1,
            ):

                logger.info(
                    "Sending onboarding email batch "
                    "%s/%s for application_id=%s "
                    "with %s attachment(s)",
                    batch_number,
                    len(attachment_batches),
                    data.job_application_id,
                    len(batch),
                )

                await (
                    self.document_email_service
                    .send_onboarding_documents(
                        recipient=candidate_email,
                        candidate_name=candidate_name,
                        attachments=batch,
                    )
                )

        except Exception as exc:

            logger.exception(
                "Failed to send onboarding documents "
                "email for application_id=%s",
                data.job_application_id,
            )

            package.status = "DRAFT"
            package.email_status = "FAILED"
            package.email_error = str(exc)
            package.sent_at = None

            for item in created_items:

                item.status = "READY"
                item.sent_at = None
                item.error_message = str(exc)
                item.updated_at = datetime.utcnow()

            self.db.commit()

            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=(
                    "Documents were prepared, but the "
                    "onboarding email could not be sent."
                ),
            ) from exc

        # ======================================================
        # 11. EMAIL SUCCESS
        # ======================================================

        sent_at = datetime.utcnow()

        package.status = "SENT"
        package.email_status = "SENT"
        package.email_error = None
        package.sent_at = sent_at

        package.generated_at = (
            package.generated_at or sent_at
        )

        for item in created_items:

            item.status = "SENT"
            item.sent_at = sent_at
            item.error_message = None
            item.updated_at = sent_at

        self.db.commit()

        self.db.refresh(package)

        return DocumentPackageResponse.model_validate(
            package
        )