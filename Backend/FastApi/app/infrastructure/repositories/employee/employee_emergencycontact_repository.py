from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.interfaces.employee.employee_emergencycontact_interface import (
    EmployeeEmergencyContactRepositoryInterface,
)
from app.infrastructure.models.employee.employee_emergencycontact import (
    EmployeeEmergencyContact,
)


class EmployeeEmergencyContactRepository(
    EmployeeEmergencyContactRepositoryInterface
):

    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[EmployeeEmergencyContact]:
        statement = select(EmployeeEmergencyContact).order_by(
            EmployeeEmergencyContact.id.desc()
        )

        return list(self.db.scalars(statement).all())

    def get_by_id(
        self,
        record_id: int,
    ) -> Optional[EmployeeEmergencyContact]:

        statement = select(EmployeeEmergencyContact).where(
            EmployeeEmergencyContact.id == record_id
        )

        return self.db.scalar(statement)

    def get_by_employee_id(
        self,
        emp_id: int,
    ) -> List[EmployeeEmergencyContact]:

        statement = (
            select(EmployeeEmergencyContact)
            .where(EmployeeEmergencyContact.emp_id == emp_id)
            .order_by(EmployeeEmergencyContact.id.desc())
        )

        return list(self.db.scalars(statement).all())

    def create(
        self,
        data: Dict[str, Any],
    ) -> EmployeeEmergencyContact:

        record = EmployeeEmergencyContact(
            **data,
            createdon=datetime.now(),
        )

        self.db.add(record)
        self.db.flush()
        self.db.refresh(record)

        return record

    def update(
        self,
        record_id: int,
        data: Dict[str, Any],
    ) -> Optional[EmployeeEmergencyContact]:

        record = self.get_by_id(record_id)

        if record is None:
            return None

        for field, value in data.items():
            setattr(record, field, value)

        record.modifiedon = datetime.now()

        self.db.flush()
        self.db.refresh(record)

        return record

    def delete(
        self,
        record_id: int,
    ) -> bool:

        record = self.get_by_id(record_id)

        if record is None:
            return False

        self.db.delete(record)
        self.db.flush()

        return True