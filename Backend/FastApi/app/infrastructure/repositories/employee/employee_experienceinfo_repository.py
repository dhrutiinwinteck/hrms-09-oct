from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.interfaces.employee.employee_experienceinfo_interface import (
    EmployeeExperienceInfoInterface,
)

from app.infrastructure.models.employee.employee_experienceinfo import (
    EmployeeExperienceInfoModel,
)


class EmployeeExperienceInfoRepository(
    EmployeeExperienceInfoInterface
):

    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        data: dict[str, Any],
    ) -> EmployeeExperienceInfoModel:

        experience = EmployeeExperienceInfoModel(
            **data
        )

        self.db.add(experience)
        self.db.flush()
        self.db.refresh(experience)

        return experience

    def get_by_employee_id(
        self,
        emp_id: int,
    ) -> list[EmployeeExperienceInfoModel]:

        statement = (
            select(EmployeeExperienceInfoModel)
            .where(
                EmployeeExperienceInfoModel.emp_id == emp_id
            )
            .order_by(
                EmployeeExperienceInfoModel.id.desc()
            )
        )

        result = self.db.execute(statement)

        return list(result.scalars().all())

    def get_by_id(
        self,
        experience_id: int,
    ) -> Optional[EmployeeExperienceInfoModel]:

        statement = select(
            EmployeeExperienceInfoModel
        ).where(
            EmployeeExperienceInfoModel.id == experience_id
        )

        result = self.db.execute(statement)

        return result.scalar_one_or_none()

    def update(
        self,
        experience_id: int,
        data: dict[str, Any],
    ) -> Optional[EmployeeExperienceInfoModel]:

        experience = self.get_by_id(experience_id)

        if experience is None:
            return None

        for field, value in data.items():
            setattr(experience, field, value)

        self.db.flush()
        self.db.refresh(experience)

        return experience

    def delete(
        self,
        experience_id: int,
    ) -> bool:

        experience = self.get_by_id(experience_id)

        if experience is None:
            return False

        self.db.delete(experience)
        self.db.flush()

        return True