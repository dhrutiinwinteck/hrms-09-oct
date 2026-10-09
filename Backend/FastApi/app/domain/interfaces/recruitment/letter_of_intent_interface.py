from abc import ABC, abstractmethod
from typing import Optional

from app.infrastructure.models.recruitment.letter_of_intent import (
    LetterOfIntentSettingsModel,
)


class LetterOfIntentSettingsInterface(ABC):

    @abstractmethod
    def get_default(
        self,
    ) -> Optional[LetterOfIntentSettingsModel]:
        raise NotImplementedError

    @abstractmethod
    def create(
        self,
        model: LetterOfIntentSettingsModel,
    ) -> LetterOfIntentSettingsModel:
        raise NotImplementedError

    @abstractmethod
    def update(
        self,
        model: LetterOfIntentSettingsModel,
    ) -> LetterOfIntentSettingsModel:
        raise NotImplementedError