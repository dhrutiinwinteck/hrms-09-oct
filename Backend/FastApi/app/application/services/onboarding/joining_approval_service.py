# import logging

# from fastapi import HTTPException, status
# from sqlalchemy.orm import Session

# from app.application.dtos.onboarding.joining_approval import (
#     JoiningApprovalActionResponse,
# )

# from app.infrastructure.email.email_service import EmailService

# from app.infrastructure.repositories.recruitment.job_application_repository import (
#     JobApplicationRepository,
# )

# from app.infrastructure.repositories.onboarding.joining_approval_repository import (
#     JoiningApprovalRepository,
# )

# from app.infrastructure.models.employee.employee import (
#     EmployeeModel,
# )

# from app.infrastructure.models.employee.designation import (
#     DesignationModel,
# )

# from app.infrastructure.models.employee.department import (
#     DepartmentModel,
# )

# from datetime import datetime


# logger = logging.getLogger(__name__)


# class JoiningApprovalService:

#     APPROVED_STATUS = "APPROVED"
#     ON_HOLD_STATUS = "ON_HOLD"
#     REJECTED_STATUS = "REJECTED"

#     # ==========================================================
#     # APPROVED EMAIL
#     # ==========================================================

#     APPROVED_SUBJECT = (
#         "Congratulations! Your Application Has Been Approved"
#     )

#     APPROVED_MESSAGE = """Dear Candidate,

# Greetings from Inwinteck Private Limited!

# We are pleased to inform you that your application has been approved.

# You have been selected to proceed with the joining process.

# Our HR team will contact you with the further joining details and necessary instructions.

# Congratulations, and we look forward to welcoming you to our team.

# Best Regards,

# HR Team
# Inwinteck Private Limited
# """

#     # ==========================================================
#     # ON HOLD EMAIL
#     # ==========================================================

#     ON_HOLD_SUBJECT = (
#         "Update Regarding Your Application"
#     )

#     ON_HOLD_MESSAGE = """Dear Candidate,

# Greetings from Inwinteck Private Limited!

# We would like to inform you that your application has currently been placed on hold.

# Your application is still under consideration, and our HR team will contact you once there is an update regarding the next steps.

# We appreciate your patience and continued interest in Inwinteck Private Limited.

# Best Regards,

# HR Team
# Inwinteck Private Limited
# """

#     # ==========================================================
#     # REJECTED EMAIL
#     # ==========================================================

#     REJECTED_SUBJECT = (
#         "Update Regarding Your Application"
#     )

#     REJECTED_MESSAGE = """Dear Candidate,

# Greetings from Inwinteck Private Limited!

# Thank you for your interest in joining Inwinteck Private Limited and for taking the time to participate in our recruitment process.

# After careful consideration, we regret to inform you that your application has not been selected for further consideration at this time.

# We appreciate your time and effort and wish you all the very best in your future career.

# Best Regards,

# HR Team
# Inwinteck Private Limited
# """

#     # ==========================================================
#     # CONSTRUCTOR
#     # ==========================================================

#     def __init__(self, db: Session):

#         self.db = db

#         self.repository = JobApplicationRepository(
#             db
#         )

#         # KEEPING YOUR EXISTING LOGIC
#         self.approval_repository = JoiningApprovalRepository(
#             db
#         )

#         # KEEPING YOUR EXISTING EMAIL SERVICE
#         self.email_service = EmailService()

#     # ==========================================================
#     # GET USER DEPARTMENT
#     # ==========================================================

#     def get_user_department(
#         self,
#         emp_code: str,
#     ) -> str:

#         employee = (
#             self.db.query(EmployeeModel)
#             .filter(
#                 EmployeeModel.emp_code == emp_code
#             )
#             .filter(
#                 EmployeeModel.is_remove == 0
#             )
#             .first()
#         )

#         if employee is None:

#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="Employee not found.",
#             )

#         if employee.designation is None:

#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="Employee designation is not assigned.",
#             )

#         department = (
#             self.db.query(DepartmentModel)
#             .join(
#                 DesignationModel,
#                 DesignationModel.depart_id
#                 == DepartmentModel.id,
#             )
#             .filter(
#                 DesignationModel.id
#                 == employee.designation
#             )
#             .first()
#         )

#         if department is None:

#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="Employee department is not assigned.",
#             )

#         return department.name

#     # ==========================================================
#     # ACCEPT APPLICATION
#     # ==========================================================

#     async def approve_application(
#         self,
#         application_id: int,
#         employee_code: str,
#     ) -> JoiningApprovalActionResponse:

#         return await self._update_status_and_send_email(
#             application_id=application_id,
#             employee_code=employee_code,
#             new_status=self.APPROVED_STATUS,
#             subject=self.APPROVED_SUBJECT,
#             message=self.APPROVED_MESSAGE,
#             success_message=(
#                 "Application approved and approval "
#                 "email sent successfully."
#             ),
#         )

#     # ==========================================================
#     # PUT APPLICATION ON HOLD
#     # ==========================================================

#     async def hold_application(
#         self,
#         application_id: int,
#         employee_code: str,
#     ) -> JoiningApprovalActionResponse:

#         return await self._update_status_and_send_email(
#             application_id=application_id,
#             employee_code=employee_code,
#             new_status=self.ON_HOLD_STATUS,
#             subject=self.ON_HOLD_SUBJECT,
#             message=self.ON_HOLD_MESSAGE,
#             success_message=(
#                 "Application placed on hold and "
#                 "on-hold email sent successfully."
#             ),
#         )

#     # ==========================================================
#     # REJECT APPLICATION
#     # ==========================================================

#     async def reject_application(
#         self,
#         application_id: int,
#         employee_code: str,
#     ) -> JoiningApprovalActionResponse:

#         return await self._update_status_and_send_email(
#             application_id=application_id,
#             employee_code=employee_code,
#             new_status=self.REJECTED_STATUS,
#             subject=self.REJECTED_SUBJECT,
#             message=self.REJECTED_MESSAGE,
#             success_message=(
#                 "Application rejected and rejection "
#                 "email sent successfully."
#             ),
#         )

#     # ==========================================================
#     # COMMON STATUS + EMAIL HANDLER
#     # ==========================================================

#     async def _update_status_and_send_email(
#         self,
#         application_id: int,
#         employee_code: str,
#         new_status: str,
#         subject: str,
#         message: str,
#         success_message: str,
#     ) -> JoiningApprovalActionResponse:

#         # ------------------------------------------------------
#         # 1. Find application
#         # ------------------------------------------------------

#         application = (
#             self.repository.get_application_by_id(
#                 application_id
#             )
#         )

#         if application is None:

#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="Job application not found.",
#             )

#         # ------------------------------------------------------
#         # 1.5. Verify user's department access
#         # ------------------------------------------------------

#         # YOUR EXISTING LOGIC - NOT CHANGED

#         user_department = self.get_user_department(
#             employee_code
#         )

#         authorized_application = (
#             self.approval_repository
#             .get_by_id_for_department(
#                 application_id=application_id,
#                 department_name=user_department,
#             )
#         )

#         if authorized_application is None:

#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail=(
#                     "You are not authorized to perform "
#                     "this action for this department."
#                 ),
#             )

#         try:

#             # --------------------------------------------------
#             # 2. DO NOT UPDATE APPROVAL STATUS
#             # --------------------------------------------------

#             # IMPORTANT:
#             #
#             # We intentionally DO NOT call:
#             #
#             # self.repository.update_joining_status(...)
#             #
#             # Therefore:
#             #
#             # job_applications.joining_status
#             #
#             # will NOT be changed for Accept / Reject / On Hold.
            

#             application.joining_status = new_status
#             application.modified_date = datetime.utcnow()

#             self.db.add(application)
#             self.db.flush()
#             # --------------------------------------------------
#             # 3. Send fixed email
#             # --------------------------------------------------

#             await self.email_service.send_email(
#                 recipient=application.email,
#                 subject=subject,
#                 body=message,
#             )

#             # --------------------------------------------------
#             # 4. Commit
#             # --------------------------------------------------

#             self.db.commit()

#             # --------------------------------------------------
#             # 5. Response
#             # --------------------------------------------------

#             return JoiningApprovalActionResponse(
#                 success=True,
#                 message=success_message,
#                 application_id=application_id,
#                 status=new_status,
#             )

#         except HTTPException:

#             self.db.rollback()

#             raise

#         except Exception as exc:

#             self.db.rollback()

#             logger.exception(
#                 "Joining status update failed for "
#                 "application_id=%s",
#                 application_id,
#             )

#             raise HTTPException(
#                 status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#                 detail=(
#                     "Unable to update application status "
#                     "or send email."
#                 ),
#             ) from exc






import logging

from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.application.dtos.onboarding.joining_approval import (
    JoiningApprovalActionResponse,
)

from app.application.services.recruitment.letter_of_intent_pdf_service import (
    LetterOfIntentPdfService,
)

from app.infrastructure.email.email_service import (
    EmailService,
)

from app.infrastructure.repositories.recruitment.job_application_repository import (
    JobApplicationRepository,
)

from app.infrastructure.repositories.onboarding.joining_approval_repository import (
    JoiningApprovalRepository,
)

from app.infrastructure.models.employee.employee import (
    EmployeeModel,
)

from app.infrastructure.models.employee.designation import (
    DesignationModel,
)

from app.infrastructure.models.employee.department import (
    DepartmentModel,
)


logger = logging.getLogger(__name__)


class JoiningApprovalService:

    APPROVED_STATUS = "APPROVED"
    ON_HOLD_STATUS = "ON_HOLD"
    REJECTED_STATUS = "REJECTED"

    # ==========================================================
    # APPROVED / SELECTION EMAIL
    # ==========================================================

    APPROVED_SUBJECT = (
        "Congratulations on Your Selection with Inwinteck!"
    )

    APPROVED_MESSAGE_TEMPLATE = """Dear {candidate_name},

Congratulations on your selection with Inwinteck!

We are delighted to welcome you to the next stage of your journey with us.

We look forward to having you on board and wish you a successful and rewarding journey with Inwinteck!

Regards,
HR Team
Inwinteck
"""

    # ==========================================================
    # LETTER OF INTENT EMAIL
    # ==========================================================

    LOI_SUBJECT = (
        "Letter of Intent to Hire - Inwinteck"
    )

    LOI_MESSAGE_TEMPLATE = """Dear {candidate_name},

Congratulations on being selected by Inwinteck! 🎉

Please find attached your Letter of Intent (LOI). Kindly review the details and confirm your acceptance as instructed.

We look forward to having you join our team.
"""

    # ==========================================================
    # ON HOLD EMAIL
    # ==========================================================

    ON_HOLD_SUBJECT = (
        "Update Regarding Your Application"
    )

    ON_HOLD_MESSAGE = """Dear Candidate,

Greetings from Inwinteck Private Limited!

We would like to inform you that your application has currently been placed on hold.

Your application is still under consideration, and our HR team will contact you once there is an update regarding the next steps.

We appreciate your patience and continued interest in Inwinteck Private Limited.

Best Regards,

HR Team

Inwinteck Private Limited
"""

    # ==========================================================
    # REJECTED EMAIL
    # ==========================================================

    REJECTED_SUBJECT = (
        "Update Regarding Your Application"
    )

    REJECTED_MESSAGE = """Dear Candidate,

Greetings from Inwinteck Private Limited!

Thank you for your interest in joining Inwinteck Private Limited and for taking the time to participate in our recruitment process.

After careful consideration, we regret to inform you that your application has not been selected for further consideration at this time.

We appreciate your time and effort and wish you all the very best in your future career.

Best Regards,

HR Team

Inwinteck Private Limited
"""

    # ==========================================================
    # CONSTRUCTOR
    # ==========================================================

    def __init__(self, db: Session):

        self.db = db

        self.repository = JobApplicationRepository(
            db
        )

        self.approval_repository = JoiningApprovalRepository(
            db
        )

        self.email_service = EmailService()

        self.loi_pdf_service = LetterOfIntentPdfService(
            db
        )

    # ==========================================================
    # GET USER DEPARTMENT
    # ==========================================================

    def get_user_department(
        self,
        emp_code: str,
    ) -> str:

        employee = (
            self.db.query(EmployeeModel)
            .filter(
                EmployeeModel.emp_code == emp_code
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

        department = (
            self.db.query(DepartmentModel)
            .join(
                DesignationModel,
                DesignationModel.depart_id
                == DepartmentModel.id,
            )
            .filter(
                DesignationModel.id
                == employee.designation
            )
            .first()
        )

        if department is None:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Employee department is not assigned.",
            )

        return department.name

    # ==========================================================
    # ACCEPT APPLICATION
    # ==========================================================

    async def approve_application(
        self,
        application_id: int,
        employee_code: str,
    ) -> JoiningApprovalActionResponse:

        return await self._approve_and_send_documents(
            application_id=application_id,
            employee_code=employee_code,
        )

    # ==========================================================
    # PUT APPLICATION ON HOLD
    # ==========================================================

    async def hold_application(
        self,
        application_id: int,
        employee_code: str,
    ) -> JoiningApprovalActionResponse:

        return await self._update_status_and_send_email(
            application_id=application_id,
            employee_code=employee_code,
            new_status=self.ON_HOLD_STATUS,
            subject=self.ON_HOLD_SUBJECT,
            message=self.ON_HOLD_MESSAGE,
            success_message=(
                "Application placed on hold and "
                "on-hold email sent successfully."
            ),
        )

    # ==========================================================
    # REJECT APPLICATION
    # ==========================================================

    async def reject_application(
        self,
        application_id: int,
        employee_code: str,
    ) -> JoiningApprovalActionResponse:

        return await self._update_status_and_send_email(
            application_id=application_id,
            employee_code=employee_code,
            new_status=self.REJECTED_STATUS,
            subject=self.REJECTED_SUBJECT,
            message=self.REJECTED_MESSAGE,
            success_message=(
                "Application rejected and rejection "
                "email sent successfully."
            ),
        )

    # ==========================================================
    # APPROVE + SELECTION EMAIL + LOI EMAIL
    # ==========================================================

    async def _approve_and_send_documents(
        self,
        application_id: int,
        employee_code: str,
    ) -> JoiningApprovalActionResponse:

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

        # ------------------------------------------------------
        # Verify user's department access
        # ------------------------------------------------------

        user_department = self.get_user_department(
            employee_code
        )

        authorized_application = (
            self.approval_repository
            .get_by_id_for_department(
                application_id=application_id,
                department_name=user_department,
            )
        )

        if authorized_application is None:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You are not authorized to perform "
                    "this action for this department."
                ),
            )

        # ------------------------------------------------------
        # Prevent duplicate acceptance/email sending
        # ------------------------------------------------------

        current_status = str(
            getattr(
                application,
                "joining_status",
                "",
            )
            or ""
        ).strip().upper()

        if current_status == self.APPROVED_STATUS:

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This application has already been approved."
                ),
            )

        try:

            # --------------------------------------------------
            # 1. Generate LOI PDF FIRST
            # --------------------------------------------------
            #
            # The PDF is generated from the CURRENT database
            # Letter of Intent settings.
            #
            # Therefore, if HR changes LOI settings before
            # accepting this candidate, the latest settings
            # are automatically used.
            #
            # Candidate-specific values are also injected:
            #
            # - Name
            # - Address
            # - Contact number
            # - Joining date
            # - Position
            # - Letter date
            #
            # --------------------------------------------------

            loi_pdf = (
                self.loi_pdf_service.generate_pdf(
                    application=application
                )
            )

            if not loi_pdf:

                raise RuntimeError(
                    "Letter of Intent PDF generation returned empty data."
                )

            # --------------------------------------------------
            # 2. Update application status
            # --------------------------------------------------

            application.joining_status = (
                self.APPROVED_STATUS
            )

            application.modified_date = (
                datetime.utcnow()
            )

            self.db.add(application)

            self.db.flush()

            # --------------------------------------------------
            # 3. Send selection email
            # --------------------------------------------------

            candidate_name = " ".join(
                part.strip()
                for part in [
                    getattr(application, "first_name", None),
                    getattr(application, "last_name", None),
                ]
                if part and str(part).strip()
            ).strip() or "Candidate"

            selection_message = (
                self.APPROVED_MESSAGE_TEMPLATE.format(
                    candidate_name=candidate_name.strip()
                )
            )

            await self.email_service.send_email(
                recipient=application.email,
                subject=self.APPROVED_SUBJECT,
                body=selection_message,
            )

            # --------------------------------------------------
            # 4. Send Letter of Intent email with PDF
            # --------------------------------------------------

            loi_email_message = (
                self.LOI_MESSAGE_TEMPLATE.format(
                    candidate_name=candidate_name.strip()
                )
            )

            await self.email_service.send_email(
                recipient=application.email,
                subject=self.LOI_SUBJECT,
                body=loi_email_message,
                attachments=[
                    loi_pdf,
                ],
            )

            # --------------------------------------------------
            # 5. Commit ONLY after both emails succeed
            # --------------------------------------------------

            self.db.commit()

            # --------------------------------------------------
            # 6. Success response
            # --------------------------------------------------

            return JoiningApprovalActionResponse(
                success=True,
                message=(
                    "Application approved successfully. "
                    "Selection email and Letter of Intent "
                    "email were sent successfully."
                ),
                application_id=application_id,
                status=self.APPROVED_STATUS,
            )

        except HTTPException:

            self.db.rollback()

            raise

        except Exception as exc:

            self.db.rollback()

            logger.exception(
                "Application approval failed for "
                "application_id=%s",
                application_id,
            )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Unable to approve the application, "
                    "generate the Letter of Intent, "
                    "or send the required emails."
                ),
            ) from exc

    # ==========================================================
    # COMMON STATUS + SINGLE EMAIL HANDLER
    # ==========================================================

    async def _update_status_and_send_email(
        self,
        application_id: int,
        employee_code: str,
        new_status: str,
        subject: str,
        message: str,
        success_message: str,
    ) -> JoiningApprovalActionResponse:

        # ------------------------------------------------------
        # 1. Find application
        # ------------------------------------------------------

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

        # ------------------------------------------------------
        # 2. Verify user's department access
        # ------------------------------------------------------

        user_department = self.get_user_department(
            employee_code
        )

        authorized_application = (
            self.approval_repository
            .get_by_id_for_department(
                application_id=application_id,
                department_name=user_department,
            )
        )

        if authorized_application is None:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You are not authorized to perform "
                    "this action for this department."
                ),
            )

        try:

            # --------------------------------------------------
            # 3. Update status
            # --------------------------------------------------

            application.joining_status = new_status

            application.modified_date = (
                datetime.utcnow()
            )

            self.db.add(application)

            self.db.flush()

            # --------------------------------------------------
            # 4. Send existing email
            # --------------------------------------------------

            await self.email_service.send_email(
                recipient=application.email,
                subject=subject,
                body=message,
            )

            # --------------------------------------------------
            # 5. Commit
            # --------------------------------------------------

            self.db.commit()

            # --------------------------------------------------
            # 6. Response
            # --------------------------------------------------

            return JoiningApprovalActionResponse(
                success=True,
                message=success_message,
                application_id=application_id,
                status=new_status,
            )

        except HTTPException:

            self.db.rollback()

            raise

        except Exception as exc:

            self.db.rollback()

            logger.exception(
                "Joining status update failed for "
                "application_id=%s",
                application_id,
            )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Unable to update application status "
                    "or send email."
                ),
            ) from exc