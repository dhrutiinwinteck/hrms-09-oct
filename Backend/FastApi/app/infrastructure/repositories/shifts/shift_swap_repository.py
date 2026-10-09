from __future__ import annotations

from datetime import date, datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.domain.interfaces.shifts.shift_swap_interface import (
    IShiftSwapRepository,
)


class ShiftSwapRepository(IShiftSwapRepository):
    """
    PostgreSQL repository for Shift Swap operations.

    This repository uses the exact existing PostgreSQL table and
    column names from the HRMS database.

    Existing tables used:
        - employee_detail
        - employeeshift
        - employeeshiftdates
        - shiftpattern
        - shiftswaprequest

    No database schema changes are required.
    """

    def __init__(self, session: Session) -> None:
        self._session = session

    # ============================================================
    # EMPLOYEE
    # ============================================================

    def get_employee_by_id(
        self,
        employee_id: int,
    ) -> Optional[Dict[str, Any]]:
        """
        Get an employee by employee ID.
        """

        result = self._session.execute(
            text(
                """
                SELECT
                    id,
                    emp_code,
                    first_name,
                    last_name,
                    reporting_manager,
                    is_remove
                FROM public.employee_detail
                WHERE id = :employee_id
                LIMIT 1
                """
            ),
            {
                "employee_id": employee_id,
            },
        ).mappings().first()

        if result is None:
            return None

        return dict(result)

    def get_employee_by_login(
        self,
        login_name: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Get an employee using the employee code stored in JWT subject.
        """

        result = self._session.execute(
            text(
                """
                SELECT
                    id,
                    emp_code,
                    first_name,
                    last_name,
                    reporting_manager,
                    is_remove
                FROM public.employee_detail
                WHERE emp_code = :login_name
                LIMIT 1
                """
            ),
            {
                "login_name": login_name,
            },
        ).mappings().first()

        if result is None:
            return None

        return dict(result)

    # ============================================================
    # ELIGIBLE EMPLOYEES
    # ============================================================

    def get_eligible_employees(
        self,
        requester_employee_id: int,
        swap_date: date,
    ) -> List[Dict[str, Any]]:
        """
        Get employees eligible for a specific-day shift swap.

        Eligibility rules:
            1. Employee must be active.
            2. Employee must not be the requester.
            3. Employee must have a shift-date record on the
               requested date.
            4. Working, week-off, and leave records are all eligible.

        IMPORTANT:
        We intentionally do NOT filter out:
            isweekoff = true
            isleave = true

        because the Shift Swap requirement allows both Week Off
        and Leave employees to be selected.
        """

        result = self._session.execute(
            text(
                """
                SELECT
                    e.id AS employee_id,
                    e.emp_code AS employee_code,

                    TRIM(
                        COALESCE(e.first_name, '')
                        || ' '
                        || COALESCE(e.last_name, '')
                    ) AS employee_name,

                    sd.dates AS swap_date,

                    COALESCE(
                        sd.dayofweek,
                        ''
                    ) AS day_of_week,

                    COALESCE(
                        sd.isweekoff,
                        FALSE
                    ) AS is_week_off,

                    COALESCE(
                        sd.isleave,
                        FALSE
                    ) AS is_leave

                FROM public.employee_detail e

                INNER JOIN public.employeeshiftdates sd
                    ON sd.empid = e.id
                    AND sd.dates::date = :swap_date

                WHERE e.id <> :requester_employee_id
                  AND COALESCE(e.is_remove, 0) = 0

                ORDER BY
                    employee_name ASC
                """
            ),
            {
                "requester_employee_id": requester_employee_id,
                "swap_date": swap_date,
            },
        ).mappings().all()

        return [dict(row) for row in result]

    # ============================================================
    # SHIFT DATE
    # ============================================================

    def get_shift_date(
        self,
        employee_id: int,
        swap_date: date,
        for_update: bool = False,
    ) -> Optional[Dict[str, Any]]:
        """
        Get the employee's shift-date record for a specific date.

        Actual database columns:
            shiftdateid
            empshiftid
            empid
            patternid
            dates
            dayofweek
            isweekoff
            isleave
        """

        lock_clause = " FOR UPDATE" if for_update else ""

        statement = text(
            f"""
            SELECT
                shiftdateid,
                empshiftid,
                empid,
                dates,
                dayofweek,
                patternid,
                isweekoff,
                isleave

            FROM public.employeeshiftdates

            WHERE empid = :employee_id
              AND dates::date = :swap_date

            ORDER BY
                shiftdateid

            LIMIT 1
            {lock_clause}
            """
        )

        result = self._session.execute(
            statement,
            {
                "employee_id": employee_id,
                "swap_date": swap_date,
            },
        ).mappings().first()

        if result is None:
            return None

        return dict(result)

    # ============================================================
    # SHIFT SWAP REQUEST
    # ============================================================

    def get_shift_swap_request(
        self,
        swap_requested_id: int,
    ) -> Optional[Dict[str, Any]]:
        """
        Get complete Shift Swap request information.
        """

        result = self._session.execute(
            text(
                """
                SELECT
                    s.swaprequestedid,
                    s.requestedbyempid,
                    s.requestedtoempid,
                    s.requesttype,
                    s.swapdate,
                    s.status,
                    s.createddate,
                    s.approvedby,
                    s.approvedon,

                    rb.emp_code AS requested_by_code,

                    TRIM(
                        COALESCE(rb.first_name, '')
                        || ' '
                        || COALESCE(rb.last_name, '')
                    ) AS requested_by_name,

                    rt.emp_code AS requested_to_code,

                    TRIM(
                        COALESCE(rt.first_name, '')
                        || ' '
                        || COALESCE(rt.last_name, '')
                    ) AS requested_to_name,

                    rb.reporting_manager AS reporting_manager_id,

                    TRIM(
                        COALESCE(rm.first_name, '')
                        || ' '
                        || COALESCE(rm.last_name, '')
                    ) AS reporting_manager_name

                FROM public.shiftswaprequest s

                INNER JOIN public.employee_detail rb
                    ON rb.id = s.requestedbyempid

                INNER JOIN public.employee_detail rt
                    ON rt.id = s.requestedtoempid

                LEFT JOIN public.employee_detail rm
                    ON rm.id = rb.reporting_manager

                WHERE s.swaprequestedid = :swap_requested_id

                LIMIT 1
                """
            ),
            {
                "swap_requested_id": swap_requested_id,
            },
        ).mappings().first()

        if result is None:
            return None

        return dict(result)

    # ============================================================
    # DUPLICATE ACTIVE REQUEST
    # ============================================================

    def get_duplicate_active_request(
        self,
        requested_by_emp_id: int,
        requested_to_emp_id: int,
        swap_date: date,
    ) -> Optional[Dict[str, Any]]:
        """
        Check whether an active request already exists for the
        same employee pair and date.

        Duplicate detection works in both directions:

            A -> B
            B -> A

        Active statuses:
            PendingTargetAcceptance
            PendingManagerApproval
        """

        result = self._session.execute(
            text(
                """
                SELECT
                    swaprequestedid,
                    requestedbyempid,
                    requestedtoempid,
                    requesttype,
                    swapdate,
                    status,
                    createddate

                FROM public.shiftswaprequest

                WHERE swapdate::date = :swap_date

                  AND status IN (
                      'PendingTargetAcceptance',
                      'PendingManagerApproval'
                  )

                  AND
                  (
                      (
                          requestedbyempid = :requested_by_emp_id
                          AND
                          requestedtoempid = :requested_to_emp_id
                      )

                      OR

                      (
                          requestedbyempid = :requested_to_emp_id
                          AND
                          requestedtoempid = :requested_by_emp_id
                      )
                  )

                ORDER BY
                    swaprequestedid DESC

                LIMIT 1
                """
            ),
            {
                "requested_by_emp_id": requested_by_emp_id,
                "requested_to_emp_id": requested_to_emp_id,
                "swap_date": swap_date,
            },
        ).mappings().first()

        if result is None:
            return None

        return dict(result)

    # ============================================================
    # CREATE SHIFT SWAP REQUEST
    # ============================================================

    def create_shift_swap_request(
        self,
        requested_by_emp_id: int,
        requested_to_emp_id: int,
        request_type: str,
        swap_date: date,
        status: str,
        created_date: datetime,
    ) -> Dict[str, Any]:
        """
        Create a new Shift Swap request.

        The INSERT creates only the request row.

        After INSERT, the newly-created request is loaded again
        through get_shift_swap_request().

        This ensures POST returns the same complete structure
        as GET /shift-swaps/{swap_requested_id}.
        """

        result = self._session.execute(
            text(
                """
                INSERT INTO public.shiftswaprequest
                (
                    requestedbyempid,
                    requestedtoempid,
                    requesttype,
                    swapdate,
                    status,
                    createddate
                )

                VALUES
                (
                    :requested_by_emp_id,
                    :requested_to_emp_id,
                    :request_type,
                    :swap_date,
                    :status,
                    :created_date
                )

                RETURNING
                    swaprequestedid
                """
            ),
            {
                "requested_by_emp_id": requested_by_emp_id,
                "requested_to_emp_id": requested_to_emp_id,
                "request_type": request_type,
                "swap_date": swap_date,
                "status": status,
                "created_date": created_date,
            },
        ).mappings().first()

        if result is None:
            raise RuntimeError(
                "Failed to create shift swap request."
            )

        swap_requested_id = int(
            result["swaprequestedid"]
        )

        created_request = self.get_shift_swap_request(
            swap_requested_id
        )

        if created_request is None:
            raise RuntimeError(
                "Shift swap request was created, but the "
                "created request could not be loaded."
            )

        return created_request

    # ============================================================
    # MY REQUESTS
    # ============================================================

    def get_my_requests(
        self,
        employee_id: int,
    ) -> List[Dict[str, Any]]:
        """
        Get requests where the logged-in employee is either:

            requester
            OR
            target employee
        """

        result = self._session.execute(
            text(
                """
                SELECT
                    s.swaprequestedid,
                    s.requestedbyempid,
                    s.requestedtoempid,

                    rb.emp_code AS requested_by_code,

                    TRIM(
                        COALESCE(rb.first_name, '')
                        || ' '
                        || COALESCE(rb.last_name, '')
                    ) AS requested_by_name,

                    rt.emp_code AS requested_to_code,

                    TRIM(
                        COALESCE(rt.first_name, '')
                        || ' '
                        || COALESCE(rt.last_name, '')
                    ) AS requested_to_name,

                    s.requesttype,
                    s.swapdate,
                    s.status,
                    s.createddate,

                    rb.reporting_manager AS reporting_manager_id,

                    TRIM(
                        COALESCE(rm.first_name, '')
                        || ' '
                        || COALESCE(rm.last_name, '')
                    ) AS reporting_manager_name,

                    s.approvedby,
                    s.approvedon

                FROM public.shiftswaprequest s

                INNER JOIN public.employee_detail rb
                    ON rb.id = s.requestedbyempid

                INNER JOIN public.employee_detail rt
                    ON rt.id = s.requestedtoempid

                LEFT JOIN public.employee_detail rm
                    ON rm.id = rb.reporting_manager

                WHERE
                    s.requestedbyempid = :employee_id

                    OR

                    s.requestedtoempid = :employee_id

                ORDER BY
                    s.createddate DESC
                """
            ),
            {
                "employee_id": employee_id,
            },
        ).mappings().all()

        return [dict(row) for row in result]

    # ============================================================
    # ALL REQUESTS
    # ============================================================

    def get_all_requests(
        self,
    ) -> List[Dict[str, Any]]:
        """
        Get all Shift Swap requests.
        """

        result = self._session.execute(
            text(
                """
                SELECT
                    s.swaprequestedid,
                    s.requestedbyempid,
                    s.requestedtoempid,

                    rb.emp_code AS requested_by_code,

                    TRIM(
                        COALESCE(rb.first_name, '')
                        || ' '
                        || COALESCE(rb.last_name, '')
                    ) AS requested_by_name,

                    rt.emp_code AS requested_to_code,

                    TRIM(
                        COALESCE(rt.first_name, '')
                        || ' '
                        || COALESCE(rt.last_name, '')
                    ) AS requested_to_name,

                    s.requesttype,
                    s.swapdate,
                    s.status,
                    s.createddate,

                    rb.reporting_manager AS reporting_manager_id,

                    TRIM(
                        COALESCE(rm.first_name, '')
                        || ' '
                        || COALESCE(rm.last_name, '')
                    ) AS reporting_manager_name,

                    s.approvedby,
                    s.approvedon

                FROM public.shiftswaprequest s

                INNER JOIN public.employee_detail rb
                    ON rb.id = s.requestedbyempid

                INNER JOIN public.employee_detail rt
                    ON rt.id = s.requestedtoempid

                LEFT JOIN public.employee_detail rm
                    ON rm.id = rb.reporting_manager

                ORDER BY
                    s.createddate DESC
                """
            )
        ).mappings().all()

        return [dict(row) for row in result]

    # ============================================================
    # TARGET ACCEPT
    # ============================================================

    def accept_request(
        self,
        swap_requested_id: int,
        target_employee_id: int,
    ) -> Dict[str, Any]:
        """
        Target employee accepts the Shift Swap request.
        """

        result = self._session.execute(
            text(
                """
                UPDATE public.shiftswaprequest

                SET
                    status = 'PendingManagerApproval'

                WHERE
                    swaprequestedid = :swap_requested_id

                    AND requestedtoempid = :target_employee_id

                    AND status = 'PendingTargetAcceptance'

                RETURNING
                    swaprequestedid,
                    requestedbyempid,
                    requestedtoempid,
                    requesttype,
                    swapdate,
                    status,
                    createddate,
                    approvedby,
                    approvedon
                """
            ),
            {
                "swap_requested_id": swap_requested_id,
                "target_employee_id": target_employee_id,
            },
        ).mappings().first()

        if result is None:
            raise ValueError(
                "The shift swap request is not pending target acceptance."
            )

        return dict(result)

    # ============================================================
    # TARGET REJECT
    # ============================================================

    def reject_request(
        self,
        swap_requested_id: int,
        target_employee_id: int,
    ) -> Dict[str, Any]:
        """
        Target employee rejects the Shift Swap request.
        """

        result = self._session.execute(
            text(
                """
                UPDATE public.shiftswaprequest

                SET
                    status = 'Rejected'

                WHERE
                    swaprequestedid = :swap_requested_id

                    AND requestedtoempid = :target_employee_id

                    AND status = 'PendingTargetAcceptance'

                RETURNING
                    swaprequestedid,
                    requestedbyempid,
                    requestedtoempid,
                    requesttype,
                    swapdate,
                    status,
                    createddate,
                    approvedby,
                    approvedon
                """
            ),
            {
                "swap_requested_id": swap_requested_id,
                "target_employee_id": target_employee_id,
            },
        ).mappings().first()

        if result is None:
            raise ValueError(
                "The shift swap request is not pending target acceptance."
            )

        return dict(result)

    # ============================================================
    # MANAGER APPROVE
    # ============================================================

    def approve_request(
        self,
        swap_requested_id: int,
        manager_employee_id: int,
    ) -> Dict[str, Any]:
        """
        Manager approves a Shift Swap request.

        Before changing the roster:

            1. Request must exist.
            2. Request must be PendingManagerApproval.
            3. Requester's reporting manager must be the
               currently logged-in manager.
            4. Both employees must still have shift-date
               records.
            5. Both shift-date records are locked using
               SELECT ... FOR UPDATE.
            6. patternid, isweekoff and isleave are exchanged.
            7. Request is marked Approved.

        The surrounding transactional DB dependency controls
        commit/rollback.
        """

        request = self.get_shift_swap_request(
            swap_requested_id
        )

        if request is None:
            raise ValueError(
                "Shift swap request not found."
            )

        if request["status"] != "PendingManagerApproval":
            raise ValueError(
                "The shift swap request is not pending manager approval."
            )

        reporting_manager_id = request.get(
            "reporting_manager_id"
        )

        if reporting_manager_id is None:
            raise ValueError(
                "Reporting manager is not configured for the requester."
            )

        if int(reporting_manager_id) != int(
            manager_employee_id
        ):
            raise PermissionError(
                "Only the requester's reporting manager can approve this request."
            )

        requester_id = int(
            request["requestedbyempid"]
        )

        target_id = int(
            request["requestedtoempid"]
        )

        if requester_id == target_id:
            raise ValueError(
                "Requester and target employee cannot be the same."
            )

        swap_date_value = request["swapdate"]

        if swap_date_value is None:
            raise ValueError(
                "Swap date is missing from the request."
            )

        if isinstance(
            swap_date_value,
            datetime,
        ):
            swap_date = swap_date_value.date()

        elif isinstance(
            swap_date_value,
            date,
        ):
            swap_date = swap_date_value

        else:
            raise ValueError(
                "Invalid swap date stored in the Shift Swap request."
            )

        # --------------------------------------------------------
        # Lock both current shift-date rows.
        # --------------------------------------------------------

        requester_shift = self.get_shift_date(
            requester_id,
            swap_date,
            for_update=True,
        )

        target_shift = self.get_shift_date(
            target_id,
            swap_date,
            for_update=True,
        )

        if requester_shift is None:
            raise ValueError(
                "Requester no longer has a shift-date record "
                "for the swap date."
            )

        if target_shift is None:
            raise ValueError(
                "Target employee no longer has a shift-date record "
                "for the swap date."
            )

        requester_shift_date_id = int(
            requester_shift["shiftdateid"]
        )

        target_shift_date_id = int(
            target_shift["shiftdateid"]
        )

        # --------------------------------------------------------
        # Capture Employee A state.
        # --------------------------------------------------------

        requester_pattern_id = requester_shift[
            "patternid"
        ]

        requester_week_off = bool(
            requester_shift["isweekoff"]
        )

        requester_leave = bool(
            requester_shift["isleave"]
        )

        # --------------------------------------------------------
        # Capture Employee B state.
        # --------------------------------------------------------

        target_pattern_id = target_shift[
            "patternid"
        ]

        target_week_off = bool(
            target_shift["isweekoff"]
        )

        target_leave = bool(
            target_shift["isleave"]
        )

        # --------------------------------------------------------
        # Employee A gets Employee B's complete date state.
        # --------------------------------------------------------

        requester_update = self._session.execute(
            text(
                """
                UPDATE public.employeeshiftdates

                SET
                    patternid = :pattern_id,
                    isweekoff = :is_week_off,
                    isleave = :is_leave

                WHERE
                    shiftdateid = :shift_date_id
                    AND empid = :employee_id
                """
            ),
            {
                "pattern_id": target_pattern_id,
                "is_week_off": target_week_off,
                "is_leave": target_leave,
                "shift_date_id": requester_shift_date_id,
                "employee_id": requester_id,
            },
        )

        if requester_update.rowcount != 1:
            raise RuntimeError(
                "Requester shift-date record could not be updated."
            )

        # --------------------------------------------------------
        # Employee B gets Employee A's complete date state.
        # --------------------------------------------------------

        target_update = self._session.execute(
            text(
                """
                UPDATE public.employeeshiftdates

                SET
                    patternid = :pattern_id,
                    isweekoff = :is_week_off,
                    isleave = :is_leave

                WHERE
                    shiftdateid = :shift_date_id
                    AND empid = :employee_id
                """
            ),
            {
                "pattern_id": requester_pattern_id,
                "is_week_off": requester_week_off,
                "is_leave": requester_leave,
                "shift_date_id": target_shift_date_id,
                "employee_id": target_id,
            },
        )

        if target_update.rowcount != 1:
            raise RuntimeError(
                "Target shift-date record could not be updated."
            )

        # --------------------------------------------------------
        # Mark request as Approved.
        # --------------------------------------------------------

        result = self._session.execute(
            text(
                """
                UPDATE public.shiftswaprequest

                SET
                    status = 'Approved',
                    approvedby = :approved_by,
                    approvedon = :approved_on

                WHERE
                    swaprequestedid = :swap_requested_id
                    AND status = 'PendingManagerApproval'

                RETURNING
                    swaprequestedid,
                    requestedbyempid,
                    requestedtoempid,
                    requesttype,
                    swapdate,
                    status,
                    createddate,
                    approvedby,
                    approvedon
                """
            ),
            {
                "swap_requested_id": swap_requested_id,
                "approved_by": str(manager_employee_id),
                "approved_on": datetime.now(),
            },
        ).mappings().first()

        if result is None:
            raise ValueError(
                "Shift swap approval could not be completed."
            )

        return dict(result)

    # ============================================================
    # MANAGER REJECT
    # ============================================================

    def manager_reject_request(
        self,
        swap_requested_id: int,
        manager_employee_id: int,
    ) -> Dict[str, Any]:
        """
        Manager rejects a Shift Swap request.
        """

        request = self.get_shift_swap_request(
            swap_requested_id
        )

        if request is None:
            raise ValueError(
                "Shift swap request not found."
            )

        if request["status"] != "PendingManagerApproval":
            raise ValueError(
                "The shift swap request is not pending manager approval."
            )

        reporting_manager_id = request.get(
            "reporting_manager_id"
        )

        if reporting_manager_id is None:
            raise ValueError(
                "Reporting manager is not configured for the requester."
            )

        if int(reporting_manager_id) != int(
            manager_employee_id
        ):
            raise PermissionError(
                "Only the requester's reporting manager can reject this request."
            )

        result = self._session.execute(
            text(
                """
                UPDATE public.shiftswaprequest

                SET
                    status = 'Rejected'

                WHERE
                    swaprequestedid = :swap_requested_id
                    AND status = 'PendingManagerApproval'

                RETURNING
                    swaprequestedid,
                    requestedbyempid,
                    requestedtoempid,
                    requesttype,
                    swapdate,
                    status,
                    createddate,
                    approvedby,
                    approvedon
                """
            ),
            {
                "swap_requested_id": swap_requested_id,
            },
        ).mappings().first()

        if result is None:
            raise ValueError(
                "Manager rejection could not be completed."
            )

        return dict(result)