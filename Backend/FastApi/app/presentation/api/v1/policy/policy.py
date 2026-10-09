from __future__ import annotations

from pathlib import Path
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    Header,
    HTTPException,
    Query,
    Request,
    UploadFile,
    status,
)
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.application.dtos.policy import (
    EmployeePolicyAcceptanceResponse,
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

from app.application.services.policy.policy_service import (
    PolicyService,
)

from app.application.services.policy.policy_translation_service import (
    PolicyTranslationService,
)

from app.core.config import settings

from app.core.security import (
    get_current_username,
)

from app.infrastructure.database.connection import (
    get_db_session,
)

from app.infrastructure.email.policy_email_service import (
    PolicyEmailService,
)

# IMPORTANT:
# Your actual folder structure is:
#
# app/infrastructure/repositories/policy/policy_repository.py
#
from app.infrastructure.repositories.policy.policy_repository import (
    PolicyRepository,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter()


# ============================================================
# UPLOAD DIRECTORY
# ============================================================

UPLOAD_DIRECTORY = (
    Path(
        settings.POLICY_UPLOAD_DIRECTORY
    )
    .resolve()
)


# ============================================================
# ALLOWED EXTENSIONS
# ============================================================

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".docx",
}


# ============================================================
# MAX FILE SIZE
# ============================================================

MAX_FILE_SIZE = 10 * 1024 * 1024


# ============================================================
# SERVICE DEPENDENCY
# ============================================================

def get_policy_service(
    db: Session = Depends(
        get_db_session
    ),
) -> PolicyService:

    repository = PolicyRepository()

    return PolicyService(
        db=db,
        repository=repository,
        document_service=PolicyDocumentService(),
        translation_service=PolicyTranslationService(),
        email_service=PolicyEmailService(),
    )


# ============================================================
# GET ALL POLICIES
# ============================================================

@router.get(
    "/",
    response_model=PolicyListResponse,
    status_code=status.HTTP_200_OK,
)
def get_policies(
    service: PolicyService = Depends(
        get_policy_service
    ),
) -> PolicyListResponse:

    return service.get_all()


# ============================================================
# GET ACTIVE POLICIES
# ============================================================

@router.get(
    "/active",
    response_model=PolicyListResponse,
    status_code=status.HTTP_200_OK,
)
def get_active_policies(
    service: PolicyService = Depends(
        get_policy_service
    ),
) -> PolicyListResponse:

    return service.get_active()


# ============================================================
# GET EMPLOYEE POLICY ACCEPTANCES
# ============================================================

@router.get(
    "/employee/{employee_id}/acceptances",
    response_model=EmployeePolicyAcceptanceResponse,
    status_code=status.HTTP_200_OK,
)
def get_employee_policy_acceptances(
    employee_id: int,
    service: PolicyService = Depends(
        get_policy_service
    ),
) -> EmployeePolicyAcceptanceResponse:

    return service.get_employee_acceptances(
        employee_id
    )


# ============================================================
# ACCEPT POLICIES
# ============================================================

@router.post(
    "/accept",
    response_model=PolicyAcceptanceResponse,
    status_code=status.HTTP_200_OK,
)
def accept_policies(
    request: PolicyAcceptanceRequest,
    employee_id: int,
    request_context: Request,
    service: PolicyService = Depends(
        get_policy_service
    ),
    user_agent: Optional[str] = Header(
        default=None
    ),
) -> PolicyAcceptanceResponse:

    if employee_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Employee ID must be "
                "greater than zero."
            ),
        )

    client_ip: Optional[str] = None

    if request_context.client:
        client_ip = (
            request_context.client.host
        )

    return service.accept_policies(
        employee_id=employee_id,
        request=request,
        client_ip=client_ip,
        user_agent=user_agent,
    )


# ============================================================
# CREATE POLICY
# ============================================================

@router.post(
    "/",
    response_model=PolicyCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_policy(
    policy_name: str = Form(...),
    description: Optional[str] = Form(
        default=None
    ),
    file: UploadFile = File(...),
    created_by: str = Depends(
        get_current_username
    ),
    service: PolicyService = Depends(
        get_policy_service
    ),
) -> PolicyCreateResponse:

    # ========================================================
    # POLICY NAME
    # ========================================================

    normalized_name = (
        policy_name or ""
    ).strip()

    if not normalized_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Policy name is required.",
        )

    # ========================================================
    # FILE
    # ========================================================

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Policy document is required.",
        )

    original_filename = Path(
        file.filename
    )

    extension = (
        original_filename.suffix
        .lower()
    )

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid document type. "
                "Allowed types: PDF and DOCX."
            ),
        )

    # ========================================================
    # UPLOAD DIRECTORY
    # ========================================================

    try:
        UPLOAD_DIRECTORY.mkdir(
            parents=True,
            exist_ok=True,
        )
    except OSError as exc:
        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Unable to create the "
                "policy upload directory."
            ),
        ) from exc

    # ========================================================
    # SAFE FILE NAME
    # ========================================================

    safe_filename = (
        normalized_name
        .replace("/", "_")
        .replace("\\", "_")
        .replace(" ", "_")
        .replace(":", "_")
        .replace("*", "_")
        .replace("?", "_")
        .replace('"', "_")
        .replace("<", "_")
        .replace(">", "_")
        .replace("|", "_")
    )

    while "__" in safe_filename:
        safe_filename = (
            safe_filename.replace(
                "__",
                "_",
            )
        )

    safe_filename = (
        safe_filename.strip(
            " ._"
        )
    )

    if not safe_filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Policy name cannot be "
                "used as a file name."
            ),
        )

    # ========================================================
    # DESTINATION
    # ========================================================

    destination = (
        UPLOAD_DIRECTORY
        / f"{safe_filename}{extension}"
    ).resolve()

    # ========================================================
    # SECURITY CHECK
    # ========================================================

    try:
        destination.relative_to(
            UPLOAD_DIRECTORY
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid policy file name.",
        ) from exc

    # ========================================================
    # FILE EXISTS
    # ========================================================

    if destination.exists():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "A policy document with the "
                "same name already exists."
            ),
        )

    # ========================================================
    # READ FILE
    # ========================================================

    try:
        content = await file.read()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Unable to read the "
                "uploaded policy document."
            ),
        ) from exc

    # ========================================================
    # EMPTY FILE
    # ========================================================

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Uploaded policy "
                "document is empty."
            ),
        )

    # ========================================================
    # FILE SIZE
    # ========================================================

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=(
                status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
            ),
            detail=(
                "Policy document must not "
                "exceed 10 MB."
            ),
        )

    # ========================================================
    # SAVE PHYSICAL FILE
    # ========================================================

    try:
        destination.write_bytes(
            content
        )
    except OSError as exc:
        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Unable to save the "
                "policy document."
            ),
        ) from exc

    # ========================================================
    # DATABASE RECORD
    # ========================================================

    try:
        return service.create(
            policy_name=normalized_name,
            description=(
                description.strip()
                if description
                else None
            ),
            file_name=(
                "/uploads/policies/"
                f"{destination.name}"
            ),
            created_by=created_by,
        )

    except HTTPException:
        # Database/service error.
        # Remove physical file because DB
        # record was not successfully created.

        try:
            if destination.exists():
                destination.unlink()
        except OSError:
            pass

        raise

    except Exception:
        try:
            if destination.exists():
                destination.unlink()
        except OSError:
            pass

        raise


# ============================================================
# GET POLICY CONTENT
#
# IMPORTANT:
# This route must appear before /{policy_id}.
# ============================================================

@router.get(
    "/{policy_id}/content",
    response_model=PolicyContentResponse,
    status_code=status.HTTP_200_OK,
)
def get_policy_content(
    policy_id: int,
    language: str = Query(
        default="en",
        min_length=2,
        max_length=2,
    ),
    service: PolicyService = Depends(
        get_policy_service
    ),
) -> PolicyContentResponse:

    return service.get_policy_content(
        policy_id=policy_id,
        language=language,
    )


# ============================================================
# GET POLICY BY ID
# ============================================================

@router.get(
    "/{policy_id}",
    response_model=PolicyResponse,
    status_code=status.HTTP_200_OK,
)
def get_policy(
    policy_id: int,
    service: PolicyService = Depends(
        get_policy_service
    ),
) -> PolicyResponse:

    return service.get_response_by_id(
        policy_id
    )


# ============================================================
# DELETE POLICY
# ============================================================

@router.delete(
    "/{policy_id}",
    response_model=PolicyDeleteResponse,
    status_code=status.HTTP_200_OK,
)
def delete_policy(
    policy_id: int,
    service: PolicyService = Depends(
        get_policy_service
    ),
) -> PolicyDeleteResponse:

    return service.delete(
        policy_id
    )