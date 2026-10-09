from typing import List, Optional

from sqlalchemy.orm import Session

from app.domain.interfaces.employee.employee_educationinfo_interface import (
    IEmployeeEducationInfoRepository,
)

from app.infrastructure.models.employee.employee_educationinfo import (
    EmployeeEducationInfoModel,
)


class EmployeeEducationInfoRepository(
    IEmployeeEducationInfoRepository
):

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(
        self,
        education_id: int,
    ) -> Optional[EmployeeEducationInfoModel]:

        return (
            self.db.query(EmployeeEducationInfoModel)
            .filter(
                EmployeeEducationInfoModel.id == education_id
            )
            .first()
        )

    def get_by_emp_id(
        self,
        emp_id: int,
    ) -> List[EmployeeEducationInfoModel]:

        return (
            self.db.query(EmployeeEducationInfoModel)
            .filter(
                EmployeeEducationInfoModel.emp_id == emp_id
            )
            .order_by(
                EmployeeEducationInfoModel.id.asc()
            )
            .all()
        )

    def add(
        self,
        education_details: EmployeeEducationInfoModel,
    ) -> EmployeeEducationInfoModel:

        self.db.add(education_details)
        self.db.flush()

        return education_details

    def update(
        self,
        education_details: EmployeeEducationInfoModel,
        update_data: dict,
    ) -> EmployeeEducationInfoModel:

        for field, value in update_data.items():
            setattr(education_details, field, value)

        self.db.flush()

        return education_details

    def delete(
        self,
        education_details: EmployeeEducationInfoModel,
    ) -> None:

        self.db.delete(education_details)

    def commit(self) -> None:
        self.db.commit()

    def rollback(self) -> None:
        self.db.rollback()

    def refresh(
        self,
        education_details: EmployeeEducationInfoModel,
    ) -> None:

        self.db.refresh(education_details)