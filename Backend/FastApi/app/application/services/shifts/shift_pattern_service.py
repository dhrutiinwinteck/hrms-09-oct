from __future__ import annotations

from datetime import datetime

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.application.dtos.shifts.shift_pattern import (
    ShiftPatternCreateDto,
)

from app.domain.interfaces.shifts.shift_pattern_interface import (
    IShiftPatternRepository,
)

from app.infrastructure.models.shifts.shift_pattern import (
    ShiftPatternModel,
)


class ShiftPatternNotFoundException(Exception):
    """
    Raised when a shift pattern does not exist.
    """

    def __init__(self, pattern_id: int) -> None:
        super().__init__(
            f"Shift pattern with ID {pattern_id} was not found."
        )


class ShiftPatternAlreadyExistsException(Exception):
    """
    Raised when a duplicate shift pattern name is detected.
    """

    def __init__(self, pattern_name: str) -> None:
        super().__init__(
            f"Shift pattern '{pattern_name}' already exists."
        )


class ShiftPatternInUseException(Exception):
    """
    Raised when a shift pattern cannot be deleted because
    another table references it.
    """

    def __init__(self, pattern_id: int) -> None:
        super().__init__(
            f"Shift pattern with ID {pattern_id} cannot be deleted "
            "because it is currently in use."
        )


class ShiftPatternService:
    """
    Application service for shift pattern management.
    """

    def __init__(
        self,
        db: Session,
        repository: IShiftPatternRepository,
    ) -> None:
        self._db = db
        self._repository = repository

    def get_all(
        self,
    ) -> list[ShiftPatternModel]:
        return self._repository.get_all()

    def create(
        self,
        dto: ShiftPatternCreateDto,
        created_by: str,
    ) -> ShiftPatternModel:

        existing_pattern = (
            self._repository.get_by_name(
                dto.pattern_name
            )
        )

        if existing_pattern is not None:
            raise ShiftPatternAlreadyExistsException(
                dto.pattern_name
            )

        shift_pattern = ShiftPatternModel(
            patternname=dto.pattern_name,
            starttime=dto.start_time,
            endtime=dto.end_time,
            createdby=created_by,
            createddate=datetime.utcnow(),
            modifiedby=None,
            modifieddate=None,
        )

        try:
            created_pattern = self._repository.add(
                shift_pattern
            )

            self._db.commit()

            return created_pattern

        except IntegrityError:
            self._db.rollback()

            raise ShiftPatternAlreadyExistsException(
                dto.pattern_name
            ) from None

        except Exception:
            self._db.rollback()
            raise

    def delete(
        self,
        pattern_id: int,
    ) -> None:

        shift_pattern = (
            self._repository.get_by_id(
                pattern_id
            )
        )

        if shift_pattern is None:
            raise ShiftPatternNotFoundException(
                pattern_id
            )

        try:
            self._repository.delete(
                shift_pattern
            )

            self._db.commit()

        except IntegrityError:
            self._db.rollback()

            raise ShiftPatternInUseException(
                pattern_id
            ) from None

        except Exception:
            self._db.rollback()
            raise