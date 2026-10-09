from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.application.dtos.recruitment.offer_letter import (
    OfferLetterCreateDto,
    OfferLetterUpdateDto,
)
from app.infrastructure.models.recruitment.offer_letter import (
    OfferLetterSettingsModel,
)
from app.infrastructure.repositories.recruitment.offer_letter_repository import (
    OfferLetterRepository,
)
from app.infrastructure.storage.offer_letter_file_storage import (
    OfferLetterFileStorage,
)


class OfferLetterService:

    def __init__(
        self,
        db: Session,
    ) -> None:
        self._repository = OfferLetterRepository(db)
        self._file_storage = OfferLetterFileStorage()

    def create(
        self,
        request: OfferLetterCreateDto,
        current_user_id: int,
    ) -> OfferLetterSettingsModel:

        existing = self._repository.get_active()

        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "An active Offer Letter template already exists. "
                    "Use the update endpoint to modify it."
                ),
            )

        entity = OfferLetterSettingsModel(
            **request.model_dump(),
            created_by=current_user_id,
            created_on=datetime.now(timezone.utc),
            is_active=True,
        )

        try:
            return self._repository.create(entity)

        except SQLAlchemyError as exc:
            self._repository.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create Offer Letter template.",
            ) from exc

    def get_by_id(
        self,
        offer_letter_id: int,
    ) -> OfferLetterSettingsModel:

        entity = self._repository.get_by_id(
            offer_letter_id,
        )

        if entity is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Offer Letter template was not found.",
            )

        return entity

    def get_active(
        self,
    ) -> Optional[OfferLetterSettingsModel]:

        """
        Returns the active Offer Letter template.

        If no template exists yet, return None instead
        of raising 404. This allows the frontend to treat
        the first-load state as an empty configuration.
        """

        return self._repository.get_active()

    def get_all(
        self,
    ) -> list[OfferLetterSettingsModel]:

        return self._repository.get_all()

    def update(
        self,
        offer_letter_id: int,
        request: OfferLetterUpdateDto,
        current_user_id: int,
    ) -> OfferLetterSettingsModel:

        entity = self.get_by_id(
            offer_letter_id,
        )

        updates: dict[str, Any] = request.model_dump(
            exclude_unset=True,
        )

        if not updates:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields were provided for update.",
            )

        old_logo = entity.company_logo

        for field_name, value in updates.items():
            setattr(
                entity,
                field_name,
                value,
            )

        entity.modified_by = current_user_id

        entity.modified_on = datetime.now(
            timezone.utc,
        )

        try:
            updated_entity = self._repository.update(
                entity,
            )

        except SQLAlchemyError as exc:
            self._repository.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update Offer Letter template.",
            ) from exc

        if (
            "company_logo" in updates
            and old_logo
            and old_logo != entity.company_logo
        ):
            self._file_storage.delete_logo(
                old_logo,
            )

        return updated_entity

    async def update_logo(
        self,
        offer_letter_id: int,
        file: UploadFile,
        current_user_id: int,
    ) -> OfferLetterSettingsModel:

        entity = self.get_by_id(
            offer_letter_id,
        )

        old_logo = entity.company_logo

        new_logo = await self._file_storage.save_company_logo(
            file,
        )

        entity.company_logo = new_logo

        entity.modified_by = current_user_id

        entity.modified_on = datetime.now(
            timezone.utc,
        )

        try:
            updated_entity = self._repository.update(
                entity,
            )

        except SQLAlchemyError as exc:
            self._repository.rollback()

            self._file_storage.delete_logo(
                new_logo,
            )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save Offer Letter logo.",
            ) from exc

        if (
            old_logo
            and old_logo != new_logo
        ):
            self._file_storage.delete_logo(
                old_logo,
            )

        return updated_entity

    async def update_signature(
        self,
        offer_letter_id: int,
        file: UploadFile,
        current_user_id: int,
    ) -> OfferLetterSettingsModel:

        entity = self.get_by_id(
            offer_letter_id,
        )

        old_signature = entity.signature_file_path

        new_signature = await self._file_storage.save_signature(
            file,
        )

        entity.signature_file_path = new_signature
        entity.signature_file_name = file.filename

        entity.modified_by = current_user_id
        entity.modified_on = datetime.now(
            timezone.utc,
        )

        try:
            updated_entity = self._repository.update(
                entity,
            )

        except SQLAlchemyError as exc:
            self._repository.rollback()

            self._file_storage.delete_file(
                new_signature,
            )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save Offer Letter signature.",
            ) from exc

        if (
            old_signature
            and old_signature != new_signature
        ):
            self._file_storage.delete_file(
                old_signature,
            )

        return updated_entity

    async def update_stamp(
        self,
        offer_letter_id: int,
        file: UploadFile,
        current_user_id: int,
    ) -> OfferLetterSettingsModel:

        entity = self.get_by_id(
            offer_letter_id,
        )

        old_stamp = entity.stamp_file_path

        new_stamp = await self._file_storage.save_stamp(
            file,
        )

        entity.stamp_file_path = new_stamp
        entity.stamp_file_name = file.filename

        entity.modified_by = current_user_id
        entity.modified_on = datetime.now(
            timezone.utc,
        )

        try:
            updated_entity = self._repository.update(
                entity,
            )

        except SQLAlchemyError as exc:
            self._repository.rollback()

            self._file_storage.delete_file(
                new_stamp,
            )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save Offer Letter stamp.",
            ) from exc

        if (
            old_stamp
            and old_stamp != new_stamp
        ):
            self._file_storage.delete_file(
                old_stamp,
            )

        return updated_entity

    def delete(
        self,
        offer_letter_id: int,
    ) -> None:

        entity = self.get_by_id(
            offer_letter_id,
        )

        old_logo = entity.company_logo

        try:
            self._repository.delete(
                entity,
            )

        except SQLAlchemyError as exc:
            self._repository.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete Offer Letter template.",
            ) from exc

        if old_logo:
            self._file_storage.delete_logo(
                old_logo,
            )