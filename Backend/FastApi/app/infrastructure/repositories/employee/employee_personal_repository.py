from typing import Optional

from sqlalchemy.orm import Session

from app.domain.interfaces.employee.employee_personal_interface import (
    IEmployeePersonalRepository,
)

from app.infrastructure.models.employee.employee_personal import (
    EmployeePersonalModel,
)


class EmployeePersonalRepository(IEmployeePersonalRepository):

    def __init__(self, db: Session):
        self.db = db

    # -----------------------------------------
    # GET ALL PERSONAL DETAILS
    # -----------------------------------------

    def get_all(
        self,
    ) -> list[EmployeePersonalModel]:

        return (
            self.db
            .query(EmployeePersonalModel)
            .all()
        )

    # -----------------------------------------
    # GET PERSONAL DETAILS BY EMPLOYEE ID
    # -----------------------------------------

    def get_by_emp_id(
        self,
        emp_id: int,
    ) -> Optional[EmployeePersonalModel]:

        return (
            self.db
            .query(EmployeePersonalModel)
            .filter(
                EmployeePersonalModel.emp_id == emp_id
            )
            .first()
        )

    # -----------------------------------------
    # CREATE
    # -----------------------------------------

    def add(
        self,
        personal_details: EmployeePersonalModel,
    ) -> EmployeePersonalModel:

        self.db.add(personal_details)

        # Generate ID before commit
        self.db.flush()

        return personal_details

    # -----------------------------------------
    # UPDATE
    # -----------------------------------------

    def update(
        self,
        personal_details: EmployeePersonalModel,
        update_data: dict,
    ) -> EmployeePersonalModel:

        for field, value in update_data.items():
            setattr(
                personal_details,
                field,
                value,
            )

        self.db.flush()

        return personal_details

    # -----------------------------------------
    # DELETE
    # -----------------------------------------

    def delete(
        self,
        personal_details: EmployeePersonalModel,
    ) -> None:

        self.db.delete(personal_details)

    # -----------------------------------------
    # COMMIT
    # -----------------------------------------

    def commit(self) -> None:

        self.db.commit()

    # -----------------------------------------
    # ROLLBACK
    # -----------------------------------------

    def rollback(self) -> None:

        self.db.rollback()

    # -----------------------------------------
    # REFRESH
    # -----------------------------------------

    def refresh(
        self,
        personal_details: EmployeePersonalModel,
    ) -> None:

        self.db.refresh(personal_details)