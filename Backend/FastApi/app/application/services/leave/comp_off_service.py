from datetime import date, datetime
from decimal import Decimal
from pathlib import Path
from typing import Optional
from uuid import uuid4

from fastapi import HTTPException, UploadFile

from app.application.dtos.leave.comp_off import (
    CompOffApprovalRequest,
    CompOffCreateRequest,
    CompOffRejectionRequest,
)

from app.core.config import settings

from app.domain.interfaces.leave.comp_off_interface import (
    ICompOffRepository,
)

from app.infrastructure.models.leave.comp_off_ledger import (
    CompOffLedgerModel,
)

from app.infrastructure.models.leave.comp_off_request import (
    CompOffRequestModel,
)


class CompOffService:

    STATUS_PENDING = "Pending"
    STATUS_APPROVED = "Approved"
    STATUS_REJECTED = "Rejected"

    PUBLIC_HOLIDAY = "PublicHoliday"
    WEEK_OFF = "WeekOff"

    DISPLAY_PUBLIC_HOLIDAY = "Public Holiday"
    DISPLAY_WEEK_OFF = "Week Off"

    MAX_FILE_SIZE = 5 * 1024 * 1024

    ALLOWED_EXTENSIONS = {
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png",
    }

    # ========================================================
    # INIT
    # ========================================================

    def __init__(
        self,
        repository: ICompOffRepository,
    ):
        self.repository = repository

    # ========================================================
    # NORMALIZE DAY TYPE
    # ========================================================

    @classmethod
    def normalize_day_type(
        cls,
        value: str,
    ) -> str:

        normalized = (
            value
            .strip()
            .lower()
            .replace("_", "")
            .replace("-", "")
            .replace(" ", "")
        )

        if normalized == "publicholiday":

            return cls.PUBLIC_HOLIDAY

        if normalized == "weekoff":

            return cls.WEEK_OFF

        raise HTTPException(
            status_code=422,
            detail=(
                "Day type must be "
                "Public Holiday or Week Off."
            ),
        )

    # ========================================================
    # FINANCIAL YEAR
    # ========================================================

    @staticmethod
    def get_financial_year(
        value: date,
    ) -> str:

        if value.month >= 4:

            start_year = value.year

        else:

            start_year = value.year - 1

        return (
            f"{start_year}-{start_year + 1}"
        )

    # ========================================================
    # CREATE REQUEST
    # ========================================================

    async def create_request(
        self,
        request: CompOffCreateRequest,
        username: str,
        attachment: Optional[UploadFile] = None,
    ):

        employee = (
            self.repository
            .get_employee_by_code(username)
        )

        if not employee:

            raise HTTPException(
                status_code=404,
                detail="Employee not found.",
            )

        if request.worked_date > date.today():

            raise HTTPException(
                status_code=400,
                detail=(
                    "Worked date cannot be "
                    "a future date."
                ),
            )

        day_type = self.normalize_day_type(
            request.day_type
        )

        reason = request.reason.strip()

        if not reason:

            raise HTTPException(
                status_code=422,
                detail="Reason is required.",
            )

        # ----------------------------------------------------
        # DUPLICATE
        # ----------------------------------------------------

        existing = (
            self.repository
            .get_existing_request(
                employee.id,
                request.worked_date,
            )
        )

        if existing:

            raise HTTPException(
                status_code=409,
                detail=(
                    "A Comp Off request already exists "
                    "for this worked date."
                ),
            )

        # ----------------------------------------------------
        # ATTACHMENT
        # ----------------------------------------------------

        attachment_path = None

        if attachment:

            attachment_path = (
                await self._save_attachment(
                    attachment
                )
            )

        now = datetime.now()

        entity = CompOffRequestModel(

            emp_id=employee.id,

            emp_code=employee.emp_code,

            worked_date=request.worked_date,

            day_type=day_type,

            reason=reason,

            attachment_path=attachment_path,

            status=self.STATUS_PENDING,

            approved_by=None,

            approved_on=None,

            rejection_reason=None,

            comp_off_date=None,

            createdby=employee.id,

            createdon=now,

            modifiedby=employee.id,

            modifiedon=now,
        )

        try:

            self.repository.add_request(
                entity
            )

            self.repository.commit()

            self.repository.refresh(
                entity
            )

        except Exception:

            self.repository.rollback()

            raise

        return entity

    # ========================================================
    # SAVE ATTACHMENT
    # ========================================================

    async def _save_attachment(
        self,
        upload: UploadFile,
    ) -> str:

        filename = (
            upload.filename or ""
        ).strip()

        if not filename:

            raise HTTPException(
                status_code=400,
                detail="Invalid attachment.",
            )

        extension = Path(
            filename
        ).suffix.lower()

        if extension not in self.ALLOWED_EXTENSIONS:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Only PDF, JPG, JPEG and PNG "
                    "files are allowed."
                ),
            )

        content = await upload.read()

        if not content:

            raise HTTPException(
                status_code=400,
                detail="Attachment cannot be empty.",
            )

        if len(content) > self.MAX_FILE_SIZE:

            raise HTTPException(
                status_code=400,
                detail="Maximum attachment size is 5 MB.",
            )

        directory = (
            settings.BASE_DIR
            / "uploads"
            / "comp-off"
        )

        directory.mkdir(
            parents=True,
            exist_ok=True,
        )

        generated_name = (
            f"{uuid4().hex}{extension}"
        )

        file_path = (
            directory
            / generated_name
        )

        file_path.write_bytes(
            content
        )

        return (
            f"/uploads/comp-off/{generated_name}"
        )

    # ========================================================
    # GET MY REQUESTS
    # ========================================================

    def get_my_requests(
        self,
        username: str,
        status: Optional[str] = None,
        day_type: Optional[str] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
    ):

        employee = (
            self.repository
            .get_employee_by_code(username)
        )

        if not employee:

            raise HTTPException(
                status_code=404,
                detail="Employee not found.",
            )

        normalized_day_type = None

        if day_type:

            normalized_day_type = (
                self.normalize_day_type(
                    day_type
                )
            )

        return self.repository.get_requests(
            emp_id=employee.id,
            status=status,
            day_type=normalized_day_type,
            from_date=from_date,
            to_date=to_date,
        )

    # ========================================================
    # GET ALL - HR
    # ========================================================

    def get_all_requests(
        self,
        status: Optional[str] = None,
        day_type: Optional[str] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
    ):

        normalized_day_type = None

        if day_type:

            normalized_day_type = (
                self.normalize_day_type(
                    day_type
                )
            )

        return self.repository.get_requests(
            status=status,
            day_type=normalized_day_type,
            from_date=from_date,
            to_date=to_date,
        )

    # ========================================================
    # GET SINGLE
    # ========================================================

    def get_request(
        self,
        request_id: int,
    ):

        entity = (
            self.repository
            .get_request_by_id(
                request_id
            )
        )

        if not entity:

            raise HTTPException(
                status_code=404,
                detail="Comp Off request not found.",
            )

        return entity

    # ========================================================
    # APPROVE
    # ========================================================

    # def approve_request(
    #     self,
    #     request_id: int,
    #     request: CompOffApprovalRequest,
    #     username: str,
    # ):

    #     comp_off_request = (
    #         self.repository
    #         .get_request_for_update(
    #             request_id
    #         )
    #     )

    #     if not comp_off_request:

    #         raise HTTPException(
    #             status_code=404,
    #             detail="Comp Off request not found.",
    #         )

    #     if (
    #         comp_off_request.status
    #         != self.STATUS_PENDING
    #     ):

    #         raise HTTPException(
    #             status_code=400,
    #             detail=(
    #                 "Only pending Comp Off requests "
    #                 "can be approved."
    #             ),
    #         )

    #     if (
    #         request.comp_off_date
    #         < comp_off_request.worked_date
    #     ):

    #         raise HTTPException(
    #             status_code=400,
    #             detail=(
    #                 "Comp Off date cannot be earlier "
    #                 "than the worked date."
    #             ),
    #         )

    #     approver = (
    #         self.repository
    #         .get_employee_by_code(username)
    #     )

    #     if not approver:

    #         raise HTTPException(
    #             status_code=404,
    #             detail="Approver employee not found.",
    #         )

    #     # financial_year = (
    #     #     self.get_financial_year(
    #     #         comp_off_request.worked_date
    #     #     )
    #     # )

    #     # balance = (
    #     #     self.repository
    #     #     .get_balance_for_update(
    #     #         comp_off_request.emp_code,
    #     #         financial_year,
    #     #     )
    #     # )
    #     # ----------------------------------------------------
    #     # EMPLOYEE BALANCE
    #     # ----------------------------------------------------

    #     employee = self.repository.get_employee_by_code(
    #         comp_off_request.emp_code
    #     )

    #     if not employee:
    #         raise HTTPException(
    #             status_code=404,
    #             detail=(
    #                 f"Employee {comp_off_request.emp_code} "
    #                 "associated with this Comp Off request was not found."
    #             ),
    #         )

    #     financial_year = self.get_financial_year(
    #         comp_off_request.worked_date
    #     )

    #     balance = self.repository.get_balance_for_update(
    #         employee.emp_code,
    #         financial_year,
    #     )

    #     if not balance:
    #         raise HTTPException(
    #             status_code=400,
    #             detail=(
    #                 f"Leave balance not found for "
    #                 f"{employee.emp_code} "
    #                 f"for financial year "
    #                 f"{financial_year}."
    #             ),
    #         )
    #     if not balance:

    #         raise HTTPException(
    #             status_code=400,
    #             detail=(
    #                 "Leave balance not found for "
    #                 f"{comp_off_request.emp_code} "
    #                 f"for financial year "
    #                 f"{financial_year}."
    #             ),
    #         )

    #     current_balance = Decimal(
    #         str(
    #             balance.remained_comp_off
    #             or 0
    #         )
    #     )

    #     credit_quantity = Decimal("1.00")

    #     new_balance = (
    #         current_balance
    #         + credit_quantity
    #     )

    #     now = datetime.now()

    #     # ----------------------------------------------------
    #     # UPDATE LEAVE BALANCE
    #     # ----------------------------------------------------

    #     balance.remained_comp_off = (
    #         new_balance
    #     )

    #     balance.modifiedby = (
    #         approver.emp_code
    #     )

    #     balance.modifieddate = now

    #     # ----------------------------------------------------
    #     # CREATE CREDIT LEDGER
    #     # ----------------------------------------------------

    #     ledger = CompOffLedgerModel(

    #         emp_id=comp_off_request.emp_id,

    #         emp_code=comp_off_request.emp_code,

    #         transaction_type="Credit",

    #         quantity=credit_quantity,

    #         balance_after=new_balance,

    #         comp_off_request_id=(
    #             comp_off_request.id
    #         ),

    #         leave_log_id=None,

    #         transaction_date=now,

    #         remarks=(
    #             request.remarks.strip()
    #             if request.remarks
    #             else "Comp Off credited after approval."
    #         ),

    #         createdby=approver.id,

    #         createdon=now,
    #     )

    #     # ----------------------------------------------------
    #     # UPDATE REQUEST
    #     # ----------------------------------------------------

    #     comp_off_request.status = (
    #         self.STATUS_APPROVED
    #     )

    #     comp_off_request.approved_by = (
    #         approver.id
    #     )

    #     comp_off_request.approved_on = now

    #     comp_off_request.comp_off_date = (
    #         request.comp_off_date
    #     )

    #     comp_off_request.rejection_reason = None

    #     comp_off_request.modifiedby = (
    #         approver.id
    #     )

    #     comp_off_request.modifiedon = now

    #     try:

    #         self.repository.add_ledger_entry(
    #             ledger
    #         )

    #         self.repository.commit()

    #         self.repository.refresh(
    #             comp_off_request
    #         )

    #     except Exception:

    #         self.repository.rollback()

    #         raise

    #     return comp_off_request


    # ========================================================
    # APPROVE
    # ========================================================

    def approve_request(
        self,
        request_id: int,
        username: str,
    ):

        # ----------------------------------------------------
        # GET REQUEST FOR UPDATE
        # ----------------------------------------------------

        comp_off_request = (
            self.repository.get_request_for_update(
                request_id
            )
        )

        if not comp_off_request:

            raise HTTPException(
                status_code=404,
                detail="Comp Off request not found.",
            )

        # ----------------------------------------------------
        # ONLY PENDING REQUESTS CAN BE APPROVED
        # ----------------------------------------------------

        if (
            comp_off_request.status
            != self.STATUS_PENDING
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "Only pending Comp Off requests "
                    "can be approved."
                ),
            )

        # ----------------------------------------------------
        # APPROVER
        # ----------------------------------------------------

        approver = (
            self.repository.get_employee_by_code(
                username
            )
        )

        if not approver:

            raise HTTPException(
                status_code=404,
                detail="Approver employee not found.",
            )

        # ----------------------------------------------------
        # EMPLOYEE ASSOCIATED WITH REQUEST
        # ----------------------------------------------------

        employee = (
            self.repository.get_employee_by_code(
                comp_off_request.emp_code.strip()
            )
        )

        if not employee:

            raise HTTPException(
                status_code=404,
                detail=(
                    f"Employee "
                    f"{comp_off_request.emp_code} "
                    "associated with this Comp Off request "
                    "was not found."
                ),
            )

        # ----------------------------------------------------
        # FINANCIAL YEAR
        # ----------------------------------------------------

        financial_year = (
            self.get_financial_year(
                comp_off_request.worked_date
            )
        )

        # ----------------------------------------------------
        # LEAVE BALANCE
        # ----------------------------------------------------

        balance = (
            self.repository.get_balance_for_update(
                employee.emp_code,
                financial_year,
            )
        )

        if not balance:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Leave balance not found for "
                    f"{employee.emp_code} "
                    f"for financial year "
                    f"{financial_year}."
                ),
            )

        # ----------------------------------------------------
        # CURRENT COMP OFF BALANCE
        # ----------------------------------------------------

        current_balance = Decimal(
            str(
                balance.remained_comp_off
                or 0
            )
        )

        credit_quantity = Decimal("1.00")

        new_balance = (
            current_balance
            + credit_quantity
        )

        now = datetime.now()

        # ----------------------------------------------------
        # UPDATE LEAVE BALANCE
        # ----------------------------------------------------

        balance.remained_comp_off = new_balance

        balance.modifiedby = (
            approver.emp_code
        )

        balance.modifieddate = now

        # ----------------------------------------------------
        # CREATE CREDIT LEDGER
        # ----------------------------------------------------

        ledger = CompOffLedgerModel(
            emp_id=employee.id,

            emp_code=employee.emp_code,

            transaction_type="Credit",

            quantity=credit_quantity,

            balance_after=new_balance,

            comp_off_request_id=(
                comp_off_request.id
            ),

            leave_log_id=None,

            transaction_date=now,

            remarks=(
                "Comp Off credited after approval."
            ),

            createdby=approver.id,

            createdon=now,
        )

        # ----------------------------------------------------
        # UPDATE REQUEST
        # ----------------------------------------------------

        comp_off_request.status = (
            self.STATUS_APPROVED
        )

        comp_off_request.approved_by = (
            approver.id
        )

        comp_off_request.approved_on = now

        # IMPORTANT:
        # HR does NOT assign a Comp Off date.
        # The employee will consume the Comp Off
        # later when applying for leave.

        comp_off_request.comp_off_date = None

        comp_off_request.rejection_reason = None

        comp_off_request.modifiedby = (
            approver.id
        )

        comp_off_request.modifiedon = now

        # ----------------------------------------------------
        # ATOMIC TRANSACTION
        # ----------------------------------------------------

        try:

            self.repository.add_ledger_entry(
                ledger
            )

            self.repository.commit()

            self.repository.refresh(
                comp_off_request
            )

        except Exception:

            self.repository.rollback()

            raise

        return comp_off_request
        
    # ========================================================
    # REJECT
    # ========================================================

    def reject_request(
        self,
        request_id: int,
        request: CompOffRejectionRequest,
        username: str,
    ):

        comp_off_request = (
            self.repository
            .get_request_for_update(
                request_id
            )
        )

        if not comp_off_request:

            raise HTTPException(
                status_code=404,
                detail="Comp Off request not found.",
            )

        if (
            comp_off_request.status
            != self.STATUS_PENDING
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "Only pending Comp Off requests "
                    "can be rejected."
                ),
            )

        approver = (
            self.repository
            .get_employee_by_code(username)
        )

        if not approver:

            raise HTTPException(
                status_code=404,
                detail="Approver employee not found.",
            )

        rejection_reason = (
            request.rejection_reason.strip()
        )

        if not rejection_reason:

            raise HTTPException(
                status_code=422,
                detail="Rejection reason is required.",
            )

        now = datetime.now()

        comp_off_request.status = (
            self.STATUS_REJECTED
        )

        comp_off_request.approved_by = (
            approver.id
        )

        comp_off_request.rejection_reason = (
            rejection_reason
        )

        comp_off_request.modifiedby = (
            approver.id
        )

        comp_off_request.modifiedon = now

        try:

            self.repository.commit()

            self.repository.refresh(
                comp_off_request
            )

        except Exception:

            self.repository.rollback()

            raise

        return comp_off_request