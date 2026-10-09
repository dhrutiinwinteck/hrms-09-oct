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
from sqlalchemy.orm import relationship

from app.infrastructure.database.base import Base


class JobApplication(Base):

    __tablename__ = "job_applications"

    application_id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    first_name = Column(
        String(255),
        nullable=False,
    )

    last_name = Column(
        String(255),
        nullable=False,
    )

    email = Column(
        String(255),
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

    position_applied_for = Column(
        String(255),
        nullable=False,
    )

      # ==========================================================
    # JOINING DETAILS  Add by ROhit 
    # ==========================================================

    joining_date = Column(
        Date,
        nullable=True,
    )

    remark = Column(
        String(500),
        nullable=True,
    )

        # ==========================================================
    # APPROVAL STATUS DETAILS
    # ==========================================================

    reporting_manager_status = Column(
        String(30),
        nullable=True,
    )

    reporting_manager_remark = Column(
        String(500),
        nullable=True,
    )

    team_manager_status = Column(
        String(30),
        nullable=True,
    )

    team_manager_remark = Column(
        String(500),
        nullable=True,
    )

    hr_status = Column(
        String(30),
        nullable=True,
    )

    hr_remark = Column(
        String(500),
        nullable=True,
    )

    date_of_application = Column(
        Date,
        nullable=False,
        default=func.current_date(),
    )

  # ==========================================================
    # JOINING DETAILS  ENd 
    # ==========================================================


   

    resume_original_name = Column(
        String(255),
        nullable=False,
    )

    resume_stored_name = Column(
        String(255),
        nullable=False,
    )

    resume_path = Column(
        String(500),
        nullable=False,
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

    current_address = Column(
        Text,
        nullable=False,
    )

    permanent_address = Column(
        Text,
        nullable=False,
    )

    # ==========================================================
    # JOINING STATUS
    # ==========================================================

    joining_status = Column(
        String(20),
        nullable=False,
        default="PENDING",
        server_default="PENDING",
    )

    created_date = Column(
        DateTime,
        nullable=False,
        default=func.current_timestamp(),
    )

    modified_date = Column(
        DateTime,
        nullable=True,
    )

    # ==========================================================
    # RELATIONSHIPS
    # ==========================================================

    emergency_contacts = relationship(
        "JobApplicationEmergencyContact",
        back_populates="application",
        cascade="all, delete-orphan",
    )

    work_experiences = relationship(
        "JobApplicationWorkExperience",
        back_populates="application",
        cascade="all, delete-orphan",
    )

    education = relationship(
        "JobApplicationEducation",
        back_populates="application",
        cascade="all, delete-orphan",
    )

    references = relationship(
        "JobApplicationReference",
        back_populates="application",
        cascade="all, delete-orphan",
    )