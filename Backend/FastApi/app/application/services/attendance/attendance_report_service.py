# from calendar import month_name
# from datetime import date, datetime, time
# from math import ceil
# from typing import Any, Dict, List, Optional

# from app.infrastructure.repositories.attendance.attendance_report_repository import (
#     AttendanceReportRepository,
# )


# class AttendanceReportService:

#     # Existing legacy business rule:
#     # first 3 late occurrences are grace occurrences.
#     GRACE_LIMIT = 3

#     def __init__(
#         self,
#         repository: AttendanceReportRepository,
#     ):
#         self.repository = repository

#     # ============================================================
#     # MONTH RANGE
#     # ============================================================

#     @staticmethod
#     def get_month_range(
#         year: int,
#         month: int,
#     ) -> tuple[date, date]:

#         start_date = date(
#             year,
#             month,
#             1,
#         )

#         if month == 12:
#             next_month = date(
#                 year + 1,
#                 1,
#                 1,
#             )
#         else:
#             next_month = date(
#                 year,
#                 month + 1,
#                 1,
#             )

#         end_date = next_month.fromordinal(
#             next_month.toordinal() - 1
#         )

#         # For current month, do not manufacture future LOP.
#         today = date.today()

#         if (
#             year == today.year
#             and month == today.month
#         ):
#             end_date = today

#         return start_date, end_date

#     # ============================================================
#     # SAFE HELPERS
#     # ============================================================

#     @staticmethod
#     def safe_float(value: Any) -> float:

#         if value is None:
#             return 0.0

#         try:
#             return float(value)
#         except (TypeError, ValueError):
#             return 0.0

#     @staticmethod
#     def normalize_leave_type(
#         leave_type: Optional[str],
#     ) -> Optional[str]:

#         if not leave_type:
#             return None

#         value = leave_type.strip().upper()

#         mapping = {
#             "PRIVILEGE LEAVE": "PL",
#             "PL": "PL",

#             "CASUAL LEAVE": "CL",
#             "CL": "CL",

#             "COMP OFF": "CO",
#             "COMPENSATORY OFF": "CO",
#             "CO": "CO",

#             "LOSS OF PAY": "LOP",
#             "LWP": "LOP",
#             "LOP": "LOP",
#         }

#         return mapping.get(
#             value,
#             value,
#         )

#     @staticmethod
#     def format_shift(
#         start_time: Optional[time],
#         end_time: Optional[time],
#         pattern_name: Optional[str],
#     ) -> str:

#         if start_time and end_time:

#             return (
#                 f"{start_time.strftime('%H:%M')}"
#                 f" - "
#                 f"{end_time.strftime('%H:%M')}"
#             )

#         if pattern_name:
#             return pattern_name

#         return "Not Assigned"

#     # ============================================================
#     # STATUS
#     # ============================================================

#     def calculate_status(
#         self,
#         row: Dict[str, Any],
#     ) -> tuple[str, Optional[str]]:

#         leave_type = self.normalize_leave_type(
#             row.get("leave_type")
#         )

#         has_leave = bool(
#             leave_type
#         )

#         is_half_day = (
#             self.safe_float(
#                 row.get("no_of_days")
#             ) == 0.5
#         )

#         has_punch = (
#             row.get("punch_in") is not None
#         )

#         is_week_off = bool(
#             row.get("isweekoff")
#         )

#         holiday_name = row.get(
#             "holiday_name"
#         )

#         is_holiday = bool(
#             holiday_name
#         )

#         # --------------------------------------------------------
#         # 1. APPROVED LEAVE
#         # --------------------------------------------------------

#         if has_leave:

#             if is_half_day:

#                 return (
#                     f"HD-{leave_type}",
#                     leave_type,
#                 )

#             return (
#                 leave_type,
#                 leave_type,
#             )

#         # --------------------------------------------------------
#         # 2. PUBLIC HOLIDAY
#         #
#         # If employee actually punched in on PH,
#         # mark Present.
#         # --------------------------------------------------------

#         if is_holiday:

#             if has_punch:

#                 return (
#                     "Present",
#                     None,
#                 )

#             return (
#                 "PH",
#                 None,
#             )

#         # --------------------------------------------------------
#         # 3. WEEK OFF
#         # --------------------------------------------------------

#         if is_week_off:

#             if has_punch:

#                 return (
#                     "Present",
#                     None,
#                 )

#             return (
#                 "WO",
#                 None,
#             )

#         # --------------------------------------------------------
#         # 4. PRESENT
#         # --------------------------------------------------------

#         if has_punch:

#             return (
#                 "Present",
#                 None,
#             )

#         # --------------------------------------------------------
#         # 5. ABSENT / LOP
#         # --------------------------------------------------------

#         return (
#             "LOP",
#             None,
#         )

#     # ============================================================
#     # LATE CALCULATION
#     # ============================================================

#     @staticmethod
#     def calculate_late_minutes(
#         punch_in: Optional[datetime],
#         shift_start: Optional[time],
#     ) -> int:

#         if not punch_in or not shift_start:
#             return 0

#         shift_start_dt = datetime.combine(
#             punch_in.date(),
#             shift_start,
#         )

#         # Handles normal day shift.
#         #
#         # For a punch around midnight against an evening shift,
#         # the source data should be validated against the roster.
#         # We intentionally do not invent a second shift date here.

#         difference = (
#             punch_in - shift_start_dt
#         ).total_seconds() / 60

#         if difference <= 0:
#             return 0

#         return int(difference)

#     # ============================================================
#     # BUILD DAILY RECORD
#     # ============================================================

#     def build_daily_record(
#         self,
#         row: Dict[str, Any],
#     ) -> Dict[str, Any]:

#         status, leave_type = (
#             self.calculate_status(row)
#         )

#         late_minutes = (
#             self.calculate_late_minutes(
#                 row.get("punch_in"),
#                 row.get("shift_start_time"),
#             )
#         )

#         shift = self.format_shift(
#             row.get("shift_start_time"),
#             row.get("shift_end_time"),
#             row.get("patternname"),
#         )

#         return {
#             "date": row["attendance_date"],

#             "day_of_week": (
#                 str(row.get("day_of_week", ""))
#                 .strip()
#             ),

#             "employee_id": row["employee_id"],

#             "employee_code": row.get(
#                 "employee_code"
#             ),

#             "employee_name": row[
#                 "employee_name"
#             ],

#             "designation": row.get(
#                 "designation"
#             ),

#             "department": row.get(
#                 "department"
#             ),

#             "shift": shift,

#             "status": status,

#             "leave_type": leave_type,

#             "holiday_name": row.get(
#                 "holiday_name"
#             ),

#             "punch_in": row.get(
#                 "punch_in"
#             ),

#             "punch_out": row.get(
#                 "punch_out"
#             ),

#             "working_hours": round(
#                 self.safe_float(
#                     row.get("working_hours")
#                 ),
#                 2,
#             ),

#             "break_minutes": round(
#                 self.safe_float(
#                     row.get("break_minutes")
#                 ),
#                 2,
#             ),

#             "late_minutes": late_minutes,
#         }

#     # ============================================================
#     # EMPLOYEE MONTH SUMMARY
#     # ============================================================

#     def build_employee_report(
#         self,
#         rows: List[Dict[str, Any]],
#         year: int,
#         month: int,
#     ) -> Dict[str, Any]:

#         if not rows:
#             return {}

#         first = rows[0]

#         daily_records = [
#             self.build_daily_record(row)
#             for row in rows
#         ]

#         present = 0.0
#         week_off = 0.0
#         public_holiday = 0.0

#         pl = 0.0
#         cl = 0.0
#         co = 0.0
#         lop = 0.0

#         half_day_leave = 0.0

#         late = 0

#         total_working_hours = 0.0
#         total_break_minutes = 0.0

#         for record in daily_records:

#             status = record["status"]

#             # ----------------------------------------------------
#             # PRESENT
#             # ----------------------------------------------------

#             if status == "Present":

#                 present += 1

#             # ----------------------------------------------------
#             # WEEK OFF
#             # ----------------------------------------------------

#             elif status == "WO":

#                 week_off += 1

#             # ----------------------------------------------------
#             # PUBLIC HOLIDAY
#             # ----------------------------------------------------

#             elif status == "PH":

#                 public_holiday += 1

#             # ----------------------------------------------------
#             # LEAVES
#             # ----------------------------------------------------

#             elif status in {
#                 "PL",
#                 "CL",
#                 "CO",
#                 "LOP",
#             }:

#                 if status == "PL":
#                     pl += 1

#                 elif status == "CL":
#                     cl += 1

#                 elif status == "CO":
#                     co += 1

#                 elif status == "LOP":
#                     lop += 1

#             # ----------------------------------------------------
#             # HALF DAY LEAVE
#             # ----------------------------------------------------

#             elif status.startswith("HD-"):

#                 half_day_leave += 0.5

#                 code = status[3:]

#                 if code == "PL":
#                     pl += 0.5

#                 elif code == "CL":
#                     cl += 0.5

#                 elif code == "CO":
#                     co += 0.5

#                 elif code == "LOP":
#                     lop += 0.5

#             # ----------------------------------------------------
#             # LATE
#             # ----------------------------------------------------

#             if record["late_minutes"] > 0:

#                 late += 1

#             total_working_hours += (
#                 record["working_hours"]
#             )

#             total_break_minutes += (
#                 record["break_minutes"]
#             )

#         # Paid days:
#         #
#         # Present
#         # + approved PL
#         # + approved CL
#         # + CO
#         # + PH
#         # + WO
#         #
#         # LOP is excluded.

#         paid_days = (
#             present
#             + week_off
#             + public_holiday
#             + pl
#             + cl
#             + co
#         )

#         return {
#             "employee_id": first["employee_id"],

#             "employee_code": first.get(
#                 "employee_code"
#             ),

#             "employee_name": first[
#                 "employee_name"
#             ],

#             "designation": first.get(
#                 "designation"
#             ),

#             "department": first.get(
#                 "department"
#             ),

#             "month": (
#                 f"{year:04d}-{month:02d}"
#             ),

#             "total_days": len(
#                 daily_records
#             ),

#             "present": present,

#             "week_off": week_off,

#             "public_holiday": public_holiday,

#             "pl": pl,

#             "cl": cl,

#             "co": co,

#             "lop": lop,

#             "half_day_leave": half_day_leave,

#             "late": late,

#             "paid_days": paid_days,

#             "total_working_hours": round(
#                 total_working_hours,
#                 2,
#             ),

#             "total_break_minutes": round(
#                 total_break_minutes,
#                 2,
#             ),

#             "daily_records": daily_records,
#         }

#     # ============================================================
#     # HISTORY
#     # ============================================================

#     def get_history(
#         self,
#         year: int,
#         month: int,
#         page: int = 1,
#         page_size: int = 10,
#         search: Optional[str] = None,
#         employee_id: Optional[int] = None,
#     ) -> Dict[str, Any]:

#         if month < 1 or month > 12:
#             raise ValueError(
#                 "Month must be between 1 and 12."
#             )

#         if year < 2000 or year > 2100:
#             raise ValueError(
#                 "Invalid year."
#             )

#         start_date, end_date = (
#             self.get_month_range(
#                 year,
#                 month,
#             )
#         )

#         rows = (
#             self.repository
#             .get_monthly_attendance(
#                 start_date=start_date,
#                 end_date=end_date,
#                 employee_id=employee_id,
#             )
#         )

#         # --------------------------------------------------------
#         # Group by employee
#         # --------------------------------------------------------

#         grouped: Dict[
#             int,
#             List[Dict[str, Any]]
#         ] = {}

#         for row in rows:

#             emp_id = int(
#                 row["employee_id"]
#             )

#             grouped.setdefault(
#                 emp_id,
#                 [],
#             ).append(row)

#         reports = []

#         for employee_rows in grouped.values():

#             report = (
#                 self.build_employee_report(
#                     employee_rows,
#                     year,
#                     month,
#                 )
#             )

#             if not report:
#                 continue

#             # Search should happen after employee
#             # name/code has been resolved.

#             if search:

#                 search_text = (
#                     search.strip().lower()
#                 )

#                 employee_name = (
#                     report["employee_name"]
#                     or ""
#                 ).lower()

#                 employee_code = (
#                     report["employee_code"]
#                     or ""
#                 ).lower()

#                 if (
#                     search_text
#                     not in employee_name
#                     and search_text
#                     not in employee_code
#                 ):
#                     continue

#             reports.append(report)

#         reports.sort(
#             key=lambda x: (
#                 x["employee_name"] or ""
#             ).lower()
#         )

#         # --------------------------------------------------------
#         # Statistics
#         # --------------------------------------------------------

#         statistics = {
#             "total_employees": len(reports),

#             "present": sum(
#                 x["present"]
#                 for x in reports
#             ),

#             "week_off": sum(
#                 x["week_off"]
#                 for x in reports
#             ),

#             "public_holiday": sum(
#                 x["public_holiday"]
#                 for x in reports
#             ),

#             "pl": sum(
#                 x["pl"]
#                 for x in reports
#             ),

#             "cl": sum(
#                 x["cl"]
#                 for x in reports
#             ),

#             "co": sum(
#                 x["co"]
#                 for x in reports
#             ),

#             "lop": sum(
#                 x["lop"]
#                 for x in reports
#             ),

#             "late": sum(
#                 x["late"]
#                 for x in reports
#             ),

#             "total_working_hours": round(
#                 sum(
#                     x["total_working_hours"]
#                     for x in reports
#                 ),
#                 2,
#             ),

#             "total_break_minutes": round(
#                 sum(
#                     x["total_break_minutes"]
#                     for x in reports
#                 ),
#                 2,
#             ),
#         }

#         # --------------------------------------------------------
#         # Pagination
#         # --------------------------------------------------------

#         total_items = len(reports)

#         total_pages = (
#             ceil(
#                 total_items / page_size
#             )
#             if total_items
#             else 0
#         )

#         start_index = (
#             page - 1
#         ) * page_size

#         end_index = (
#             start_index + page_size
#         )

#         paginated_reports = reports[
#             start_index:end_index
#         ]

#         return {
#             "success": True,

#             "message": (
#                 "Attendance history "
#                 "loaded successfully."
#             ),

#             "filters": {
#                 "year": year,
#                 "month": month,
#                 "month_name": month_name[month],
#                 "start_date": start_date.isoformat(),
#                 "end_date": end_date.isoformat(),
#                 "search": search,
#                 "employee_id": employee_id,
#             },

#             "statistics": statistics,

#             "pagination": {
#                 "page": page,
#                 "page_size": page_size,
#                 "total_items": total_items,
#                 "total_pages": total_pages,
#                 "has_previous": page > 1,
#                 "has_next": (
#                     page < total_pages
#                 ),
#             },

#             "employees": paginated_reports,
#         }

#     # ============================================================
#     # EMPLOYEE LIST
#     # ============================================================

#     def get_employees(
#         self,
#         search: Optional[str] = None,
#     ):

#         return {
#             "success": True,
#             "employees": (
#                 self.repository
#                 .get_active_employees(
#                     search=search
#                 )
#             ),
#         }

#     # ============================================================
#     # LATE MARK CALCULATION
#     # ============================================================

#     def calculate_late_marks(
#         self,
#         year: int,
#         month: int,
#         employee_id: Optional[int] = None,
#     ):

#         start_date, end_date = (
#             self.get_month_range(
#                 year,
#                 month,
#             )
#         )

#         rows = (
#             self.repository
#             .get_monthly_attendance(
#                 start_date=start_date,
#                 end_date=end_date,
#                 employee_id=employee_id,
#             )
#         )

#         grouped = {}

#         for row in rows:

#             emp_id = int(
#                 row["employee_id"]
#             )

#             grouped.setdefault(
#                 emp_id,
#                 [],
#             ).append(row)

#         result = []

#         for employee_rows in grouped.values():

#             employee = employee_rows[0]

#             late_days = []

#             for row in employee_rows:

#                 record = (
#                     self.build_daily_record(
#                         row
#                     )
#                 )

#                 if record["late_minutes"] > 0:

#                     late_days.append({
#                         "date": record["date"],
#                         "punch_in": record["punch_in"],
#                         "shift": record["shift"],
#                         "late_minutes": record[
#                             "late_minutes"
#                         ],
#                     })

#             total_late = len(late_days)

#             grace_used = min(
#                 total_late,
#                 self.GRACE_LIMIT,
#             )

#             excess_late = max(
#                 total_late
#                 - self.GRACE_LIMIT,
#                 0,
#             )

#             half_day_lop = (
#                 excess_late * 0.5
#             )

#             result.append({
#                 "employee_id": employee[
#                     "employee_id"
#                 ],

#                 "employee_code": employee.get(
#                     "employee_code"
#                 ),

#                 "employee_name": employee[
#                     "employee_name"
#                 ],

#                 "month": (
#                     f"{year:04d}-{month:02d}"
#                 ),

#                 "total_late": total_late,

#                 "grace_limit": self.GRACE_LIMIT,

#                 "grace_used": grace_used,

#                 "excess_late": excess_late,

#                 "half_day_lop": half_day_lop,

#                 "late_days": late_days,
#             })

#         return {
#             "success": True,
#             "year": year,
#             "month": month,
#             "employees": result,
#         }



from calendar import month_name
from datetime import date, datetime, time
from math import ceil
from typing import Any, Dict, List, Optional

from app.infrastructure.repositories.attendance.attendance_report_repository import (
    AttendanceReportRepository,
)


class AttendanceReportService:
    """
    Application service containing the active .NET
    GetMonthlyAttendanceNumberCount business rules.

    The repository supplies the equivalent of the old
    Attenance_History DataSet. This service deliberately keeps
    N1..N12 logic out of the repository.
    """

    def __init__(
        self,
        repository: AttendanceReportRepository,
    ):
        self.repository = repository

    @staticmethod
    def get_month_range(
        year: int,
        month: int,
    ) -> tuple[date, date]:
        if month < 1 or month > 12:
            raise ValueError("Month must be between 1 and 12.")

        if year < 2000 or year > 2100:
            raise ValueError("Invalid year.")

        start_date = date(year, month, 1)

        if month == 12:
            next_month = date(year + 1, 1, 1)
        else:
            next_month = date(year, month + 1, 1)

        end_date = next_month.fromordinal(
            next_month.toordinal() - 1
        )

        # Exact .NET behavior: no "current month = today" cap.
        return start_date, end_date

    @staticmethod
    def safe_float(value: Any) -> float:
        if value is None:
            return 0.0
        try:
            return float(value)
        except (TypeError, ValueError):
            return 0.0

    @staticmethod
    def normalize_leave_type(
        leave_type: Optional[str],
    ) -> Optional[str]:
        if leave_type is None:
            return None

        value = str(leave_type).strip().upper()

        if not value or value in {"0", "NA"}:
            return None

        return value

    @staticmethod
    def parse_punch_time(
        attendance_date: date,
        punch_in: Any,
    ) -> Optional[datetime]:
        if punch_in is None:
            return None

        if isinstance(punch_in, datetime):
            return punch_in

        if isinstance(punch_in, time):
            return datetime.combine(
                attendance_date,
                punch_in,
            )

        value = str(punch_in).strip()

        if not value:
            return None

        for fmt in (
            "%H:%M:%S",
            "%H:%M",
            "%I:%M:%S %p",
            "%I:%M %p",
        ):
            try:
                parsed = datetime.strptime(
                    value,
                    fmt,
                ).time()
                return datetime.combine(
                    attendance_date,
                    parsed,
                )
            except ValueError:
                continue

        return None

    @staticmethod
    def calculate_late_minutes(
        attendance_date: date,
        punch_in: Any,
        shift_start: Optional[time],
    ) -> int:
        """
        Exact active .NET calculation:

            punchIn = attendance date + punch time
            if punchIn < shiftStart:
                punchIn += 1 day
            lateMinutes = punchIn - shiftStart

        Note: the source itself uses:
            if (lateMinutes < 15)
        in the N12 rule. That condition is intentionally preserved.
        """

        if not punch_in or not shift_start:
            return 0

        punch_datetime = AttendanceReportService.parse_punch_time(
            attendance_date,
            punch_in,
        )

        if punch_datetime is None:
            return 0

        shift_start_datetime = datetime.combine(
            attendance_date,
            shift_start,
        )

        if punch_datetime < shift_start_datetime:
            punch_datetime = (
                punch_datetime
                .replace()
            )
            # Preserve .NET AddDays(1).
            punch_datetime = punch_datetime.fromtimestamp(
                punch_datetime.timestamp() + 86400
            )

        return int(
            (
                punch_datetime
                - shift_start_datetime
            ).total_seconds()
            / 60
        )

    @staticmethod
    def format_shift(
        start_time: Optional[time],
        end_time: Optional[time],
        pattern_name: Optional[str],
    ) -> str:
        if start_time and end_time:
            return (
                f"{start_time.strftime('%H:%M')}"
                f" - "
                f"{end_time.strftime('%H:%M')}"
            )

        if pattern_name:
            return pattern_name

        return "Not Assigned"

    def calculate_monthly_numbers_from_rows(
        self,
        rows: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Direct port of the active .NET method after its DataSet
        has been reconstructed by the repository.
        """

        result: List[Dict[str, Any]] = []

        grouped: Dict[int, List[Dict[str, Any]]] = {}

        for row in rows:
            emp_id = int(row["employee_id"])
            grouped.setdefault(emp_id, []).append(row)

        for emp_id, employee_rows in grouped.items():
            first = employee_rows[0]

            count = {
                "employee_id": emp_id,
                "employee_name": first["employee_name"],

                "n1": 0.0,
                "n2": 0.0,
                "n3": 0.0,
                "n4": 0.0,
                "n5": 0.0,
                "n6": 0.0,
                "n7": 0.0,
                "n8": 0.0,
                "n9": 0.0,
                "n10": 0.0,
                "n11": 0.0,
                "n12": 0.0,

                "late_count_15": 0,
            }

            for row in employee_rows:
                leave_type = self.normalize_leave_type(
                    row.get("leave_type")
                )

                is_on_leave = (
                    leave_type is not None
                )

                is_ph = bool(
                    row.get("holiday_name")
                )

                has_punch = (
                    row.get("punch_in") is not None
                )

                shift_start = row.get(
                    "shift_start_time"
                )

                # ------------------------------------------------
                # ROSTER VALIDATION
                #
                # Repository only returns rows having a matching
                # EmployeeShiftDates + ShiftPattern, exactly like
                # the active .NET code's "continue".
                # ------------------------------------------------

                if shift_start is None:
                    continue

                # ------------------------------------------------
                # WEEK OFF
                # ------------------------------------------------

                if bool(row.get("isweekoff")):
                    count["n2"] += 1
                    continue

                # ------------------------------------------------
                # PUBLIC HOLIDAY
                # ------------------------------------------------

                if is_ph:
                    count["n9"] += 1
                    continue

                # ------------------------------------------------
                # LEAVES
                # ------------------------------------------------

                if is_on_leave:
                    if leave_type == "PL":
                        count["n3"] += 1

                    elif leave_type == "CO":
                        count["n4"] += 1

                    elif leave_type == "CL":
                        count["n5"] += 1

                    elif leave_type == "HD-PL":
                        count["n6"] += 1

                    elif leave_type == "HD-CL":
                        count["n7"] += 1

                    elif leave_type == "HD-CO":
                        count["n8"] += 1

                    elif leave_type == "HD-LWP":
                        count["n12"] += 0.5
                        count["n1"] += 0.5

                    elif leave_type == "HD-LOP":
                        count["n11"] += 0.5
                        count["n1"] += 0.5

                    continue

                # ------------------------------------------------
                # PRESENT / LATE / ABSENT
                # ------------------------------------------------

                if has_punch:
                    late_minutes = self.calculate_late_minutes(
                        row["attendance_date"],
                        row["punch_in"],
                        shift_start,
                    )

                    # Exact active .NET condition.
                    if late_minutes < 15:
                        count["late_count_15"] += 1
                        count["n12"] += 0.5

                    # Always full present.
                    count["n1"] += 1.0

                else:
                    count["n10"] += 1.0

            result.append(count)

        result.sort(
            key=lambda item: (
                item["employee_name"] or ""
            ).lower()
        )

        return result

    def get_monthly_numbers(
        self,
        year: int,
        month: int,
        employee_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        start_date, end_date = self.get_month_range(
            year,
            month,
        )

        rows = self.repository.get_monthly_attendance(
            start_date=start_date,
            end_date=end_date,
            employee_id=employee_id,
        )

        data = self.calculate_monthly_numbers_from_rows(rows)

        return {
            "success": True,
            "from_date": start_date,
            "to_date": end_date,
            "data": data,
        }

    def build_daily_record(
        self,
        row: Dict[str, Any],
    ) -> Dict[str, Any]:
        leave_type = self.normalize_leave_type(
            row.get("leave_type")
        )

        if row.get("isweekoff"):
            status = "WO"
            response_leave = None
        elif row.get("holiday_name"):
            status = "PH"
            response_leave = None
        elif leave_type:
            status = leave_type
            response_leave = leave_type
        elif row.get("punch_in"):
            status = "Present"
            response_leave = None
        else:
            status = "LOP"
            response_leave = None

        late_minutes = self.calculate_late_minutes(
            row["attendance_date"],
            row.get("punch_in"),
            row.get("shift_start_time"),
        )

        return {
            "date": row["attendance_date"],
            "day_of_week": row["day_of_week"],
            "employee_id": row["employee_id"],
            "employee_code": row.get("employee_code"),
            "employee_name": row["employee_name"],
            "designation": row.get("designation"),
            "department": row.get("department"),
            "shift": self.format_shift(
                row.get("shift_start_time"),
                row.get("shift_end_time"),
                row.get("patternname"),
            ),
            "status": status,
            "leave_type": response_leave,
            "holiday_name": row.get("holiday_name"),
            "punch_in": row.get("punch_in"),
            "punch_out": row.get("punch_out"),
            "working_hours": round(
                self.safe_float(
                    row.get("working_hours")
                ),
                2,
            ),
            "break_minutes": round(
                self.safe_float(
                    row.get("break_minutes")
                ),
                2,
            ),
            "late_minutes": late_minutes,
        }

    def build_employee_report(
        self,
        rows: List[Dict[str, Any]],
        year: int,
        month: int,
        number_row: Dict[str, Any],
    ) -> Dict[str, Any]:
        daily_records = [
            self.build_daily_record(row)
            for row in rows
        ]

        present = number_row["n1"]
        week_off = number_row["n2"]
        public_holiday = number_row["n9"]
        pl = number_row["n3"]
        cl = number_row["n5"]
        co = number_row["n4"]

        half_day_leave = (
            number_row["n6"]
            + number_row["n7"]
            + number_row["n8"]
            + number_row["n11"]
            + number_row["n12"]
        )

        # Keep the existing response contract while exposing exact
        # N-buckets. N10 is the .NET absent bucket.
        lop = (
            number_row["n10"]
            + number_row["n11"]
            + number_row["n12"]
        )

        total_working_hours = sum(
            record["working_hours"]
            for record in daily_records
        )

        total_break_minutes = sum(
            record["break_minutes"]
            for record in daily_records
        )

        # Existing HRMS paid-days semantics.
        paid_days = (
            present
            + week_off
            + public_holiday
            + pl
            + cl
            + co
        )

        first = rows[0]

        return {
            "employee_id": first["employee_id"],
            "employee_code": first.get("employee_code"),
            "employee_name": first["employee_name"],
            "designation": first.get("designation"),
            "department": first.get("department"),
            "month": f"{year:04d}-{month:02d}",
            "total_days": len(daily_records),

            "present": present,
            "week_off": week_off,
            "public_holiday": public_holiday,
            "pl": pl,
            "cl": cl,
            "co": co,
            "lop": lop,
            "half_day_leave": half_day_leave,
            "late": number_row["late_count_15"],

            "n1": number_row["n1"],
            "n2": number_row["n2"],
            "n3": number_row["n3"],
            "n4": number_row["n4"],
            "n5": number_row["n5"],
            "n6": number_row["n6"],
            "n7": number_row["n7"],
            "n8": number_row["n8"],
            "n9": number_row["n9"],
            "n10": number_row["n10"],
            "n11": number_row["n11"],
            "n12": number_row["n12"],
            "late_count_15": number_row["late_count_15"],

            "paid_days": paid_days,
            "total_working_hours": round(
                total_working_hours,
                2,
            ),
            "total_break_minutes": round(
                total_break_minutes,
                2,
            ),
            "daily_records": daily_records,
        }

    def get_history(
        self,
        year: int,
        month: int,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        employee_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        start_date, end_date = self.get_month_range(
            year,
            month,
        )

        rows = self.repository.get_monthly_attendance(
            start_date=start_date,
            end_date=end_date,
            employee_id=employee_id,
        )

        grouped: Dict[int, List[Dict[str, Any]]] = {}

        for row in rows:
            grouped.setdefault(
                int(row["employee_id"]),
                [],
            ).append(row)

        number_rows = self.calculate_monthly_numbers_from_rows(
            rows
        )

        number_map = {
            int(row["employee_id"]): row
            for row in number_rows
        }

        reports: List[Dict[str, Any]] = []

        for emp_id, employee_rows in grouped.items():
            number_row = number_map.get(emp_id)
            if number_row is None:
                continue

            report = self.build_employee_report(
                employee_rows,
                year,
                month,
                number_row,
            )

            if search and search.strip():
                search_text = search.strip().lower()

                if (
                    search_text
                    not in (
                        report["employee_name"]
                        or ""
                    ).lower()
                    and search_text
                    not in (
                        report["employee_code"]
                        or ""
                    ).lower()
                ):
                    continue

            reports.append(report)

        reports.sort(
            key=lambda item: (
                item["employee_name"] or ""
            ).lower()
        )

        statistics = {
            "total_employees": len(reports),
            "present": sum(
                item["present"] for item in reports
            ),
            "week_off": sum(
                item["week_off"] for item in reports
            ),
            "public_holiday": sum(
                item["public_holiday"] for item in reports
            ),
            "pl": sum(
                item["pl"] for item in reports
            ),
            "cl": sum(
                item["cl"] for item in reports
            ),
            "co": sum(
                item["co"] for item in reports
            ),
            "lop": sum(
                item["lop"] for item in reports
            ),
            "late": sum(
                item["late"] for item in reports
            ),
            "total_working_hours": round(
                sum(
                    item["total_working_hours"]
                    for item in reports
                ),
                2,
            ),
            "total_break_minutes": round(
                sum(
                    item["total_break_minutes"]
                    for item in reports
                ),
                2,
            ),
        }

        total_items = len(reports)

        total_pages = (
            ceil(total_items / page_size)
            if total_items
            else 0
        )

        if page > max(total_pages, 1):
            paginated = []
        else:
            start_index = (page - 1) * page_size
            end_index = start_index + page_size
            paginated = reports[start_index:end_index]

        return {
            "success": True,
            "message": "Attendance history loaded successfully.",
            "filters": {
                "year": year,
                "month": month,
                "month_name": month_name[month],
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "search": search,
                "employee_id": employee_id,
            },
            "statistics": statistics,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_items": total_items,
                "total_pages": total_pages,
                "has_previous": page > 1,
                "has_next": page < total_pages,
            },
            "employees": paginated,
        }

    def get_employees(
        self,
        search: Optional[str] = None,
    ) -> Dict[str, Any]:
        return {
            "success": True,
            "employees": self.repository.get_active_employees(
                search=search
            ),
        }

    def calculate_late_marks(
        self,
        year: int,
        month: int,
        employee_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        start_date, end_date = self.get_month_range(
            year,
            month,
        )

        rows = self.repository.get_monthly_attendance(
            start_date=start_date,
            end_date=end_date,
            employee_id=employee_id,
        )

        grouped: Dict[int, List[Dict[str, Any]]] = {}

        for row in rows:
            grouped.setdefault(
                int(row["employee_id"]),
                [],
            ).append(row)

        result = []

        for emp_id, employee_rows in grouped.items():
            employee = employee_rows[0]
            late_days = []

            for row in employee_rows:
                late_minutes = self.calculate_late_minutes(
                    row["attendance_date"],
                    row.get("punch_in"),
                    row.get("shift_start_time"),
                )

                if late_minutes > 0:
                    late_days.append(
                        {
                            "date": row["attendance_date"],
                            "punch_in": row.get("punch_in"),
                            "shift": self.format_shift(
                                row.get("shift_start_time"),
                                row.get("shift_end_time"),
                                row.get("patternname"),
                            ),
                            "late_minutes": late_minutes,
                        }
                    )

            result.append(
                {
                    "employee_id": employee["employee_id"],
                    "employee_code": employee.get(
                        "employee_code"
                    ),
                    "employee_name": employee["employee_name"],
                    "month": f"{year:04d}-{month:02d}",
                    "total_late": len(late_days),
                    "late_days": late_days,
                }
            )

        return {
            "success": True,
            "year": year,
            "month": month,
            "employees": result,
        }
