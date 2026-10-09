from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.infrastructure.models.employee.employee_salary import (
    EmployeeSalary,
)


class EmployeeSalaryRepository:

    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        salary: EmployeeSalary
    ) -> EmployeeSalary:

        self.db.add(salary)
        self.db.flush()
        self.db.refresh(salary)

        return salary

    def get_by_id(
        self,
        salary_id: int
    ) -> Optional[EmployeeSalary]:

        statement = select(EmployeeSalary).where(
            EmployeeSalary.id == salary_id
        )

        return self.db.execute(statement).scalar_one_or_none()

    def get_by_employee_id(
        self,
        emp_id: int
    ) -> Optional[EmployeeSalary]:

        statement = (
            select(EmployeeSalary)
            .where(EmployeeSalary.emp_id == emp_id)
            .order_by(EmployeeSalary.id.desc())
            .limit(1)
        )

        return self.db.execute(statement).scalar_one_or_none()

    def update(
        self,
        salary: EmployeeSalary
    ) -> EmployeeSalary:

        self.db.flush()
        self.db.refresh(salary)

        return salary

    def delete(
        self,
        salary: EmployeeSalary
    ) -> None:

        self.db.delete(salary)
        self.db.flush()