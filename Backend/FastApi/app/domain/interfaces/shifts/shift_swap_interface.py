from __future__ import annotations

from datetime import date, datetime
from typing import Any, Dict, List, Optional, Protocol


class IShiftSwapRepository(Protocol):
    """
    Repository contract for Shift Swap operations.
    """

    def get_employee_by_id(
        self,
        employee_id: int,
    ) -> Optional[Dict[str, Any]]:
        ...

    def get_employee_by_login(
        self,
        login_name: str,
    ) -> Optional[Dict[str, Any]]:
        ...

    def get_eligible_employees(
        self,
        requester_employee_id: int,
        swap_date: date,
    ) -> List[Dict[str, Any]]:
        ...

    def get_shift_date(
        self,
        employee_id: int,
        swap_date: date,
        for_update: bool = False,
    ) -> Optional[Dict[str, Any]]:
        ...

    def get_shift_swap_request(
        self,
        swap_requested_id: int,
    ) -> Optional[Dict[str, Any]]:
        ...

    def get_duplicate_active_request(
        self,
        requested_by_emp_id: int,
        requested_to_emp_id: int,
        swap_date: date,
    ) -> Optional[Dict[str, Any]]:
        ...

    def create_shift_swap_request(
        self,
        requested_by_emp_id: int,
        requested_to_emp_id: int,
        request_type: str,
        swap_date: date,
        status: str,
        created_date: datetime,
    ) -> Dict[str, Any]:
        ...

    def get_my_requests(
        self,
        employee_id: int,
    ) -> List[Dict[str, Any]]:
        ...

    def get_all_requests(
        self,
    ) -> List[Dict[str, Any]]:
        ...

    def accept_request(
        self,
        swap_requested_id: int,
        target_employee_id: int,
    ) -> Dict[str, Any]:
        ...

    def reject_request(
        self,
        swap_requested_id: int,
        target_employee_id: int,
    ) -> Dict[str, Any]:
        ...

    def approve_request(
        self,
        swap_requested_id: int,
        manager_employee_id: int,
    ) -> Dict[str, Any]:
        ...

    def manager_reject_request(
        self,
        swap_requested_id: int,
        manager_employee_id: int,
    ) -> Dict[str, Any]:
        ...