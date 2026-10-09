from typing import Optional

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.domain.interfaces.recruitment.letter_of_intent_interface import (
    LetterOfIntentSettingsInterface,
)
from app.infrastructure.models.recruitment.letter_of_intent import (
    LetterOfIntentSettingsModel,
)


class LetterOfIntentSettingsRepository(
    LetterOfIntentSettingsInterface
):
    def __init__(
        self,
        db: Session,
    ) -> None:
        self.db = db

    def get_default(
        self,
    ) -> Optional[LetterOfIntentSettingsModel]:
        return (
            self.db.query(LetterOfIntentSettingsModel)
            .filter(
                LetterOfIntentSettingsModel.setting_key
                == "default"
            )
            .first()
        )

    def create(
        self,
        model: LetterOfIntentSettingsModel,
    ) -> LetterOfIntentSettingsModel:
        try:
            self.db.add(model)
            self.db.commit()
            self.db.refresh(model)

            return model

        except SQLAlchemyError:
            self.db.rollback()
            raise

    def update(
        self,
        model: LetterOfIntentSettingsModel,
    ) -> LetterOfIntentSettingsModel:
        try:
            self.db.add(model)
            self.db.commit()
            self.db.refresh(model)

            return model

        except SQLAlchemyError:
            self.db.rollback()
            raise