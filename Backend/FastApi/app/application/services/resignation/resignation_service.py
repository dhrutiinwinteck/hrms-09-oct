from datetime import datetime

from fastapi import HTTPException

from app.domain.interfaces.resignation.resignation_interface import (
    IResignationRepository
)

from app.infrastructure.models.resignation.resignation import (
    ResignationModel
)

from app.application.dtos.resignation.resignation_dto import (
    ResignationCreate,
    ResignationUpdate
)


class ResignationService:

    def __init__(
        self,
        repo: IResignationRepository
    ):
        self.repo = repo

    # ========================================================
    # FORMAT EMPLOYEE
    # ========================================================

    def _format_employee(
        self,
        employee
    ):

        if not employee:
            return None

        full_name = (
            f"{employee.first_name or ''} "
            f"{employee.last_name or ''}"
        ).strip()

        return {
            "id": employee.id,
            "first_name": employee.first_name,
            "last_name": employee.last_name,
            "full_name": full_name,
            "emp_code": employee.emp_code,
        }

    # ========================================================
    # FORMAT RESIGNATION
    # ========================================================

    def _format_resignation(
        self,
        resignation
    ):

        return {
            "id": resignation.id,
            "emp_id": resignation.emp_id,

            "employee": self._format_employee(
                resignation.employee
            ),

            "reason": resignation.reason,
            "is_resignation": resignation.is_resignation,
            "is_termination": resignation.is_termination,
            "from_date": resignation.from_date,
            "notice_period": resignation.notice_period,
            "hr_status": resignation.hr_status,
            "promoter_status": resignation.promoter_status,
            "createdon": resignation.createdon,
        }

    # ========================================================
    # GET ALL
    # ========================================================

    def get_all(self):

        resignations = self.repo.get_all()

        return [
            self._format_resignation(item)
            for item in resignations
        ]

    # ========================================================
    # GET BY ID
    # ========================================================

    def get_by_id(
        self,
        res_id: int
    ):

        resignation = (
            self.repo.get_by_id(res_id)
        )

        if not resignation:

            raise HTTPException(
                status_code=404,
                detail="Resignation request not found"
            )

        return self._format_resignation(
            resignation
        )

    # ========================================================
    # CREATE RESIGNATION
    # ========================================================

    def create(
        self,
        data: ResignationCreate
    ):

        # ----------------------------------------------------
        # Check employee
        # ----------------------------------------------------

        employee = (
            self.repo.get_employee_by_id(
                data.emp_id
            )
        )

        if not employee:

            raise HTTPException(
                status_code=404,
                detail="Employee not found"
            )

        # ----------------------------------------------------
        # Check existing pending resignation
        # ----------------------------------------------------

        existing = self.repo.get_all()

        for item in existing:

            if (
                item.emp_id == data.emp_id
                and item.hr_status == 0
                and item.promoter_status == 0
            ):

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Employee already has a "
                        "pending resignation request"
                    )
                )

        # ----------------------------------------------------
        # Create model
        # ----------------------------------------------------

        resignation = ResignationModel(
            emp_id=data.emp_id,
            reason=data.reason,
            is_resignation=data.is_resignation,
            is_termination=data.is_termination,
            from_date=data.from_date,
            notice_period=data.notice_period,
            hr_status=0,
            promoter_status=0,
            createdon=datetime.now()
        )

        # ----------------------------------------------------
        # Save
        # ----------------------------------------------------

        resignation = self.repo.add(
            resignation
        )

        return self._format_resignation(
            resignation
        )

    # ========================================================
    # UPDATE RESIGNATION
    # ========================================================

    def update(
        self,
        res_id: int,
        data: ResignationUpdate
    ):

        resignation = (
            self.repo.get_by_id(res_id)
        )

        if not resignation:

            raise HTTPException(
                status_code=404,
                detail="Resignation request not found"
            )

        update_data = (
            data.model_dump(
                exclude_unset=True
            )
        )

        # ----------------------------------------------------
        # Validate HR status
        # ----------------------------------------------------

        if "hr_status" in update_data:

            hr_status = update_data["hr_status"]

            if hr_status not in [0, 1, 2]:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Invalid HR status. "
                        "Use 0, 1 or 2."
                    )
                )

        # ----------------------------------------------------
        # Validate Promoter status
        # ----------------------------------------------------

        if "promoter_status" in update_data:

            promoter_status = (
                update_data["promoter_status"]
            )

            if promoter_status not in [0, 1, 2]:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Invalid promoter status. "
                        "Use 0, 1 or 2."
                    )
                )

        # ----------------------------------------------------
        # Update fields
        # ----------------------------------------------------

        for key, value in update_data.items():

            setattr(
                resignation,
                key,
                value
            )

        # ====================================================
        # PROMOTER APPROVAL
        # ====================================================

        if (
            "promoter_status" in update_data
            and update_data["promoter_status"] == 1
        ):

            employee = (
                self.repo.get_employee_by_id(
                    resignation.emp_id
                )
            )

            if not employee:

                raise HTTPException(
                    status_code=404,
                    detail="Employee not found"
                )

            employee.is_remove = 1

        # ----------------------------------------------------
        # Save
        # ----------------------------------------------------

        resignation = self.repo.update(
            resignation
        )

        return self._format_resignation(
            resignation
        )

    # ========================================================
    # DELETE
    # ========================================================

    def delete(
        self,
        res_id: int
    ):

        resignation = (
            self.repo.get_by_id(res_id)
        )

        if not resignation:

            raise HTTPException(
                status_code=404,
                detail="Resignation request not found"
            )

        self.repo.delete(
            resignation
        )

        return {
            "message": "Resignation request deleted",
            "id": res_id
        }