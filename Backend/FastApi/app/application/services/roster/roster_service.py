from __future__ import annotations

from datetime import date, timedelta
from typing import Dict, List

from app.application.dtos.roster.roster import (
    RosterDayResponse,
    RosterEmployeeResponse,
    RosterShiftResponse,
    WeeklyRosterResponse,
)

from app.domain.interfaces.roster.roster_interface import (
    IRosterRepository,
)


class RosterService:
    """
    Application service for the read-only weekly roster.

    Responsibilities:

        - Validate the requested week.
        - Ensure week starts on Monday.
        - Calculate Sunday.
        - Retrieve roster records.
        - Build the seven-day employee matrix.

    No database modification is performed.
    """

    def __init__(
        self,
        repository: IRosterRepository,
    ) -> None:
        self._repository = repository

    def get_weekly_roster(
        self,
        week_start: date,
    ) -> WeeklyRosterResponse:

        if week_start.weekday() != 0:
            raise ValueError(
                "week_start must be a Monday."
            )

        week_end = week_start + timedelta(days=6)

        days = []

        for offset in range(7):
            current_date = (
                week_start
                + timedelta(days=offset)
            )

            days.append(
                RosterDayResponse(
                    date=current_date,
                    day=current_date.strftime("%A"),
                )
            )

        records = self._repository.get_weekly_roster(
            week_start=week_start,
            week_end=week_end,
        )

        employee_map: Dict[int, Dict] = {}

        for record in records:

            employee_id = int(
                record["employee_id"]
            )

            if employee_id not in employee_map:

                employee_map[employee_id] = {
                    "employee_id": employee_id,
                    "employee_code": record.get(
                        "employee_code"
                    ),
                    "employee_name": (
                        record.get("employee_name")
                        or "Unknown Employee"
                    ).strip(),
                    "records": {},
                }

            roster_date = record["roster_date"]

            if (
                hasattr(roster_date, "date")
                and not isinstance(roster_date, date)
            ):
                roster_date = roster_date.date()

            employee_map[
                employee_id
            ]["records"][
                roster_date
            ] = record

        employees: List[
            RosterEmployeeResponse
        ] = []

        for employee_data in employee_map.values():

            shifts: List[
                RosterShiftResponse
            ] = []

            records_by_date = employee_data[
                "records"
            ]

            for day_info in days:

                current_date = day_info.date

                record = records_by_date.get(
                    current_date
                )

                if record is None:

                    shifts.append(
                        RosterShiftResponse(
                            date=current_date,
                            day=day_info.day,
                            shift=None,
                            pattern_id=None,
                            pattern_name=None,
                            start_time=None,
                            end_time=None,
                            is_week_off=False,
                            is_leave=False,
                        )
                    )

                    continue

                is_week_off = bool(
                    record.get("is_week_off")
                )

                is_leave = bool(
                    record.get("is_leave")
                )

                pattern_id = record.get(
                    "pattern_id"
                )

                pattern_name = record.get(
                    "pattern_name"
                )

                start_time = record.get(
                    "start_time"
                )

                end_time = record.get(
                    "end_time"
                )

                if is_week_off:
                    shift = "WO"

                elif is_leave:
                    shift = "Leave"

                elif (
                    start_time is not None
                    and end_time is not None
                ):
                    shift = (
                        f"{start_time.strftime('%H:%M')}"
                        f" - "
                        f"{end_time.strftime('%H:%M')}"
                    )

                else:
                    shift = None

                shifts.append(
                    RosterShiftResponse(
                        date=current_date,
                        day=day_info.day,
                        pattern_id=pattern_id,
                        pattern_name=pattern_name,
                        start_time=start_time,
                        end_time=end_time,
                        shift=shift,
                        is_week_off=is_week_off,
                        is_leave=is_leave,
                    )
                )

            employees.append(
                RosterEmployeeResponse(
                    employee_id=employee_data[
                        "employee_id"
                    ],
                    employee_code=employee_data[
                        "employee_code"
                    ],
                    employee_name=employee_data[
                        "employee_name"
                    ],
                    shifts=shifts,
                )
            )

        employees.sort(
            key=lambda employee: (
                employee.employee_name.lower()
            )
        )

        return WeeklyRosterResponse(
            week_start=week_start,
            week_end=week_end,
            days=days,
            employees=employees,
        )