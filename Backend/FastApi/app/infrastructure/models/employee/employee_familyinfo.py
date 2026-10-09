from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.database.base import Base


class EmployeeFamilyInfo(Base):
    __tablename__ = "employee_familyinfo"
    __table_args__ = {"schema": "public"}

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        nullable=False,
    )

    emp_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
    )

    name: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    relationship: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    dob: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
    )

    phone: Mapped[Optional[str]] = mapped_column(
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