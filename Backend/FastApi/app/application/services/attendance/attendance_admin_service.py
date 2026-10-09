from datetime import date, datetime, timedelta
from typing import Optional
import csv
import io

from fastapi import HTTPException
from fastapi.responses import StreamingResponse

from app.infrastructure.repositories.attendance.attendance_admin_repository import (
    AttendanceAdminRepository,
)


class AttendanceAdminService:

    def __init__(
        self,
        repository: AttendanceAdminRepository,
    ):

        self.repository = repository

    # ============================================================
    # EMPLOYEE NAME
    # ============================================================

    @staticmethod
    def employee_name(
        employee,
    ):

        first_name = (
            employee.first_name or ""
        ).strip()

        last_name = (
            employee.last_name or ""
        ).strip()

        name = (
            f"{first_name} {last_name}"
        ).strip()

        return (
            name
            or employee.emp_code
            or f"Employee {employee.id}"
        )

    # ============================================================
    # SHIFT
    # ============================================================

    def get_shift(
        self,
        emp_id: int,
        attendance_date: date,
    ):

        return self.repository.get_shift_for_date(
            emp_id,
            attendance_date,
        )

    # ============================================================
    # WEEK OFF
    # ============================================================

    def is_week_off(
        self,
        emp_id: int,
        attendance_date: date,
    ) -> bool:

        shift_data = self.get_shift(
            emp_id,
            attendance_date,
        )

        if not shift_data:

            return False

        employee_shift, shift_pattern = (
            shift_data
        )

        # --------------------------------------------------------
        # DATE-WISE ROSTER
        # --------------------------------------------------------

        if (
            hasattr(employee_shift, "isweekoff")
            and employee_shift.isweekoff
        ):

            return True

        # --------------------------------------------------------
        # EMPLOYEE SHIFT WEEKOFFDAYS
        # --------------------------------------------------------

        weekoffdays = (
            employee_shift.weekoffdays
        )

        if not weekoffdays:

            return False

        day_name = (
            attendance_date
            .strftime("%A")
            .lower()
        )

        configured_days = {
            value.strip().lower()
            for value in
            weekoffdays.split(",")
            if value.strip()
        }

        return (
            day_name in configured_days
        )

    # ============================================================
    # STATUS
    # ============================================================

    def calculate_status(
        self,
        attendance,
        emp_id: int,
        attendance_date: date,
    ) -> str:

        # --------------------------------------------------------
        # HOLIDAY
        # --------------------------------------------------------

        holiday = (
            self.repository.get_holiday(
                attendance_date
            )
        )

        # --------------------------------------------------------
        # LEAVE
        # --------------------------------------------------------

        leave = (
            self.repository.get_leave(
                emp_id,
                attendance_date,
            )
        )

        # --------------------------------------------------------
        # ATTENDANCE EXISTS
        # --------------------------------------------------------

        if attendance:

            if (
                attendance.punch_out
                is None
            ):

                return "OPEN"

            working_hours = float(
                attendance.working_hrs or 0
            )

            if working_hours < 4:

                return "HALF_DAY"

            return "PRESENT"

        # --------------------------------------------------------
        # NO ATTENDANCE
        # --------------------------------------------------------

        if holiday:

            return "HOLIDAY"

        if leave:

            leave_type = (
                leave.leave_type
                or "LEAVE"
            ).upper()

            return leave_type

        if self.is_week_off(
            emp_id,
            attendance_date,
        ):

            return "WEEK_OFF"

        return "ABSENT"

    # ============================================================
    # LATE MINUTES
    # ============================================================

    def calculate_late_minutes(
        self,
        attendance,
        emp_id: int,
        attendance_date: date,
        grace_minutes: int = 15,
    ) -> int:

        if not attendance:

            return 0

        if not attendance.punch_in:

            return 0

        shift_data = self.get_shift(
            emp_id,
            attendance_date,
        )

        if not shift_data:

            return 0

        _, shift_pattern = shift_data

        if not shift_pattern:

            return 0

        if not shift_pattern.starttime:

            return 0

        scheduled = datetime.combine(
            attendance_date,
            shift_pattern.starttime,
        )

        allowed = (
            scheduled
            + timedelta(
                minutes=grace_minutes
            )
        )

        if attendance.punch_in <= allowed:

            return 0

        return int(
            (
                attendance.punch_in
                - scheduled
            ).total_seconds()
            // 60
        )

    # ============================================================
    # BUILD HISTORY ROW
    # ============================================================

    def build_history_item(
        self,
        attendance,
        employee,
        department,
    ):

        attendance_date = (
            attendance.date.date()
            if isinstance(
                attendance.date,
                datetime,
            )
            else attendance.date
        )

        shift_data = self.get_shift(
            employee.id,
            attendance_date,
        )

        shift_start = None
        shift_end = None

        if shift_data:

            _, shift_pattern = shift_data

            if shift_pattern:

                if shift_pattern.starttime:

                    shift_start = (
                        shift_pattern.starttime
                        .strftime("%H:%M")
                    )

                if shift_pattern.endtime:

                    shift_end = (
                        shift_pattern.endtime
                        .strftime("%H:%M")
                    )

        status = self.calculate_status(
            attendance,
            employee.id,
            attendance_date,
        )

        late_minutes = (
            self.calculate_late_minutes(
                attendance,
                employee.id,
                attendance_date,
            )
        )

        return {

            "id": attendance.id,

            "emp_id": employee.id,

            "emp_code": employee.emp_code,

            "employee_name":
                self.employee_name(
                    employee
                ),

            "department_id":
                department.id
                if department
                else None,

            "department_name":
                department.name
                if department
                else None,

            "date":
                attendance_date,

            "punch_in":
                attendance.punch_in,

            "punch_out":
                attendance.punch_out,

            "working_hrs":
                float(
                    attendance.working_hrs
                    or 0
                ),

            "total_break":
                float(
                    attendance.total_break
                    or 0
                ),

            "status":
                status,

            "late_minutes":
                late_minutes,

            "shift_start":
                shift_start,

            "shift_end":
                shift_end,

            "punch_in_address":
                attendance.punch_in_address,

            "punch_out_address":
                attendance.punch_out_address,

            "punch_in_inside_office":
                attendance.punch_in_inside_office,

            "punch_out_inside_office":
                attendance.punch_out_inside_office,
        }

    # ============================================================
    # HISTORY
    # ============================================================

    def history(
        self,
        page: int,
        page_size: int,
        from_date: Optional[date],
        to_date: Optional[date],
        emp_id: Optional[int],
        department_id: Optional[int],
        search: Optional[str],
    ):

        if (
            from_date
            and to_date
            and from_date > to_date
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "from_date cannot be "
                    "greater than to_date"
                ),
            )

        rows, total_records = (
            self.repository.get_history(
                page=page,
                page_size=page_size,
                from_date=from_date,
                to_date=to_date,
                emp_id=emp_id,
                department_id=department_id,
                search=search,
            )
        )

        data = []

        for (
            attendance,
            employee,
            department,
        ) in rows:

            data.append(
                self.build_history_item(
                    attendance,
                    employee,
                    department,
                )
            )

        total_pages = (
            (
                total_records
                + page_size
                - 1
            )
            // page_size
        )

        return {

            "success": True,

            "data": data,

            "pagination": {

                "page": page,

                "page_size":
                    page_size,

                "total_records":
                    total_records,

                "total_pages":
                    total_pages,

                "has_next":
                    page < total_pages,

                "has_previous":
                    page > 1,
            },
        }

    # ============================================================
    # EMPLOYEES
    # ============================================================

    def employees(self):

        employees = (
            self.repository
            .get_active_employees()
        )

        return {

            "success": True,

            "data": [

                {
                    "id": employee.id,

                    "emp_code":
                        employee.emp_code,

                    "employee_name":
                        self.employee_name(
                            employee
                        ),
                }

                for employee in employees
            ],
        }

    # ============================================================
    # SUMMARY
    # ============================================================

    def summary(
        self,
        from_date: date,
        to_date: date,
        emp_id: Optional[int] = None,
    ):

        rows = (
            self.repository.get_all_history(
                from_date=from_date,
                to_date=to_date,
                emp_id=emp_id,
            )
        )

        employees = (
            self.repository
            .get_active_employees()
        )

        if emp_id:

            total_employees = sum(
                1
                for employee in employees
                if employee.id == emp_id
            )

        else:

            total_employees = len(
                employees
            )

        present = 0
        absent = 0
        half_day = 0
        week_off = 0
        holiday = 0
        leave = 0
        late = 0
        open_sessions = 0

        total_working_hours = 0.0

        for (
            attendance,
            employee,
            department,
        ) in rows:

            status = (
                self.calculate_status(
                    attendance,
                    employee.id,
                    (
                        attendance.date.date()
                        if isinstance(
                            attendance.date,
                            datetime,
                        )
                        else attendance.date
                    ),
                )
            )

            if status == "PRESENT":

                present += 1

            elif status == "ABSENT":

                absent += 1

            elif status == "HALF_DAY":

                half_day += 1

            elif status == "WEEK_OFF":

                week_off += 1

            elif status == "HOLIDAY":

                holiday += 1

            elif status == "OPEN":

                open_sessions += 1

            else:

                leave += 1

            late_minutes = (
                self.calculate_late_minutes(
                    attendance,
                    employee.id,
                    (
                        attendance.date.date()
                        if isinstance(
                            attendance.date,
                            datetime,
                        )
                        else attendance.date
                    ),
                )
            )

            if late_minutes > 0:

                late += 1

            total_working_hours += float(
                attendance.working_hrs or 0
            )

        average_hours = (
            total_working_hours
            / len(rows)
            if rows
            else 0
        )

        return {

            "success": True,

            "total_employees":
                total_employees,

            "present":
                present,

            "absent":
                absent,

            "half_day":
                half_day,

            "week_off":
                week_off,

            "holiday":
                holiday,

            "leave":
                leave,

            "late":
                late,

            "open_sessions":
                open_sessions,

            "total_working_hours":
                round(
                    total_working_hours,
                    2,
                ),

            "average_working_hours":
                round(
                    average_hours,
                    2,
                ),
        }

    # ============================================================
    # OVERVIEW
    # ============================================================

    def overview(
        self,
        from_date: date,
        to_date: date,
        emp_id: Optional[int] = None,
    ):

        rows = (
            self.repository.get_all_history(
                from_date=from_date,
                to_date=to_date,
                emp_id=emp_id,
            )
        )

        grouped = {}

        current_date = from_date

        while current_date <= to_date:

            grouped[current_date] = {

                "date": current_date,

                "present": 0,

                "absent": 0,

                "half_day": 0,

                "week_off": 0,

                "holiday": 0,

                "leave": 0,

                "late": 0,
            }

            current_date += timedelta(
                days=1
            )

        for (
            attendance,
            employee,
            department,
        ) in rows:

            attendance_date = (
                attendance.date.date()
                if isinstance(
                    attendance.date,
                    datetime,
                )
                else attendance.date
            )

            if attendance_date not in grouped:

                continue

            status = (
                self.calculate_status(
                    attendance,
                    employee.id,
                    attendance_date,
                )
            )

            if status == "PRESENT":

                grouped[
                    attendance_date
                ]["present"] += 1

            elif status == "ABSENT":

                grouped[
                    attendance_date
                ]["absent"] += 1

            elif status == "HALF_DAY":

                grouped[
                    attendance_date
                ]["half_day"] += 1

            elif status == "WEEK_OFF":

                grouped[
                    attendance_date
                ]["week_off"] += 1

            elif status == "HOLIDAY":

                grouped[
                    attendance_date
                ]["holiday"] += 1

            elif status != "OPEN":

                grouped[
                    attendance_date
                ]["leave"] += 1

            if (
                self.calculate_late_minutes(
                    attendance,
                    employee.id,
                    attendance_date,
                )
                > 0
            ):

                grouped[
                    attendance_date
                ]["late"] += 1

        return {

            "success": True,

            "data": list(
                grouped.values()
            ),
        }

    # ============================================================
    # FILTER
    # ============================================================

    def filters(self):

        employees = (
            self.repository
            .get_active_employees()
        )

        departments = (
            self.repository
            .get_departments()
        )

        current_year = (
            date.today().year
        )

        months = []

        for month in range(1, 13):

            month_date = date(
                current_year,
                month,
                1,
            )

            months.append(
                {
                    "year":
                        current_year,

                    "month":
                        month,

                    "value":
                        month_date.strftime(
                            "%Y-%m"
                        ),

                    "label":
                        month_date.strftime(
                            "%B %Y"
                        ),
                }
            )

        return {

            "success": True,

            "employees": [

                {
                    "id":
                        employee.id,

                    "emp_code":
                        employee.emp_code,

                    "employee_name":
                        self.employee_name(
                            employee
                        ),
                }

                for employee in employees
            ],

            "departments": [

                {
                    "id":
                        department.id,

                    "name":
                        department.name,
                }

                for department
                in departments
            ],

            "months":
                months,
        }

    # ============================================================
    # LATE MARKS
    # ============================================================

    def calculate_late_marks(
        self,
        from_date: date,
        to_date: date,
        emp_id: Optional[int],
        grace_minutes: int,
    ):

        rows = (
            self.repository.get_all_history(
                from_date=from_date,
                to_date=to_date,
                emp_id=emp_id,
            )
        )

        data = []

        for (
            attendance,
            employee,
            department,
        ) in rows:

            attendance_date = (
                attendance.date.date()
                if isinstance(
                    attendance.date,
                    datetime,
                )
                else attendance.date
            )

            shift_data = (
                self.get_shift(
                    employee.id,
                    attendance_date,
                )
            )

            shift_start = None

            if shift_data:

                _, shift_pattern = (
                    shift_data
                )

                if (
                    shift_pattern
                    and shift_pattern.starttime
                ):

                    shift_start = (
                        shift_pattern.starttime
                        .strftime("%H:%M")
                    )

            late_minutes = (
                self.calculate_late_minutes(
                    attendance,
                    employee.id,
                    attendance_date,
                    grace_minutes,
                )
            )

            data.append(
                {

                    "attendance_id":
                        attendance.id,

                    "emp_id":
                        employee.id,

                    "emp_code":
                        employee.emp_code,

                    "employee_name":
                        self.employee_name(
                            employee
                        ),

                    "date":
                        attendance_date,

                    "punch_in":
                        attendance.punch_in,

                    "shift_start":
                        shift_start,

                    "late_minutes":
                        late_minutes,

                    "is_late":
                        late_minutes > 0,
                }
            )

        late_count = sum(
            1
            for item in data
            if item["is_late"]
        )

        return {

            "success": True,

            "from_date":
                from_date,

            "to_date":
                to_date,

            "grace_minutes":
                grace_minutes,

            "total_late_records":
                late_count,

            "data":
                data,
        }

    # ============================================================
    # CSV EXPORT
    # ============================================================

    def export(
        self,
        from_date: date,
        to_date: date,
        emp_id: Optional[int],
        department_id: Optional[int],
        search: Optional[str],
    ):

        rows = (
            self.repository.get_all_history(
                from_date=from_date,
                to_date=to_date,
                emp_id=emp_id,
                department_id=department_id,
                search=search,
            )
        )

        output = io.StringIO()

        writer = csv.writer(
            output
        )

        writer.writerow(
            [
                "Employee Code",
                "Employee Name",
                "Department",
                "Date",
                "Punch In",
                "Punch Out",
                "Working Hours",
                "Break Minutes",
                "Status",
                "Late Minutes",
                "Shift Start",
                "Shift End",
            ]
        )

        for (
            attendance,
            employee,
            department,
        ) in rows:

            item = (
                self.build_history_item(
                    attendance,
                    employee,
                    department,
                )
            )

            writer.writerow(
                [
                    item["emp_code"],
                    item["employee_name"],
                    item["department_name"],
                    item["date"],
                    item["punch_in"],
                    item["punch_out"],
                    item["working_hrs"],
                    item["total_break"],
                    item["status"],
                    item["late_minutes"],
                    item["shift_start"],
                    item["shift_end"],
                ]
            )

        output.seek(0)

        filename = (
            f"attendance_"
            f"{from_date}_"
            f"{to_date}.csv"
        )

        return StreamingResponse(
            iter(
                [output.getvalue()]
            ),
            media_type="text/csv",
            headers={
                "Content-Disposition":
                    (
                        f'attachment; '
                        f'filename="{filename}"'
                    )
            },
        )