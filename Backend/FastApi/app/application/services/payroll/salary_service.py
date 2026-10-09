from fastapi import HTTPException

from app.domain.interfaces.payroll.salary_interface import (
    ISalaryRepository,
)

from app.infrastructure.models.payroll.salary import (
    SalaryModel,
)

from app.infrastructure.models.employee.bank import (
    BankModel,
)

from app.application.dtos.payroll.salary import (
    SalaryBankUpdate,
)


class SalaryService:
    def __init__(self, repo: ISalaryRepository):
        self.repo = repo

    def update_salary_and_bank(
        self,
        data: SalaryBankUpdate,
    ):
        # 1. Logic for Salary record
        salary_rec = self.repo.get_salary_by_emp_id(
            data.emp_id
        )

        if not salary_rec:
            salary_rec = SalaryModel(
                emp_id=data.emp_id
            )

            self.repo.add_salary(
                salary_rec
            )

        salary_rec.salary = data.salary
        salary_rec.uan = data.uan
        salary_rec.esic = data.esic
        salary_rec.mode_pay = data.mode_pay

        # 2. Logic for Bank record
        bank_rec = self.repo.get_bank_by_emp_id(
            data.emp_id
        )

        if not bank_rec:
            bank_rec = BankModel(
                emp_id=data.emp_id
            )

            self.repo.add_bank(
                bank_rec
            )

        bank_rec.bank_name = data.bank_name
        bank_rec.account_no = data.account_no
        bank_rec.ifsc_code = data.ifsc_code

        self.repo.save_changes()

        return {
            "message": "Salary and Bank details updated successfully"
        }

    def get_employee_salary_details(
        self,
        emp_id: int,
    ):
        salary = self.repo.get_salary_by_emp_id(
            emp_id
        )

        bank = self.repo.get_bank_by_emp_id(
            emp_id
        )

        if not salary:
            raise HTTPException(
                status_code=404,
                detail="Salary details not found",
            )

        return {
            "salary": float(salary.salary),
            "uan": salary.uan,
            "bank_name": (
                bank.bank_name
                if bank
                else None
            ),
            "account_no": (
                bank.account_no
                if bank
                else None
            ),
            "ifsc": (
                bank.ifsc_code
                if bank
                else None
            ),
        }