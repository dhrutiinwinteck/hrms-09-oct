from abc import ABC, abstractmethod
from datetime import date
from typing import Any, Dict, List, Optional


class IAttendanceReportRepository(ABC):
    """
    Read-only repository contract for monthly attendance reporting.

    This interface contains only data-access operations. All .NET
    attendance business rules remain in the application service.
    """

    @abstractmethod
    def get_monthly_attendance(
        self,
        start_date: date,
        end_date: date,
        employee_id: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        raise NotImplementedError

    @abstractmethod
    def get_active_employees(
        self,
        search: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        raise NotImplementedError
