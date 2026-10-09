from typing import List, Optional

from sqlalchemy.orm import Session

from app.domain.interfaces.resignation.resignation_interface import (
    IResignationRepository
)

from app.infrastructure.models.resignation.resignation import (
    ResignationModel
)

from app.infrastructure.models.employee.employee import (
    EmployeeModel
)


class ResignationRepository(
    IResignationRepository
):

    def __init__(
        self,
        db: Session
    ):
        self.db = db

    # ========================================================
    # GET ALL RESIGNATIONS
    # ========================================================

    def get_all(
        self
    ) -> List[ResignationModel]:

        return (
            self.db
            .query(ResignationModel)
            .order_by(
                ResignationModel.id.desc()
            )
            .all()
        )

    # ========================================================
    # GET RESIGNATION BY ID
    # ========================================================

    def get_by_id(
        self,
        res_id: int
    ) -> Optional[ResignationModel]:

        return (
            self.db
            .query(ResignationModel)
            .filter(
                ResignationModel.id == res_id
            )
            .first()
        )

    # ========================================================
    # ADD RESIGNATION
    # ========================================================

    def add(
        self,
        resignation: ResignationModel
    ) -> ResignationModel:

        try:

            self.db.add(resignation)

            self.db.commit()

            self.db.refresh(resignation)

            return resignation

        except Exception:

            self.db.rollback()

            raise

    # ========================================================
    # UPDATE RESIGNATION
    # ========================================================

    def update(
        self,
        resignation: ResignationModel
    ) -> ResignationModel:

        try:

            self.db.commit()

            self.db.refresh(resignation)

            return resignation

        except Exception:

            self.db.rollback()

            raise

    # ========================================================
    # DELETE RESIGNATION
    # ========================================================

    def delete(
        self,
        resignation: ResignationModel
    ) -> None:

        try:

            self.db.delete(resignation)

            self.db.commit()

        except Exception:

            self.db.rollback()

            raise

    # ========================================================
    # GET EMPLOYEE
    # ========================================================

    def get_employee_by_id(
        self,
        emp_id: int
    ) -> Optional[EmployeeModel]:

        return (
            self.db
            .query(EmployeeModel)
            .filter(
                EmployeeModel.id == emp_id
            )
            .first()
        )

    # ========================================================
    # SAVE CHANGES
    # ========================================================

    def save_changes(
        self
    ) -> None:

        try:

            self.db.commit()

        except Exception:

            self.db.rollback()

            raise