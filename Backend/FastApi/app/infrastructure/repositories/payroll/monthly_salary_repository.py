from typing import Any

from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from app.domain.interfaces.payroll.monthly_salary_interface import (
    IMonthlySalaryRepository,
)

from app.infrastructure.models.employee.bank import (
    BankModel,
)

from app.infrastructure.models.employee.employee import (
    EmployeeModel,
)

from app.infrastructure.models.payroll.salary import (
    SalaryModel,
)


class MonthlySalaryRepository(
    IMonthlySalaryRepository
):
    """
    Repository for Monthly Salary Sheet.

    Uses existing employee, salary, and bank tables.
    """

    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def get_monthly_salary_sheet(
        self,
        month: int,
        year: int,
    ) -> list[dict[str, Any]]:
        """
        Retrieve employee salary details.

        Current database limitation:
        SalaryModel has no month/year column.
        Therefore, month/year are not used as SQL filters.
        """

        latest_salary_id = (
            self.db.query(
                SalaryModel.emp_id,
                func.max(SalaryModel.id).label(
                    "latest_salary_id"
                ),
            )
            .group_by(
                SalaryModel.emp_id
            )
            .subquery()
        )

        latest_bank_id = (
            self.db.query(
                BankModel.emp_id,
                func.max(BankModel.id).label(
                    "latest_bank_id"
                ),
            )
            .group_by(
                BankModel.emp_id
            )
            .subquery()
        )

        results = (
            self.db.query(
                EmployeeModel.id.label(
                    "employee_id"
                ),

                EmployeeModel.first_name.label(
                    "first_name"
                ),

                EmployeeModel.last_name.label(
                    "last_name"
                ),

                SalaryModel.uan.label(
                    "uan"
                ),

                SalaryModel.esic.label(
                    "esic"
                ),

                BankModel.bank_name.label(
                    "bank_name"
                ),

                BankModel.account_no.label(
                    "account_no"
                ),

                BankModel.ifsc_code.label(
                    "ifsc"
                ),

                SalaryModel.salary.label(
                    "net_salary"
                ),
            )
            .outerjoin(
                latest_salary_id,
                latest_salary_id.c.emp_id
                == EmployeeModel.id,
            )
            .outerjoin(
                SalaryModel,
                and_(
                    SalaryModel.emp_id
                    == EmployeeModel.id,

                    SalaryModel.id
                    == latest_salary_id.c.latest_salary_id,
                ),
            )
            .outerjoin(
                latest_bank_id,
                latest_bank_id.c.emp_id
                == EmployeeModel.id,
            )
            .outerjoin(
                BankModel,
                and_(
                    BankModel.emp_id
                    == EmployeeModel.id,

                    BankModel.id
                    == latest_bank_id.c.latest_bank_id,
                ),
            )
            .filter(
                EmployeeModel.is_remove != 1
            )
            .order_by(
                EmployeeModel.first_name.asc(),
                EmployeeModel.last_name.asc(),
                EmployeeModel.id.asc(),
            )
            .all()
        )

        salary_sheet: list[dict[str, Any]] = []

        for row in results:

            first_name = (
                row.first_name or ""
            ).strip()

            last_name = (
                row.last_name or ""
            ).strip()

            employee_name = (
                f"{first_name} {last_name}"
            ).strip()

            salary_sheet.append(
                {
                    "employee_id": row.employee_id,

                    "employee_name": employee_name,

                    "uan": row.uan,

                    "esic": row.esic,

                    "bank_name": row.bank_name,

                    "account_no": row.account_no,

                    "ifsc": row.ifsc,

                    "net_salary": row.net_salary,
                }
            )

        return salary_sheet