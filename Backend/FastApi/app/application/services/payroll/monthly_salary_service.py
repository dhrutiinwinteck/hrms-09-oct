from typing import Any

from app.domain.interfaces.payroll.monthly_salary_interface import (
    IMonthlySalaryRepository,
)


class MonthlySalaryService:
    """
    Business service for Monthly Salary Sheet.
    """

    def __init__(
        self,
        repository: IMonthlySalaryRepository,
    ):
        self.repository = repository

    def get_monthly_salary_sheet(
        self,
        month: int,
        year: int,
    ) -> dict[str, Any]:
        """
        Retrieve salary sheet for requested month/year.
        """

        salary_data = (
            self.repository.get_monthly_salary_sheet(
                month=month,
                year=year,
            )
        )

        return {
            "month": month,
            "year": year,
            "total_records": len(salary_data),
            "data": salary_data,
        }