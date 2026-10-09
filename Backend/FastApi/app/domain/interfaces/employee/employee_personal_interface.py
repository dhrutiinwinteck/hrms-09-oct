from abc import ABC, abstractmethod
from typing import Optional

from app.infrastructure.models.employee.employee_personal import (
    EmployeePersonalModel,
)


class IEmployeePersonalRepository(ABC):

    # -----------------------------------------
    # GET ALL
    # -----------------------------------------

    @abstractmethod
    def get_all(
        self,
    ) -> list[EmployeePersonalModel]:
        pass

    # -----------------------------------------
    # GET BY EMPLOYEE ID
    # -----------------------------------------

    @abstractmethod
    def get_by_emp_id(
        self,
        emp_id: int,
    ) -> Optional[EmployeePersonalModel]:
        pass

    # -----------------------------------------
    # CREATE
    # -----------------------------------------

    @abstractmethod
    def add(
        self,
        personal_details: EmployeePersonalModel,
    ) -> EmployeePersonalModel:
        pass

    # -----------------------------------------
    # UPDATE
    # -----------------------------------------

    @abstractmethod
    def update(
        self,
        personal_details: EmployeePersonalModel,
        update_data: dict,
    ) -> EmployeePersonalModel:
        pass

    # -----------------------------------------
    # DELETE
    # -----------------------------------------

    @abstractmethod
    def delete(
        self,
        personal_details: EmployeePersonalModel,
    ) -> None:
        pass

    # -----------------------------------------
    # COMMIT
    # -----------------------------------------

    @abstractmethod
    def commit(self) -> None:
        pass

    # -----------------------------------------
    # ROLLBACK
    # -----------------------------------------

    @abstractmethod
    def rollback(self) -> None:
        pass

    # -----------------------------------------
    # REFRESH
    # -----------------------------------------

    @abstractmethod
    def refresh(
        self,
        personal_details: EmployeePersonalModel,
    ) -> None:
        pass