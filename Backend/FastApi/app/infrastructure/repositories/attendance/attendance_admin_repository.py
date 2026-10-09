from datetime import date, datetime, time
from typing import Optional

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.infrastructure.models.attendance.timesheet import (
    TimesheetModel,
)

from app.infrastructure.models.employee.employee import (
    EmployeeModel,
)

from app.infrastructure.models.employee.designation import (
    DesignationModel,
)

from app.infrastructure.models.employee.department import (
    DepartmentModel,
)

from app.infrastructure.models.employee.employee_shift import (
    EmployeeShift,
)

from app.infrastructure.models.shifts.shift_pattern import (
    ShiftPatternModel,
)

from app.infrastructure.models.roster.shift_date import (
    ShiftDateModel,
)

from app.infrastructure.models.leave.leave_log import (
    LeaveLogModel,
)

from app.infrastructure.models.holiday.holiday import (
    HolidayModel,
)


class AttendanceAdminRepository:

    def __init__(self, db: Session):

        self.db = db

    # ============================================================
    # ACTIVE EMPLOYEES
    # ============================================================

    def get_active_employees(self):

        return (
            self.db.query(EmployeeModel)
            .filter(
                EmployeeModel.is_remove == 0
            )
            .order_by(
                EmployeeModel.first_name.asc(),
                EmployeeModel.last_name.asc(),
            )
            .all()
        )

    # ============================================================
    # EMPLOYEE
    # ============================================================

    def get_employee(
        self,
        emp_id: int,
    ):

        return (
            self.db.query(EmployeeModel)
            .filter(
                EmployeeModel.id == emp_id,
                EmployeeModel.is_remove == 0,
            )
            .first()
        )

    # ============================================================
    # ATTENDANCE HISTORY QUERY
    # ============================================================

    def get_history_query(
        self,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
        emp_id: Optional[int] = None,
        department_id: Optional[int] = None,
        search: Optional[str] = None,
    ):

        query = (
            self.db.query(
                TimesheetModel,
                EmployeeModel,
                DepartmentModel,
            )
            .join(
                EmployeeModel,
                EmployeeModel.id
                == TimesheetModel.emp_id,
            )
            .outerjoin(
                DesignationModel,
                EmployeeModel.designation
                == DesignationModel.id,
            )
            .outerjoin(
                DepartmentModel,
                DesignationModel.depart_id
                == DepartmentModel.id,
            )
        )

        # --------------------------------------------------------
        # DATE
        #
        # timesheet.date is timestamp in your PostgreSQL DB.
        # --------------------------------------------------------

        if from_date:

            query = query.filter(
                TimesheetModel.date
                >= datetime.combine(
                    from_date,
                    time.min,
                )
            )

        if to_date:

            query = query.filter(
                TimesheetModel.date
                < datetime.combine(
                    to_date,
                    time.max,
                )
            )

        # --------------------------------------------------------
        # EMPLOYEE
        # --------------------------------------------------------

        if emp_id:

            query = query.filter(
                TimesheetModel.emp_id
                == emp_id
            )

        # --------------------------------------------------------
        # DEPARTMENT
        # --------------------------------------------------------

        if department_id:

            query = query.filter(
                DesignationModel.depart_id
                == department_id
            )

        # --------------------------------------------------------
        # SEARCH
        # --------------------------------------------------------

        if search:

            search_value = (
                f"%{search.strip()}%"
            )

            query = query.filter(
                or_(
                    EmployeeModel.emp_code.ilike(
                        search_value
                    ),

                    EmployeeModel.first_name.ilike(
                        search_value
                    ),

                    EmployeeModel.last_name.ilike(
                        search_value
                    ),

                    func.concat(
                        EmployeeModel.first_name,
                        " ",
                        EmployeeModel.last_name,
                    ).ilike(
                        search_value
                    ),
                )
            )

        # --------------------------------------------------------
        # ORDER
        # --------------------------------------------------------

        return query.order_by(
            TimesheetModel.date.desc(),
            EmployeeModel.first_name.asc(),
            EmployeeModel.last_name.asc(),
            TimesheetModel.id.desc(),
        )

    # ============================================================
    # PAGINATED HISTORY
    # ============================================================

    def get_history(
        self,
        page: int,
        page_size: int,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
        emp_id: Optional[int] = None,
        department_id: Optional[int] = None,
        search: Optional[str] = None,
    ):

        query = self.get_history_query(
            from_date=from_date,
            to_date=to_date,
            emp_id=emp_id,
            department_id=department_id,
            search=search,
        )

        total_records = query.count()

        offset = (
            page - 1
        ) * page_size

        rows = (
            query
            .offset(offset)
            .limit(page_size)
            .all()
        )

        return rows, total_records

    # ============================================================
    # ALL HISTORY
    # ============================================================

    def get_all_history(
        self,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
        emp_id: Optional[int] = None,
        department_id: Optional[int] = None,
        search: Optional[str] = None,
    ):

        return self.get_history_query(
            from_date=from_date,
            to_date=to_date,
            emp_id=emp_id,
            department_id=department_id,
            search=search,
        ).all()

    # ============================================================
    # SHIFT FOR PARTICULAR DATE
    #
    # First:
    # employeeshiftdates
    #
    # Then:
    # employeeshift
    # ============================================================

    def get_shift_for_date(
        self,
        emp_id: int,
        attendance_date: date,
    ):

        date_shift = (
            self.db.query(
                ShiftDateModel,
                ShiftPatternModel,
            )
            .join(
                ShiftPatternModel,
                ShiftPatternModel.patternid
                == ShiftDateModel.patternid,
            )
            .filter(
                ShiftDateModel.empid == emp_id,

                func.date(
                    ShiftDateModel.dates
                ) == attendance_date,
            )
            .first()
        )

        if date_shift:

            return (
                date_shift[0],
                date_shift[1],
            )

        # --------------------------------------------------------
        # FALLBACK EMPLOYEE SHIFT
        # --------------------------------------------------------

        employee_shift = (
            self.db.query(
                EmployeeShift,
                ShiftPatternModel,
            )
            .join(
                ShiftPatternModel,
                ShiftPatternModel.patternid
                == EmployeeShift.patternid,
            )
            .filter(
                EmployeeShift.empid == emp_id,

                or_(
                    EmployeeShift.startdate.is_(None),

                    EmployeeShift.startdate
                    <= attendance_date,
                ),

                or_(
                    EmployeeShift.enddate.is_(None),

                    EmployeeShift.enddate
                    >= attendance_date,
                ),
            )
            .order_by(
                EmployeeShift.startdate.desc()
            )
            .first()
        )

        if employee_shift:

            return (
                employee_shift[0],
                employee_shift[1],
            )

        return None

    # ============================================================
    # HOLIDAY
    # ============================================================

    def get_holiday(
        self,
        attendance_date: date,
    ):

        return (
            self.db.query(
                HolidayModel
            )
            .filter(
                HolidayModel.holiday_date
                == attendance_date,

                HolidayModel.status == 1,
            )
            .first()
        )

    # ============================================================
    # LEAVE
    # ============================================================

    def get_leave(
        self,
        emp_id: int,
        attendance_date: date,
    ):

        start_datetime = datetime.combine(
            attendance_date,
            time.min,
        )

        end_datetime = datetime.combine(
            attendance_date,
            time.max,
        )

        return (
            self.db.query(
                LeaveLogModel
            )
            .filter(
                LeaveLogModel.emp_id
                == emp_id,

                LeaveLogModel.leave_from
                <= end_datetime,

                LeaveLogModel.leave_to
                >= start_datetime,

                LeaveLogModel.status == 1,
            )
            .first()
        )

    # ============================================================
    # DEPARTMENTS
    # ============================================================

    def get_departments(self):

        return (
            self.db.query(
                DepartmentModel
            )
            .order_by(
                DepartmentModel.name.asc()
            )
            .all()
        )