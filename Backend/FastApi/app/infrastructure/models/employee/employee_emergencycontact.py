from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.database.base import Base


class EmployeeEmergencyContact(Base):
    __tablename__ = "employee_emergencycontact"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        nullable=False,
    )

    emp_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
    )

    p_name: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    p_relationship: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    p_phone: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    p_alt_phone: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    s_name: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    s_relationship: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    s_phone: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    s_alt_phone: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    createdby: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    createdon: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
    )

    modifiedby: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    modifiedon: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
    )