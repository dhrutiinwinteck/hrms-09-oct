from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional

from app.infrastructure.models.recruitment.offer_letter import (
    OfferLetterSettingsModel,
)


class IOfferLetterRepository(ABC):

    @abstractmethod
    def create(
        self,
        entity: OfferLetterSettingsModel,
    ) -> OfferLetterSettingsModel:
        raise NotImplementedError

    @abstractmethod
    def get_by_id(
        self,
        offer_letter_id: int,
    ) -> Optional[OfferLetterSettingsModel]:
        raise NotImplementedError

    @abstractmethod
    def get_active(
        self,
    ) -> Optional[OfferLetterSettingsModel]:
        raise NotImplementedError

    @abstractmethod
    def get_all(
        self,
    ) -> list[OfferLetterSettingsModel]:
        raise NotImplementedError

    @abstractmethod
    def update(
        self,
        entity: OfferLetterSettingsModel,
    ) -> OfferLetterSettingsModel:
        raise NotImplementedError

    @abstractmethod
    def delete(
        self,
        entity: OfferLetterSettingsModel,
    ) -> None:
        raise NotImplementedError

    @abstractmethod
    def rollback(self) -> None:
        raise NotImplementedError