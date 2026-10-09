from abc import ABC, abstractmethod
from typing import Any


class IMonthlySalaryRepository(ABC):
    """
    Contract for Monthly Salary Sheet repository.
    """

    @abstractmethod
    def get_monthly_salary_sheet(
        self,
        month: int,
        year: int,
    ) -> list[dict[str, Any]]:
        """
        Retrieve employee salary sheet.
        """
        raise NotImplementedError