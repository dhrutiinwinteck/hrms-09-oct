from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.base import Base

if TYPE_CHECKING:
    from app.infrastructure.models.onboarding.onboarding_document_package import (
        OnboardingDocumentPackage,
    )


class OnboardingDocumentItem(Base):
    __tablename__ = "onboarding_document_items"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    package_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "onboarding_document_packages.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    document_type: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    file_name: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    file_path: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    status: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    generated_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    sent_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    error_message: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    created_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    package: Mapped["OnboardingDocumentPackage"] = relationship(
        "OnboardingDocumentPackage",
        back_populates="items",
    )