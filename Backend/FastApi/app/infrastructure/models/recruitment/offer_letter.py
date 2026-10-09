from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    BigInteger,
    Boolean,
    Date,
    DateTime,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.database.base import Base


class OfferLetterSettingsModel(Base):
    """
    SQLAlchemy model for Offer Letter template settings.
    """

    __tablename__ = "offer_letter_settings"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    offer_letter_title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    company_logo: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )

    company_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    office_address: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    singapore_os_address: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    offer_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )

    candidate_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    candidate_address: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    candidate_contact_no: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )

    candidate_email: Mapped[Optional[str]] = mapped_column(
        String(320),
        nullable=True,
    )

    position: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    reporting_manager: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    reporting_manager_designation: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    joining_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )

    probation_period: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    probation_period_unit: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="Months",
        server_default="Months",
    )

    total_ctc: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(18, 2),
        nullable=True,
    )

    job_duties: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    acceptance_text: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    hr_signatory_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    hr_designation: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    signature_file_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    signature_file_path: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )

    stamp_file_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    stamp_file_path: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )

    letter_body_template: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    show_company_logo: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    show_office_address_footer: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    show_singapore_address: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    show_candidate_acceptance: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    page_size: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="A4",
        server_default="A4",
    )

    created_by: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    created_on: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    modified_by: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    modified_on: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )