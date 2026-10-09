from datetime import date
from typing import Any, Dict, List, Optional

from sqlalchemy import func, text
from sqlalchemy.orm import Session

from app.domain.interfaces.recruitment.job_application_interface import (
    IJobApplicationRepository,
)

from app.infrastructure.models.recruitment.job_application import (
    JobApplication,
)

from app.infrastructure.models.recruitment.job_application_education import (
    JobApplicationEducation,
)

from app.infrastructure.models.recruitment.job_application_emergency_contact import (
    JobApplicationEmergencyContact,
)

from app.infrastructure.models.recruitment.job_application_reference import (
    JobApplicationReference,
)

from app.infrastructure.models.recruitment.job_application_work_experience import (
    JobApplicationWorkExperience,
)
from app.infrastructure.models.employee.designation import DesignationModel


class JobApplicationRepository(
    IJobApplicationRepository
):

    def __init__(self, db: Session):
        self.db = db

    # ==========================================================
    # CREATE COMPLETE APPLICATION
    # ==========================================================

    def create_complete_application(
        self,
        application_data: Dict[str, Any],
        emergency_contacts: List[Dict[str, Any]],
        work_experiences: List[Dict[str, Any]],
        education: List[Dict[str, Any]],
        references: List[Dict[str, Any]],
    ) -> JobApplication:

        application_data = application_data.copy()

        # Remove relationship collections before creating
        # the JobApplication object.

        application_data.pop(
            "emergency_contacts",
            None,
        )

        application_data.pop(
            "work_experiences",
            None,
        )

        application_data.pop(
            "education",
            None,
        )

        application_data.pop(
            "references",
            None,
        )

        # ------------------------------------------------------
        # 1. CREATE MAIN APPLICATION
        # ------------------------------------------------------

        application = JobApplication(
            **application_data
        )

        self.db.add(application)

        self.db.flush()

        # ------------------------------------------------------
        # 2. CREATE EMERGENCY CONTACTS
        # ------------------------------------------------------

        for data in emergency_contacts:

            data = data.copy()

            relationship_value = data.pop(
                "relationship"
            )

            contact = JobApplicationEmergencyContact(
                application_id=application.application_id,
                contact_relationship=relationship_value,
                **data,
            )

            self.db.add(contact)

        # ------------------------------------------------------
        # 3. CREATE WORK EXPERIENCES
        # ------------------------------------------------------

        for data in work_experiences:

            experience = JobApplicationWorkExperience(
                application_id=application.application_id,
                **data,
            )

            self.db.add(experience)

        # ------------------------------------------------------
        # 4. CREATE EDUCATION
        # ------------------------------------------------------

        for data in education:

            education_record = JobApplicationEducation(
                application_id=application.application_id,
                **data,
            )

            self.db.add(education_record)

        # ------------------------------------------------------
        # 5. CREATE REFERENCES
        # ------------------------------------------------------

        for data in references:

            reference = JobApplicationReference(
                application_id=application.application_id,
                **data,
            )

            self.db.add(reference)

        self.db.flush()

        self.db.refresh(application)

        return application

    # ==========================================================
    # GET ALL APPLICATIONS
    # ==========================================================

    def get_all_applications(
        self,
    ) -> List[JobApplication]:

        return (
            self.db.query(JobApplication)
            .order_by(
                JobApplication.application_id.desc()
            )
            .all()
        )

    def get_all_applications_by_department(
        self,
        department_id: int,
    ) -> List[JobApplication]:

        return (
            self.db.query(JobApplication)
            .join(
                DesignationModel,
                func.lower(
                    func.trim(DesignationModel.name)
                )
                ==
                func.lower(
                    func.trim(
                        JobApplication.position_applied_for
                    )
                )
            )
            .filter(
                DesignationModel.depart_id == department_id
            )
            .order_by(
                JobApplication.application_id.desc()
            )
            .all()
        )

        # ==========================================================
    # GET REFERRAL BY APPLICATION ID
    # ==========================================================

    def get_referral_by_application_id(
        self,
        application_id: int,
    ) -> Optional[Dict[str, Any]]:

        result = self.db.execute(
            text(
                """
                SELECT
                    er.employee_id,
                    er.referral_token,
                    CONCAT_WS(
                        ' ',
                        ed.first_name,
                        ed.last_name
                    ) AS referred_by
                FROM public.job_application_referrals jar

                INNER JOIN public.employee_referrals er
                    ON er.id = jar.referral_id

                INNER JOIN public.employee_detail ed
                    ON ed.id = er.employee_id

                WHERE jar.application_id = :application_id

                LIMIT 1
                """
            ),
            {
                "application_id": application_id,
            },
        ).mappings().first()

        if result is None:
            return None

        return {
            "employee_id": result["employee_id"],
            "referral_token": result["referral_token"],
            "referred_by": result["referred_by"],
        }
    # ==========================================================
    # GET APPLICATION BY ID
    # ==========================================================

    def get_application_by_id(
        self,
        application_id: int,
    ) -> Optional[JobApplication]:

        return (
            self.db.query(JobApplication)
            .filter(
                JobApplication.application_id
                == application_id
            )
            .first()
        )

    # ==========================================================
    # UPDATE JOINING STATUS
    # ==========================================================

    def update_joining_status(
        self,
        application_id: int,
        joining_status: str,
    ) -> Optional[JobApplication]:

        application = (
            self.db.query(JobApplication)
            .filter(
                JobApplication.application_id
                == application_id
            )
            .first()
        )

        if application is None:
            return None

        application.joining_status = joining_status

        self.db.flush()

        return application


    # ==========================================================
    # UPDATE APPLICATION JOINING DETAILS  Change by ROhit 
    # ==========================================================

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
    ) -> Optional[JobApplication]:

        application = (
            self.db.query(JobApplication)
            .filter(
                JobApplication.application_id == application_id
            )
            .first()
        )

        if application is None:
            return None

        # Existing fields
        application.position_applied_for = position_applied_for
        application.joining_date = joining_date
        application.remark = remark

        # Reporting Manager fields
        application.reporting_manager_status = (
            reporting_manager_status
        )

        application.reporting_manager_remark = (
            reporting_manager_remark
        )

        # Team Manager fields
        application.team_manager_status = (
            team_manager_status
        )

        application.team_manager_remark = (
            team_manager_remark
        )

        # HR fields
        application.hr_status = hr_status
        application.hr_remark = hr_remark

        # Modified date
        application.modified_date = func.current_timestamp()

        self.db.flush()

        return application
      # ==========================================================
        # UPDATE APPLICATION JOINING DETAILS  End 
        # ==========================================================
    # ==========================================================
    # DELETE APPLICATION
    # ==========================================================

    def delete_application(
        self,
        application_id: int,
    ) -> Optional[JobApplication]:

        application = (
            self.db.query(JobApplication)
            .filter(
                JobApplication.application_id
                == application_id
            )
            .first()
        )

        if application is None:
            return None

        self.db.delete(application)

        self.db.flush()

        return application

    # ==========================================================
    # SERIALIZE MAIN APPLICATION
    # ==========================================================
    @staticmethod
    def serialize_application(
        application: JobApplication,
    ) -> Dict[str, Any]:

        return {
            "application_id":
                application.application_id,

            "first_name":
                application.first_name,

            "last_name":
                application.last_name,

            "full_name":
                " ".join(
                    part.strip()
                    for part in [
                        application.first_name,
                        application.last_name,
                    ]
                    if part and str(part).strip()
                ).strip(),

            "email":
                application.email,

            "phone_number":
                application.phone_number,

            "alternate_phone_number":
                application.alternate_phone_number,

            "position_applied_for":
                application.position_applied_for,

            # ==========================================================
            # JOINING DETAILS
            # ==========================================================

            "joining_date":
                application.joining_date,

            "remark":
                application.remark,

            # ==========================================================
            # APPROVAL STATUS DETAILS
            # ==========================================================

            "reporting_manager_status":
                application.reporting_manager_status,

            "reporting_manager_remark":
                application.reporting_manager_remark,

            "team_manager_status":
                application.team_manager_status,

            "team_manager_remark":
                application.team_manager_remark,

            "hr_status":
                application.hr_status,

            "hr_remark":
                application.hr_remark,

            # ==========================================================
            # APPLICATION DETAILS
            # ==========================================================

            "date_of_application":
                application.date_of_application,

            "resume_original_name":
                application.resume_original_name,

            "resume_stored_name":
                application.resume_stored_name,

            "resume_path":
                application.resume_path,

            "date_of_birth":
                application.date_of_birth,

            "gender":
                application.gender,

            "marital_status":
                application.marital_status,

            "nationality":
                application.nationality,

            "aadhar_number":
                application.aadhar_number,

            "pan_number":
                application.pan_number,

            "current_address":
                application.current_address,

            "permanent_address":
                application.permanent_address,

            # ==========================================================
            # JOINING STATUS
            # ==========================================================

            "joining_status":
                application.joining_status,

            # ==========================================================
            # AUDIT
            # ==========================================================

            "created_date":
                application.created_date,

            "modified_date":
                application.modified_date,
        }
    # ==========================================================
    # SERIALIZE EDUCATION
    # ==========================================================

    @staticmethod
    def serialize_education(
        item: JobApplicationEducation,
    ) -> Dict[str, Any]:

        return {
            "education_id":
                item.education_id,

            "application_id":
                item.application_id,

            "qualification":
                item.qualification,

            "specification_stream":
                item.specification_stream,

             "institute_university": item.institute_university,

            "passing_year":
                item.passing_year,

            "percentage_cgpa":
                item.percentage_cgpa,

            "currently_pursuing":
                item.currently_pursuing,

            "education_order":
                item.education_order,

            "created_date":
                item.created_date,
        }

    # ==========================================================
    # SERIALIZE EMERGENCY CONTACT
    # ==========================================================

    @staticmethod
    def serialize_emergency_contact(
        item: JobApplicationEmergencyContact,
    ) -> Dict[str, Any]:

        return {
            "emergency_contact_id":
                item.emergency_contact_id,

            "application_id":
                item.application_id,

            "full_name":
                item.full_name,

            "relationship":
                item.contact_relationship,

            "phone_number":
                item.phone_number,

            "email_address":
                item.email_address,

            "address":
                item.address,

            "contact_order":
                item.contact_order,

            "created_date":
                item.created_date,
        }

    # ==========================================================
    # SERIALIZE WORK EXPERIENCE
    # ==========================================================

    @staticmethod
    def serialize_work_experience(
        item: JobApplicationWorkExperience,
    ) -> Dict[str, Any]:

        return {
            "experience_id":
                item.experience_id,

            "application_id":
                item.application_id,

            "company_name":
                item.company_name,

            "job_title":
                item.job_title,

            "employee_type":
                item.employee_type,

            "from_date":
                item.from_date,

            "to_date":
                item.to_date,

            "currently_working_here":
                item.currently_working_here,

            "key_responsibilities":
                item.key_responsibilities,

            "experience_order":
                item.experience_order,

            "is_fresher":
                item.is_fresher,

            "created_date":
                item.created_date,
        }

    # ==========================================================
    # SERIALIZE REFERENCE
    # ==========================================================

    @staticmethod
    def serialize_reference(
        item: JobApplicationReference,
    ) -> Dict[str, Any]:

        return {
            "reference_id":
                item.reference_id,

            "application_id":
                item.application_id,

            "full_name":
                item.full_name,

            "designation":
                item.designation,

            "company_organization":
                item.company_organization,

            "email_address":
                item.email_address,

            "phone_number":
                item.phone_number,

            "relationship":
                item.relationship,

            "reference_order":
                item.reference_order,

            "created_date":
                item.created_date,
        }