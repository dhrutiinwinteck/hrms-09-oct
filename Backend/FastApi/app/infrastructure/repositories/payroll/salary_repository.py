from typing import Optional

from sqlalchemy.orm import Session

from app.domain.interfaces.payroll.salary_interface import (
    ISalaryRepository,
)

from app.infrastructure.models.payroll.salary import (
    SalaryModel,
)

from app.infrastructure.models.employee.bank import (
    BankModel,
)


class SalaryRepository(ISalaryRepository):

    def __init__(self, db: Session):
        self.db = db

    def get_salary_by_emp_id(
        self,
        emp_id: int,
    ) -> Optional[SalaryModel]:

        return (
            self.db.query(SalaryModel)
            .filter(
                SalaryModel.emp_id == emp_id
            )
            .first()
        )

    def get_bank_by_emp_id(
        self,
        emp_id: int,
    ) -> Optional[BankModel]:

        return (
            self.db.query(BankModel)
            .filter(
                BankModel.emp_id == emp_id
            )
            .first()
        )

    def add_salary(
        self,
        salary: SalaryModel,
    ) -> None:

        self.db.add(salary)

    def add_bank(
        self,
        bank: BankModel,
    ) -> None:

        self.db.add(bank)

    def save_changes(
        self,
    ) -> None:

        self.db.commit()