from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Optional


class EmployeeExperienceInfoInterface(ABC):

    @abstractmethod
    def create(
        self,
        data: dict[str, Any],
    ) -> Any:
        raise NotImplementedError

    @abstractmethod
    def get_by_employee_id(
        self,
        emp_id: int,
    ) -> list[Any]:
        raise NotImplementedError

    @abstractmethod
    def get_by_id(
        self,
        experience_id: int,
    ) -> Optional[Any]:
        raise NotImplementedError

    @abstractmethod
    def update(
        self,
        experience_id: int,
        data: dict[str, Any],
    ) -> Optional[Any]:
        raise NotImplementedError

    @abstractmethod
    def delete(
        self,
        experience_id: int,
    ) -> bool:
        raise NotImplementedError