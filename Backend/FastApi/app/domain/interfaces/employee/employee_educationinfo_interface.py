from abc import ABC, abstractmethod
from typing import List, Optional

from app.infrastructure.models.employee.employee_educationinfo import (
    EmployeeEducationInfoModel,
)


class IEmployeeEducationInfoRepository(ABC):

    @abstractmethod
    def get_by_id(
        self,
        education_id: int,
    ) -> Optional[EmployeeEducationInfoModel]:
        pass

    @abstractmethod
    def get_by_emp_id(
        self,
        emp_id: int,
    ) -> List[EmployeeEducationInfoModel]:
        pass

    @abstractmethod
    def add(
        self,
        education_details: EmployeeEducationInfoModel,
    ) -> EmployeeEducationInfoModel:
        pass

    @abstractmethod
    def update(
        self,
        education_details: EmployeeEducationInfoModel,
        update_data: dict,
    ) -> EmployeeEducationInfoModel:
        pass

    @abstractmethod
    def delete(
        self,
        education_details: EmployeeEducationInfoModel,
    ) -> None:
        pass

    @abstractmethod
    def commit(self) -> None:
        pass

    @abstractmethod
    def rollback(self) -> None:
        pass

    @abstractmethod
    def refresh(
        self,
        education_details: EmployeeEducationInfoModel,
    ) -> None:
        pass