from __future__ import annotations

from datetime import date, timedelta
from typing import List, Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)


class LeaveDayDto(BaseModel):
    """
    Represents a leave entry for a specific calendar date.
    """

    date: date

    leave_type: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    model_config = ConfigDict(
        extra="forbid",
    )


class GeneratedShiftDateDto(BaseModel):
    """
    Represents the complete configuration for one
    calendar date.

    This is used by POST and PUT.
    """

    shift_date: date

    pattern_id: int = Field(
        ...,
        gt=0,
    )

    is_week_off: bool = False

    is_leave: bool = False

    model_config = ConfigDict(
        extra="forbid",
    )

    @field_validator("pattern_id")
    @classmethod
    def validate_pattern_id(
        cls,
        value: int,
    ) -> int:
        """
        Ensures the shift pattern ID is valid.
        """

        if value <= 0:
            raise ValueError(
                "Pattern ID must be greater than zero."
            )

        return value


class CreateShiftAssignmentRequest(BaseModel):
    """
    Request model for creating a shift assignment.

    POST can contain one default pattern and optional
    date-wise overrides.

    The backend generates missing dates automatically.
    """

    employee_ids: List[int] = Field(
        ...,
        min_length=1,
    )

    start_date: date

    end_date: date

    week_off_days: List[str] = Field(
        default_factory=list,
    )

    leave_days: List[LeaveDayDto] = Field(
        default_factory=list,
    )

    generated_patterns: List[
        GeneratedShiftDateDto
    ] = Field(
        default_factory=list,
    )

    model_config = ConfigDict(
        extra="forbid",
    )

    @field_validator("employee_ids")
    @classmethod
    def validate_employee_ids(
        cls,
        value: List[int],
    ) -> List[int]:
        """
        Validates employee IDs and removes duplicates.
        """

        cleaned: List[int] = []

        for employee_id in value:

            if employee_id <= 0:
                raise ValueError(
                    "Employee IDs must be greater than zero."
                )

            if employee_id not in cleaned:
                cleaned.append(
                    employee_id
                )

        if not cleaned:
            raise ValueError(
                "At least one employee must be selected."
            )

        return cleaned

    @model_validator(mode="after")
    def validate_request(
        self,
    ) -> "CreateShiftAssignmentRequest":
        """
        Performs cross-field validation for POST.
        """

        if self.end_date < self.start_date:
            raise ValueError(
                "End date must be greater than or equal to start date."
            )

        self._validate_generated_pattern_entries()

        self._validate_leave_dates()

        return self

    def _validate_generated_pattern_entries(
        self,
    ) -> None:
        """
        Validates explicitly supplied generated pattern entries.

        POST allows partial date-wise configuration.

        Duplicate dates are not allowed and every supplied
        date must fall within the assignment range.
        """

        seen_dates: set[date] = set()

        for item in self.generated_patterns:

            if item.shift_date in seen_dates:
                raise ValueError(
                    "Duplicate generated shift date: "
                    f"{item.shift_date.isoformat()}"
                )

            if not (
                self.start_date
                <= item.shift_date
                <= self.end_date
            ):
                raise ValueError(
                    f"Generated shift date "
                    f"{item.shift_date.isoformat()} "
                    "must be within the assignment date range."
                )

            seen_dates.add(
                item.shift_date
            )

    def _validate_leave_dates(
        self,
    ) -> None:
        """
        Validates leave dates.

        Leave dates must be unique and within
        the assignment date range.
        """

        dates: set[date] = set()

        for leave_day in self.leave_days:

            if leave_day.date in dates:
                raise ValueError(
                    f"Duplicate leave date: "
                    f"{leave_day.date.isoformat()}"
                )

            if not (
                self.start_date
                <= leave_day.date
                <= self.end_date
            ):
                raise ValueError(
                    f"Leave date "
                    f"{leave_day.date.isoformat()} "
                    "must be within the assignment date range."
                )

            dates.add(
                leave_day.date
            )

    @field_validator("week_off_days")
    @classmethod
    def validate_week_off_days(
        cls,
        value: List[str],
    ) -> List[str]:
        """
        Validates and normalizes week-off day names.
        """

        allowed_days = {
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        }

        normalized: List[str] = []

        for value_item in value:

            if not value_item:
                continue

            days = [
                item.strip()
                for item in value_item.split(",")
                if item.strip()
            ]

            for day in days:

                normalized_day = (
                    day.strip().capitalize()
                )

                if normalized_day not in allowed_days:
                    raise ValueError(
                        f"Invalid week-off day: {day}"
                    )

                if normalized_day not in normalized:
                    normalized.append(
                        normalized_day
                    )

        return normalized


class UpdateShiftAssignmentRequest(BaseModel):
    """
    Complete replacement request for PUT.

    PUT requires exactly one generated_patterns entry
    for every date in the assignment range.
    """

    employee_id: int

    start_date: date

    end_date: date

    week_off_days: List[str] = Field(
        default_factory=list,
    )

    leave_days: List[LeaveDayDto] = Field(
        default_factory=list,
    )

    generated_patterns: List[
        GeneratedShiftDateDto
    ] = Field(
        default_factory=list,
    )

    model_config = ConfigDict(
        extra="forbid",
    )

    @field_validator("employee_id")
    @classmethod
    def validate_employee_id(
        cls,
        value: int,
    ) -> int:
        """
        Validates the employee ID.
        """

        if value <= 0:
            raise ValueError(
                "Employee ID must be greater than zero."
            )

        return value

    @model_validator(mode="after")
    def validate_request(
        self,
    ) -> "UpdateShiftAssignmentRequest":
        """
        Performs cross-field validation for PUT.
        """

        if self.end_date < self.start_date:
            raise ValueError(
                "End date must be greater than or equal to start date."
            )

        self._validate_generated_dates()

        self._validate_leave_dates()

        return self

    def _validate_generated_dates(
        self,
    ) -> None:
        """
        PUT requires exactly one generated pattern
        for every date in the assignment range.

        Example:

        start_date = 2026-09-01
        end_date   = 2026-09-30

        generated_patterns must contain:

        2026-09-01
        2026-09-02
        2026-09-03
        ...
        2026-09-30
        """

        expected_dates: set[date] = set()

        current = self.start_date

        while current <= self.end_date:

            expected_dates.add(
                current
            )

            current += timedelta(
                days=1
            )

        actual_dates: List[date] = [
            item.shift_date
            for item in self.generated_patterns
        ]

        actual_date_set: set[date] = set(
            actual_dates
        )

        # FIX:
        # Create the expected date set before using it.
        expected_date_set: set[date] = set(
            expected_dates
        )

        # Check duplicate generated dates.
        if len(actual_dates) != len(
            actual_date_set
        ):
            raise ValueError(
                "Duplicate generated shift date found."
            )

        # The generated dates must exactly match
        # the assignment date range.
        if actual_date_set != expected_date_set:

            missing_dates = sorted(
                expected_date_set
                - actual_date_set
            )

            extra_dates = sorted(
                actual_date_set
                - expected_date_set
            )

            details: List[str] = []

            if missing_dates:
                details.append(
                    "Missing dates: "
                    + ", ".join(
                        item.isoformat()
                        for item in missing_dates
                    )
                )

            if extra_dates:
                details.append(
                    "Dates outside assignment range: "
                    + ", ".join(
                        item.isoformat()
                        for item in extra_dates
                    )
                )

            raise ValueError(
                "generated_patterns must contain exactly one "
                "entry for every date between start_date and "
                "end_date. "
                + " ".join(details)
            )

    def _validate_leave_dates(
        self,
    ) -> None:
        """
        Validates leave dates.

        Leave dates must be unique and within
        the assignment date range.
        """

        dates: set[date] = set()

        for leave_day in self.leave_days:

            if leave_day.date in dates:
                raise ValueError(
                    f"Duplicate leave date: "
                    f"{leave_day.date.isoformat()}"
                )

            if not (
                self.start_date
                <= leave_day.date
                <= self.end_date
            ):
                raise ValueError(
                    f"Leave date "
                    f"{leave_day.date.isoformat()} "
                    "must be within the assignment date range."
                )

            dates.add(
                leave_day.date
            )

    @field_validator("week_off_days")
    @classmethod
    def validate_week_off_days(
        cls,
        value: List[str],
    ) -> List[str]:
        """
        Validates and normalizes week-off day names.
        """

        allowed_days = {
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        }

        normalized: List[str] = []

        for value_item in value:

            if not value_item:
                continue

            days = [
                item.strip()
                for item in value_item.split(",")
                if item.strip()
            ]

            for day in days:

                normalized_day = (
                    day.strip().capitalize()
                )

                if normalized_day not in allowed_days:
                    raise ValueError(
                        f"Invalid week-off day: {day}"
                    )

                if normalized_day not in normalized:
                    normalized.append(
                        normalized_day
                    )

        return normalized


class PatchShiftAssignmentDateDto(BaseModel):
    """
    Partial update for one specific roster date.

    Only supplied properties are modified.

    Example:

    {
        "shift_date": "2026-09-02",
        "is_week_off": true
    }
    """

    shift_date: date

    pattern_id: Optional[int] = Field(
        default=None,
        gt=0,
    )

    is_week_off: Optional[bool] = None

    is_leave: Optional[bool] = None

    model_config = ConfigDict(
        extra="forbid",
    )

    @model_validator(mode="after")
    def validate_at_least_one_change(
        self,
    ) -> "PatchShiftAssignmentDateDto":
        """
        At least one updateable field must be supplied.
        """

        if (
            self.pattern_id is None
            and self.is_week_off is None
            and self.is_leave is None
        ):
            raise ValueError(
                "At least one of pattern_id, "
                "is_week_off or is_leave must be supplied."
            )

        return self


class PatchShiftAssignmentRequest(BaseModel):
    """
    Partial update request.

    PATCH updates only the specified dates.

    Example:

    {
        "dates": [
            {
                "shift_date": "2026-09-02",
                "is_week_off": true
            },
            {
                "shift_date": "2026-09-05",
                "is_leave": true
            }
        ]
    }
    """

    dates: List[
        PatchShiftAssignmentDateDto
    ] = Field(
        ...,
        min_length=1,
    )

    model_config = ConfigDict(
        extra="forbid",
    )

    @model_validator(mode="after")
    def validate_dates(
        self,
    ) -> "PatchShiftAssignmentRequest":
        """
        Validates that no date is supplied more than once.
        """

        dates: set[date] = set()

        for item in self.dates:

            if item.shift_date in dates:
                raise ValueError(
                    "Duplicate shift date found: "
                    f"{item.shift_date.isoformat()}"
                )

            dates.add(
                item.shift_date
            )

        return self


class ShiftAssignmentDateResponse(BaseModel):
    """
    Represents one roster date.
    """

    date: date

    day_of_week: str

    is_week_off: bool

    is_leave: bool

    pattern_id: Optional[int] = None

    pattern_name: Optional[str] = None

    start_time: Optional[str] = None

    end_time: Optional[str] = None


class ShiftAssignmentResponse(BaseModel):
    """
    Complete shift assignment response.
    """

    id: int

    employee_id: int

    employee_name: str

    employee_code: Optional[str] = None

    start_date: date

    end_date: date

    week_off_days: List[str]

    leave_days: List[LeaveDayDto]

    generated_dates: List[
        ShiftAssignmentDateResponse
    ]

    model_config = ConfigDict(
        from_attributes=True,
    )


class AssignedShiftListItem(BaseModel):
    """
    Shift assignment summary.
    """

    id: int

    employee_id: int

    employee_name: str

    employee_code: Optional[str] = None

    shift_pattern_names: List[str]

    start_date: date

    end_date: date

    week_off_days: List[str]

    leave_days: List[LeaveDayDto]

    model_config = ConfigDict(
        from_attributes=True,
    )


class ShiftPatternOption(BaseModel):
    """
    Shift pattern option used by the frontend.
    """

    pattern_id: int

    pattern_name: Optional[str] = None

    start_time: Optional[str] = None

    end_time: Optional[str] = None