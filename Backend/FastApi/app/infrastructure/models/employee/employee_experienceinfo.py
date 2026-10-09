from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.database.base import Base


class EmployeeExperienceInfoModel(Base):
    __tablename__ = "employee_experienceinfo"
    __table_args__ = {
        "schema": "public",
    }

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    emp_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
    )

    company_name: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    company_address: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    exp_year_from: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
    )

    exp_year_to: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
    )

    designation: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    company_file: Mapped[Optional[str]] = mapped_column(
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