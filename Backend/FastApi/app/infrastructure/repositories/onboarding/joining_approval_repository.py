# from datetime import datetime
# from typing import List, Optional

# from sqlalchemy import func
# from sqlalchemy.orm import Session

# from app.domain.interfaces.onboarding.joining_approval_interface import (
#     IJoiningApprovalRepository,
# )

# # from app.infrastructure.models.onboarding.joining_approval import (
# #     JoiningApproval,
# # )
# from app.infrastructure.models.recruitment.job_application import (
#     JobApplication,
# )


# class JoiningApprovalRepository(
#     IJoiningApprovalRepository
# ):

#     def __init__(self, db: Session):
#         self.db = db

#     # ==========================================================
#     # GET BY ID
#     # ==========================================================

#     def get_by_id_for_department(
#         self,
#         application_id: int,
#         department_name: str,
#     ) -> Optional[JobApplication]:

        
#         return self.get_by_id(application_id)

#     # ==========================================================
#     # GET ALL
#     # ==========================================================

#     def get_all(
#         self,
#     ) -> List[JobApplication]:

#         return (
#             self.db.query(JobApplication)
#             .order_by(
#                 JobApplication.application_id.desc()
#             )
#             .all()
#         )

#     # # ==========================================================
#     # # GET ALL BY DEPARTMENT
#     # # ==========================================================

#     # def get_all_by_department(
#     #     self,
#     #     department_name: str,
#     # ) -> List[JobApplication]:

#     #     if not department_name:
#     #         return []

#     #     return (
#     #         self.db.query(JobApplication)
#     #         .filter(
#     #             func.lower(
#     #                 func.trim(
#     #                     JobApplication.department
#     #                 )
#     #             )
#     #             == department_name.strip().lower()
#     #         )
#     #         .order_by(
#     #             JobApplication.application_id.desc()
#     #         )
#     #         .all()
#     #     )

#     # ==========================================================
#     # GET BY ID AND DEPARTMENT
#     # ==========================================================

#     def get_by_id_for_department(
#         self,
#         application_id: int,
#         department_name: str,
#     ) -> Optional[JobApplication]:

#         if not department_name:
#             return None

#         return (
#             self.db.query(JobApplication)
#             .filter(
#                 JobApplication.application_id
#                 == application_id
#             )
#             .filter(
#                 func.lower(
#                     func.trim(
#                         JobApplication.department
#                     )
#                 )
#                 == department_name.strip().lower()
#             )
#             .first()
#         )

#     # ==========================================================
#     # UPDATE STATUS
#     # ==========================================================

#     def update_status(
#         self,
#         application_id: int,
#         status: str,
#     ) -> Optional[JobApplication]:

#         approval = self.get_by_id(
#             application_id
#         )

#         if approval is None:
#             return None

#         approval.status = status
#         approval.modified_date = datetime.utcnow()

#         self.db.flush()

#         return approval



from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from app.domain.interfaces.onboarding.joining_approval_interface import (
    IJoiningApprovalRepository,
)

from app.infrastructure.models.recruitment.job_application import (
    JobApplication,
)


class JoiningApprovalRepository(
    IJoiningApprovalRepository
):

    def __init__(self, db: Session):
        self.db = db

    # ==========================================================
    # GET BY ID
    # ==========================================================

    def get_by_id(
        self,
        application_id: int,
    ) -> Optional[JobApplication]:

        return (
            self.db.query(JobApplication)
            .filter(
                JobApplication.application_id == application_id
            )
            .first()
        )

    # ==========================================================
    # GET ALL
    # ==========================================================

    def get_all(
        self,
    ) -> List[JobApplication]:

        return (
            self.db.query(JobApplication)
            .order_by(
                JobApplication.application_id.desc()
            )
            .all()
        )

    # ==========================================================
    # GET ALL BY DEPARTMENT
    # ==========================================================

    def get_all_by_department(
        self,
        department_name: str,
    ) -> List[JobApplication]:

        if not department_name:
            return []

        # Temporary: JobApplication has no department column.
        return self.get_all()

    # ==========================================================
    # GET BY ID AND DEPARTMENT
    # ==========================================================

    def get_by_id_for_department(
        self,
        application_id: int,
        department_name: str,
    ) -> Optional[JobApplication]:

        if not department_name:
            return None

        # Temporary: department verification is not implemented.
        return self.get_by_id(application_id)

    # ==========================================================
    # UPDATE STATUS
    # ==========================================================

    def update_status(
        self,
        application_id: int,
        status: str,
    ) -> Optional[JobApplication]:

        application = self.get_by_id(application_id)

        if application is None:
            return None

        application.joining_status = status.upper()
        application.modified_date = datetime.utcnow()

        self.db.flush()

        return application