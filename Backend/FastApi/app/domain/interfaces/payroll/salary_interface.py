from abc import ABC, abstractmethod
from typing import Optional

from app.infrastructure.models.payroll.salary import SalaryModel
from app.infrastructure.models.employee.bank import BankModel


class ISalaryRepository(ABC):

    @abstractmethod
    def get_salary_by_emp_id(
        self,
        emp_id: int
    ) -> Optional[SalaryModel]:
        pass

    @abstractmethod
    def get_bank_by_emp_id(
        self,
        emp_id: int
    ) -> Optional[BankModel]:
        pass

    @abstractmethod
    def add_salary(
        self,
        salary: SalaryModel
    ) -> None:
        pass

    @abstractmethod
    def add_bank(
        self,
        bank: BankModel
    ) -> None:
        pass

    @abstractmethod
    def save_changes(self) -> None:
        pass