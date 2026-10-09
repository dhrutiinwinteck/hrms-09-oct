from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional

from app.infrastructure.models.shifts.shift_pattern import ShiftPatternModel


class IShiftPatternRepository(ABC):
    """
    Repository contract for shift pattern operations.
    """

    @abstractmethod
    def get_all(self) -> list[ShiftPatternModel]:
        raise NotImplementedError

    @abstractmethod
    def get_by_id(
        self,
        pattern_id: int,
    ) -> Optional[ShiftPatternModel]:
        raise NotImplementedError

    @abstractmethod
    def get_by_name(
        self,
        pattern_name: str,
    ) -> Optional[ShiftPatternModel]:
        raise NotImplementedError

    @abstractmethod
    def add(
        self,
        shift_pattern: ShiftPatternModel,
    ) -> ShiftPatternModel:
        raise NotImplementedError

    @abstractmethod
    def delete(
        self,
        shift_pattern: ShiftPatternModel,
    ) -> None:
        raise NotImplementedError