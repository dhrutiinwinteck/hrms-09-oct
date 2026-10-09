from sqlalchemy.orm import Session
from typing import List, Optional

from app.domain.interfaces.employee.department_interface import (
    IDepartmentRepository,
)

from app.infrastructure.models.employee.department import (
    DepartmentModel,
)


class DepartmentRepository(IDepartmentRepository):

    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[DepartmentModel]:
        return self.db.query(DepartmentModel).all()

    def get_by_id(
        self,
        dept_id: int,
    ) -> Optional[DepartmentModel]:
        return (
            self.db.query(DepartmentModel)
            .filter(
                DepartmentModel.id == dept_id
            )
            .first()
        )

    def add(
        self,
        department: DepartmentModel,
    ) -> DepartmentModel:
        self.db.add(department)
        self.db.commit()
        self.db.refresh(department)

        return department

    def update(
        self,
        department: DepartmentModel,
    ) -> DepartmentModel:
        self.db.commit()
        self.db.refresh(department)

        return department

    def delete(
        self,
        department: DepartmentModel,
    ) -> None:
        self.db.delete(department)
        self.db.commit()