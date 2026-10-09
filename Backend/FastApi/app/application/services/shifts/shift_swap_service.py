from __future__ import annotations

from datetime import date, datetime
from typing import Any, Dict, List

from app.application.dtos.shifts.shift_swap import (
    CreateShiftSwapRequest,
    EligibleEmployeeDto,
    ShiftSwapActionResponseDto,
    ShiftSwapListItemDto,
    ShiftSwapResponseDto,
    ShiftSwapStatus,
    ShiftSwapEligibleEmployeeResponse,
    ShiftStateDto,
)

from app.domain.interfaces.shifts.shift_swap_interface import (
    IShiftSwapRepository,
)


class ShiftSwapService:
    """
    Business service for the Shift Swap module.
    """

    def __init__(
        self,
        repository: IShiftSwapRepository,
    ) -> None:
        self._repository = repository

    # ============================================================
    # CURRENT EMPLOYEE
    # ============================================================

    def _get_current_employee(
        self,
        login_name: str,
    ) -> Dict[str, Any]:

        employee = self._repository.get_employee_by_login(
            login_name
        )

        if employee is None:
            raise ValueError(
                "Authenticated user is not linked to an employee."
            )

        if int(employee.get("is_remove", 0) or 0) != 0:
            raise PermissionError(
                "Employee account is inactive."
            )

        return employee

    # ============================================================
    # ELIGIBLE EMPLOYEES
    # ============================================================

    def get_eligible_employees(
        self,
        login_name: str,
        swap_date: date,
    ) -> ShiftSwapEligibleEmployeeResponse:

        requester = self._get_current_employee(
            login_name
        )

        requester_id = int(
            requester["id"]
        )

        employees = self._repository.get_eligible_employees(
            requester_employee_id=requester_id,
            swap_date=swap_date,
        )

        result = [
            EligibleEmployeeDto(
                employee_id=int(
                    employee["employee_id"]
                ),
                employee_code=employee.get(
                    "employee_code"
                ),
                employee_name=(
                    employee.get("employee_name")
                    or "Unknown Employee"
                ).strip(),
                swap_date=swap_date,
                day_of_week=(
                    employee.get("day_of_week")
                    or swap_date.strftime("%A")
                ),
                is_week_off=bool(
                    employee.get("is_week_off", False)
                ),
                is_leave=bool(
                    employee.get("is_leave", False)
                ),
            )
            for employee in employees
        ]

        return ShiftSwapEligibleEmployeeResponse(
            success=True,
            swap_date=swap_date,
            employees=result,
        )

    # ============================================================
    # CREATE
    # ============================================================

    def create_request(
        self,
        request: CreateShiftSwapRequest,
        login_name: str,
    ) -> ShiftSwapResponseDto:

        requester = self._get_current_employee(
            login_name
        )

        requester_id = int(
            requester["id"]
        )

        target_id = int(
            request.requested_to_emp_id
        )

        # --------------------------------------------------------
        # SELF VALIDATION
        # --------------------------------------------------------

        if requester_id == target_id:
            raise ValueError(
                "Cannot create a shift swap request with yourself."
            )

        # --------------------------------------------------------
        # TARGET VALIDATION
        # --------------------------------------------------------

        target = self._repository.get_employee_by_id(
            target_id
        )

        if target is None:
            raise ValueError(
                "Requested employee does not exist."
            )

        if int(target.get("is_remove", 0) or 0) != 0:
            raise ValueError(
                "Requested employee is inactive."
            )

        # --------------------------------------------------------
        # REQUEST TYPE
        # --------------------------------------------------------

        if request.request_type.value != "SpecificDay":
            raise ValueError(
                "Only SpecificDay shift swaps are supported."
            )

        # --------------------------------------------------------
        # REQUESTER SHIFT DATE
        # --------------------------------------------------------

        requester_shift = self._repository.get_shift_date(
            requester_id,
            request.swap_date,
        )

        if requester_shift is None:
            raise ValueError(
                "Shift is not assigned to the requester for the selected date."
            )

        # --------------------------------------------------------
        # TARGET SHIFT DATE
        # --------------------------------------------------------

        target_shift = self._repository.get_shift_date(
            target_id,
            request.swap_date,
        )

        if target_shift is None:
            raise ValueError(
                "Shift-date record is not assigned to the selected employee for the selected date."
            )

        # --------------------------------------------------------
        # DUPLICATE ACTIVE REQUEST
        # --------------------------------------------------------

        duplicate = self._repository.get_duplicate_active_request(
            requested_by_emp_id=requester_id,
            requested_to_emp_id=target_id,
            swap_date=request.swap_date,
        )

        if duplicate is not None:
            raise ValueError(
                "An active shift swap request already exists for the selected employees and date."
            )

        # --------------------------------------------------------
        # CREATE
        # --------------------------------------------------------

        created = self._repository.create_shift_swap_request(
            requested_by_emp_id=requester_id,
            requested_to_emp_id=target_id,
            request_type=request.request_type.value,
            swap_date=request.swap_date,
            status=ShiftSwapStatus.PENDING_TARGET_ACCEPTANCE.value,
            created_date=datetime.now(),
        )

        return self._build_response(
            created
        )

    # ============================================================
    # MY REQUESTS
    # ============================================================

    def get_my_requests(
        self,
        login_name: str,
    ) -> List[ShiftSwapListItemDto]:

        employee = self._get_current_employee(
            login_name
        )

        employee_id = int(
            employee["id"]
        )

        rows = self._repository.get_my_requests(
            employee_id
        )

        return [
            self._build_list_item(row)
            for row in rows
        ]

    # ============================================================
    # ALL REQUESTS
    # ============================================================

    def get_all_requests(
        self,
    ) -> List[ShiftSwapListItemDto]:

        rows = self._repository.get_all_requests()

        return [
            self._build_list_item(row)
            for row in rows
        ]

    # ============================================================
    # DETAILS
    # ============================================================

    def get_request(
        self,
        swap_requested_id: int,
    ) -> ShiftSwapResponseDto:

        request = self._repository.get_shift_swap_request(
            swap_requested_id
        )

        if request is None:
            raise ValueError(
                "Shift swap request not found."
            )

        swap_date = request["swapdate"].date()

        requester_id = int(
            request["requestedbyempid"]
        )

        target_id = int(
            request["requestedtoempid"]
        )

        requester_shift = self._repository.get_shift_date(
            requester_id,
            swap_date,
        )

        target_shift = self._repository.get_shift_date(
            target_id,
            swap_date,
        )

        response = self._build_response(
            request
        )

        response.requester_shift = (
            self._build_shift_state(
                requester_shift,
                requester_id,
                swap_date,
            )
            if requester_shift
            else None
        )

        response.target_shift = (
            self._build_shift_state(
                target_shift,
                target_id,
                swap_date,
            )
            if target_shift
            else None
        )

        return response

    # ============================================================
    # TARGET ACCEPT
    # ============================================================

    def accept_request(
        self,
        swap_requested_id: int,
        login_name: str,
    ) -> ShiftSwapActionResponseDto:

        employee = self._get_current_employee(
            login_name
        )

        employee_id = int(
            employee["id"]
        )

        request = self._repository.get_shift_swap_request(
            swap_requested_id
        )

        if request is None:
            raise ValueError(
                "Shift swap request not found."
            )

        if int(
            request["requestedtoempid"]
        ) != employee_id:
            raise PermissionError(
                "Only the employee receiving the swap request can accept it."
            )

        if request["status"] != (
            ShiftSwapStatus.PENDING_TARGET_ACCEPTANCE.value
        ):
            raise ValueError(
                "This request is not waiting for target employee acceptance."
            )

        result = self._repository.accept_request(
            swap_requested_id=swap_requested_id,
            target_employee_id=employee_id,
        )

        return ShiftSwapActionResponseDto(
            success=True,
            message=(
                "Shift swap request accepted. "
                "The request is now pending reporting manager approval."
            ),
            swap_requested_id=swap_requested_id,
            status=result["status"],
        )

    # ============================================================
    # TARGET REJECT
    # ============================================================

    def reject_request(
        self,
        swap_requested_id: int,
        login_name: str,
    ) -> ShiftSwapActionResponseDto:

        employee = self._get_current_employee(
            login_name
        )

        employee_id = int(
            employee["id"]
        )

        request = self._repository.get_shift_swap_request(
            swap_requested_id
        )

        if request is None:
            raise ValueError(
                "Shift swap request not found."
            )

        if int(
            request["requestedtoempid"]
        ) != employee_id:
            raise PermissionError(
                "Only the employee receiving the swap request can reject it."
            )

        result = self._repository.reject_request(
            swap_requested_id=swap_requested_id,
            target_employee_id=employee_id,
        )

        return ShiftSwapActionResponseDto(
            success=True,
            message="Shift swap request rejected.",
            swap_requested_id=swap_requested_id,
            status=result["status"],
        )

    # ============================================================
    # MANAGER APPROVE
    # ============================================================

    def approve_request(
        self,
        swap_requested_id: int,
        login_name: str,
    ) -> ShiftSwapActionResponseDto:

        manager = self._get_current_employee(
            login_name
        )

        manager_id = int(
            manager["id"]
        )

        result = self._repository.approve_request(
            swap_requested_id=swap_requested_id,
            manager_employee_id=manager_id,
        )

        return ShiftSwapActionResponseDto(
            success=True,
            message=(
                "Shift swap approved successfully. "
                "The two employee date-level assignments have been exchanged."
            ),
            swap_requested_id=swap_requested_id,
            status=result["status"],
        )

    # ============================================================
    # MANAGER REJECT
    # ============================================================

    def manager_reject_request(
        self,
        swap_requested_id: int,
        login_name: str,
    ) -> ShiftSwapActionResponseDto:

        manager = self._get_current_employee(
            login_name
        )

        manager_id = int(
            manager["id"]
        )

        result = self._repository.manager_reject_request(
            swap_requested_id=swap_requested_id,
            manager_employee_id=manager_id,
        )

        return ShiftSwapActionResponseDto(
            success=True,
            message="Shift swap rejected by the reporting manager.",
            swap_requested_id=swap_requested_id,
            status=result["status"],
        )

    # ============================================================
    # BUILDERS
    # ============================================================

    def _build_response(
        self,
        row: Dict[str, Any],
    ) -> ShiftSwapResponseDto:

        swap_date_value = row["swapdate"]

        if hasattr(
            swap_date_value,
            "date",
        ):
            swap_date_value = swap_date_value.date()

        return ShiftSwapResponseDto(
            swap_requested_id=int(
                row["swaprequestedid"]
            ),
            requested_by_emp_id=int(
                row["requestedbyempid"]
            ),
            requested_to_emp_id=int(
                row["requestedtoempid"]
            ),
            requested_by_name=(
                row.get("requested_by_name")
                or "Unknown Employee"
            ).strip(),
            requested_to_name=(
                row.get("requested_to_name")
                or "Unknown Employee"
            ).strip(),
            request_type=row["requesttype"],
            swap_date=swap_date_value,
            status=row["status"],
            created_date=row["createddate"],
            reporting_manager_id=(
                int(row["reporting_manager_id"])
                if row.get("reporting_manager_id")
                is not None
                else None
            ),
            reporting_manager_name=(
                row.get("reporting_manager_name")
            ),
            approved_by=row.get(
                "approvedby"
            ),
            approved_on=row.get(
                "approvedon"
            ),
        )

    def _build_list_item(
        self,
        row: Dict[str, Any],
    ) -> ShiftSwapListItemDto:

        swap_date_value = row["swapdate"]

        if hasattr(
            swap_date_value,
            "date",
        ):
            swap_date_value = swap_date_value.date()

        return ShiftSwapListItemDto(
            swap_requested_id=int(
                row["swaprequestedid"]
            ),
            requested_by_emp_id=int(
                row["requestedbyempid"]
            ),
            requested_to_emp_id=int(
                row["requestedtoempid"]
            ),
            requested_by_name=(
                row.get("requested_by_name")
                or "Unknown Employee"
            ).strip(),
            requested_to_name=(
                row.get("requested_to_name")
                or "Unknown Employee"
            ).strip(),
            request_type=row["requesttype"],
            swap_date=swap_date_value,
            status=row["status"],
            created_date=row["createddate"],
            reporting_manager_id=(
                int(row["reporting_manager_id"])
                if row.get("reporting_manager_id")
                is not None
                else None
            ),
            reporting_manager_name=row.get(
                "reporting_manager_name"
            ),
            approved_by=row.get(
                "approvedby"
            ),
            approved_on=row.get(
                "approvedon"
            ),
        )

    def _build_shift_state(
        self,
        row: Dict[str, Any],
        employee_id: int,
        swap_date: date,
    ) -> ShiftStateDto:

        return ShiftStateDto(
            employee_id=employee_id,
            swap_date=swap_date,
            pattern_id=(
                int(row["patternid"])
                if row.get("patternid") is not None
                else None
            ),
            is_week_off=bool(
                row.get("is_week_off", False)
            ),
            is_leave=bool(
                row.get("is_leave", False)
            ),
            day_of_week=row.get(
                "day_of_week"
            ),
        )