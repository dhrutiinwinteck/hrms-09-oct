from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from typing import List

from app.domain.interfaces.dashboard.dashboard_interface import (
    IDashboardRepository,
)

from app.infrastructure.models.employee.employee import (
    EmployeeModel,
)

from app.infrastructure.models.attendance.timesheet import (
    TimesheetModel,
)

from app.infrastructure.models.leave.leave_log import (
    LeaveLogModel,
)


class DashboardRepository(IDashboardRepository):

    def __init__(self, db: Session):
        self.db = db

    def get_total_active_employees(self) -> int:
        return (
            self.db.query(EmployeeModel)
            .filter(
                EmployeeModel.is_remove == 0
            )
            .count()
        )

    def get_present_today_count(
        self,
        today: date,
    ) -> int:
        return (
            self.db.query(TimesheetModel)
            .filter(
                TimesheetModel.date == today,
                TimesheetModel.punch_in != None,
            )
            .count()
        )

    def get_on_leave_today_count(
        self,
        today: date,
    ) -> int:
        return (
            self.db.query(LeaveLogModel)
            .filter(
                LeaveLogModel.leave_from <= today,
                LeaveLogModel.leave_to >= today,
                LeaveLogModel.status == 1,  # Approved
            )
            .count()
        )

    def get_birthdays_today(
        self,
        month: int,
        day: int,
    ) -> List[EmployeeModel]:

        return (
            self.db.query(EmployeeModel)
            .filter(
                EmployeeModel.is_remove == 0,
                func.extract(
                    "month",
                    EmployeeModel.doj,
                ) == month,
                func.extract(
                    "day",
                    EmployeeModel.doj,
                ) == day,
            )
            .all()
        )