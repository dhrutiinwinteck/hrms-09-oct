from datetime import date, datetime
from typing import Optional

from sqlalchemy import Boolean, Date, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.database.base import Base


class LetterOfIntentSettingsModel(Base):
    __tablename__ = "letter_of_intent_settings"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    setting_key: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        default="default",
    )

    letter_title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        default="Letter of Intent to Hire",
    )

    company_logo: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )

    stamp_image_path: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )

    signature_image_path: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )

    company_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        default="Inwinteck Pvt Ltd",
    )

    registered_office_address: Mapped[str] = mapped_column(
        String(1000),
        nullable=False,
    )

    letter_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )

    position_role: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    joining_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )

    shift_timing: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    probation_period_months: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=3,
    )

    hr_signatory_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    hr_designation: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    reference_contact: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    letter_body: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    show_company_logo: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    show_registered_office_footer: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    show_acceptance_instruction: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    show_hr_signature_section: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    page_size: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="A4",
    )

    template_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="Active",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    created_by: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    updated_by: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )