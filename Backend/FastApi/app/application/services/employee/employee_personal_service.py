from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError

from app.domain.interfaces.employee.employee_personal_interface import (
    IEmployeePersonalRepository,
)

from app.application.dtos.employee.employee_personal import (
    EmployeePersonalCreate,
    EmployeePersonalUpdate,
)

from app.infrastructure.models.employee.employee_personal import (
    EmployeePersonalModel,
)


class EmployeePersonalService:

    def __init__(
        self,
        repo: IEmployeePersonalRepository,
    ):
        self.repo = repo

    # -----------------------------------------
    # GET ALL PERSONAL DETAILS
    # -----------------------------------------

    def get_all(self):

        return self.repo.get_all()

    # -----------------------------------------
    # GET PERSONAL DETAILS BY EMPLOYEE ID
    # -----------------------------------------

    def get_by_emp_id(
        self,
        emp_id: int,
    ):

        record = self.repo.get_by_emp_id(emp_id)

        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"Personal details for employee ID "
                    f"{emp_id} not found"
                ),
            )

        return record

    # -----------------------------------------
    # CREATE PERSONAL DETAILS
    # -----------------------------------------

    def create(
        self,
        personal_data: EmployeePersonalCreate,
    ):

        existing_record = self.repo.get_by_emp_id(
            personal_data.emp_id
        )

        if existing_record:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Personal details already exist "
                    f"for employee ID "
                    f"{personal_data.emp_id}"
                ),
            )

        personal_details = EmployeePersonalModel(
            **personal_data.model_dump(),
            createdby="api",
            createdon=datetime.now(timezone.utc),
        )

        try:

            self.repo.add(
                personal_details
            )

            self.repo.commit()

            self.repo.refresh(
                personal_details
            )

            return personal_details

        except IntegrityError:

            self.repo.rollback()

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Unable to create personal details. "
                    "Please verify the employee ID."
                ),
            )

        except Exception:

            self.repo.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create personal details",
            )

    # -----------------------------------------
    # UPDATE PERSONAL DETAILS
    # -----------------------------------------

    def update(
        self,
        emp_id: int,
        personal_data: EmployeePersonalUpdate,
    ):

        personal_details = (
            self.repo.get_by_emp_id(emp_id)
        )

        if not personal_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"Personal details for employee ID "
                    f"{emp_id} not found"
                ),
            )

        # Only update fields sent by frontend
        update_data = personal_data.model_dump(
            exclude_unset=True
        )

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields provided for update",
            )

        update_data["modifiedby"] = "api"
        update_data["modifiedon"] = (
            datetime.now(timezone.utc)
        )

        try:

            updated_record = self.repo.update(
                personal_details,
                update_data,
            )

            self.repo.commit()

            self.repo.refresh(
                updated_record
            )

            return updated_record

        except Exception:

            self.repo.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update personal details",
            )

    # -----------------------------------------
    # DELETE PERSONAL DETAILS
    # -----------------------------------------

    def delete(
        self,
        emp_id: int,
    ):

        personal_details = (
            self.repo.get_by_emp_id(emp_id)
        )

        if not personal_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"Personal details for employee ID "
                    f"{emp_id} not found"
                ),
            )

        try:

            self.repo.delete(
                personal_details
            )

            self.repo.commit()

            return {
                "success": True,
                "message": (
                    "Personal details deleted "
                    "successfully for employee ID "
                    f"{emp_id}"
                ),
            }

        except Exception:

            self.repo.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete personal details",
            )