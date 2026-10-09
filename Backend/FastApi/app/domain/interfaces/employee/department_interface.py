from abc import ABC, abstractmethod
from typing import List, Optional

from app.infrastructure.models.employee.department import DepartmentModel


class IDepartmentRepository(ABC):

    @abstractmethod
    def get_all(self) -> List[DepartmentModel]:
        pass

    @abstractmethod
    def get_by_id(
        self,
        dept_id: int
    ) -> Optional[DepartmentModel]:
        pass

    @abstractmethod
    def add(
        self,
        department: DepartmentModel
    ) -> DepartmentModel:
        pass

    @abstractmethod
    def update(
        self,
        department: DepartmentModel
    ) -> DepartmentModel:
        pass

    @abstractmethod
    def delete(
        self,
        department: DepartmentModel
    ) -> None:
        pass