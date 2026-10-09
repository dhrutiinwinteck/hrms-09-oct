from abc import ABC, abstractmethod
from datetime import date
from typing import List

from app.infrastructure.models.employee.employee import EmployeeModel


class IDashboardRepository(ABC):

    @abstractmethod
    def get_total_active_employees(self) -> int:
        pass

    @abstractmethod
    def get_present_today_count(self, today: date) -> int:
        pass

    @abstractmethod
    def get_on_leave_today_count(self, today: date) -> int:
        pass

    @abstractmethod
    def get_birthdays_today(
        self,
        month: int,
        day: int
    ) -> List[EmployeeModel]:
        pass