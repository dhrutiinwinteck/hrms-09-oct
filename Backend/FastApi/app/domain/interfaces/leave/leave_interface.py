from abc import ABC, abstractmethod
from typing import Optional, List

from app.infrastructure.models.leave.leave_log import (
    LeaveLogModel,
)

from app.infrastructure.models.leave.leave_balance import (
    LeaveBalanceModel,
)

from app.infrastructure.models.leave.leave_setting import (
    LeaveSettingModel,
)

from app.infrastructure.models.employee.employee import (
    EmployeeModel,
)


class ILeaveRepository(ABC):

    # ========================================================
    # EMPLOYEE
    # ========================================================

    @abstractmethod
    def get_employee_by_id(
        self,
        emp_id: int,
    ) -> Optional[EmployeeModel]:
        pass

    @abstractmethod
    def get_employee_by_code(
        self,
        emp_code: str,
    ) -> Optional[EmployeeModel]:
        pass

    @abstractmethod
    def get_active_employees(
        self,
    ) -> List[EmployeeModel]:
        pass

    @abstractmethod
    def get_all_employees(
        self,
    ) -> List[EmployeeModel]:
        pass

    # ========================================================
    # BALANCE
    # ========================================================

    @abstractmethod
    def get_balance_by_emp_code(
        self,
        emp_code: str,
        year: Optional[str] = None,
    ) -> Optional[LeaveBalanceModel]:
        pass

    @abstractmethod
    def get_balance_by_id(
        self,
        balance_id: int,
    ) -> Optional[LeaveBalanceModel]:
        pass

    @abstractmethod
    def get_all_balances(
        self,
        year: Optional[str] = None,
    ) -> List[LeaveBalanceModel]:
        pass

    @abstractmethod
    def add_leave_balance(
        self,
        balance: LeaveBalanceModel,
    ) -> None:
        pass

    @abstractmethod
    def get_leave_setting(self) -> Optional[LeaveSettingModel]:
        pass

    @abstractmethod
    def update_leave_setting(self, setting: LeaveSettingModel) -> None:
        pass

    # ========================================================
    # LEAVE
    # ========================================================

    @abstractmethod
    def get_leave_log_by_id(
        self,
        leave_id: int,
    ) -> Optional[LeaveLogModel]:
        pass

    @abstractmethod
    def get_all_leave_logs(
        self,
        emp_code: Optional[str] = None,
        status: Optional[int] = None,
        leave_type: Optional[str] = None,
    ) -> List[LeaveLogModel]:
        pass

    @abstractmethod
    def add_leave_log(
        self,
        leave: LeaveLogModel,
    ) -> None:
        pass

    @abstractmethod
    def delete_leave_log(self, leave: LeaveLogModel) -> None:
        pass

    # ========================================================
    # TRANSACTION
    # ========================================================

    @abstractmethod
    def commit(self) -> None:
        pass

    @abstractmethod
    def rollback(self) -> None:
        pass