from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.database.base import Base


class ShiftSwapModel(Base):
    """
    SQLAlchemy model for the existing PostgreSQL
    public.shiftswaprequest table.
    """

    __tablename__ = "shiftswaprequest"

    swap_requested_id: Mapped[int] = mapped_column(
        "swaprequestedid",
        Integer,
        primary_key=True,
    )

    requested_by_emp_id: Mapped[int] = mapped_column(
        "requestedbyempid",
        Integer,
        nullable=False,
    )

    requested_to_emp_id: Mapped[int] = mapped_column(
        "requestedtoempid",
        Integer,
        nullable=False,
    )

    request_type: Mapped[str] = mapped_column(
        "requesttype",
        String(50),
        nullable=False,
    )

    swap_date: Mapped[datetime] = mapped_column(
        "swapdate",
        DateTime,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        "status",
        String(50),
        nullable=False,
    )

    created_date: Mapped[datetime] = mapped_column(
        "createddate",
        DateTime,
        nullable=False,
    )

    approved_by: Mapped[Optional[str]] = mapped_column(
        "approvedby",
        String(100),
        nullable=True,
    )

    approved_on: Mapped[Optional[datetime]] = mapped_column(
        "approvedon",
        DateTime,
        nullable=True,
    )