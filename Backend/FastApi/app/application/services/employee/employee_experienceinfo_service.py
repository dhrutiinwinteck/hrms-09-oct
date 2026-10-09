from datetime import datetime
from typing import Any, Optional

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.application.dtos.employee.employee_experienceinfo import (
    EmployeeExperienceInfoCreate,
    EmployeeExperienceInfoUpdate,
)

from app.infrastructure.repositories.employee.employee_experienceinfo_repository import (
    EmployeeExperienceInfoRepository,
)


class EmployeeExperienceInfoService:

    def __init__(self, db: Session):

        self.db = db

        self.repository = (
            EmployeeExperienceInfoRepository(db)
        )

    @staticmethod
    def _validate_date_range(
        exp_year_from: Optional[datetime],
        exp_year_to: Optional[datetime],
    ) -> None:

        if (
            exp_year_from is not None
            and exp_year_to is not None
            and exp_year_to < exp_year_from
        ):
            raise ValueError(
                "Experience end date cannot be earlier than start date."
            )

    def create(
        self,
        request: EmployeeExperienceInfoCreate,
    ):

        data = request.model_dump(
            exclude_unset=True
        )

        self._validate_date_range(
            data.get("exp_year_from"),
            data.get("exp_year_to"),
        )

        now = datetime.now()

        data["createdon"] = now
        data["modifiedon"] = None

        try:

            experience = self.repository.create(data)

            self.db.commit()
            self.db.refresh(experience)

            return experience

        except (SQLAlchemyError, ValueError):

            self.db.rollback()
            raise

    def get_by_employee_id(
        self,
        emp_id: int,
    ):

        return self.repository.get_by_employee_id(emp_id)

    def get_by_id(
        self,
        experience_id: int,
    ):

        return self.repository.get_by_id(experience_id)

    def update(
        self,
        experience_id: int,
        request: EmployeeExperienceInfoUpdate,
    ):

        existing = self.repository.get_by_id(
            experience_id
        )

        if existing is None:
            return None

        data = request.model_dump(
            exclude_unset=True
        )

        exp_year_from = data.get(
            "exp_year_from",
            existing.exp_year_from,
        )

        exp_year_to = data.get(
            "exp_year_to",
            existing.exp_year_to,
        )

        self._validate_date_range(
            exp_year_from,
            exp_year_to,
        )

        data["modifiedon"] = datetime.now()

        try:

            updated = self.repository.update(
                experience_id,
                data,
            )

            self.db.commit()

            if updated is not None:
                self.db.refresh(updated)

            return updated

        except (SQLAlchemyError, ValueError):

            self.db.rollback()
            raise

    def delete(
        self,
        experience_id: int,
    ) -> bool:

        try:

            deleted = self.repository.delete(
                experience_id
            )

            if not deleted:
                return False

            self.db.commit()

            return True

        except SQLAlchemyError:

            self.db.rollback()
            raise