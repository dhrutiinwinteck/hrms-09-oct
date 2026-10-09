from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.infrastructure.database.base import Base


class JobApplicationWorkExperience(Base):
    __tablename__ = "job_application_work_experiences"

    experience_id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    application_id = Column(
        BigInteger,
        ForeignKey(
            "job_applications.application_id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    company_name = Column(
        String(255),
        nullable=True,
    )

    job_title = Column(
        String(255),
        nullable=True,
    )

    employee_type = Column(
        String(100),
        nullable=True,
    )

    from_date = Column(
        Date,
        nullable=True,
    )

    to_date = Column(
        Date,
        nullable=True,
    )

    currently_working_here = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    key_responsibilities = Column(
        Text,
        nullable=True,
    )

    experience_order = Column(
        Integer,
        nullable=False,
    )

    is_fresher = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    created_date = Column(
        DateTime,
        nullable=False,
        default=func.current_timestamp(),
    )

    application = relationship(
        "JobApplication",
        back_populates="work_experiences",
    )