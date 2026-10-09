from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.application.dtos.employee.employee_salary import (
    EmployeeSalaryCreate,
    EmployeeSalaryUpdate,
)
from app.domain.interfaces.employee.employee_salary_interface import (
    IEmployeeSalaryService,
)
from app.infrastructure.models.employee.employee_salary import (
    EmployeeSalary,
)
from app.infrastructure.repositories.employee.employee_salary_repository import (
    EmployeeSalaryRepository,
)


class EmployeeSalaryService(IEmployeeSalaryService):

    def __init__(self, db: Session):

        self.db = db
        self.repository = EmployeeSalaryRepository(db)

    def create(
        self,
        data: EmployeeSalaryCreate
    ) -> EmployeeSalary:

        existing = self.repository.get_by_employee_id(
            data.emp_id
        )

        if existing is not None:
            raise ValueError(
                "Salary details already exist for this employee."
            )

        salary = EmployeeSalary(
            emp_id=data.emp_id,
            salary=data.salary,
            mode_pay=data.mode_pay,
            uan=data.uan,
            esic=data.esic,
            createdby=data.createdby,
            createdon=datetime.now(timezone.utc)
        )

        try:

            result = self.repository.create(salary)

            self.db.commit()

            return result

        except SQLAlchemyError:

            self.db.rollback()

            raise

    def get_by_id(
        self,
        salary_id: int
    ) -> Optional[EmployeeSalary]:

        return self.repository.get_by_id(salary_id)

    def get_by_employee_id(
        self,
        emp_id: int
    ) -> Optional[EmployeeSalary]:

        return self.repository.get_by_employee_id(emp_id)

    def update(
        self,
        salary_id: int,
        data: EmployeeSalaryUpdate
    ) -> Optional[EmployeeSalary]:

        salary = self.repository.get_by_id(salary_id)

        if salary is None:
            return None

        update_data = data.model_dump(
            exclude_unset=True
        )

        update_data.pop("modifiedby", None)

        for field, value in update_data.items():

            setattr(salary, field, value)

        salary.modifiedby = data.modifiedby
        salary.modifiedon = datetime.now(timezone.utc)

        try:

            result = self.repository.update(salary)

            self.db.commit()

            return result

        except SQLAlchemyError:

            self.db.rollback()

            raise

    def delete(
        self,
        salary_id: int
    ) -> bool:

        salary = self.repository.get_by_id(salary_id)

        if salary is None:
            return False

        try:

            self.repository.delete(salary)

            self.db.commit()

            return True

        except SQLAlchemyError:

            self.db.rollback()

            raise