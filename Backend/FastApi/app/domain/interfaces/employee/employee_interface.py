from abc import ABC, abstractmethod
from typing import Any, List, Optional

from app.infrastructure.models.employee.employee import EmployeeModel
from app.infrastructure.models.user.user import UserModel


class IEmployeeRepository(ABC):

    def get_active_employees(self) -> List[EmployeeModel]:
        raise NotImplementedError

    @abstractmethod
    def get_all_with_details(self) -> List[Any]:
        pass

    @abstractmethod
    def get_by_id_with_details(
        self,
        emp_id: int
    ) -> Optional[Any]:
        pass

    @abstractmethod
    def get_by_emp_code_with_details(
        self,
        emp_code: str
    ) -> Optional[Any]:
        pass

    @abstractmethod
    def get_last_employee(
        self
    ) -> Optional[EmployeeModel]:
        pass

    @abstractmethod
    def get_by_id(
        self,
        emp_id: int
    ) -> Optional[EmployeeModel]:
        pass

    @abstractmethod
    def get_user_by_username(
        self,
        username: str
    ) -> Optional[UserModel]:
        pass

    @abstractmethod
    def get_designation_by_name(
        self,
        designation_name: str
    ) -> Optional[Any]:
        pass

    @abstractmethod
    def add_employee(
        self,
        employee: EmployeeModel
    ) -> None:
        pass

    @abstractmethod
    def add_user(
        self,
        user: UserModel
    ) -> None:
        pass

    @abstractmethod
    def commit(self) -> None:
        pass

    @abstractmethod
    def flush(self) -> None:
        pass