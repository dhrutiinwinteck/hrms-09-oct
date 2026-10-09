from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from app.infrastructure.models.onboarding.joining_form import JoiningForm


class IJoiningFormRepository(ABC):

    @abstractmethod
    def get_by_application_id(
        self,
        application_id: int,
    ) -> Optional[JoiningForm]:
        pass

    @abstractmethod
    def get_all(
        self,
    ) -> List[JoiningForm]:
        pass

    @abstractmethod
    def create_or_update(
        self,
        application_data: Dict[str, Any],
        joining_data: Dict[str, Any],
        work_experiences: List[Dict[str, Any]],
        education: List[Dict[str, Any]],
        documents: List[Dict[str, Any]],
        references: List[Dict[str, Any]],
    ) -> JoiningForm:
        pass