from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional

from app.application.dtos.onboarding.document_package import (
    DocumentPackageCreateRequest,
)
from app.infrastructure.models.onboarding.onboarding_document_package import (
    OnboardingDocumentPackage,
)


class OnboardingDocumentInterface(ABC):

    @abstractmethod
    def get_by_application_id(
        self,
        job_application_id: int,
    ) -> Optional[OnboardingDocumentPackage]:
        raise NotImplementedError

    @abstractmethod
    def get_by_id(
        self,
        package_id: int,
    ) -> Optional[OnboardingDocumentPackage]:
        raise NotImplementedError

    @abstractmethod
    def create(
        self,
        data: DocumentPackageCreateRequest,
        user_id: Optional[int],
    ) -> OnboardingDocumentPackage:
        raise NotImplementedError

    @abstractmethod
    def update(
        self,
        package: OnboardingDocumentPackage,
        data: DocumentPackageCreateRequest,
        user_id: Optional[int],
    ) -> OnboardingDocumentPackage:
        raise NotImplementedError