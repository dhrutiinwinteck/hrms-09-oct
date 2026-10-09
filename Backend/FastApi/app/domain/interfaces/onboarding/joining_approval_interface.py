from abc import ABC, abstractmethod
from typing import List, Optional

from app.infrastructure.models.onboarding.joining_approval import JoiningApproval


class IJoiningApprovalRepository(ABC):

    @abstractmethod
    def get_by_id(
        self,
        application_id: int,
    ) -> Optional[JoiningApproval]:
        pass

    @abstractmethod
    def update_status(
        self,
        application_id: int,
        status: str,
    ) -> Optional[JoiningApproval]:
        pass

    @abstractmethod
    def get_all(
        self,
    ) -> List[JoiningApproval]:
        pass