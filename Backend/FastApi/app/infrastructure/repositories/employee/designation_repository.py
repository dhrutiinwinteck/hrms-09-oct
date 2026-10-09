from sqlalchemy.orm import Session
from typing import List, Optional, Any

from app.domain.interfaces.employee.designation_interface import (
    IDesignationRepository,
)

from app.infrastructure.models.employee.designation import (
    DesignationModel,
)

from app.infrastructure.models.employee.department import (
    DepartmentModel,
)


class DesignationRepository(IDesignationRepository):

    def __init__(self, db: Session):
        self.db = db

    def get_all_with_department(self) -> List[Any]:
        return (
            self.db.query(
                DesignationModel,
                DepartmentModel.name.label(
                    "department_name"
                ),
            )
            .join(
                DepartmentModel,
                DesignationModel.depart_id
                == DepartmentModel.id,
            )
            .all()
        )

    def get_by_id(
        self,
        desg_id: int,
    ) -> Optional[DesignationModel]:
        return (
            self.db.query(DesignationModel)
            .filter(
                DesignationModel.id == desg_id
            )
            .first()
        )

    def add(
        self,
        designation: DesignationModel,
    ) -> DesignationModel:
        self.db.add(designation)
        self.db.commit()
        self.db.refresh(designation)

        return designation

    def update(
        self,
        designation: DesignationModel,
    ) -> DesignationModel:
        self.db.commit()
        self.db.refresh(designation)

        return designation

    def delete(
        self,
        designation: DesignationModel,
    ) -> None:
        self.db.delete(designation)
        self.db.commit()