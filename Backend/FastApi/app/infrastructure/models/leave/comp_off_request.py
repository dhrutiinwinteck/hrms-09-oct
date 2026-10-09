from datetime import date, datetime
from typing import Optional

from sqlalchemy import (
    BigInteger,
    Date,
    DateTime,
    Index,
    Numeric,
    String,
    Text,
    CheckConstraint,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.database.base import Base


class CompOffRequestModel(Base):

    __tablename__ = "comp_off_request"

    __table_args__ = (

        Index(
            "idx_comp_off_request_emp_id",
            "emp_id",
        ),

        Index(
            "idx_comp_off_request_status",
            "status",
        ),

        Index(
            "idx_comp_off_request_worked_date",
            "worked_date",
        ),

        CheckConstraint(
            "day_type IN ('PublicHoliday', 'WeekOff')",
            name="chk_comp_off_request_day_type",
        ),

        CheckConstraint(
            "status IN ('Pending', 'Approved', 'Rejected')",
            name="chk_comp_off_request_status",
        ),
    )

    # ========================================================
    # PRIMARY KEY
    # ========================================================

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    # ========================================================
    # EMPLOYEE
    # ========================================================

    emp_id: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
    )

    emp_code: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )

    # ========================================================
    # WORKED DATE
    # ========================================================

    worked_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    # ========================================================
    # DAY TYPE
    #
    # PublicHoliday
    # WeekOff
    # ========================================================

    day_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    # ========================================================
    # REASON
    # ========================================================

    reason: Mapped[str] = mapped_column(
        String(1000),
        nullable=False,
    )

    # ========================================================
    # ATTACHMENT
    # ========================================================

    attachment_path: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )

    # ========================================================
    # STATUS
    #
    # Pending
    # Approved
    # Rejected
    # ========================================================

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="Pending",
    )

    # ========================================================
    # APPROVAL
    # ========================================================

    approved_by: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        nullable=True,
    )

    approved_on: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
    )

    # ========================================================
    # REJECTION
    # ========================================================

    rejection_reason: Mapped[Optional[str]] = mapped_column(
        String(1000),
        nullable=True,
    )

    # ========================================================
    # COMP OFF DATE
    # ========================================================

    comp_off_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )

    # ========================================================
    # AUDIT
    # ========================================================

    createdby: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        nullable=True,
    )

    createdon: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )

    modifiedby: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        nullable=True,
    )

    modifiedon: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
    )