from __future__ import annotations

from pathlib import Path
from typing import Annotated, List

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from pydantic import EmailStr, TypeAdapter
from sqlalchemy.orm import Session

from app.application.dtos.resignation.resignation_dto import (
    ResignationCreate,
    ResignationResponse,
    ResignationUpdate,
)
from app.application.dtos.resignation.resignation_email_dto import (
    ActiveEmployeeResponse,
    ResignationEmailResponse,
)
from app.application.services.resignation.resignation_email_service import (
    ResignationEmailService,
)
from app.application.services.resignation.resignation_service import (
    ResignationService,
)
from app.infrastructure.database.connection import get_db_session
from app.infrastructure.email.email_service import EmailAttachment
from app.infrastructure.repositories.employee.employee_repository import (
    EmployeeRepository,
)
from app.infrastructure.repositories.resignation.resignation_repository import (
    ResignationRepository,
)
from app.presentation.dependencies.database import get_transactional_db


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/resignations",
    tags=["Resignation"],
)


# ============================================================
# RESIGNATION EMAIL CONFIGURATION
# ============================================================

ALLOWED_ATTACHMENT_EXTENSIONS = {
    ".pdf",
    ".doc",
    ".docx",
    ".jpg",
    ".jpeg",
    ".png",
}

MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024  # 10 MB per file

email_adapter = TypeAdapter(EmailStr)


# ============================================================
# GET ACTIVE EMPLOYEES
# ============================================================

@router.get(
    "/active-employees",
    response_model=list[ActiveEmployeeResponse],
)
def get_active_employees(
    db: Session = Depends(get_db_session),
) -> list[ActiveEmployeeResponse]:
    """
    Return all active employees having an official email address.

    Active employee is determined using:
        employee_detail.is_remove = 0
    """

    repository = EmployeeRepository(db)

    employees = repository.get_active_employees()

    return [
        ActiveEmployeeResponse(
            employee_id=employee.id,
            employee_name=(
                f"{employee.first_name or ''} "
                f"{employee.last_name or ''}"
            ).strip(),
            email=employee.email.strip(),
        )
        for employee in employees
        if employee.email
        and employee.email.strip()
    ]


# ============================================================
# SEND RESIGNATION EMAIL
# ============================================================

@router.post(
    "/send-email",
    response_model=ResignationEmailResponse,
    status_code=status.HTTP_200_OK,
)
async def send_resignation_email(
    employee_id: Annotated[
        int | None,
        Form(),
    ] = None,
    employee_email: Annotated[
        str | None,
        Form(),
    ] = None,
    subject: Annotated[
        str,
        Form(),
    ] = "",
    body: Annotated[
        str,
        Form(),
    ] = "",
    attachments: Annotated[
        list[UploadFile] | None,
        File(),
    ] = None,
    db: Session = Depends(get_db_session),
) -> ResignationEmailResponse:
    """
    Send a resignation email to an active employee.

    Employee can be selected by employee_id or supplied by email.
    Attachments are optional and can contain multiple files.
    """

    repository = EmployeeRepository(db)

    recipient_email: str

    # ========================================================
    # EMPLOYEE SELECTED FROM DROPDOWN
    # ========================================================

    if employee_id is not None:
        employee = repository.get_by_id(employee_id)

        if employee is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found.",
            )

        if employee.is_remove != 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected employee is not active.",
            )

        if not employee.email or not employee.email.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Selected employee does not have "
                    "an official email address."
                ),
            )

        recipient_email = employee.email.strip()

    # ========================================================
    # EMPLOYEE EMAIL ENTERED MANUALLY
    # ========================================================

    elif employee_email and employee_email.strip():
        recipient_email = employee_email.strip()

        try:
            recipient_email = str(
                email_adapter.validate_python(
                    recipient_email
                )
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid employee email address.",
            ) from exc

        employee = repository.get_by_email(
            recipient_email
        )

        if employee is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "No employee was found with this email address."
                ),
            )

        if employee.is_remove != 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The employee is not active.",
            )

        if not employee.email or not employee.email.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Employee does not have "
                    "an official email address."
                ),
            )

        recipient_email = employee.email.strip()

    # ========================================================
    # EMPLOYEE NOT PROVIDED
    # ========================================================

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Either employee_id or employee_email "
                "is required."
            ),
        )

    # ========================================================
    # SUBJECT VALIDATION
    # ========================================================

    subject = subject.strip()

    if not subject:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email subject is required.",
        )

    # ========================================================
    # BODY VALIDATION
    # ========================================================

    body = body.strip()

    if not body:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email body is required.",
        )

    # ========================================================
    # PROCESS ATTACHMENTS
    # ========================================================

    email_attachments: list[EmailAttachment] = []

    if attachments:
        for upload in attachments:

            # ------------------------------------------------
            # Ignore empty upload slots
            # ------------------------------------------------

            if not upload.filename:
                continue

            # ------------------------------------------------
            # Get file extension
            # ------------------------------------------------

            extension = Path(
                upload.filename
            ).suffix.lower()

            # ------------------------------------------------
            # Validate extension
            # ------------------------------------------------

            if extension not in ALLOWED_ATTACHMENT_EXTENSIONS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Unsupported attachment type: "
                        f"{extension or 'unknown'}. "
                        "Allowed formats are PDF, DOC, DOCX, "
                        "JPG, JPEG and PNG."
                    ),
                )

            # ------------------------------------------------
            # Read file
            # ------------------------------------------------

            content = await upload.read()

            # ------------------------------------------------
            # Empty file validation
            # ------------------------------------------------

            if not content:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Attachment '{upload.filename}' "
                        "is empty."
                    ),
                )

            # ------------------------------------------------
            # File size validation
            # ------------------------------------------------

            if len(content) > MAX_ATTACHMENT_SIZE:
                raise HTTPException(
                    status_code=(
                        status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
                    ),
                    detail=(
                        f"Attachment '{upload.filename}' "
                        "exceeds the maximum allowed size "
                        "of 10 MB."
                    ),
                )

            # ------------------------------------------------
            # Add attachment
            # ------------------------------------------------

            email_attachments.append(
                EmailAttachment(
                    filename=upload.filename,
                    content_type=(
                        upload.content_type
                        or "application/octet-stream"
                    ),
                    content=content,
                )
            )

    # ========================================================
    # SEND EMAIL
    # ========================================================

    service = ResignationEmailService()

    try:
        await service.send(
            recipient_email=recipient_email,
            subject=subject,
            body=body,
            attachments=email_attachments,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    # ========================================================
    # SUCCESS RESPONSE
    # ========================================================

    return ResignationEmailResponse(
        success=True,
        message="Resignation email sent successfully.",
        recipient_email=recipient_email,
        attachment_count=len(email_attachments),
    )


# ============================================================
# GET ALL RESIGNATIONS
# ============================================================

@router.get(
    "/",
    response_model=List[ResignationResponse],
)
def list_all(
    db: Session = Depends(
        get_transactional_db
    ),
):
    repository = ResignationRepository(db)

    service = ResignationService(
        repository
    )

    return service.get_all()


# ============================================================
# GET RESIGNATION BY ID
# ============================================================

@router.get(
    "/{id}",
    response_model=ResignationResponse,
)
def get_one(
    id: int,
    db: Session = Depends(
        get_transactional_db
    ),
):
    repository = ResignationRepository(db)

    service = ResignationService(
        repository
    )

    return service.get_by_id(id)


# ============================================================
# CREATE RESIGNATION
# ============================================================

@router.post(
    "/",
    response_model=ResignationResponse,
    status_code=status.HTTP_201_CREATED,
)
def apply(
    data: ResignationCreate,
    db: Session = Depends(
        get_transactional_db
    ),
):
    repository = ResignationRepository(db)

    service = ResignationService(
        repository
    )

    return service.create(
        data
    )


# ============================================================
# UPDATE RESIGNATION
# ============================================================

@router.put(
    "/{id}",
    response_model=ResignationResponse,
)
def update(
    id: int,
    data: ResignationUpdate,
    db: Session = Depends(
        get_transactional_db
    ),
):
    repository = ResignationRepository(db)

    service = ResignationService(
        repository
    )

    return service.update(
        id,
        data
    )


# ============================================================
# DELETE RESIGNATION
# ============================================================

@router.delete(
    "/{id}",
)
def remove(
    id: int,
    db: Session = Depends(
        get_transactional_db
    ),
):
    repository = ResignationRepository(db)

    service = ResignationService(
        repository
    )

    return service.delete(
        id
    )