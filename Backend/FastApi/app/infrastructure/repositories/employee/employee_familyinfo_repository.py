from typing import List, Optional

from sqlalchemy.orm import Session

from app.infrastructure.models.employee.employee_familyinfo import (
    EmployeeFamilyInfo,
)


class EmployeeFamilyInfoRepository:

    def __init__(self, db: Session):
        self._db = db

    def create(
        self,
        family_info: EmployeeFamilyInfo,
    ) -> EmployeeFamilyInfo:
        self._db.add(family_info)
        self._db.flush()
        self._db.refresh(family_info)
        return family_info

    def get_by_id(
        self,
        family_id: int,
    ) -> Optional[EmployeeFamilyInfo]:
        return (
            self._db.query(EmployeeFamilyInfo)
            .filter(EmployeeFamilyInfo.id == family_id)
            .first()
        )

    def get_by_employee_id(
        self,
        emp_id: int,
    ) -> List[EmployeeFamilyInfo]:
        return (
            self._db.query(EmployeeFamilyInfo)
            .filter(EmployeeFamilyInfo.emp_id == emp_id)
            .order_by(EmployeeFamilyInfo.id.asc())
            .all()
        )

    def update(
        self,
        family_info: EmployeeFamilyInfo,
    ) -> EmployeeFamilyInfo:
        self._db.flush()
        self._db.refresh(family_info)
        return family_info

    def delete(
        self,
        family_info: EmployeeFamilyInfo,
    ) -> None:
        self._db.delete(family_info)
        self._db.flush()