from sqlalchemy.orm import Session
from sqlalchemy import func, text

from typing import List, Optional, Tuple

from datetime import date

from app.domain.interfaces.attendance.attendance_interface import (
    IAttendanceRepository,
)

from app.infrastructure.models.attendance.timesheet import (
    TimesheetModel,
)

from app.infrastructure.models.attendance.timesheet_log import (
    TimesheetLogModel,
)


class AttendanceRepository(IAttendanceRepository):

    def __init__(self, db: Session):
        self.db = db

    # ============================================================
    # GET PAGINATED ATTENDANCE
    # ============================================================

    def get_all(
        self,
        page: int = 1,
        page_size: int = 50,
    ) -> Tuple[List[TimesheetModel], int]:

        offset = (page - 1) * page_size

        query = (
            self.db.query(TimesheetModel)
            .order_by(
                TimesheetModel.date.desc(),
                TimesheetModel.id.desc(),
            )
        )

        total_records = query.count()

        records = (
            query
            .offset(offset)
            .limit(page_size)
            .all()
        )

        return records, total_records

    # ============================================================
    # GET TODAY'S ACTIVE PUNCH-IN
    # ============================================================
    #
    # IMPORTANT:
    #
    # This does NOT mean:
    #
    #     "Does any attendance row exist today?"
    #
    # It means:
    #
    #     "Does an OPEN attendance session exist today?"
    #
    # Therefore:
    #
    # punch_out IS NULL      -> still punched in
    # punch_out IS NOT NULL  -> session completed
    #
    # ============================================================

    def get_today_record(
        self,
        emp_id: int,
        today: date,
    ) -> Optional[TimesheetModel]:

        return (
            self.db.query(TimesheetModel)
            .filter(
                TimesheetModel.emp_id == emp_id,
                TimesheetModel.date == today,
                TimesheetModel.punch_out.is_(None),
            )
            .order_by(
                TimesheetModel.id.desc()
            )
            .first()
        )

    # ============================================================
    # GET ACTIVE SESSION
    # ============================================================

    def get_active_session(
        self,
        emp_id: int,
    ) -> Optional[TimesheetModel]:

        return (
            self.db.query(TimesheetModel)
            .filter(
                TimesheetModel.emp_id == emp_id,
                TimesheetModel.punch_out.is_(None),
            )
            .order_by(
                TimesheetModel.id.desc()
            )
            .first()
        )

    # ============================================================
    # GET RECORD BY ID
    # ============================================================

    def get_by_id(
        self,
        attendance_id: int,
    ) -> Optional[TimesheetModel]:

        return (
            self.db.query(TimesheetModel)
            .filter(
                TimesheetModel.id == attendance_id
            )
            .first()
        )

    # ============================================================
    # ADD TIMESHEET
    # ============================================================

    def add_timesheet(
        self,
        timesheet: TimesheetModel,
    ) -> TimesheetModel:

        self.db.add(timesheet)

        return timesheet

    # ============================================================
    # ADD LOG
    # ============================================================

    def add_log(
        self,
        log: TimesheetLogModel,
    ) -> None:

        self.db.add(log)

    # ============================================================
    # DELETE TIMESHEET
    # ============================================================

    def delete_timesheet(
        self,
        timesheet: TimesheetModel,
    ) -> None:

        self.db.delete(timesheet)

    # ============================================================
    # DELETE LOGS BY DATE
    # ============================================================

    def delete_logs_by_date(
        self,
        emp_id: int,
        log_date: date,
    ) -> None:

        (
            self.db.query(TimesheetLogModel)
            .filter(
                TimesheetLogModel.emp_id == emp_id,
                func.date(
                    TimesheetLogModel.log
                ) == log_date,
            )
            .delete(
                synchronize_session=False
            )
        )

    # ============================================================
    # EXECUTE MONTHLY ACCRUAL PROCEDURE
    # ============================================================

    def execute_accrual_proc(self) -> None:

        try:
            self.db.execute(
                text(
                    "EXEC dbo.usp_AccrueMonthlyLeave"
                )
            )

        except Exception:
            pass

    # ============================================================
    # COMMIT
    # ============================================================

    def commit(self) -> None:
        self.db.commit()

    # ============================================================
    # ROLLBACK
    # ============================================================

    def rollback(self) -> None:
        self.db.rollback()