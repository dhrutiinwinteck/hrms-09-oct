from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class EmployeeEmergencyContactRepositoryInterface(ABC):

    @abstractmethod
    def get_all(self) -> List[Any]:
        raise NotImplementedError

    @abstractmethod
    def get_by_id(
        self,
        record_id: int,
    ) -> Optional[Any]:
        raise NotImplementedError

    @abstractmethod
    def get_by_employee_id(
        self,
        emp_id: int,
    ) -> List[Any]:
        raise NotImplementedError

    @abstractmethod
    def create(
        self,
        data: Dict[str, Any],
    ) -> Any:
        raise NotImplementedError

    @abstractmethod
    def update(
        self,
        record_id: int,
        data: Dict[str, Any],
    ) -> Optional[Any]:
        raise NotImplementedError

    @abstractmethod
    def delete(
        self,
        record_id: int,
    ) -> bool:
        raise NotImplementedError