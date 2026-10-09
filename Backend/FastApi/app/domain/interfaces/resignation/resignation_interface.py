from abc import ABC, abstractmethod
from typing import List, Optional

from app.infrastructure.models.resignation.resignation import (
    ResignationModel
)

from app.infrastructure.models.employee.employee import (
    EmployeeModel
)


class IResignationRepository(ABC):

    # ========================================================
    # GET ALL
    # ========================================================

    @abstractmethod
    def get_all(
        self
    ) -> List[ResignationModel]:
        pass

    # ========================================================
    # GET BY ID
    # ========================================================

    @abstractmethod
    def get_by_id(
        self,
        res_id: int
    ) -> Optional[ResignationModel]:
        pass

    # ========================================================
    # ADD
    # ========================================================

    @abstractmethod
    def add(
        self,
        resignation: ResignationModel
    ) -> ResignationModel:
        pass

    # ========================================================
    # UPDATE
    # ========================================================

    @abstractmethod
    def update(
        self,
        resignation: ResignationModel
    ) -> ResignationModel:
        pass

    # ========================================================
    # DELETE
    # ========================================================

    @abstractmethod
    def delete(
        self,
        resignation: ResignationModel
    ) -> None:
        pass

    # ========================================================
    # GET EMPLOYEE
    # ========================================================

    @abstractmethod
    def get_employee_by_id(
        self,
        emp_id: int
    ) -> Optional[EmployeeModel]:
        pass

    # ========================================================
    # SAVE CHANGES
    # ========================================================

    @abstractmethod
    def save_changes(
        self
    ) -> None:
        pass