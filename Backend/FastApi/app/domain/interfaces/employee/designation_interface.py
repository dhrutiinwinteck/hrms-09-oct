from abc import ABC, abstractmethod
from typing import Any, List, Optional

from app.infrastructure.models.employee.designation import DesignationModel


class IDesignationRepository(ABC):

    @abstractmethod
    def get_all_with_department(self) -> List[Any]:
        """Returns designations joined with department name."""
        pass

    @abstractmethod
    def get_by_id(
        self,
        desg_id: int
    ) -> Optional[DesignationModel]:
        pass

    @abstractmethod
    def add(
        self,
        designation: DesignationModel
    ) -> DesignationModel:
        pass

    @abstractmethod
    def update(
        self,
        designation: DesignationModel
    ) -> DesignationModel:
        pass

    @abstractmethod
    def delete(
        self,
        designation: DesignationModel
    ) -> None:
        pass