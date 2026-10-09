from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.application.dtos.employee.employee_bank_dto import (
    EmployeeBankCreate,
    EmployeeBankUpdate,
)
from app.infrastructure.repositories.employee.employee_bank_repository import (
    EmployeeBankRepository,
)


class EmployeeBankService:

    def __init__(self, db: Session):
        self.repository = EmployeeBankRepository(db)

    # CREATE
    def create_bank_details(
        self,
        bank_data: EmployeeBankCreate,
    ):
        bank_dict = bank_data.model_dump(
            exclude_unset=True
        )

        return self.repository.create(bank_dict)

    # GET BY ID
    def get_bank_details(
        self,
        bank_id: int,
    ):
        bank = self.repository.get_by_id(bank_id)

        if not bank:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee bank details not found",
            )

        return bank

    # GET BY EMPLOYEE ID
    def get_employee_bank_details(
        self,
        emp_id: int,
    ):
        return self.repository.get_by_employee_id(emp_id)

    # UPDATE
    def update_bank_details(
        self,
        bank_id: int,
        bank_data: EmployeeBankUpdate,
    ):
        update_dict = bank_data.model_dump(
            exclude_unset=True
        )

        bank = self.repository.update(
            bank_id,
            update_dict,
        )

        if not bank:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee bank details not found",
            )

        return bank

    # DELETE
    def delete_bank_details(
        self,
        bank_id: int,
    ):
        deleted = self.repository.delete(bank_id)

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee bank details not found",
            )

        return {
            "message": "Employee bank details deleted successfully"
        }