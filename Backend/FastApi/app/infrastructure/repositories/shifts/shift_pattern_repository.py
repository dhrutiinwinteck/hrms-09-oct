from __future__ import annotations

from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.domain.interfaces.shifts.shift_pattern_interface import (
    IShiftPatternRepository,
)

from app.infrastructure.models.shifts.shift_pattern import (
    ShiftPatternModel,
)


class ShiftPatternRepository(IShiftPatternRepository):
    """
    Repository implementation for shift pattern persistence.
    """

    def __init__(self, db: Session) -> None:
        self._db = db

    def get_all(self) -> list[ShiftPatternModel]:
        statement = select(ShiftPatternModel).order_by(
            ShiftPatternModel.patternid.asc()
        )

        result = self._db.execute(statement)

        return list(result.scalars().all())

    def get_by_id(
        self,
        pattern_id: int,
    ) -> Optional[ShiftPatternModel]:
        statement = select(ShiftPatternModel).where(
            ShiftPatternModel.patternid == pattern_id
        )

        result = self._db.execute(statement)

        return result.scalar_one_or_none()

    def get_by_name(
        self,
        pattern_name: str,
    ) -> Optional[ShiftPatternModel]:
        statement = select(ShiftPatternModel).where(
            func.lower(ShiftPatternModel.patternname)
            == pattern_name.strip().lower()
        )

        result = self._db.execute(statement)

        return result.scalar_one_or_none()

    def add(
        self,
        shift_pattern: ShiftPatternModel,
    ) -> ShiftPatternModel:
        self._db.add(shift_pattern)
        self._db.flush()
        self._db.refresh(shift_pattern)

        return shift_pattern

    def delete(
        self,
        shift_pattern: ShiftPatternModel,
    ) -> None:
        self._db.delete(shift_pattern)
        self._db.flush()