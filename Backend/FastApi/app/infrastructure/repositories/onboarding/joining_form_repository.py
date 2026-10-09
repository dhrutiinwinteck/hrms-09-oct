from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session, selectinload

from app.domain.interfaces.onboarding.joining_form_interface import (
    IJoiningFormRepository,
)

from app.infrastructure.models.recruitment.job_application import (
    JobApplication,
)

from app.infrastructure.models.onboarding.joining_form import (
    JoiningForm,
)

from app.infrastructure.models.onboarding.joining_form_work_experience import (
    JoiningFormWorkExperience,
)

from app.infrastructure.models.onboarding.joining_form_education import (
    JoiningFormEducation,
)

from app.infrastructure.models.onboarding.joining_form_document import (
    JoiningFormDocument,
)

from app.infrastructure.models.onboarding.joining_form_reference import (
    JoiningFormReference,
)

from app.infrastructure.models.onboarding.joining_form_emergency_contact import (
    JoiningFormEmergencyContact,
)

class JoiningFormRepository(IJoiningFormRepository):

    def __init__(self, db: Session):
        self.db = db

    # ==========================================================
    # GET BY APPLICATION ID
    # ==========================================================

    def get_by_application_id(
        self,
        application_id: int,
    ) -> Optional[JoiningForm]:

        return (
            self.db.query(JoiningForm)
            .options(
                selectinload(
                    JoiningForm.work_experiences
                ),
                selectinload(
                    JoiningForm.education
                ),
                selectinload(
                    JoiningForm.documents
                ),
                selectinload(
                    JoiningForm.references
                ),
                selectinload(JoiningForm.emergency_contacts),
            )
            .filter(
                JoiningForm.application_id
                == application_id
            )
            .first()
        )

    # ==========================================================
    # GET ALL
    # ==========================================================

    def get_all(
        self,
    ) -> List[JoiningForm]:

        return (
            self.db.query(JoiningForm)
            .options(
                selectinload(
                    JoiningForm.work_experiences
                ),
                selectinload(
                    JoiningForm.education
                ),
                selectinload(
                    JoiningForm.documents
                ),
                selectinload(
                    JoiningForm.references
                ),
                selectinload(
                    JoiningForm.emergency_contacts
                ),
            )
            .order_by(
                JoiningForm.joining_form_id.desc()
            )
            .all()
        )

    # ==========================================================
    # GET JOB APPLICATION
    # ==========================================================

    def get_job_application(
        self,
        application_id: int,
    ) -> Optional[JobApplication]:

        return (
            self.db.query(JobApplication)
            .options(
                selectinload(
                    JobApplication.work_experiences
                ),
                selectinload(
                    JobApplication.education
                ),
                selectinload(
                    JobApplication.emergency_contacts
                ),
                selectinload(
                    JobApplication.references
                ),
            )
            .filter(
                JobApplication.application_id
                == application_id
            )
            .first()
        )

    # ==========================================================
    # CREATE / UPDATE
    # ==========================================================

    def create_or_update(
        self,
        application_data: Dict[str, Any],
        joining_data: Dict[str, Any],
        work_experiences: List[Dict[str, Any]],
        education: List[Dict[str, Any]],
        documents: List[Dict[str, Any]],
        references: List[Dict[str, Any]],
        emergency_contacts: List[Dict[str, Any]],
    ) -> JoiningForm:

        application_id = application_data[
            "application_id"
        ]
        # Convert full_name into first_name and last_name
        full_name = application_data.pop(
            "full_name",
            "",
        )

        if full_name:
            name_parts = full_name.strip().split(
                " ",
                1,
            )

            application_data["first_name"] = (
                name_parts[0]
            )

            application_data["last_name"] = (
                name_parts[1]
                if len(name_parts) > 1
                else None
            )

        existing = self.get_by_application_id(
            application_id
        )

        # ======================================================
        # UPDATE EXISTING
        # ======================================================

        if existing is not None:

            # --------------------------------------------------
            # Update application snapshot
            # --------------------------------------------------

            for key, value in application_data.items():

                if key != "application_id":

                    setattr(
                        existing,
                        key,
                        value,
                    )

            # --------------------------------------------------
            # Update joining-specific fields
            # --------------------------------------------------

            for key, value in joining_data.items():

                setattr(
                    existing,
                    key,
                    value,
                )

            existing.modified_date = datetime.utcnow()

            # --------------------------------------------------
            # Delete old children
            # --------------------------------------------------

            existing.work_experiences.clear()
            existing.education.clear()
            existing.documents.clear()
            existing.references.clear()
            existing.emergency_contacts.clear()
            joining_form = existing

        # ======================================================
        # CREATE NEW
        # ======================================================

        else:

            joining_form = JoiningForm(
                **application_data,
                **joining_data,
            )

            self.db.add(
                joining_form
            )

            self.db.flush()

        # ======================================================
        # WORK EXPERIENCE
        # ======================================================

        for item in work_experiences:

            record = JoiningFormWorkExperience(
                joining_form_id=(
                    joining_form.joining_form_id
                ),
                **item,
            )

            self.db.add(record)

        # ======================================================
        # EDUCATION
        # ======================================================

        for item in education:

            record = JoiningFormEducation(
                joining_form_id=(
                    joining_form.joining_form_id
                ),
                **item,
            )

            self.db.add(record)

        # ======================================================
        # DOCUMENTS
        # ======================================================

        for item in documents:

            record = JoiningFormDocument(
                joining_form_id=(
                    joining_form.joining_form_id
                ),
                **item,
            )

            self.db.add(record)

        # ======================================================
        # REFERENCES
        # ======================================================

        for item in references:

            reference_data = item.copy()

            reference_data.pop(
                "reference_order",
                None,
            )

            record = JoiningFormReference(
                joining_form_id=(
                    joining_form.joining_form_id
                ),
                **reference_data,
            )

            self.db.add(record)
        

        # ======================================================
        # EMERGENCY CONTACTS
        # ======================================================
                # ======================================================
        # EMERGENCY CONTACTS
        # ======================================================

        for item in emergency_contacts:

            contact_data = item.copy()

            contact_data.pop(
                "emergency_contact_id",
                None,
            )

            contact_data.pop(
                "joining_form_id",
                None,
            )

            record = JoiningFormEmergencyContact(
                joining_form_id=(
                    joining_form.joining_form_id
                ),
                **contact_data,
            )

            # IMPORTANT: Must be inside for loop
            self.db.add(record)

        # ======================================================
        # FLUSH
        # ======================================================

        self.db.flush()

        # ======================================================
        # RELOAD
        # ======================================================

        return self.get_by_application_id(
            application_id
        )
        