from abc import ABC, abstractmethod
from typing import List, Optional

from app.application.dtos.employee.employee_familyinfo import (
    EmployeeFamilyInfoCreate,
    EmployeeFamilyInfoResponse,
    EmployeeFamilyInfoUpdate,
)


class IEmployeeFamilyInfoService(ABC):

    @abstractmethod
    def create(
        self,
        request: EmployeeFamilyInfoCreate,
        current_user: Optional[str],
    ) -> EmployeeFamilyInfoResponse:
        raise NotImplementedError

    @abstractmethod
    def get_by_id(
        self,
        family_id: int,
    ) -> Optional[EmployeeFamilyInfoResponse]:
        raise NotImplementedError

    @abstractmethod
    def get_by_employee_id(
        self,
        emp_id: int,
    ) -> List[EmployeeFamilyInfoResponse]:
        raise NotImplementedError

    @abstractmethod
    def update(
        self,
        family_id: int,
        request: EmployeeFamilyInfoUpdate,
        current_user: Optional[str],
    ) -> Optional[EmployeeFamilyInfoResponse]:
        raise NotImplementedError

    @abstractmethod
    def delete(
        self,
        family_id: int,
    ) -> bool:
        raise NotImplementedError