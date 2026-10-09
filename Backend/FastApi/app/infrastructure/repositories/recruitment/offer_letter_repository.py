from __future__ import annotations

from typing import Optional

from sqlalchemy.orm import Session

from app.domain.interfaces.recruitment.offer_letter_interface import (
    IOfferLetterRepository,
)
from app.infrastructure.models.recruitment.offer_letter import (
    OfferLetterSettingsModel,
)


class OfferLetterRepository(IOfferLetterRepository):

    def __init__(
        self,
        db: Session,
    ) -> None:

        self._db = db

    def create(
        self,
        entity: OfferLetterSettingsModel,
    ) -> OfferLetterSettingsModel:

        self._db.add(entity)

        self._db.commit()

        self._db.refresh(entity)

        return entity

    def get_by_id(
        self,
        offer_letter_id: int,
    ) -> Optional[OfferLetterSettingsModel]:

        return (
            self._db.query(
                OfferLetterSettingsModel,
            )
            .filter(
                OfferLetterSettingsModel.id
                == offer_letter_id,
            )
            .first()
        )

    def get_active(
        self,
    ) -> Optional[OfferLetterSettingsModel]:

        return (
            self._db.query(
                OfferLetterSettingsModel,
            )
            .filter(
                OfferLetterSettingsModel.is_active.is_(True),
            )
            .order_by(
                OfferLetterSettingsModel.id.desc(),
            )
            .first()
        )

    def get_all(
        self,
    ) -> list[OfferLetterSettingsModel]:

        return (
            self._db.query(
                OfferLetterSettingsModel,
            )
            .order_by(
                OfferLetterSettingsModel.id.desc(),
            )
            .all()
        )

    def update(
        self,
        entity: OfferLetterSettingsModel,
    ) -> OfferLetterSettingsModel:

        self._db.add(entity)

        self._db.commit()

        self._db.refresh(entity)

        return entity

    def delete(
        self,
        entity: OfferLetterSettingsModel,
    ) -> None:

        self._db.delete(entity)

        self._db.commit()

    def rollback(self) -> None:

        self._db.rollback()