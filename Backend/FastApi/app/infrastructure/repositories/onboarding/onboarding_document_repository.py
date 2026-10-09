from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.application.dtos.onboarding.document_package import (
    DocumentPackageCreateRequest,
)
from app.domain.interfaces.onboarding.onboarding_document_interface import (
    OnboardingDocumentInterface,
)
from app.infrastructure.models.onboarding.onboarding_document_package import (
    OnboardingDocumentPackage,
)
from app.infrastructure.models.onboarding.onboarding_document_item import (
    OnboardingDocumentItem,
)


class OnboardingDocumentRepository(OnboardingDocumentInterface):

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_application_id(
        self,
        job_application_id: int,
    ) -> Optional[OnboardingDocumentPackage]:

        statement = (
            select(OnboardingDocumentPackage)
            .where(
                OnboardingDocumentPackage.job_application_id
                == job_application_id
            )
        )

        return self.db.scalar(statement)

    def get_by_id(
        self,
        package_id: int,
    ) -> Optional[OnboardingDocumentPackage]:

        statement = (
            select(OnboardingDocumentPackage)
            .where(OnboardingDocumentPackage.id == package_id)
        )

        return self.db.scalar(statement)

    def create(
        self,
        data: DocumentPackageCreateRequest,
        user_id: Optional[int],
    ) -> OnboardingDocumentPackage:

        package = OnboardingDocumentPackage(
            **data.model_dump(),
            created_by=user_id,
            updated_by=user_id,
        )

        self.db.add(package)
        self.db.flush()
        self.db.refresh(package)

        return package

    def update(
        self,
        package: OnboardingDocumentPackage,
        data: DocumentPackageCreateRequest,
        user_id: Optional[int],
    ) -> OnboardingDocumentPackage:

        values = data.model_dump(exclude_unset=True)

        for field_name, value in values.items():
            setattr(package, field_name, value)

        package.updated_by = user_id

        self.db.flush()
        self.db.refresh(package)

        return package