from abc import ABC, abstractmethod
from typing import Optional

from app.application.dtos.employee.employee_salary import (
    EmployeeSalaryCreate,
    EmployeeSalaryUpdate,
)
from app.infrastructure.models.employee.employee_salary import (
    EmployeeSalary,
)


class IEmployeeSalaryService(ABC):

    @abstractmethod
    def create(
        self,
        data: EmployeeSalaryCreate
    ) -> EmployeeSalary:
        raise NotImplementedError

    @abstractmethod
    def get_by_id(
        self,
        salary_id: int
    ) -> Optional[EmployeeSalary]:
        raise NotImplementedError

    @abstractmethod
    def get_by_employee_id(
        self,
        emp_id: int
    ) -> Optional[EmployeeSalary]:
        raise NotImplementedError

    @abstractmethod
    def update(
        self,
        salary_id: int,
        data: EmployeeSalaryUpdate
    ) -> Optional[EmployeeSalary]:
        raise NotImplementedError

    @abstractmethod
    def delete(
        self,
        salary_id: int
    ) -> bool:
        raise NotImplementedError