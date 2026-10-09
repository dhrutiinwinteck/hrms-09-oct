from __future__ import annotations

from datetime import datetime, time
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ShiftPatternCreateDto(BaseModel):
    """
    Request DTO for creating a shift pattern.
    """

    pattern_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Shift pattern name.",
    )

    start_time: time = Field(
        ...,
        description="Shift start time.",
    )

    end_time: time = Field(
        ...,
        description="Shift end time.",
    )

    @field_validator("pattern_name")
    @classmethod
    def validate_pattern_name(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError(
                "Shift pattern name is required."
            )

        return value

    @field_validator("end_time")
    @classmethod
    def validate_end_time(
        cls,
        value: time,
        info,
    ) -> time:
        start_time = info.data.get("start_time")

        if start_time is not None and start_time == value:
            raise ValueError(
                "Shift start time and end time cannot be the same."
            )

        return value


class ShiftPatternResponseDto(BaseModel):
    """
    Response DTO for shift pattern data.
    """

    model_config = ConfigDict(
        from_attributes=True
    )

    pattern_id: int
    pattern_name: str
    start_time: time
    end_time: time
    created_by: str
    created_date: datetime
    modified_by: Optional[str] = None
    modified_date: Optional[datetime] = None


class ShiftPatternDeleteResponseDto(BaseModel):
    """
    Response DTO returned after deleting a shift pattern.
    """

    message: str
    pattern_id: int