from datetime import datetime

from sqlalchemy import Integer, String, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.database.base import Base


class PayrollSettingModel(Base):
    __tablename__ = "payroll_setting"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    company_logo: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    company_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    company_address: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    company_contact: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    basic_earning: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    hra: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    conveyance_allowance: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    provident_fund: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    esic: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    professional_tax: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )

    created_by: Mapped[str | None] = mapped_column(
        "createdby",
        String(100),
        nullable=True,
    )

    created_on: Mapped[datetime | None] = mapped_column(
        "createdon",
        DateTime,
        nullable=True,
    )

    modified_by: Mapped[str | None] = mapped_column(
        "modifiedby",
        String(100),
        nullable=True,
    )

    modified_on: Mapped[datetime | None] = mapped_column(
        "modifiedon",
        DateTime,
        nullable=True,
    )