from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    Date,
    DateTime,
    String,
    Text,
    func,
)

from sqlalchemy.orm import relationship, foreign

from app.infrastructure.database.base import Base
from app.infrastructure.models.onboarding.joining_form_emergency_contact import (
    JoiningFormEmergencyContact,
)


class JoiningForm(Base):
    __tablename__ = "employee_joining_forms"

    # ==========================================================
    # PRIMARY KEY
    # ==========================================================

    joining_form_id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    # ==========================================================
    # SOURCE APPLICATION
    # ==========================================================

    application_id = Column(
        BigInteger,
        nullable=False,
        unique=True,
        index=True,
    )

    # ==========================================================
    # COMMON APPLICATION INFORMATION
    # ==========================================================

    first_name = Column(
    String(255),
    nullable=False,
    )

    last_name = Column(
    String(255),
    nullable=True,
    )

    email = Column(
        String(320),
        nullable=False,
    )

    phone_number = Column(
        String(50),
        nullable=False,
    )

    alternate_phone_number = Column(
        String(50),
        nullable=True,
    )

    date_of_birth = Column(
        Date,
        nullable=False,
    )

    gender = Column(
        String(50),
        nullable=False,
    )

    marital_status = Column(
        String(50),
        nullable=False,
    )
    marriage_date = Column(
    Date,
    nullable=True,
    )

    position_applied_for = Column(
        String(255),
        nullable=False,
    )

    nationality = Column(
        String(100),
        nullable=False,
    )

    aadhar_number = Column(
        String(12),
        nullable=True,
    )

    pan_number = Column(
        String(10),
        nullable=True,
    )

    permanent_address = Column(
        Text,
        nullable=False,
    )

    current_address = Column(
        Text,
        nullable=False,
    )

    # ==========================================================
    # JOINING FORM SPECIFIC INFORMATION
    # ==========================================================

    blood_group = Column(
        String(20),
        nullable=False,
    )

    date_of_joining = Column(
        Date,
        nullable=False,
    )

    father_name = Column(
        "fathers_name",
        String(255),
        nullable=False,
    )

    mother_name = Column(
        "mothers_name",
        String(255),
        nullable=False,
    )

    religion = Column(
        String(100),
        nullable=False,
    )

    uan_number = Column(
        String(50),
        nullable=True,
    )

    passport_number = Column(
        String(50),
        nullable=True,
    )

    same_as_permanent_address = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    # ==========================================================
    # SUBMISSION / AUDIT
    # ==========================================================

    submitted_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        server_default=func.current_timestamp(),
    )

    modified_date = Column(
        DateTime,
        nullable=True,
    )

    # ==========================================================
    # CHILD RELATIONSHIPS
    # ==========================================================

    work_experiences = relationship(
        "JoiningFormWorkExperience",
        back_populates="joining_form",
        cascade="all, delete-orphan",
    )

    education = relationship(
        "JoiningFormEducation",
        back_populates="joining_form",
        cascade="all, delete-orphan",
    )

    documents = relationship(
        "JoiningFormDocument",
        back_populates="joining_form",
        cascade="all, delete-orphan",
    )

    references = relationship(
        "JoiningFormReference",
        back_populates="joining_form",
        cascade="all, delete-orphan",
    )
    emergency_contacts = relationship(
        "JoiningFormEmergencyContact",
        primaryjoin=(
            "JoiningForm.joining_form_id == "
            "foreign(JoiningFormEmergencyContact.joining_form_id)"
        ),
        back_populates="joining_form",
        cascade="all, delete-orphan",
    )