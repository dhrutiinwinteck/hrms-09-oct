from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.base import Base


class JobApplicationEducation(Base):
    __tablename__ = "job_application_education"

    education_id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    application_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            "job_applications.application_id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    qualification: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    specification_stream: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    institute_university: Mapped[str] = mapped_column(
    String(255),
    nullable=False,
    )

    

    passing_year: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    percentage_cgpa: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    currently_pursuing: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    education_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    created_date: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=func.current_timestamp(),
    )

    application = relationship(
        "JobApplication",
        back_populates="education",
    )