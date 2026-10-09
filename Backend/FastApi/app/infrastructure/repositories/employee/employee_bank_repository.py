from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from app.infrastructure.models.employee.employee_bank import EmployeeBank
from app.domain.interfaces.employee.employee_bank_repository import (
    EmployeeBankRepositoryInterface,
)


class EmployeeBankRepository(EmployeeBankRepositoryInterface):

    def __init__(self, db: Session):
        self.db = db

    def create(self, bank_data: dict) -> EmployeeBank:
        bank = EmployeeBank(**bank_data)

        self.db.add(bank)
        self.db.commit()
        self.db.refresh(bank)

        return bank

    def get_by_id(self, bank_id: int) -> Optional[EmployeeBank]:
        return (
            self.db.query(EmployeeBank)
            .filter(EmployeeBank.id == bank_id)
            .first()
        )

    def get_by_employee_id(self, emp_id: int) -> List[EmployeeBank]:
        return (
            self.db.query(EmployeeBank)
            .filter(EmployeeBank.emp_id == emp_id)
            .order_by(EmployeeBank.id.desc())
            .all()
        )

    def update(
        self,
        bank_id: int,
        bank_data: dict,
    ) -> Optional[EmployeeBank]:

        bank = self.get_by_id(bank_id)

        if not bank:
            return None

        for key, value in bank_data.items():
            setattr(bank, key, value)

        bank.modifiedon = datetime.utcnow()

        self.db.commit()
        self.db.refresh(bank)

        return bank

    def delete(self, bank_id: int) -> bool:

        bank = self.get_by_id(bank_id)

        if not bank:
            return False

        self.db.delete(bank)
        self.db.commit()

        return True