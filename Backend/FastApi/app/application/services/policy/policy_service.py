from __future__ import annotations

import logging
import os

from datetime import datetime, timezone

from pathlib import Path

from typing import Any

from urllib.parse import (
    unquote,
    urlparse,
)

from fastapi import (
    HTTPException,
    status,
)

from sqlalchemy import delete as sqlalchemy_delete

from sqlalchemy.exc import SQLAlchemyError

from sqlalchemy.orm import Session

from app.application.dtos.policy import (
    EmployeePolicyAcceptanceResponse,
    PolicyAcceptanceItemResponse,
    PolicyAcceptanceRequest,
    PolicyAcceptanceResponse,
    PolicyContentResponse,
    PolicyCreateResponse,
    PolicyDeleteResponse,
    PolicyListResponse,
    PolicyResponse,
)

from app.application.services.policy.policy_document_service import (
    PolicyDocumentService,
)

from app.application.services.policy.policy_translation_service import (
    PolicyTranslationService,
)

from app.core.config import settings

from app.domain.interfaces.policy.policy_interface import (
    IPolicyRepository,
)

from app.infrastructure.email.policy_email_service import (
    PolicyEmailError,
    PolicyEmailService,
)

from app.infrastructure.models.policy.policy import (
    Policy,
)

from app.infrastructure.models.policy.policy_acceptance import (
    PolicyAcceptance,
)


logger = logging.getLogger(
    __name__
)


class PolicyService:
    """
    Production Policy Management Service.

    Responsibilities:

        - Policy retrieval
        - Policy creation
        - Policy deletion
        - Creator name resolution
        - Document URL generation
        - Document text extraction
        - Translation
        - Employee policy acceptance
        - Acceptance history
        - Acceptance email notification

    Transaction ownership belongs to this service.

    Repository never commits.
    """

    # ============================================================
    # SUPPORTED LANGUAGES
    # ============================================================

    SUPPORTED_CONTENT_LANGUAGES = {
        "en": "English",
        "hi": "Hindi",
        "bn": "Bengali",
    }

    # ============================================================
    # INITIALIZATION
    # ============================================================

    def __init__(
        self,
        db: Session,
        repository: IPolicyRepository,
        document_service: PolicyDocumentService | None = None,
        translation_service: PolicyTranslationService | None = None,
        email_service: PolicyEmailService | None = None,
    ) -> None:

        self.db = db

        self.repository = repository

        self.document_service = (
            document_service
            if document_service is not None
            else PolicyDocumentService()
        )

        self.translation_service = (
            translation_service
            if translation_service is not None
            else PolicyTranslationService()
        )

        self.email_service = (
            email_service
            if email_service is not None
            else PolicyEmailService()
        )

    # ============================================================
    # VALIDATE POLICY ID
    # ============================================================

    @staticmethod
    def _validate_policy_id(
        policy_id: int,
    ) -> None:

        if policy_id <= 0:

            raise HTTPException(
                status_code=(
                    status.HTTP_400_BAD_REQUEST
                ),
                detail=(
                    "Policy ID must be greater than zero."
                ),
            )

    # ============================================================
    # VALIDATE EMPLOYEE ID
    # ============================================================

    @staticmethod
    def _validate_employee_id(
        employee_id: int,
    ) -> None:

        if employee_id <= 0:

            raise HTTPException(
                status_code=(
                    status.HTTP_400_BAD_REQUEST
                ),
                detail=(
                    "Employee ID must be greater than zero."
                ),
            )

    # ============================================================
    # UTC NOW
    # ============================================================

    @staticmethod
    def _utc_now() -> datetime:

        return datetime.now(
            timezone.utc
        )

    # ============================================================
    # BUILD DOCUMENT URL
    # ============================================================

    @staticmethod
    def _build_document_url(
        policy_file: str | None,
    ) -> str | None:

        if not policy_file:
            return None

        normalized_file = (
            str(policy_file)
            .replace("\\", "/")
            .strip()
        )

        if not normalized_file:
            return None

        normalized_file = (
            normalized_file.lstrip("/")
        )

        if normalized_file.startswith(
            "uploads/"
        ):

            return (
                f"/{normalized_file}"
            )

        return (
            "/uploads/policies/"
            f"{Path(normalized_file).name}"
        )

    # ============================================================
    # BUILD POLICY RESPONSE
    # ============================================================

    @classmethod
    def _to_response(
        cls,
        policy: Policy,
        creator_name: str | None = None,
        is_accepted: bool = False,
    ) -> PolicyResponse:

        return PolicyResponse(
            id=policy.id,

            title=policy.policy_name,

            description=policy.description,

            documentUrl=(
                cls._build_document_url(
                    policy.policy_file
                )
            ),

            version=policy.version,

            status=(
                "Active"
                if policy.is_active
                else "Inactive"
            ),

            # Database value.
            #
            # Example:
            # IWT90
            createdBy=(
                str(policy.createdby).strip()
                if policy.createdby
                else None
            ),

            # Human-readable value.
            #
            # Example:
            # Abhinav Chaudhari
            createdByName=creator_name,

            creatorRole=None,

            createdAt=policy.createdon,

            updatedAt=(
                policy.modifiedon
                or policy.createdon
            ),

            isAccepted=is_accepted,
        )

    # ============================================================
    # RESOLVE CREATOR NAMES
    # ============================================================

    def _resolve_creator_names(
        self,
        policies: list[Policy],
    ) -> dict[str, str]:

        creator_codes = {
            str(policy.createdby).strip()
            for policy in policies
            if policy.createdby
            and str(policy.createdby).strip()
        }

        if not creator_codes:
            return {}

        try:

            return (
                self.repository
                .get_employee_names_by_codes(
                    self.db,
                    creator_codes,
                )
            )

        except SQLAlchemyError as exc:

            logger.exception(
                "Failed to resolve policy creator names."
            )

            raise HTTPException(
                status_code=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
                detail=(
                    "Unable to resolve policy creator names."
                ),
            ) from exc

    # ============================================================
    # GET ALL
    # ============================================================

    def get_all(
        self,
    ) -> PolicyListResponse:

        try:

            policies = (
                self.repository.get_all(
                    self.db,
                    include_inactive=True,
                )
            )

            creator_names = (
                self._resolve_creator_names(
                    policies
                )
            )

            data = []

            for policy in policies:

                creator_name = None

                if policy.createdby:

                    creator_name = (
                        creator_names.get(
                            str(
                                policy.createdby
                            ).strip()
                        )
                    )

                data.append(
                    self._to_response(
                        policy=policy,
                        creator_name=creator_name,
                    )
                )

            return PolicyListResponse(
                success=True,
                message=(
                    "Policies retrieved successfully."
                ),
                data=data,
            )

        except HTTPException:
            raise

        except SQLAlchemyError as exc:

            logger.exception(
                "Failed to retrieve policies."
            )

            raise HTTPException(
                status_code=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
                detail=(
                    "Unable to retrieve policies."
                ),
            ) from exc

    # ============================================================
    # GET ALL RESPONSE
    #
    # IMPORTANT:
    # Your router is calling this method.
    # ============================================================

    def get_all_response(
        self,
    ) -> PolicyListResponse:

        return self.get_all()

    # ============================================================
    # GET ACTIVE
    # ============================================================

    def get_active(
        self,
    ) -> PolicyListResponse:

        try:

            policies = (
                self.repository.get_active(
                    self.db
                )
            )

            creator_names = (
                self._resolve_creator_names(
                    policies
                )
            )

            data = []

            for policy in policies:

                creator_name = None

                if policy.createdby:

                    creator_name = (
                        creator_names.get(
                            str(
                                policy.createdby
                            ).strip()
                        )
                    )

                data.append(
                    self._to_response(
                        policy=policy,
                        creator_name=creator_name,
                    )
                )

            return PolicyListResponse(
                success=True,
                message=(
                    "Active policies retrieved successfully."
                ),
                data=data,
            )

        except HTTPException:
            raise

        except SQLAlchemyError as exc:

            logger.exception(
                "Failed to retrieve active policies."
            )

            raise HTTPException(
                status_code=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
                detail=(
                    "Unable to retrieve active policies."
                ),
            ) from exc

    # ============================================================
    # GET ACTIVE RESPONSE
    # ============================================================

    def get_active_response(
        self,
    ) -> PolicyListResponse:

        return self.get_active()

    # ============================================================
    # GET POLICY BY ID
    # ============================================================

    def get_by_id(
        self,
        policy_id: int,
    ) -> PolicyResponse:

        self._validate_policy_id(
            policy_id
        )

        try:

            policy = (
                self.repository.get_by_id(
                    self.db,
                    policy_id,
                )
            )

            if policy is None:

                raise HTTPException(
                    status_code=(
                        status.HTTP_404_NOT_FOUND
                    ),
                    detail="Policy not found.",
                )

            creator_name = None

            if policy.createdby:

                names = (
                    self.repository
                    .get_employee_names_by_codes(
                        self.db,
                        {
                            str(
                                policy.createdby
                            ).strip()
                        },
                    )
                )

                creator_name = (
                    names.get(
                        str(
                            policy.createdby
                        ).strip()
                    )
                )

            return self._to_response(
                policy=policy,
                creator_name=creator_name,
            )

        except HTTPException:
            raise

        except SQLAlchemyError as exc:

            logger.exception(
                "Failed to retrieve policy. "
                "policy_id=%s",
                policy_id,
            )

            raise HTTPException(
                status_code=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
                detail=(
                    "Unable to retrieve policy."
                ),
            ) from exc

    # ============================================================
    # GET POLICY BY ID RESPONSE
    # ============================================================

    def get_by_id_response(
        self,
        policy_id: int,
    ) -> PolicyResponse:

        return self.get_by_id(
            policy_id
        )

    # ============================================================
    # CREATE POLICY
    # ============================================================

    def create(
        self,
        policy_name: str,
        description: str | None,
        file_name: str,
        created_by: str,
    ) -> PolicyCreateResponse:

        normalized_name = (
            policy_name or ""
        ).strip()

        if not normalized_name:

            raise HTTPException(
                status_code=(
                    status.HTTP_400_BAD_REQUEST
                ),
                detail="Policy name is required.",
            )

        normalized_creator = (
            created_by or ""
        ).strip()

        if not normalized_creator:

            raise HTTPException(
                status_code=(
                    status.HTTP_401_UNAUTHORIZED
                ),
                detail=(
                    "Authenticated employee code "
                    "is missing."
                ),
            )

        normalized_file_name = (
            file_name or ""
        ).strip()

        if not normalized_file_name:

            raise HTTPException(
                status_code=(
                    status.HTTP_400_BAD_REQUEST
                ),
                detail=(
                    "Policy document is required."
                ),
            )

        # ========================================================
        # VERIFY CREATOR
        # ========================================================

        try:

            employee = (
                self.repository
                .get_employee_by_code(
                    self.db,
                    normalized_creator,
                )
            )

        except SQLAlchemyError as exc:

            logger.exception(
                "Failed to resolve policy creator. "
                "creator=%s",
                normalized_creator,
            )

            raise HTTPException(
                status_code=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
                detail=(
                    "Unable to resolve policy creator."
                ),
            ) from exc

        if employee is None:

            raise HTTPException(
                status_code=(
                    status.HTTP_403_FORBIDDEN
                ),
                detail=(
                    "Authenticated employee record "
                    "was not found."
                ),
            )

        # ========================================================
        # DUPLICATE NAME CHECK
        # ========================================================

        try:

            existing = (
                self.repository.get_by_name(
                    self.db,
                    normalized_name,
                )
            )

        except SQLAlchemyError as exc:

            logger.exception(
                "Failed to check duplicate policy."
            )

            raise HTTPException(
                status_code=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
                detail=(
                    "Unable to validate policy name."
                ),
            ) from exc

        if existing is not None:

            raise HTTPException(
                status_code=(
                    status.HTTP_409_CONFLICT
                ),
                detail=(
                    "A policy with this name "
                    "already exists."
                ),
            )

        # ========================================================
        # CREATE ENTITY
        # ========================================================

        now = self._utc_now()

        policy = Policy(
            policy_name=normalized_name,

            description=(
                description.strip()
                if description
                and description.strip()
                else None
            ),

            policy_file=normalized_file_name,

            version=1,

            is_active=True,

            # Keep employee code in database.
            #
            # Example:
            # IWT90
            createdby=normalized_creator,

            createdon=now,

            modifiedby=None,

            modifiedon=None,
        )

        # ========================================================
        # DATABASE TRANSACTION
        # ========================================================

        try:

            self.repository.create(
                self.db,
                policy,
            )

            self.db.flush()

            self.db.commit()

            self.db.refresh(
                policy
            )

        except SQLAlchemyError as exc:

            self.db.rollback()

            logger.exception(
                "Failed to create policy. "
                "policy_name=%s creator=%s",
                normalized_name,
                normalized_creator,
            )

            raise HTTPException(
                status_code=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
                detail=(
                    "Unable to create policy."
                ),
            ) from exc

        # ========================================================
        # CREATOR DISPLAY NAME
        # ========================================================

        creator_name = (
            f"{employee.first_name or ''} "
            f"{employee.last_name or ''}"
        ).strip()

        if not creator_name:

            creator_name = (
                normalized_creator
            )

        return PolicyCreateResponse(
            success=True,

            message=(
                "Policy created successfully."
            ),

            data=self._to_response(
                policy=policy,
                creator_name=creator_name,
            ),
        )

    # ============================================================
    # GET POLICY CONTENT
    # ============================================================

    def get_policy_content(
        self,
        policy_id: int,
        language: str = "en",
    ) -> PolicyContentResponse:

        self._validate_policy_id(
            policy_id
        )

        normalized_language = (
            (language or "en")
            .strip()
            .lower()
        )

        if (
            normalized_language
            not in self.SUPPORTED_CONTENT_LANGUAGES
        ):

            raise HTTPException(
                status_code=(
                    status.HTTP_400_BAD_REQUEST
                ),
                detail=(
                    "Unsupported policy language. "
                    "Supported languages are en, hi and bn."
                ),
            )

        try:

            policy = (
                self.repository.get_by_id(
                    self.db,
                    policy_id,
                )
            )

        except SQLAlchemyError as exc:

            logger.exception(
                "Failed to retrieve policy content. "
                "policy_id=%s",
                policy_id,
            )

            raise HTTPException(
                status_code=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
                detail=(
                    "Unable to retrieve policy."
                ),
            ) from exc

        if policy is None:

            raise HTTPException(
                status_code=(
                    status.HTTP_404_NOT_FOUND
                ),
                detail="Policy not found.",
            )

        document_url = (
            str(
                policy.policy_file
            ).strip()
            if policy.policy_file
            else ""
        )

        if not document_url:

            raise HTTPException(
                status_code=(
                    status.HTTP_404_NOT_FOUND
                ),
                detail=(
                    "No policy document is "
                    "attached to this policy."
                ),
            )

        # ========================================================
        # EXTRACT DOCUMENT TEXT
        # ========================================================

        try:

            english_content = (
                self.document_service
                .extract_text_from_pdf(
                    document_url
                )
            )

        except FileNotFoundError as exc:

            logger.warning(
                "Policy document not found. "
                "policy_id=%s document=%s",
                policy_id,
                document_url,
            )

            raise HTTPException(
                status_code=(
                    status.HTTP_404_NOT_FOUND
                ),
                detail=str(exc),
            ) from exc

        except ValueError as exc:

            raise HTTPException(
                status_code=(
                    status.HTTP_422_UNPROCESSABLE_ENTITY
                ),
                detail=str(exc),
            ) from exc

        except Exception as exc:

            logger.exception(
                "Failed to extract policy document. "
                "policy_id=%s",
                policy_id,
            )

            raise HTTPException(
                status_code=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
                detail=(
                    "Unable to extract policy "
                    "document content."
                ),
            ) from exc

        english_content = (
            english_content or ""
        ).strip()

        if not english_content:

            raise HTTPException(
                status_code=(
                    status.HTTP_422_UNPROCESSABLE_ENTITY
                ),
                detail=(
                    "No readable text was found "
                    "inside the policy document."
                ),
            )

        # ========================================================
        # ENGLISH
        # ========================================================

        if normalized_language == "en":

            return PolicyContentResponse(
                success=True,

                message=(
                    "Policy document text "
                    "extracted successfully."
                ),

                policy_id=policy.id,

                language="en",

                title=policy.policy_name,

                version=policy.version,

                content=english_content,
            )

        # ========================================================
        # HINDI / BENGALI
        # ========================================================

        try:

            translated_content = (
                self.translation_service
                .translate_policy_text(
                    english_content,
                    normalized_language,
                )
            )

        except ValueError as exc:

            raise HTTPException(
                status_code=(
                    status.HTTP_400_BAD_REQUEST
                ),
                detail=str(exc),
            ) from exc

        except RuntimeError as exc:

            logger.exception(
                "Policy translation failed. "
                "policy_id=%s language=%s",
                policy_id,
                normalized_language,
            )

            raise HTTPException(
                status_code=(
                    status.HTTP_503_SERVICE_UNAVAILABLE
                ),
                detail=str(exc),
            ) from exc

        except Exception as exc:

            logger.exception(
                "Unexpected policy translation error."
            )

            raise HTTPException(
                status_code=(
                    status.HTTP_503_SERVICE_UNAVAILABLE
                ),
                detail=(
                    "Unable to translate the policy."
                ),
            ) from exc

        translated_content = (
            translated_content or ""
        ).strip()

        if not translated_content:

            raise HTTPException(
                status_code=(
                    status.HTTP_503_SERVICE_UNAVAILABLE
                ),
                detail=(
                    "Translation service returned "
                    "empty content."
                ),
            )

        return PolicyContentResponse(
            success=True,

            message=(
                "Policy translated successfully."
            ),

            policy_id=policy.id,

            language=normalized_language,

            title=policy.policy_name,

            version=policy.version,

            content=translated_content,
        )

    # ============================================================
    # GET EMPLOYEE
    # ============================================================

    def _get_employee(
        self,
        employee_id: int,
    ):

        self._validate_employee_id(
            employee_id
        )

        try:

            employee = (
                self.repository
                .get_employee_by_id(
                    self.db,
                    employee_id,
                )
            )

        except SQLAlchemyError as exc:

            logger.exception(
                "Failed to retrieve employee. "
                "employee_id=%s",
                employee_id,
            )

            raise HTTPException(
                status_code=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
                detail=(
                    "Unable to retrieve employee."
                ),
            ) from exc

        if employee is None:

            raise HTTPException(
                status_code=(
                    status.HTTP_404_NOT_FOUND
                ),
                detail="Employee not found.",
            )

        return employee

    # ============================================================
    # ACCEPT POLICIES
    # ============================================================

    def accept_policies(
        self,
        employee_id: int,
        request: PolicyAcceptanceRequest,
        client_ip: str | None = None,
        user_agent: str | None = None,
    ) -> PolicyAcceptanceResponse:

        employee = self._get_employee(
            employee_id
        )

        policy_ids = list(
            dict.fromkeys(
                request.policy_ids
            )
        )

        if not policy_ids:

            raise HTTPException(
                status_code=(
                    status.HTTP_400_BAD_REQUEST
                ),
                detail=(
                    "At least one policy "
                    "must be selected."
                ),
            )

        invalid_ids = [
            policy_id
            for policy_id in policy_ids
            if policy_id <= 0
        ]

        if invalid_ids:

            raise HTTPException(
                status_code=(
                    status.HTTP_400_BAD_REQUEST
                ),
                detail=(
                    "Invalid policy ID(s): "
                    f"{invalid_ids}"
                ),
            )

        accepted_policy_ids: list[int] = []

        email_policies: list[
            dict[str, Any]
        ] = []

        try:

            for policy_id in policy_ids:

                policy = (
                    self.repository.get_by_id(
                        self.db,
                        policy_id,
                    )
                )

                if policy is None:

                    raise HTTPException(
                        status_code=(
                            status.HTTP_404_NOT_FOUND
                        ),
                        detail=(
                            f"Policy {policy_id} "
                            "was not found."
                        ),
                    )

                if not policy.is_active:

                    raise HTTPException(
                        status_code=(
                            status.HTTP_400_BAD_REQUEST
                        ),
                        detail=(
                            f"Policy {policy_id} "
                            "is inactive."
                        ),
                    )

                existing = (
                    self.repository
                    .get_acceptance(
                        self.db,
                        employee_id,
                        policy.id,
                        policy.version,
                    )
                )

                if existing is not None:

                    if existing.accepted:

                        accepted_policy_ids.append(
                            policy.id
                        )

                    continue

                acceptance = PolicyAcceptance(
                    policy_id=policy.id,

                    employee_id=employee.id,

                    version=policy.version,

                    accepted=True,

                    accepted_on=self._utc_now(),

                    ip_address=client_ip,

                    user_agent=user_agent,
                )

                self.repository.create_acceptance(
                    self.db,
                    acceptance,
                )

                accepted_policy_ids.append(
                    policy.id
                )

                # ------------------------------------------------
                # Email attachment path
                # ------------------------------------------------

                if policy.policy_file:

                    try:

                        file_path = (
                            self._resolve_policy_file_path(
                                policy.policy_file
                            )
                        )

                        email_policies.append(
                            {
                                "policy_name": (
                                    policy.policy_name
                                ),
                                "version": (
                                    policy.version
                                ),
                                "file_path": (
                                    str(file_path)
                                ),
                            }
                        )

                    except (
                        ValueError,
                        OSError,
                    ) as exc:

                        logger.warning(
                            "Unable to resolve policy "
                            "file for acceptance email. "
                            "policy_id=%s error=%s",
                            policy.id,
                            exc,
                        )

            self.db.commit()

        except HTTPException:

            self.db.rollback()

            raise

        except SQLAlchemyError as exc:

            self.db.rollback()

            logger.exception(
                "Failed to save policy acceptance. "
                "employee_id=%s",
                employee_id,
            )

            raise HTTPException(
                status_code=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
                detail=(
                    "Unable to save policy acceptance."
                ),
            ) from exc

        # ========================================================
        # EMPLOYEE NAME
        # ========================================================

        employee_name = (
            f"{getattr(employee, 'first_name', '') or ''} "
            f"{getattr(employee, 'last_name', '') or ''}"
        ).strip()

        if not employee_name:

            employee_name = (
                getattr(
                    employee,
                    "emp_code",
                    None,
                )
                or "Employee"
            )

        # ========================================================
        # EMPLOYEE EMAIL
        # ========================================================

        employee_email = (
            getattr(
                employee,
                "email",
                None,
            )
            or getattr(
                employee,
                "official_email",
                None,
            )
        )

        # ========================================================
        # SEND CONFIRMATION EMAIL
        # ========================================================

        if (
            email_policies
            and employee_email
        ):

            try:

                self.email_service.send_policy_email(
                    recipient_email=employee_email,

                    employee_name=str(
                        employee_name
                    ),

                    policies=email_policies,
                )

            except PolicyEmailError as exc:

                logger.exception(
                    "Policy acceptance saved but "
                    "confirmation email failed. "
                    "employee_id=%s error=%s",
                    employee_id,
                    exc,
                )

        return PolicyAcceptanceResponse(
            success=True,

            message=(
                "Policies accepted successfully."
            ),

            accepted_policy_ids=(
                accepted_policy_ids
            ),
        )

    # ============================================================
    # GET EMPLOYEE ACCEPTANCES
    # ============================================================

    def get_employee_acceptances(
        self,
        employee_id: int,
    ) -> EmployeePolicyAcceptanceResponse:

        employee = self._get_employee(
            employee_id
        )

        try:

            acceptances = (
                self.repository
                .get_employee_acceptances(
                    self.db,
                    employee.id,
                )
            )

        except SQLAlchemyError as exc:

            logger.exception(
                "Failed to retrieve policy "
                "acceptance history. "
                "employee_id=%s",
                employee_id,
            )

            raise HTTPException(
                status_code=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
                detail=(
                    "Unable to retrieve policy "
                    "acceptance history."
                ),
            ) from exc

        data = []

        for acceptance in acceptances:

            data.append(
                PolicyAcceptanceItemResponse(
                    policy_id=(
                        acceptance.policy_id
                    ),

                    version=(
                        acceptance.version
                    ),

                    accepted=(
                        acceptance.accepted
                    ),

                    accepted_on=(
                        acceptance.accepted_on
                    ),
                )
            )

        return EmployeePolicyAcceptanceResponse(
            success=True,

            message=(
                "Policy acceptance history "
                "retrieved successfully."
            ),

            data=data,
        )

    # ============================================================
    # DELETE POLICY
    #
    # IMPORTANT:
    # THIS METHOD IS INSIDE PolicyService.
    #
    # This fixes your original indentation problem.
    # ============================================================

    def delete(
        self,
        policy_id: int,
    ) -> PolicyDeleteResponse:

        self._validate_policy_id(
            policy_id
        )

        # ========================================================
        # STEP 1 - GET POLICY
        # ========================================================

        try:

            policy = (
                self.repository.get_by_id(
                    self.db,
                    policy_id,
                )
            )

        except SQLAlchemyError as exc:

            logger.exception(
                "Failed to retrieve policy before deletion. "
                "policy_id=%s",
                policy_id,
            )

            raise HTTPException(
                status_code=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
                detail=(
                    "Unable to retrieve policy."
                ),
            ) from exc

        if policy is None:

            raise HTTPException(
                status_code=(
                    status.HTTP_404_NOT_FOUND
                ),
                detail="Policy not found.",
            )

        # ========================================================
        # STEP 2 - RESOLVE PHYSICAL DOCUMENT PATH
        # ========================================================

        document_path: Path | None = None

        if policy.policy_file:

            try:

                document_path = (
                    self._resolve_policy_file_path_for_delete(
                        str(
                            policy.policy_file
                        )
                    )
                )

                logger.info(
                    "Policy document path resolved. "
                    "policy_id=%s stored_file=%s physical_path=%s",
                    policy_id,
                    policy.policy_file,
                    document_path,
                )

            except (
                ValueError,
                OSError,
            ) as exc:

                logger.warning(
                    "Unable to resolve policy document path. "
                    "policy_id=%s stored_file=%s error=%s",
                    policy_id,
                    policy.policy_file,
                    exc,
                )

                document_path = None

        # ========================================================
        # STEP 3 - DELETE DATABASE RECORDS
        # ========================================================

        try:

            # ----------------------------------------------------
            # Delete child acceptance records first
            # ----------------------------------------------------

            result = self.db.execute(
                sqlalchemy_delete(
                    PolicyAcceptance
                ).where(
                    PolicyAcceptance.policy_id
                    == policy_id
                )
            )

            deleted_acceptance_count = (
                result.rowcount or 0
            )

            logger.info(
                "Deleted policy acceptance records. "
                "policy_id=%s count=%s",
                policy_id,
                deleted_acceptance_count,
            )

            # ----------------------------------------------------
            # Flush child deletion
            # ----------------------------------------------------

            self.db.flush()

            # ----------------------------------------------------
            # Delete parent policy
            # ----------------------------------------------------

            self.repository.delete(
                self.db,
                policy,
            )

            # ----------------------------------------------------
            # Flush parent deletion
            # ----------------------------------------------------

            self.db.flush()

            # ----------------------------------------------------
            # Commit database
            # ----------------------------------------------------

            self.db.commit()

            logger.info(
                "Policy database deletion committed. "
                "policy_id=%s",
                policy_id,
            )

        except SQLAlchemyError as exc:

            self.db.rollback()

            logger.exception(
                "Policy database deletion failed. "
                "policy_id=%s",
                policy_id,
            )

            raise HTTPException(
                status_code=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
                detail=(
                    "Unable to delete policy because "
                    "related database records could "
                    "not be deleted."
                ),
            ) from exc

        # ========================================================
        # STEP 4 - NO FILE
        # ========================================================

        if document_path is None:

            return PolicyDeleteResponse(
                success=True,

                message=(
                    "Policy and related acceptance "
                    "records deleted successfully. "
                    "The physical document could not "
                    "be resolved."
                ),
            )

        # ========================================================
        # STEP 5 - FILE DOES NOT EXIST
        # ========================================================

        if not document_path.exists():

            logger.warning(
                "Policy database record deleted but "
                "physical document was already missing. "
                "policy_id=%s path=%s",
                policy_id,
                document_path,
            )

            return PolicyDeleteResponse(
                success=True,

                message=(
                    "Policy and related acceptance "
                    "records deleted successfully. "
                    "The physical document was already missing."
                ),
            )

        # ========================================================
        # STEP 6 - VERIFY FILE
        # ========================================================

        if not document_path.is_file():

            logger.warning(
                "Resolved policy document path is not a file. "
                "policy_id=%s path=%s",
                policy_id,
                document_path,
            )

            return PolicyDeleteResponse(
                success=True,

                message=(
                    "Policy and related acceptance "
                    "records were deleted successfully, "
                    "but the physical document path is invalid."
                ),
            )

        # ========================================================
        # STEP 7 - DELETE PHYSICAL FILE
        # ========================================================

        try:

            os.remove(
                str(document_path)
            )

        except PermissionError as exc:

            logger.exception(
                "Permission denied while deleting policy "
                "document. File may be locked. "
                "policy_id=%s path=%s",
                policy_id,
                document_path,
            )

            return PolicyDeleteResponse(
                success=True,

                message=(
                    "Policy was deleted from the database, "
                    "but the physical document could not be "
                    "deleted because the file is locked or "
                    "permission was denied."
                ),
            )

        except FileNotFoundError:

            logger.info(
                "Policy document was already removed. "
                "policy_id=%s path=%s",
                policy_id,
                document_path,
            )

            return PolicyDeleteResponse(
                success=True,

                message=(
                    "Policy and related acceptance records "
                    "were deleted successfully. "
                    "The physical document was already missing."
                ),
            )

        except OSError as exc:

            logger.exception(
                "Filesystem error while deleting policy "
                "document. policy_id=%s path=%s",
                policy_id,
                document_path,
            )

            return PolicyDeleteResponse(
                success=True,

                message=(
                    "Policy and related acceptance records "
                    "were deleted successfully, but the "
                    "physical document could not be deleted."
                ),
            )

        # ========================================================
        # STEP 8 - VERIFY PHYSICAL DELETION
        # ========================================================

        if document_path.exists():

            logger.error(
                "Physical policy document still exists "
                "after delete operation. "
                "policy_id=%s path=%s",
                policy_id,
                document_path,
            )

            return PolicyDeleteResponse(
                success=True,

                message=(
                    "Policy and related acceptance records "
                    "were deleted successfully, but the "
                    "physical document could not be removed."
                ),
            )

        logger.info(
            "Physical policy document deleted successfully. "
            "policy_id=%s path=%s",
            policy_id,
            document_path,
        )

        return PolicyDeleteResponse(
            success=True,

            message=(
                "Policy, related acceptance records, "
                "and physical policy document "
                "deleted successfully."
            ),
        )

    # ============================================================
    # RESOLVE POLICY FILE PATH FOR DELETE / EMAIL
    # ============================================================

    def _resolve_policy_file_path_for_delete(
        self,
        policy_file: str,
    ) -> Path:

        normalized = (
            str(
                policy_file or ""
            ).strip()
        )

        if not normalized:

            raise ValueError(
                "Policy document path is missing."
            )

        normalized = (
            normalized.replace(
                "\\",
                "/",
            )
        )

        upload_root = (
            Path(
                settings.POLICY_UPLOAD_DIRECTORY
            ).resolve()
        )

        parsed = urlparse(
            normalized
        )

        # ========================================================
        # HTTP / HTTPS
        # ========================================================

        if parsed.scheme.lower() in {
            "http",
            "https",
        }:

            filename = Path(
                unquote(
                    parsed.path
                )
            ).name

            if not filename:

                raise ValueError(
                    "Policy document filename is invalid."
                )

            file_path = (
                upload_root
                / filename
            ).resolve()

            self._ensure_inside_directory(
                file_path,
                upload_root,
            )

            return file_path

        # ========================================================
        # FILE URL
        # ========================================================

        if parsed.scheme.lower() == "file":

            raw_path = unquote(
                parsed.path
            )

            # Windows:
            #
            # file:///C:/folder/file.pdf

            if (
                len(raw_path) >= 3
                and raw_path[0] == "/"
                and raw_path[2] == ":"
            ):

                raw_path = raw_path[1:]

            file_path = (
                Path(
                    raw_path
                ).resolve()
            )

            self._ensure_inside_directory(
                file_path,
                upload_root,
            )

            return file_path

        # ========================================================
        # ABSOLUTE FILESYSTEM PATH
        # ========================================================

        candidate = Path(
            normalized
        )

        if candidate.is_absolute():

            file_path = (
                candidate.resolve()
            )

            self._ensure_inside_directory(
                file_path,
                upload_root,
            )

            return file_path

        # ========================================================
        # RELATIVE PATH
        # ========================================================

        normalized_path = (
            normalized.lstrip("/")
        )

        filename = (
            Path(
                normalized_path
            ).name
        )

        if not filename:

            raise ValueError(
                "Policy document filename is invalid."
            )

        file_path = (
            upload_root
            / filename
        ).resolve()

        self._ensure_inside_directory(
            file_path,
            upload_root,
        )

        return file_path

    # ============================================================
    # RESOLVE POLICY FILE PATH
    # ============================================================

    def _resolve_policy_file_path(
        self,
        policy_file: str,
    ) -> Path:

        return (
            self._resolve_policy_file_path_for_delete(
                policy_file
            )
        )

    # ============================================================
    # DIRECTORY SECURITY
    # ============================================================

    @staticmethod
    def _ensure_inside_directory(
        file_path: Path,
        directory: Path,
    ) -> None:

        try:

            file_path.relative_to(
                directory
            )

        except ValueError as exc:

            raise ValueError(
                "Invalid policy document path."
            ) from exc