from datetime import date
from pathlib import Path
from typing import Any, Dict, Optional

import logging
import shutil
import uuid

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.application.dtos.recruitment.job_application import (
    JobApplicationSubmit,
    JobApplicationSubmitResponse,
)

from app.infrastructure.repositories.recruitment.job_application_repository import (
    JobApplicationRepository,
)
from app.infrastructure.models.employee.employee import EmployeeModel
from app.infrastructure.models.employee.designation import DesignationModel
from app.infrastructure.models.employee.department import DepartmentModel

from app.core.config import settings


logger = logging.getLogger(__name__)


class JobApplicationService:
    """
    Service layer for complete job applications.

    One request creates:
    - Main job application
    - Emergency contacts
    - Work experiences
    - Education records
    - References
    - Resume file

    No application token is required.
    """

    def __init__(self, db: Session):
        self.db = db

        self.repository = JobApplicationRepository(db)

        self.upload_dir = (
            Path(settings.UPLOAD_DIR)
            if hasattr(settings, "UPLOAD_DIR")
            else Path("uploads/resumes")
        )

        self.upload_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

    # ==========================================================
    # COMPLETE APPLICATION
    # ==========================================================
    def submit_application(
        self,
        form_data: JobApplicationSubmit,
        resume_file: UploadFile,
        referral_token: Optional[str] = None,
    ) -> JobApplicationSubmitResponse:

        # ------------------------------------------------------
        # 1. Validate resume
        # ------------------------------------------------------

        if not resume_file or not resume_file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Resume file is required.",
            )

        # ------------------------------------------------------
        # 2. Save resume
        # ------------------------------------------------------

        resume_data = self._save_resume(resume_file)

        try:

            # --------------------------------------------------
            # 3. Prepare main application data
            # --------------------------------------------------

            application_data = form_data.model_dump(
                exclude={
                    "emergency_contacts",
                    "work_experiences",
                    "education",
                    "references",
                }
            )

            application_data["date_of_application"] = date.today()

            application_data["gender"] = form_data.gender.value

            application_data.update(resume_data)

            # --------------------------------------------------
            # 4. Create complete application
            #
            # EXISTING LOGIC PRESERVED
            # --------------------------------------------------

            application = (
                self.repository.create_complete_application(
                    application_data=application_data,

                    emergency_contacts=[
                        item.model_dump()
                        for item in form_data.emergency_contacts
                    ],

                    work_experiences=[
                        item.model_dump()
                        for item in form_data.work_experiences
                    ],

                    education=[
                        item.model_dump()
                        for item in form_data.education
                    ],

                    references=[
                        item.model_dump()
                        for item in form_data.references
                    ],
                )
            )

            # --------------------------------------------------
            # 5. SAVE REFERRAL MAPPING
            #
            # Only executed when referral_token exists.
            #
            # Normal application:
            #     referral_token = None
            #     Nothing happens here.
            # --------------------------------------------------

            if referral_token and referral_token.strip():

                token = referral_token.strip()

                # ------------------------------------------------
                # Find active referral
                # ------------------------------------------------

                referral_result = self.db.execute(
                    text(
                        """
                        SELECT id
                        FROM public.employee_referrals
                        WHERE referral_token = :referral_token
                          AND is_active = TRUE
                        LIMIT 1
                        """
                    ),
                    {
                        "referral_token": token,
                    },
                ).first()

                # ------------------------------------------------
                # Invalid referral
                # ------------------------------------------------

                if referral_result is None:

                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid or inactive referral token.",
                    )

                referral_id = referral_result[0]

                # ------------------------------------------------
                # Create application -> referral mapping
                # ------------------------------------------------

                self.db.execute(
                    text(
                        """
                        INSERT INTO public.job_application_referrals
                        (
                            application_id,
                            referral_id
                        )
                        VALUES
                        (
                            :application_id,
                            :referral_id
                        )
                        """
                    ),
                    {
                        "application_id": application.application_id,
                        "referral_id": referral_id,
                    },
                )

            # --------------------------------------------------
            # 6. Commit everything
            # --------------------------------------------------
            #
            # IMPORTANT:
            #
            # Application + referral mapping are committed
            # together.
            #
            # If referral mapping fails, application is
            # rolled back as well.
            # --------------------------------------------------

            self.db.commit()

            # --------------------------------------------------
            # 7. Refresh application
            # --------------------------------------------------

            self.db.refresh(application)

            # --------------------------------------------------
            # 8. Build response
            # --------------------------------------------------

            return JobApplicationSubmitResponse(
                success=True,

                message="Application submitted successfully.",

                data={
                    "job_application": (
                        self.repository.serialize_application(
                            application
                        )
                    ),

                    "education": [
                        self.repository.serialize_education(item)
                        for item in application.education
                    ],

                    "emergency_contacts": [
                        self.repository.serialize_emergency_contact(item)
                        for item in application.emergency_contacts
                    ],

                    "work_experiences": [
                        self.repository.serialize_work_experience(item)
                        for item in application.work_experiences
                    ],

                    "references": [
                        self.repository.serialize_reference(item)
                        for item in application.references
                    ],
                },
            )

        except HTTPException:

            self.db.rollback()

            self._delete_resume(
                resume_data["resume_path"]
            )

            raise

        except Exception as exc:

            self.db.rollback()

            self._delete_resume(
                resume_data["resume_path"]
            )

            logger.exception(
                "Failed to submit complete job application."
            )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to submit job application.",
            ) from exc


    # ==========================================================
    # GET EMPLOYEE DEPARTMENT
    # ==========================================================

    def get_employee_department_id(
            self,
            employee_code: str,
        ) -> int:

        employee = (
            self.db.query(EmployeeModel)
            .filter(
                EmployeeModel.emp_code == employee_code
            )
            .filter(
                EmployeeModel.is_remove == 0
            )
            .first()
        )

        if employee is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Employee not found.",
            )

        if employee.designation is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Employee designation is not assigned.",
            )

        designation = (
            self.db.query(DesignationModel)
            .filter(
                DesignationModel.id == employee.designation
            )
            .first()
        )

        if designation is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Employee designation is not assigned.",
            )

        if designation.depart_id is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Employee department is not assigned.",
            )

        return designation.depart_id


        # ==========================================================
        # GET ALL APPLICATIONS
        # ==========================================================

    def get_all_applications(
    self,
    employee_code: str,
    ) -> dict:

        department_id = self.get_employee_department_id(
        employee_code
        )

        department = (
            self.db.query(DepartmentModel)
            .filter(
                DepartmentModel.id == department_id
            )
            .first()
        )

        if department is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Employee department is not assigned.",
            )

        if (
            department.name
            and department.name.strip().lower()
            == "human resource"
        ):
            # HR can see applications from ALL departments
            applications = (
                self.repository.get_all_applications()
            )
        else:
            # Other managers see only their own department
            applications = (
                self.repository.get_all_applications_by_department(
                    department_id
                )
            )

        data = []

        for application in applications:

            # --------------------------------------------------
            # Existing application serialization
            # --------------------------------------------------

            application_data = (
                self.repository.serialize_application(
                    application
                )
            )

            # --------------------------------------------------
            # Get referral information
            # --------------------------------------------------

            referral_data = (
                self.repository.get_referral_by_application_id(
                    application.application_id
                )
            )

            # --------------------------------------------------
            # Add referral information
            #
            # Normal application:
            # referred_by = None
            #
            # Referral application:
            # referred_by = employee name
            # --------------------------------------------------

            application_data["referred_by"] = (
                referral_data["referred_by"]
                if referral_data
                else None
            )

            application_data["referral_employee_id"] = (
                referral_data["employee_id"]
                if referral_data
                else None
            )

            application_data["referral_token"] = (
                referral_data["referral_token"]
                if referral_data
                else None
            )

            # --------------------------------------------------
            # Existing response structure preserved
            # --------------------------------------------------

            data.append(
                {
                    "job_application": application_data,

                    "education": [
                        self.repository.serialize_education(item)
                        for item in application.education
                    ],

                    "emergency_contacts": [
                        self.repository.serialize_emergency_contact(item)
                        for item in application.emergency_contacts
                    ],

                    "work_experiences": [
                        self.repository.serialize_work_experience(item)
                        for item in application.work_experiences
                    ],

                    "references": [
                        self.repository.serialize_reference(item)
                        for item in application.references
                    ],
                }
            )

        return {
            "success": True,
            "message": "Job applications fetched successfully.",
            "data": data,
        }
    # ==========================================================
    # GET APPLICATION BY ID
    # ==========================================================

    def get_application_by_id(
        self,
        application_id: int,
    ) -> dict:

        application = (
            self.repository.get_application_by_id(
                application_id
            )
        )

        if application is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job application not found.",
            )

        return {
            "success": True,
            "message": "Job application fetched successfully.",
            "data": {
                "job_application": (
                    self.repository.serialize_application(
                        application
                    )
                ),
                "education": [
                    self.repository.serialize_education(item)
                    for item in application.education
                ],
                "emergency_contacts": [
                    self.repository.serialize_emergency_contact(item)
                    for item in application.emergency_contacts
                ],
                "work_experiences": [
                    self.repository.serialize_work_experience(item)
                    for item in application.work_experiences
                ],
                "references": [
                    self.repository.serialize_reference(item)
                    for item in application.references
                ],
            },
        }


        # ==========================================================
    # UPDATE APPLICATION JOINING DETAILS
    # ==========================================================

    def update_application_details(
        self,
        application_id: int,
        position_applied_for: str,
        joining_date: Optional[date],
        remark: Optional[str],

        reporting_manager_status: Optional[str] = None,
        reporting_manager_remark: Optional[str] = None,

        team_manager_status: Optional[str] = None,
        team_manager_remark: Optional[str] = None,

        hr_status: Optional[str] = None,
        hr_remark: Optional[str] = None,
    ) -> dict:

        application = (
            self.repository.update_application_details(
                application_id=application_id,
                position_applied_for=position_applied_for,
                joining_date=joining_date,
                remark=remark,

                reporting_manager_status=reporting_manager_status,
                reporting_manager_remark=reporting_manager_remark,

                team_manager_status=team_manager_status,
                team_manager_remark=team_manager_remark,

                hr_status=hr_status,
                hr_remark=hr_remark,
            )
        )

        if application is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job application not found.",
            )

        self.db.commit()

        self.db.refresh(application)

        return {
            "application_id": application.application_id,

            "position_applied_for": (
                application.position_applied_for
            ),

            "joining_date": application.joining_date,

            "remark": application.remark,

            "joining_status": application.joining_status,

            "reporting_manager_status": (
                application.reporting_manager_status
            ),

            "reporting_manager_remark": (
                application.reporting_manager_remark
            ),

            "team_manager_status": (
                application.team_manager_status
            ),

            "team_manager_remark": (
                application.team_manager_remark
            ),

            "hr_status": application.hr_status,

            "hr_remark": application.hr_remark,

            "modified_date": application.modified_date,
        }

     # ==========================================================
        # UPDATE APPLICATION JOINING DETAILS
        # ==========================================================


        
    # ==========================================================
    # DELETE APPLICATION
    # ==========================================================

    def delete_application(
        self,
        application_id: int,
    ) -> dict:

        application = (
            self.repository.get_application_by_id(
                application_id
            )
        )

        if application is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job application not found.",
            )

        resume_path = application.resume_path

        try:

            deleted_application = (
                self.repository.delete_application(
                    application_id
                )
            )

            if deleted_application is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Job application not found.",
                )

            self.db.commit()

            # Delete resume only after successful DB deletion.
            self._delete_resume(resume_path)

            return {
                "success": True,
                "message": "Job application deleted successfully.",
                "application_id": application_id,
            }

        except HTTPException:
            self.db.rollback()
            raise

        except Exception as exc:

            self.db.rollback()

            logger.exception(
                "Failed to delete job application %s",
                application_id,
            )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete job application.",
            ) from exc

    # ==========================================================
    # SAVE RESUME
    # ==========================================================

    def _save_resume(
        self,
        resume_file: UploadFile,
    ) -> Dict[str, str]:

        allowed_extensions = {
            ".pdf",
            ".doc",
            ".docx",
        }

        original_name = (
            resume_file.filename.strip()
        )

        extension = Path(
            original_name
        ).suffix.lower()

        if extension not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid resume file type. "
                    "Allowed types: PDF, DOC, DOCX."
                ),
            )

        stored_name = (
            f"{uuid.uuid4().hex}{extension}"
        )

        file_path = (
            self.upload_dir / stored_name
        )

        try:

            with file_path.open("wb") as buffer:

                shutil.copyfileobj(
                    resume_file.file,
                    buffer,
                )

        except OSError as exc:

            logger.exception(
                "Failed to save resume."
            )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save resume file.",
            ) from exc

        return {
            "resume_original_name": original_name,
            "resume_stored_name": stored_name,
            "resume_path": str(file_path),
        }

    # ==========================================================
    # DELETE RESUME AFTER FAILURE
    # ==========================================================

    @staticmethod
    def _delete_resume(
        resume_path: str,
    ) -> None:

        try:

            path = Path(resume_path)

            if path.exists():
                path.unlink()

        except OSError:

            logger.exception(
                "Failed to remove resume after rollback."
            )