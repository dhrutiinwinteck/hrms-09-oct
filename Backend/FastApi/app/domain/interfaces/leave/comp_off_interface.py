from abc import ABC, abstractmethod
from datetime import date
from typing import List, Optional

from app.infrastructure.models.employee.employee import (
    EmployeeModel,
)

from app.infrastructure.models.leave.comp_off_request import (
    CompOffRequestModel,
)

from app.infrastructure.models.leave.comp_off_ledger import (
    CompOffLedgerModel,
)

from app.infrastructure.models.leave.leave_balance import (
    LeaveBalanceModel,
)


class ICompOffRepository(ABC):

    # ========================================================
    # EMPLOYEE
    # ========================================================

    @abstractmethod
    def get_employee_by_code(
        self,
        emp_code: str,
    ) -> Optional[EmployeeModel]:
        pass

    # ========================================================
    # REQUEST
    # ========================================================

    @abstractmethod
    def add_request(
        self,
        request: CompOffRequestModel,
    ) -> None:
        pass

    @abstractmethod
    def get_request_by_id(
        self,
        request_id: int,
    ) -> Optional[CompOffRequestModel]:
        pass

    @abstractmethod
    def get_request_for_update(
        self,
        request_id: int,
    ) -> Optional[CompOffRequestModel]:
        pass

    @abstractmethod
    def get_existing_request(
        self,
        emp_id: int,
        worked_date: date,
    ) -> Optional[CompOffRequestModel]:
        pass

    @abstractmethod
    def get_requests(
        self,
        emp_id: Optional[int] = None,
        status: Optional[str] = None,
        day_type: Optional[str] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
    ) -> List[CompOffRequestModel]:
        pass

    # ========================================================
    # BALANCE
    # ========================================================

    @abstractmethod
    def get_balance_for_update(
        self,
        emp_code: str,
        year: str,
    ) -> Optional[LeaveBalanceModel]:
        pass

    # ========================================================
    # LEDGER
    # ========================================================

    @abstractmethod
    def add_ledger_entry(
        self,
        ledger: CompOffLedgerModel,
    ) -> None:
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

    @abstractmethod
    def refresh(
        self,
        entity,
    ) -> None:
        pass