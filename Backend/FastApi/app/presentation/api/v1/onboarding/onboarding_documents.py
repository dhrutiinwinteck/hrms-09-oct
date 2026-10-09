from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.application.dtos.onboarding.document_package import (
    DocumentPackageCreateRequest,
)

from app.application.dtos.onboarding.document_package_response import (
    DocumentPackageResponse,
)

from app.application.services.onboarding.onboarding_document_service import (
    OnboardingDocumentService,
)

from app.presentation.dependencies.database import get_db_session


router = APIRouter(
    prefix="/onboarding/documents",
    tags=["Onboarding Documents"],
)


# ==========================================================
# GET DOCUMENT PACKAGE BY APPLICATION ID
# ==========================================================

@router.get(
    "/application/{job_application_id}",
    response_model=DocumentPackageResponse,
    status_code=status.HTTP_200_OK,
)
def get_document_package(
    job_application_id: int,
    db: Session = Depends(get_db_session),
) -> DocumentPackageResponse:

    service = OnboardingDocumentService(db)

    return service.get_by_application_id(
        job_application_id=job_application_id,
    )


# ==========================================================
# GET DOCUMENT PACKAGE BY PACKAGE ID
# ==========================================================

@router.get(
    "/{package_id}",
    response_model=DocumentPackageResponse,
    status_code=status.HTTP_200_OK,
)
def get_document_package_by_id(
    package_id: int,
    db: Session = Depends(get_db_session),
) -> DocumentPackageResponse:

    service = OnboardingDocumentService(db)

    return service.get_by_id(
        package_id=package_id,
    )


# ==========================================================
# CREATE / UPDATE DOCUMENT PACKAGE
# AND SEND ONBOARDING DOCUMENT EMAIL
# ==========================================================

@router.post(
    "",
    response_model=DocumentPackageResponse,
    status_code=status.HTTP_200_OK,
)
async def save_document_package(
    payload: DocumentPackageCreateRequest,
    db: Session = Depends(get_db_session),
) -> DocumentPackageResponse:

    service = OnboardingDocumentService(db)

    return await service.create_or_update(
        data=payload,
        user_id=None,
    )