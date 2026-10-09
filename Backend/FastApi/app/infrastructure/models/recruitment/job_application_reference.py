from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import (
    BigInteger,
    DateTime,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship as orm_relationship,
)

from app.infrastructure.database.base import Base


class JobApplicationReference(Base):

    __tablename__ = "job_application_references"

    reference_id: Mapped[int] = mapped_column(
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

    full_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    designation: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    company_organization: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    email_address: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    phone_number: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )

    relationship: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    reference_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    created_date: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=func.current_timestamp(),
    )

    application = orm_relationship(
        "JobApplication",
        back_populates="references",
    )