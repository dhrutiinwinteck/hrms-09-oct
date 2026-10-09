from typing import List, Optional

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.application.dtos.employee.employee_emergencycontact import (
    EmployeeEmergencyContactCreate,
    EmployeeEmergencyContactUpdate,
)
from app.infrastructure.models.employee.employee_emergencycontact import (
    EmployeeEmergencyContact,
)
from app.infrastructure.repositories.employee.employee_emergencycontact_repository import (
    EmployeeEmergencyContactRepository,
)


class EmployeeEmergencyContactService:
    def __init__(self, db: Session):
        self.db = db

        self.repository = EmployeeEmergencyContactRepository(
            db=db
        )

    def get_all(self) -> List[EmployeeEmergencyContact]:
        return self.repository.get_all()

    def get_by_id(
        self,
        record_id: int,
    ) -> Optional[EmployeeEmergencyContact]:
        return self.repository.get_by_id(record_id)

    def get_by_employee_id(
        self,
        emp_id: int,
    ) -> List[EmployeeEmergencyContact]:
        return self.repository.get_by_employee_id(emp_id)

    def create(
        self,
        data: EmployeeEmergencyContactCreate,
    ) -> EmployeeEmergencyContact:
        try:
            record = self.repository.create(
                data=data.model_dump(
                    exclude_unset=True
                )
            )

            self.db.commit()
            self.db.refresh(record)

            return record

        except SQLAlchemyError:
            self.db.rollback()
            raise

    def update(
        self,
        record_id: int,
        data: EmployeeEmergencyContactUpdate,
    ) -> Optional[EmployeeEmergencyContact]:
        try:
            update_data = data.model_dump(
                exclude_unset=True
            )

            record = self.repository.update(
                record_id=record_id,
                data=update_data,
            )

            if record is None:
                return None

            self.db.commit()
            self.db.refresh(record)

            return record

        except SQLAlchemyError:
            self.db.rollback()
            raise

    def delete(
        self,
        record_id: int,
    ) -> bool:
        try:
            deleted = self.repository.delete(
                record_id=record_id
            )

            if not deleted:
                return False

            self.db.commit()

            return True

        except SQLAlchemyError:
            self.db.rollback()
            raise