from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import (
    BigInteger,
    Date,
    DateTime,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.base import Base

if TYPE_CHECKING:
    from app.infrastructure.models.onboarding.onboarding_document_item import (
        OnboardingDocumentItem,
    )
    


class OnboardingDocumentPackage(Base):
    __tablename__ = "onboarding_document_packages"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    job_application_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        unique=True,
        index=True,
    )

    designation: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    department: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    location: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    reporting_manager: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    joining_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )

    interview_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )

    salary_from_month: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )

    annual_ctc: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    basic_monthly: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    basic_annual: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    hra_monthly: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    hra_annual: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    conveyance_monthly: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    conveyance_annual: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    education_allowance_monthly: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    education_allowance_annual: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    special_allowance_monthly: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    special_allowance_annual: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    lta_monthly: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    lta_annual: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    medical_monthly: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    medical_annual: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    mediclaim_monthly: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    mediclaim_annual: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    professional_tax_monthly: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    professional_tax_annual: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    pf_monthly: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    pf_annual: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    gratuity_monthly: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    gratuity_annual: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    sub_total_1_monthly: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    sub_total_1_annual: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    sub_total_deduction_monthly: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    sub_total_deduction_annual: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    sub_total_monthly: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    sub_total_annual: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    gross_ctc_monthly: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    gross_ctc_annual: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="DRAFT",
        server_default="DRAFT",
        index=True,
    )

    created_by: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    updated_by: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
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

    generated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    sent_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    email_status: Mapped[Optional[str]] = mapped_column(
        String(30),
        nullable=True,
    )

    email_error: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    items: Mapped[List["OnboardingDocumentItem"]] = relationship(
        "OnboardingDocumentItem",
        back_populates="package",
        cascade="all, delete-orphan",
        lazy="selectin",
    )