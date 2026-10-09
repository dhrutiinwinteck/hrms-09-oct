from typing import Optional, List

from sqlalchemy.orm import Session

from app.domain.interfaces.leave.leave_interface import (
    ILeaveRepository,
)

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


class LeaveRepository(ILeaveRepository):

    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    # ========================================================
    # EMPLOYEE
    # ========================================================

    def get_employee_by_id(
        self,
        emp_id: int,
    ) -> Optional[EmployeeModel]:

        return (
            self.db.query(EmployeeModel)
            .filter(
                EmployeeModel.id == emp_id
            )
            .first()
        )

    def get_employee_by_code(
        self,
        emp_code: str,
    ) -> Optional[EmployeeModel]:

        return (
            self.db.query(EmployeeModel)
            .filter(
                EmployeeModel.emp_code == emp_code
            )
            .first()
        )

    def get_active_employees(
        self,
    ) -> List[EmployeeModel]:

        return (
            self.db.query(EmployeeModel)
            .filter(
                EmployeeModel.is_remove == 0
            )
            .order_by(
                EmployeeModel.first_name,
                EmployeeModel.last_name,
            )
            .all()
        )

    def get_all_employees(
        self,
    ) -> List[EmployeeModel]:

        return (
            self.db.query(EmployeeModel)
            .order_by(
                EmployeeModel.first_name,
                EmployeeModel.last_name,
            )
            .all()
        )

    # ========================================================
    # BALANCE
    # ========================================================

    def get_balance_by_emp_code(
        self,
        emp_code: str,
        year: Optional[str] = None,
    ) -> Optional[LeaveBalanceModel]:

        query = (
            self.db.query(
                LeaveBalanceModel
            )
            .filter(
                LeaveBalanceModel.emp_id
                == emp_code
            )
        )

        if year:

            query = query.filter(
                LeaveBalanceModel.year
                == year
            )

        return query.first()

    def get_balance_by_id(
        self,
        balance_id: int,
    ) -> Optional[LeaveBalanceModel]:

        return (
            self.db.query(
                LeaveBalanceModel
            )
            .filter(
                LeaveBalanceModel.id
                == balance_id
            )
            .first()
        )

    def get_all_balances(
        self,
        year: Optional[str] = None,
    ) -> List[LeaveBalanceModel]:

        query = self.db.query(
            LeaveBalanceModel
        )

        if year:

            query = query.filter(
                LeaveBalanceModel.year
                == year
            )

        return (
            query
            .order_by(
                LeaveBalanceModel.emp_id
            )
            .all()
        )

    def add_leave_balance(
        self,
        balance: LeaveBalanceModel,
    ) -> None:

        self.db.add(balance)

    def get_leave_setting(self) -> Optional[LeaveSettingModel]:
        return (
            self.db.query(LeaveSettingModel)
            .order_by(LeaveSettingModel.id.asc())
            .first()
        )

    def update_leave_setting(self, setting: LeaveSettingModel) -> None:
        self.db.add(setting)

    # ========================================================
    # LEAVE LOG
    # ========================================================

    def get_leave_log_by_id(
        self,
        leave_id: int,
    ) -> Optional[LeaveLogModel]:

        return (
            self.db.query(
                LeaveLogModel
            )
            .filter(
                LeaveLogModel.id
                == leave_id
            )
            .first()
        )

    def get_all_leave_logs(
        self,
        emp_code: Optional[str] = None,
        status: Optional[int] = None,
        leave_type: Optional[str] = None,
    ) -> List[LeaveLogModel]:

        query = self.db.query(
            LeaveLogModel
        )

        if emp_code:

            query = query.filter(
                LeaveLogModel.emp_code
                == emp_code
            )

        if status is not None:

            query = query.filter(
                LeaveLogModel.status
                == status
            )

        if leave_type:

            query = query.filter(
                LeaveLogModel.leave_type
                == leave_type
            )

        return (
            query
            .order_by(
                LeaveLogModel.createdon.desc()
            )
            .all()
        )

    def add_leave_log(
        self,
        leave: LeaveLogModel,
    ) -> None:

        self.db.add(leave)
        self.db.flush()

    def delete_leave_log(self, leave: LeaveLogModel) -> None:
        self.db.delete(leave)

    # ========================================================
    # TRANSACTION
    # ========================================================

    def commit(self) -> None:

        self.db.commit()

    def rollback(self) -> None:

        self.db.rollback()