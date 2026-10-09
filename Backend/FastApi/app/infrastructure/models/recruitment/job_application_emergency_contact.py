from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import (
    BigInteger,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship as orm_relationship,
)

from app.infrastructure.database.base import Base


class JobApplicationEmergencyContact(Base):
    __tablename__ = "job_application_emergency_contacts"

    emergency_contact_id: Mapped[int] = mapped_column(
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

    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    contact_relationship: Mapped[str] = mapped_column(
        "relationship",
        String(100),
        nullable=False,
    )

    phone_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    email_address: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    address: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    contact_order: Mapped[int] = mapped_column(
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
        back_populates="emergency_contacts",
    )