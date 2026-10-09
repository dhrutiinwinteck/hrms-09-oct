from abc import ABC, abstractmethod
from datetime import date
from typing import List, Optional, Tuple

from app.infrastructure.models.attendance.timesheet import TimesheetModel
from app.infrastructure.models.attendance.timesheet_log import TimesheetLogModel


class IAttendanceRepository(ABC):

    @abstractmethod
    def get_all(
        self,
        page: int = 1,
        page_size: int = 50
    ) -> Tuple[List[TimesheetModel], int]:
        pass

    @abstractmethod
    def get_by_id(
        self,
        attendance_id: int
    ) -> Optional[TimesheetModel]:
        pass

    @abstractmethod
    def get_today_record(
        self,
        emp_id: int,
        today: date
    ) -> Optional[TimesheetModel]:
        pass

    @abstractmethod
    def get_active_session(
        self,
        emp_id: int
    ) -> Optional[TimesheetModel]:
        pass

    @abstractmethod
    def add_timesheet(
        self,
        timesheet: TimesheetModel
    ) -> TimesheetModel:
        pass

    @abstractmethod
    def add_log(
        self,
        log: TimesheetLogModel
    ) -> None:
        pass

    @abstractmethod
    def delete_timesheet(
        self,
        timesheet: TimesheetModel
    ) -> None:
        pass

    @abstractmethod
    def delete_logs_by_date(
        self,
        emp_id: int,
        log_date: date
    ) -> None:
        pass

    @abstractmethod
    def commit(self) -> None:
        pass

    @abstractmethod
    def rollback(self) -> None:
        pass

    @abstractmethod
    def execute_accrual_proc(self) -> None:
        pass






