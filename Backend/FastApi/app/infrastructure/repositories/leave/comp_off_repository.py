from datetime import date
from typing import List, Optional

from sqlalchemy import case, func, or_
from sqlalchemy.orm import Session

from app.domain.interfaces.leave.comp_off_interface import (
    ICompOffRepository,
)

from app.infrastructure.models.employee.employee import (
    EmployeeModel,
)

from app.infrastructure.models.leave.comp_off_request import (
    CompOffRequestModel,
)

from app.infrastructure.models.leave.comp_off_ledger import (
    CompOffLedgerModel,
)

from app.infrastructure.models.leave.leave_balance import (
    LeaveBalanceModel,
)


class CompOffRepository(ICompOffRepository):

    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    # ========================================================
    # EMPLOYEE
    # ========================================================

    def get_employee_by_code(
        self,
        emp_code: str,
    ) -> Optional[EmployeeModel]:

        return (
            self.db.query(EmployeeModel)
            .filter(
                EmployeeModel.emp_code == emp_code,
                EmployeeModel.is_remove == 0,
            )
            .first()
        )

    # ========================================================
    # REQUEST
    # ========================================================

    def add_request(
        self,
        request: CompOffRequestModel,
    ) -> None:

        self.db.add(request)

        self.db.flush()

    def get_request_by_id(
        self,
        request_id: int,
    ) -> Optional[CompOffRequestModel]:

        return (
            self.db.query(CompOffRequestModel)
            .filter(
                CompOffRequestModel.id == request_id
            )
            .first()
        )

    def get_request_for_update(
        self,
        request_id: int,
    ) -> Optional[CompOffRequestModel]:

        return (
            self.db.query(CompOffRequestModel)
            .filter(
                CompOffRequestModel.id == request_id
            )
            .with_for_update()
            .first()
        )

    def get_existing_request(
        self,
        emp_id: int,
        worked_date: date,
    ) -> Optional[CompOffRequestModel]:

        return (
            self.db.query(CompOffRequestModel)
            .filter(
                CompOffRequestModel.emp_id == emp_id,
                CompOffRequestModel.worked_date == worked_date,
                CompOffRequestModel.status.in_(
                    [
                        "Pending",
                        "Approved",
                    ]
                ),
            )
            .first()
        )

    def get_requests(
        self,
        emp_id: Optional[int] = None,
        status: Optional[str] = None,
        day_type: Optional[str] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
    ) -> List[CompOffRequestModel]:

        query = self.db.query(
            CompOffRequestModel
        )

        if emp_id is not None:

            query = query.filter(
                CompOffRequestModel.emp_id == emp_id
            )

        if status:

            query = query.filter(
                CompOffRequestModel.status == status
            )

        if day_type:

            query = query.filter(
                CompOffRequestModel.day_type == day_type
            )

        if from_date:

            query = query.filter(
                CompOffRequestModel.worked_date >= from_date
            )

        if to_date:

            query = query.filter(
                CompOffRequestModel.worked_date <= to_date
            )

        return (
            query
            .order_by(
                CompOffRequestModel.createdon.desc()
            )
            .all()
        )

    # ========================================================
    # BALANCE
    # ========================================================

    # def get_balance_for_update(
    #     self,
    #     emp_code: str,
    #     year: str,
    # ) -> Optional[LeaveBalanceModel]:

    #     return (
    #         self.db.query(LeaveBalanceModel)
    #         .filter(
    #             LeaveBalanceModel.emp_id == emp_code,
    #             LeaveBalanceModel.year == year,
    #         )
    #         .with_for_update()
    #         .first()
    #     )


    def get_balance_for_update(
        self,
        emp_code: str,
        year: str,
    ) -> Optional[LeaveBalanceModel]:

        normalized_emp_code = emp_code.strip().upper()
        normalized_year = year.strip()

        # Canonical financial year:
        #
        # 2026-2027 -> legacy year 2026
        #
        # This allows the system to safely read old records while
        # all new records use the canonical YYYY-YYYY format.

        legacy_year: Optional[str] = None

        if (
            len(normalized_year) == 9
            and normalized_year[4] == "-"
            and normalized_year[:4].isdigit()
            and normalized_year[5:].isdigit()
        ):
            legacy_year = normalized_year[:4]

        year_values = [normalized_year]

        if legacy_year:
            year_values.append(legacy_year)

        query = (
            self.db.query(LeaveBalanceModel)
            .filter(
                func.upper(
                    func.trim(LeaveBalanceModel.emp_id)
                ) == normalized_emp_code,
                func.trim(
                    LeaveBalanceModel.year
                ).in_(year_values),
            )
            .order_by(
                case(
                    (
                        func.trim(
                            LeaveBalanceModel.year
                        ) == normalized_year,
                        0,
                    ),
                    else_=1,
                ),
                LeaveBalanceModel.id.asc(),
            )
            .with_for_update()
        )

        return query.first()
        

    # ========================================================
    # LEDGER
    # ========================================================

    def add_ledger_entry(
        self,
        ledger: CompOffLedgerModel,
    ) -> None:

        self.db.add(ledger)

        self.db.flush()

    # ========================================================
    # TRANSACTION
    # ========================================================

    def commit(self) -> None:

        self.db.commit()

    def rollback(self) -> None:

        self.db.rollback()

    def refresh(
        self,
        entity,
    ) -> None:

        self.db.refresh(entity)