from datetime import datetime, timezone
from typing import List

from fastapi import HTTPException, status

from app.domain.interfaces.employee.employee_educationinfo_interface import (
    IEmployeeEducationInfoRepository,
)

from app.application.dtos.employee.employee_educationinfo import (
    EmployeeEducationInfoCreate,
    EmployeeEducationInfoUpdate,
)

from app.infrastructure.models.employee.employee_educationinfo import (
    EmployeeEducationInfoModel,
)


class EmployeeEducationInfoService:

    def __init__(
        self,
        repo: IEmployeeEducationInfoRepository,
    ):
        self.repo = repo

    # -----------------------------------------
    # GET BY EDUCATION ID
    # -----------------------------------------

    def get_by_id(self, education_id: int):

        record = self.repo.get_by_id(education_id)

        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"Education record with ID "
                    f"{education_id} not found"
                ),
            )

        return record

    # -----------------------------------------
    # GET ALL BY EMPLOYEE ID
    # -----------------------------------------

    def get_by_emp_id(
        self,
        emp_id: int,
    ) -> List[EmployeeEducationInfoModel]:

        return self.repo.get_by_emp_id(emp_id)

    # -----------------------------------------
    # CREATE
    # -----------------------------------------

    def create(
        self,
        education_data: EmployeeEducationInfoCreate,
    ):

        education_details = EmployeeEducationInfoModel(
            **education_data.model_dump(),
            createdby="api",
            createdon=datetime.now(timezone.utc),
        )

        try:

            self.repo.add(education_details)
            self.repo.commit()
            self.repo.refresh(education_details)

            return education_details

        except Exception:

            self.repo.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create education details",
            )

    # -----------------------------------------
    # UPDATE
    # -----------------------------------------

    def update(
        self,
        education_id: int,
        education_data: EmployeeEducationInfoUpdate,
    ):

        education_details = self.repo.get_by_id(education_id)

        if not education_details:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"Education record with ID "
                    f"{education_id} not found"
                ),
            )

        update_data = education_data.model_dump(
            exclude_unset=True
        )

        if not update_data:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields provided for update",
            )

        update_data["modifiedby"] = "api"
        update_data["modifiedon"] = datetime.now(timezone.utc)

        try:

            updated_record = self.repo.update(
                education_details,
                update_data,
            )

            self.repo.commit()
            self.repo.refresh(updated_record)

            return updated_record

        except Exception:

            self.repo.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update education details",
            )

    # -----------------------------------------
    # DELETE
    # -----------------------------------------

    def delete(self, education_id: int):

        education_details = self.repo.get_by_id(education_id)

        if not education_details:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"Education record with ID "
                    f"{education_id} not found"
                ),
            )

        try:

            self.repo.delete(education_details)
            self.repo.commit()

            return {
                "success": True,
                "message": (
                    "Education details deleted successfully"
                ),
            }

        except Exception:

            self.repo.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete education details",
            )