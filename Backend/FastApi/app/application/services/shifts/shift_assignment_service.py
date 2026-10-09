from __future__ import annotations

import json
from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional

from app.application.dtos.shifts.shift_assignment import (
    AssignedShiftListItem,
    CreateShiftAssignmentRequest,
    GeneratedShiftDateDto,
    LeaveDayDto,
    PatchShiftAssignmentRequest,
    ShiftAssignmentDateResponse,
    ShiftAssignmentResponse,
    ShiftPatternOption,
    UpdateShiftAssignmentRequest,
)

from app.domain.interfaces.shifts.shift_assignment_interface import (
    IShiftAssignmentRepository,
)

class ShiftAssignmentService:

    def __init__(
        self,
        repository: IShiftAssignmentRepository,
    ) -> None:
        self._repository = repository

    def get_employees(
        self,
    ) -> List[Dict[str, Any]]:

        return self._repository.get_active_employees()

    def get_shift_patterns(
        self,
    ) -> List[ShiftPatternOption]:

        patterns = (
            self._repository.get_shift_patterns()
        )

        return [
            ShiftPatternOption(
                pattern_id=int(
                    item["patternid"]
                ),
                pattern_name=item.get(
                    "patternname"
                ),
                start_time=(
                    item["starttime"].strftime(
                        "%H:%M"
                    )
                    if item.get("starttime")
                    else None
                ),
                end_time=(
                    item["endtime"].strftime(
                        "%H:%M"
                    )
                    if item.get("endtime")
                    else None
                ),
            )
            for item in patterns
        ]

    def create_assignment(
        self,
        request: CreateShiftAssignmentRequest,
        current_user: Optional[str],
    ) -> List[ShiftAssignmentResponse]:

        self._validate_request_dates(
            request.start_date,
            request.end_date,
        )

        employee_ids = (
            self._resolve_employee_ids(
                request.employee_ids
            )
        )

        self._validate_patterns(
            request.generated_patterns
        )

        generated_dates = (
            self._normalize_generated_dates(
                start_date=request.start_date,
                end_date=request.end_date,
                week_off_days=request.week_off_days,
                leave_days=request.leave_days,
                generated_patterns=request.generated_patterns,
            )
        )

        week_off_days = (
            self._serialize_week_off_days(
                self._get_distinct_week_off_days(
                    generated_dates
                )
            )
        )

        leave_days = (
            self._serialize_leave_days(
                request.leave_days
            )
        )

        results: List[
            ShiftAssignmentResponse
        ] = []

        for employee_id in employee_ids:

            assignment_id = (
                self._repository.create_assignment(
                    employee_id=employee_id,
                    start_date=request.start_date,
                    end_date=request.end_date,
                    week_off_days=week_off_days,
                    leave_days=leave_days,
                    created_by=current_user,
                )
            )

            self._repository.create_assignment_dates(
                emp_shift_id=assignment_id,
                employee_id=employee_id,
                generated_dates=generated_dates,
            )

            results.append(
                self._build_response(
                    assignment_id
                )
            )

        return results

    def get_all_assignments(
        self,
    ) -> List[AssignedShiftListItem]:

        rows = (
            self._repository.get_all_assignments()
        )

        return [
            AssignedShiftListItem(
                id=int(
                    row["empshiftid"]
                ),
                employee_id=int(
                    row["empid"]
                ),
                employee_name=(
                    row.get(
                        "employee_name"
                    )
                    or "Unknown"
                ),
                employee_code=row.get(
                    "emp_code"
                ),
                shift_pattern_names=(
                    self._parse_pattern_names(
                        row.get(
                            "shift_pattern_names"
                        )
                    )
                ),
                start_date=self._to_date(
                    row["startdate"]
                ),
                end_date=self._to_date(
                    row["enddate"]
                ),
                week_off_days=(
                    self._deserialize_week_off_days(
                        row.get(
                            "weekoffdays"
                        )
                    )
                ),
                leave_days=(
                    self._deserialize_leave_days(
                        row.get(
                            "leavedays"
                        )
                    )
                ),
            )
            for row in rows
        ]

    def get_assignment(
        self,
        assignment_id: int,
    ) -> Optional[
        ShiftAssignmentResponse
    ]:

        assignment = (
            self._repository.get_assignment(
                assignment_id
            )
        )

        if assignment is None:
            return None

        return self._build_response(
            assignment_id
        )

    def get_edit_payload(
        self,
        assignment_id: int,
    ) -> Optional[
        UpdateShiftAssignmentRequest
    ]:
        """
        Loads the complete existing assignment into a
        PUT-ready payload.

        This is useful for Swagger and frontend edit screens.
        """

        assignment = (
            self._repository.get_assignment(
                assignment_id
            )
        )

        if assignment is None:
            return None

        start_date = self._to_date(
            assignment["startdate"]
        )

        end_date = self._to_date(
            assignment["enddate"]
        )

        dates = (
            self._repository.get_assignment_dates(
                assignment_id
            )
        )

        date_by_date = {
            self._to_date(
                row["dates"]
            ): row
            for row in dates
        }

        expected_dates = (
            self._generate_date_range(
                start_date=start_date,
                end_date=end_date,
            )
        )

        generated_patterns: List[
            GeneratedShiftDateDto
        ] = []

        for shift_date in expected_dates:

            row = date_by_date.get(
                shift_date
            )

            if row is None:
                raise ValueError(
                    "Existing shift assignment is missing "
                    f"roster date {shift_date.isoformat()}."
                )

            pattern_id = row.get(
                "patternid"
            )

            if pattern_id is None:
                raise ValueError(
                    "Existing shift assignment date "
                    f"{shift_date.isoformat()} "
                    "does not have a valid pattern ID."
                )

            generated_patterns.append(
                GeneratedShiftDateDto(
                    shift_date=shift_date,
                    pattern_id=int(
                        pattern_id
                    ),
                    is_week_off=bool(
                        row.get(
                            "isweekoff"
                        )
                    ),
                    is_leave=bool(
                        row.get(
                            "isleave"
                        )
                    ),
                )
            )

        return UpdateShiftAssignmentRequest(
            employee_id=int(
                assignment["empid"]
            ),
            start_date=start_date,
            end_date=end_date,
            week_off_days=(
                self._deserialize_week_off_days(
                    assignment.get(
                        "weekoffdays"
                    )
                )
            ),
            leave_days=(
                self._deserialize_leave_days(
                    assignment.get(
                        "leavedays"
                    )
                )
            ),
            generated_patterns=generated_patterns,
        )

    def update_assignment(
        self,
        assignment_id: int,
        request: UpdateShiftAssignmentRequest,
        current_user: Optional[str],
    ) -> ShiftAssignmentResponse:

        existing = (
            self._repository.get_assignment(
                assignment_id
            )
        )

        if existing is None:
            raise ValueError(
                "Shift assignment not found."
            )

        self._validate_request_dates(
            request.start_date,
            request.end_date,
        )

        employee_ids = (
            self._resolve_employee_ids(
                [request.employee_id]
            )
        )

        employee_id = employee_ids[0]

        self._validate_patterns(
            request.generated_patterns
        )

        generated_dates = (
            self._normalize_generated_dates(
                start_date=request.start_date,
                end_date=request.end_date,
                week_off_days=request.week_off_days,
                leave_days=request.leave_days,
                generated_patterns=request.generated_patterns,
            )
        )

        week_off_days = (
            self._serialize_week_off_days(
                self._get_distinct_week_off_days(
                    generated_dates
                )
            )
        )

        leave_days = (
            self._serialize_leave_days(
                request.leave_days
            )
        )

        self._repository.update_assignment(
            assignment_id=assignment_id,
            employee_id=employee_id,
            start_date=request.start_date,
            end_date=request.end_date,
            week_off_days=week_off_days,
            leave_days=leave_days,
            modified_by=current_user,
        )

        self._repository.delete_assignment_dates(
            assignment_id
        )

        self._repository.create_assignment_dates(
            emp_shift_id=assignment_id,
            employee_id=employee_id,
            generated_dates=generated_dates,
        )

        return self._build_response(
            assignment_id
        )

    def patch_assignment(
        self,
        assignment_id: int,
        request: PatchShiftAssignmentRequest,
    ) -> ShiftAssignmentResponse:
        """
        Partially updates only the specified roster dates.

        This is the preferred API for editing individual
        week-offs, leaves or shift patterns.
        """

        assignment = (
            self._repository.get_assignment(
                assignment_id
            )
        )

        if assignment is None:
            raise ValueError(
                "Shift assignment not found."
            )

        start_date = self._to_date(
            assignment["startdate"]
        )

        end_date = self._to_date(
            assignment["enddate"]
        )

        for item in request.dates:

            if not (
                start_date
                <= item.shift_date
                <= end_date
            ):
                raise ValueError(
                    f"Shift date "
                    f"{item.shift_date.isoformat()} "
                    "must be within the assignment date range."
                )

            existing_date = (
                self._repository.get_assignment_date(
                    assignment_id=assignment_id,
                    shift_date=item.shift_date,
                )
            )

            if existing_date is None:
                raise ValueError(
                    f"No roster entry exists for "
                    f"{item.shift_date.isoformat()}."
                )

            if item.pattern_id is not None:

                if not self._repository.shift_pattern_exists(
                    item.pattern_id
                ):
                    raise ValueError(
                        f"Shift pattern not found: "
                        f"{item.pattern_id}"
                    )

            updated = (
                self._repository.update_assignment_date(
                    assignment_id=assignment_id,
                    shift_date=item.shift_date,
                    pattern_id=item.pattern_id,
                    is_week_off=item.is_week_off,
                    is_leave=item.is_leave,
                )
            )

            if not updated:
                raise ValueError(
                    f"Failed to update roster date "
                    f"{item.shift_date.isoformat()}."
                )

        self._refresh_assignment_summary(
            assignment_id
        )

        return self._build_response(
            assignment_id
        )

    def _refresh_assignment_summary(
        self,
        assignment_id: int,
    ) -> None:
        """
        Refreshes employeeshift summary fields from the
        authoritative employeeshiftdates rows.
        """

        assignment = (
            self._repository.get_assignment(
                assignment_id
            )
        )

        if assignment is None:
            return

        dates = (
            self._repository.get_assignment_dates(
                assignment_id
            )
        )

        generated_dates = [
            {
                "day_of_week": (
                    row.get(
                        "dayofweek"
                    )
                    or self._to_date(
                        row["dates"]
                    ).strftime("%A")
                ),
                "is_week_off": bool(
                    row.get(
                        "isweekoff"
                    )
                ),
            }
            for row in dates
        ]

        week_off_days = (
            self._get_distinct_week_off_days(
                generated_dates
            )
        )

        self._repository.update_assignment(
            assignment_id=assignment_id,
            employee_id=int(
                assignment["empid"]
            ),
            start_date=self._to_date(
                assignment["startdate"]
            ),
            end_date=self._to_date(
                assignment["enddate"]
            ),
            week_off_days=(
                self._serialize_week_off_days(
                    week_off_days
                )
            ),
            leave_days=assignment.get(
                "leavedays"
            ),
            modified_by=None,
        )

    def delete_assignment(
        self,
        assignment_id: int,
    ) -> bool:

        existing = (
            self._repository.get_assignment(
                assignment_id
            )
        )

        if existing is None:
            return False

        self._repository.delete_assignment_dates(
            assignment_id
        )

        return self._repository.delete_assignment(
            assignment_id
        )

    def _build_response(
        self,
        assignment_id: int,
    ) -> ShiftAssignmentResponse:

        assignment = (
            self._repository.get_assignment(
                assignment_id
            )
        )

        if assignment is None:
            raise ValueError(
                "Shift assignment not found."
            )

        dates = (
            self._repository.get_assignment_dates(
                assignment_id
            )
        )

        generated_dates = [
            ShiftAssignmentDateResponse(
                date=self._to_date(
                    row["dates"]
                ),
                day_of_week=(
                    row.get(
                        "dayofweek"
                    )
                    or self._to_date(
                        row["dates"]
                    ).strftime("%A")
                ),
                is_week_off=bool(
                    row.get(
                        "isweekoff"
                    )
                ),
                is_leave=bool(
                    row.get(
                        "isleave"
                    )
                ),
                pattern_id=(
                    int(
                        row["patternid"]
                    )
                    if row.get(
                        "patternid"
                    ) is not None
                    else None
                ),
                pattern_name=row.get(
                    "patternname"
                ),
                start_time=(
                    row["starttime"].strftime(
                        "%H:%M"
                    )
                    if row.get(
                        "starttime"
                    )
                    else None
                ),
                end_time=(
                    row["endtime"].strftime(
                        "%H:%M"
                    )
                    if row.get(
                        "endtime"
                    )
                    else None
                ),
            )
            for row in dates
        ]

        return ShiftAssignmentResponse(
            id=int(
                assignment[
                    "empshiftid"
                ]
            ),
            employee_id=int(
                assignment[
                    "empid"
                ]
            ),
            employee_name=(
                assignment.get(
                    "employee_name"
                )
                or "Unknown"
            ),
            employee_code=assignment.get(
                "emp_code"
            ),
            start_date=self._to_date(
                assignment[
                    "startdate"
                ]
            ),
            end_date=self._to_date(
                assignment[
                    "enddate"
                ]
            ),
            week_off_days=(
                self._deserialize_week_off_days(
                    assignment.get(
                        "weekoffdays"
                    )
                )
            ),
            leave_days=(
                self._deserialize_leave_days(
                    assignment.get(
                        "leavedays"
                    )
                )
            ),
            generated_dates=generated_dates,
        )

    def _resolve_employee_ids(
        self,
        employee_ids: List[int],
    ) -> List[int]:

        cleaned: List[int] = []

        for employee_id in employee_ids:

            if employee_id <= 0:
                raise ValueError(
                    "Employee ID must be greater than zero."
                )

            if employee_id not in cleaned:
                cleaned.append(
                    employee_id
                )

        if not cleaned:
            raise ValueError(
                "At least one employee must be selected."
            )

        for employee_id in cleaned:

            if not self._repository.employee_exists(
                employee_id
            ):
                raise ValueError(
                    f"Employee not found: {employee_id}"
                )

        return cleaned

    def _validate_patterns(
        self,
        generated_patterns: List[
            GeneratedShiftDateDto
        ],
    ) -> None:

        if not generated_patterns:
            raise ValueError(
                "At least one generated pattern with a valid "
                "pattern_id is required."
            )

        validated_pattern_ids: set[int] = set()

        for item in generated_patterns:

            if item.pattern_id <= 0:
                raise ValueError(
                    "Pattern ID must be greater than zero."
                )

            if item.pattern_id in validated_pattern_ids:
                continue

            if not self._repository.shift_pattern_exists(
                item.pattern_id
            ):
                raise ValueError(
                    f"Shift pattern not found: "
                    f"{item.pattern_id}"
                )

            validated_pattern_ids.add(
                item.pattern_id
            )

    @staticmethod
    def _validate_request_dates(
        start_date: date,
        end_date: date,
    ) -> None:

        if end_date < start_date:
            raise ValueError(
                "End date must be greater than or equal to start date."
            )

    @staticmethod
    def _normalize_generated_dates(
        start_date: date,
        end_date: date,
        week_off_days: List[str],
        leave_days: List[LeaveDayDto],
        generated_patterns: List[
            GeneratedShiftDateDto
        ],
    ) -> List[Dict[str, Any]]:

        pattern_by_date: Dict[
            date,
            GeneratedShiftDateDto,
        ] = {}

        for item in generated_patterns:

            if item.shift_date in pattern_by_date:
                raise ValueError(
                    "Duplicate generated shift date: "
                    f"{item.shift_date.isoformat()}"
                )

            pattern_by_date[
                item.shift_date
            ] = item

        if not pattern_by_date:
            raise ValueError(
                "At least one generated pattern is required."
            )

        default_pattern_id = (
            next(
                iter(
                    pattern_by_date.values()
                )
            ).pattern_id
        )

        leave_by_date = {
            item.date: item
            for item in leave_days
        }

        normalized_week_off_days = {
            day.strip().capitalize()
            for day in week_off_days
        }

        normalized: List[
            Dict[str, Any]
        ] = []

        current = start_date

        while current <= end_date:

            day_of_week = current.strftime(
                "%A"
            )

            generated = (
                pattern_by_date.get(
                    current
                )
            )

            leave = (
                leave_by_date.get(
                    current
                )
            )

            if generated is not None:

                pattern_id = (
                    generated.pattern_id
                )

                is_week_off = bool(
                    generated.is_week_off
                )

                is_leave = bool(
                    generated.is_leave
                )

            else:

                pattern_id = (
                    default_pattern_id
                )

                is_week_off = (
                    day_of_week
                    in normalized_week_off_days
                )

                is_leave = (
                    leave is not None
                )

            if leave is not None:
                is_leave = True

            normalized.append(
                {
                    "shift_date": current,
                    "day_of_week": day_of_week,
                    "pattern_id": pattern_id,
                    "is_week_off": is_week_off,
                    "is_leave": is_leave,
                }
            )

            current += timedelta(
                days=1
            )

        return normalized

    @staticmethod
    def _get_distinct_week_off_days(
        generated_dates: List[
            Dict[str, Any]
        ],
    ) -> List[str]:

        result: List[str] = []

        for item in generated_dates:

            if not item.get(
                "is_week_off"
            ):
                continue

            day = item.get(
                "day_of_week"
            )

            if day and day not in result:
                result.append(
                    day
                )

        return result

    @staticmethod
    def _generate_date_range(
        start_date: date,
        end_date: date,
    ) -> List[date]:

        if end_date < start_date:
            raise ValueError(
                "End date must be greater than or equal to start date."
            )

        dates: List[date] = []

        current = start_date

        while current <= end_date:

            dates.append(
                current
            )

            current += timedelta(
                days=1
            )

        return dates

    @staticmethod
    def _to_date(
        value: Any,
    ) -> date:

        if isinstance(
            value,
            datetime,
        ):
            return value.date()

        if isinstance(
            value,
            date,
        ):
            return value

        if isinstance(
            value,
            str,
        ):
            return date.fromisoformat(
                value
            )

        raise ValueError(
            "Invalid date value returned from repository."
        )

    @staticmethod
    def _serialize_week_off_days(
        week_off_days: List[str],
    ) -> Optional[str]:

        if not week_off_days:
            return None

        return ",".join(
            dict.fromkeys(
                day.strip().capitalize()
                for day in week_off_days
                if day.strip()
            )
        )

    @staticmethod
    def _deserialize_week_off_days(
        value: Optional[str],
    ) -> List[str]:

        if not value:
            return []

        return [
            item.strip()
            for item in value.split(",")
            if item.strip()
        ]

    @staticmethod
    def _serialize_leave_days(
        leave_days: List[LeaveDayDto],
    ) -> Optional[str]:

        if not leave_days:
            return None

        data = [
            {
                "Date": item.date.isoformat(),
                "DayOfWeek": item.date.strftime(
                    "%A"
                ),
                "LeaveType": item.leave_type,
            }
            for item in leave_days
        ]

        return json.dumps(
            data,
            separators=(",", ":"),
        )

    @staticmethod
    def _deserialize_leave_days(
        leave_days_json: Optional[str],
    ) -> List[LeaveDayDto]:

        if not leave_days_json:
            return []

        try:

            data = json.loads(
                leave_days_json
            )

            if not isinstance(
                data,
                list,
            ):
                return []

            result: List[
                LeaveDayDto
            ] = []

            for item in data:

                if not isinstance(
                    item,
                    dict,
                ):
                    continue

                raw_date = (
                    item.get("Date")
                    or item.get("date")
                )

                leave_type = (
                    item.get("LeaveType")
                    or item.get("leave_type")
                    or "Leave"
                )

                if not raw_date:
                    continue

                result.append(
                    LeaveDayDto(
                        date=date.fromisoformat(
                            raw_date
                        ),
                        leave_type=leave_type,
                    )
                )

            return result

        except (
            json.JSONDecodeError,
            ValueError,
            TypeError,
        ):
            return []

    @staticmethod
    def _parse_pattern_names(
        value: Optional[str],
    ) -> List[str]:

        if not value:
            return []

        return [
            item.strip()
            for item in value.split(",")
            if item.strip()
        ]