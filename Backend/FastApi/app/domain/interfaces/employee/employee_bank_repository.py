from abc import ABC, abstractmethod
from typing import List, Optional

from app.infrastructure.models.employee.employee_bank import EmployeeBank


class EmployeeBankRepositoryInterface(ABC):

    @abstractmethod
    def create(self, bank_data: dict) -> EmployeeBank:
        pass

    @abstractmethod
    def get_by_id(self, bank_id: int) -> Optional[EmployeeBank]:
        pass

    @abstractmethod
    def get_by_employee_id(self, emp_id: int) -> List[EmployeeBank]:
        pass

    @abstractmethod
    def update(
        self,
        bank_id: int,
        bank_data: dict,
    ) -> Optional[EmployeeBank]:
        pass

    @abstractmethod
    def delete(self, bank_id: int) -> bool:
        pass