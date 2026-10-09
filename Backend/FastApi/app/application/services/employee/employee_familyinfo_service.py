from datetime import datetime
from typing import List, Optional

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.application.dtos.employee.employee_familyinfo import (
    EmployeeFamilyInfoCreate,
    EmployeeFamilyInfoResponse,
    EmployeeFamilyInfoUpdate,
)

from app.domain.interfaces.employee.employee_familyinfo_interface import (
    IEmployeeFamilyInfoService,
)

from app.infrastructure.models.employee.employee_familyinfo import (
    EmployeeFamilyInfo,
)

from app.infrastructure.repositories.employee.employee_familyinfo_repository import (
    EmployeeFamilyInfoRepository,
)


class EmployeeFamilyInfoService(IEmployeeFamilyInfoService):

    def __init__(
        self,
        db: Session,
        repository: EmployeeFamilyInfoRepository,
    ):
        self._db = db
        self._repository = repository

    def create(
        self,
        request: EmployeeFamilyInfoCreate,
        current_user: Optional[str],
    ) -> EmployeeFamilyInfoResponse:

        try:
            now = datetime.now()

            family_info = EmployeeFamilyInfo(
                emp_id=request.emp_id,
                name=request.name,
                relationship=request.relationship,
                dob=request.dob,
                phone=request.phone,
                createdby=current_user,
                createdon=now,
            )

            created = self._repository.create(family_info)

            self._db.commit()
            self._db.refresh(created)

            return EmployeeFamilyInfoResponse.model_validate(
                created
            )

        except SQLAlchemyError:
            self._db.rollback()
            raise

    def get_by_id(
        self,
        family_id: int,
    ) -> Optional[EmployeeFamilyInfoResponse]:

        family_info = self._repository.get_by_id(family_id)

        if family_info is None:
            return None

        return EmployeeFamilyInfoResponse.model_validate(
            family_info
        )

    def get_by_employee_id(
        self,
        emp_id: int,
    ) -> List[EmployeeFamilyInfoResponse]:

        family_records = self._repository.get_by_employee_id(
            emp_id
        )

        return [
            EmployeeFamilyInfoResponse.model_validate(record)
            for record in family_records
        ]

    def update(
        self,
        family_id: int,
        request: EmployeeFamilyInfoUpdate,
        current_user: Optional[str],
    ) -> Optional[EmployeeFamilyInfoResponse]:

        family_info = self._repository.get_by_id(family_id)

        if family_info is None:
            return None

        try:
            update_data = request.model_dump(
                exclude_unset=True
            )

            for field, value in update_data.items():
                setattr(family_info, field, value)

            family_info.modifiedby = current_user
            family_info.modifiedon = datetime.now()

            updated = self._repository.update(family_info)

            self._db.commit()
            self._db.refresh(updated)

            return EmployeeFamilyInfoResponse.model_validate(
                updated
            )

        except SQLAlchemyError:
            self._db.rollback()
            raise

    def delete(
        self,
        family_id: int,
    ) -> bool:

        family_info = self._repository.get_by_id(family_id)

        if family_info is None:
            return False

        try:
            self._repository.delete(family_info)

            self._db.commit()

            return True

        except SQLAlchemyError:
            self._db.rollback()
            raise