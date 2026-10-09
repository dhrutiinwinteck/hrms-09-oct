from datetime import datetime

from fastapi import HTTPException

from app.application.dtos.leave.leave import (
    LeaveRequest,
    LeaveUpdateRequest,
    LeaveStatusUpdate,
    LeaveBalanceCreateRequest,
    LeaveBalanceUpdateRequest,
)

from app.domain.interfaces.leave.leave_interface import (
    ILeaveRepository,
)

from app.infrastructure.models.leave.leave_log import (
    LeaveLogModel,
)

from app.infrastructure.models.leave.leave_balance import (
    LeaveBalanceModel,
)


class LeaveService:

    STATUS_PENDING = 0
    STATUS_APPROVED = 1
    STATUS_REJECTED = 2

    PAID_LEAVE = "Paid Leave"
    CASUAL_LEAVE = "Casual Leave"
    COMP_OFF = "Comp off"
    LOP = "LOP"

    def __init__(
        self,
        repository: ILeaveRepository,
    ):
        self.repository = repository

    # ========================================================
    # EMPLOYEES
    # ========================================================

    def get_active_employees(self):

        return (
            self.repository
            .get_active_employees()
        )

    def get_all_employees(self):

        return (
            self.repository
            .get_all_employees()
        )

    # ========================================================
    # BALANCE
    # ========================================================

    def get_all_balances(
        self,
        year=None,
    ):

        return (
            self.repository
            .get_all_balances(year)
        )

    def get_balance(
        self,
        emp_code: str,
        year=None,
    ):

        balance = (
            self.repository
            .get_balance_by_emp_code(
                emp_code,
                year,
            )
        )

        if not balance:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Leave balance not found "
                    f"for employee {emp_code}."
                ),
            )

        return balance

    def create_balance(
        self,
        request: LeaveBalanceCreateRequest,
        username: str,
    ):

        employee = (
            self.repository
            .get_employee_by_code(
                request.emp_id
            )
        )

        if not employee:

            raise HTTPException(
                status_code=404,
                detail="Employee not found.",
            )

        existing = (
            self.repository
            .get_balance_by_emp_code(
                request.emp_id,
                request.year,
            )
        )

        if existing:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Leave balance already exists "
                    "for this employee and year."
                ),
            )

        now = datetime.now()

        balance = LeaveBalanceModel(

            emp_id=request.emp_id,

            year=request.year,

            remained_casual_leave=(
                request.remained_casual_leave
            ),

            remained_paid_leave=(
                request.remained_paid_leave
            ),

            remained_comp_off=(
                request.remained_comp_off
            ),

            leave_type=request.leave_type,

            createdby=username,

            createddate=now,

            modifiedby=username,

            modifieddate=now,
        )

        try:

            self.repository.add_leave_balance(
                balance
            )

            self.repository.commit()

        except Exception:

            self.repository.rollback()

            raise

        return balance

    # def update_balance(
    #     self,
    #     balance_id: int,
    #     request: LeaveBalanceUpdateRequest,
    #     username: str,
    # ):

    #     balance = (
    #         self.repository
    #         .get_balance_by_id(
    #             balance_id
    #         )
    #     )

    #     if not balance:

    #         raise HTTPException(
    #             status_code=404,
    #             detail="Leave balance not found.",
    #         )

    #     balance.remained_casual_leave = (
    #         request.remained_casual_leave
    #     )

    #     balance.remained_paid_leave = (
    #         request.remained_paid_leave
    #     )

    #     balance.remained_comp_off = (
    #         request.remained_comp_off
    #     )

    #     balance.leave_type = (
    #         request.leave_type
    #     )

    #     balance.modifiedby = username
    #     balance.modifieddate = datetime.now()

    #     try:

    #         self.repository.commit()

    #     except Exception:

    #         self.repository.rollback()

    #         raise

    #     return balance


    def update_balance(
        self,
        balance_id: int,
        request: LeaveBalanceUpdateRequest,
        username: str,
    ):
        """
        Update the Comp Off balance for an existing leave balance record.

        This endpoint intentionally updates only remained_comp_off.
        Casual Leave, Paid Leave, and Leave Type are not modified by
        this legacy edit operation.
        """

        balance = (
            self.repository
            .get_balance_by_id(balance_id)
        )

        if not balance:
            raise HTTPException(
                status_code=404,
                detail="Leave balance not found.",
            )

        if request.remained_comp_off < 0:
            raise HTTPException(
                status_code=400,
                detail="Comp Off balance cannot be negative.",
            )

        balance.remained_comp_off = (
            request.remained_comp_off
        )

        balance.modifiedby = username
        balance.modifieddate = datetime.now()

        try:
            self.repository.commit()
            self.repository.db.refresh(balance)

        except Exception:
            self.repository.rollback()
            raise

        return balance
    # ========================================================
    # APPLY
    # ========================================================

    def apply_leave(
        self,
        request: LeaveRequest,
        username: str,
    ):

        if request.leave_to < request.leave_from:

            raise HTTPException(
                status_code=400,
                detail=(
                    "To date must be greater "
                    "than or equal to From date."
                ),
            )

        if request.no_of_days <= 0:

            raise HTTPException(
                status_code=400,
                detail=(
                    "No of days must be "
                    "greater than zero."
                ),
            )

        employee = (
            self.repository
            .get_employee_by_code(
                request.emp_code
            )
        )

        if not employee:

            raise HTTPException(
                status_code=404,
                detail="Employee not found.",
            )

        # LOP does not require balance
        if request.leave_type != self.LOP:

            balance = (
                self.repository
                .get_balance_by_emp_code(
                    request.emp_code
                )
            )

            if not balance:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Leave balance not found "
                        "for employee."
                    ),
                )

            self.validate_balance(
                balance,
                request.leave_type,
                request.no_of_days,
            )

        now = datetime.now()

        leave = LeaveLogModel(

            emp_id=employee.id,

            emp_code=request.emp_code,

            leave_from=request.leave_from,

            leave_to=request.leave_to,

            no_of_days=request.no_of_days,

            leave_type=request.leave_type,

            leave_reason=request.leave_reason,

            status=self.STATUS_PENDING,

            createdby=username,

            createdon=now,

            modifiedby=username,

            modifiedon=now,
        )

        try:

            self.repository.add_leave_log(
                leave
            )

            self.repository.commit()
            self.repository.db.refresh(leave)

        except Exception:

            self.repository.rollback()

            raise

        return leave

    # ========================================================
    # VALIDATE BALANCE
    # ========================================================

    def validate_balance(
        self,
        balance,
        leave_type,
        days,
    ):

        if leave_type == self.CASUAL_LEAVE:

            available = (
                balance.remained_casual_leave
                or 0
            )

        elif leave_type == self.PAID_LEAVE:

            available = (
                balance.remained_paid_leave
                or 0
            )

        elif leave_type == self.COMP_OFF:

            available = (
                balance.remained_comp_off
                or 0
            )

        else:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Unsupported leave type: "
                    f"{leave_type}"
                ),
            )

        if available < days:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Insufficient {leave_type} "
                    f"balance. Available: "
                    f"{available}, Requested: {days}."
                ),
            )

    # ========================================================
    # GET LEAVE
    # ========================================================

    def get_leave(
        self,
        leave_id: int,
    ):

        leave = (
            self.repository
            .get_leave_log_by_id(
                leave_id
            )
        )

        if not leave:

            raise HTTPException(
                status_code=404,
                detail="Leave request not found.",
            )

        return leave

    # ========================================================
    # ALL LEAVES
    # ========================================================

    def get_all_leaves(
        self,
        emp_code=None,
        status=None,
        leave_type=None,
    ):

        return (
            self.repository
            .get_all_leave_logs(
                emp_code=emp_code,
                status=status,
                leave_type=leave_type,
            )
        )

    # ========================================================
    # APPROVE
    # ========================================================

    def approve_leave(
        self,
        request: LeaveStatusUpdate,
        username: str,
    ):

        leave = self.get_leave(
            request.leave_id
        )

        if leave.status != self.STATUS_PENDING:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Only pending leave requests "
                    "can be approved."
                ),
            )

        if leave.leave_type != self.LOP:

            balance = (
                self.repository
                .get_balance_by_emp_code(
                    leave.emp_code
                )
            )

            if not balance:

                raise HTTPException(
                    status_code=400,
                    detail="Leave balance not found.",
                )

            self.validate_balance(
                balance,
                leave.leave_type,
                leave.no_of_days,
            )

            self.deduct_balance(
                balance,
                leave.leave_type,
                leave.no_of_days,
            )

            balance.modifiedby = username
            balance.modifieddate = datetime.now()

        now = datetime.now()

        leave.status = (
            self.STATUS_APPROVED
        )

        leave.approved_by = (
            request.approved_by
        )

        leave.approved_on = now

        leave.modifiedby = username

        leave.modifiedon = now

        try:

            self.repository.commit()

        except Exception:

            self.repository.rollback()

            raise

        return leave

    # ========================================================
    # REJECT
    # ========================================================

    def reject_leave(
        self,
        request: LeaveStatusUpdate,
        username: str,
    ):

        leave = self.get_leave(
            request.leave_id
        )

        if leave.status != self.STATUS_PENDING:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Only pending leave requests "
                    "can be rejected."
                ),
            )

        now = datetime.now()

        leave.status = (
            self.STATUS_REJECTED
        )

        leave.approved_by = (
            request.approved_by
        )

        leave.approved_on = now

        leave.modifiedby = username

        leave.modifiedon = now

        try:

            self.repository.commit()

        except Exception:

            self.repository.rollback()

            raise

        return leave

    # ========================================================
    # DEDUCT BALANCE
    # ========================================================

    def deduct_balance(
        self,
        balance,
        leave_type,
        days,
    ):

        if leave_type == self.CASUAL_LEAVE:

            balance.remained_casual_leave = (
                balance.remained_casual_leave
                or 0
            ) - days

        elif leave_type == self.PAID_LEAVE:

            balance.remained_paid_leave = (
                balance.remained_paid_leave
                or 0
            ) - days

        elif leave_type == self.COMP_OFF:

            balance.remained_comp_off = (
                balance.remained_comp_off
                or 0
            ) - days

    # ========================================================
    # UPDATE LEAVE
    # ========================================================

    def update_leave(
        self,
        leave_id: int,
        request: LeaveUpdateRequest,
        username: str,
    ):

        leave = self.get_leave(
            leave_id
        )

        if leave.status != self.STATUS_PENDING:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Only pending leave requests "
                    "can be edited."
                ),
            )

        if request.leave_to < request.leave_from:

            raise HTTPException(
                status_code=400,
                detail=(
                    "To date must be "
                    "greater than or equal "
                    "to From date."
                ),
            )

        if request.no_of_days <= 0:

            raise HTTPException(
                status_code=400,
                detail=(
                    "No of days must be "
                    "greater than zero."
                ),
            )

        if request.leave_type != self.LOP:

            balance = (
                self.repository
                .get_balance_by_emp_code(
                    leave.emp_code
                )
            )

            if not balance:

                raise HTTPException(
                    status_code=400,
                    detail="Leave balance not found.",
                )

            self.validate_balance(
                balance,
                request.leave_type,
                request.no_of_days,
            )

        leave.leave_from = (
            request.leave_from
        )

        leave.leave_to = (
            request.leave_to
        )

        leave.no_of_days = (
            request.no_of_days
        )

        leave.leave_type = (
            request.leave_type
        )

        leave.leave_reason = (
            request.leave_reason
        )

        leave.modifiedby = username

        leave.modifiedon = datetime.now()

        try:

            self.repository.commit()

        except Exception:

            self.repository.rollback()

            raise

        return leave