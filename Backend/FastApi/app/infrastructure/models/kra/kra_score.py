from datetime import datetime

from sqlalchemy import (
    DateTime,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.infrastructure.database.base import Base

class KRAScore(Base):
    """
    SQLAlchemy model for:

        public.kra_score_new

    Business Rule:
        An employee can have only ONE KRA Score
        for the exact same:

            emp_id
            frommonth
            tomonth
            year

    Example:

        Employee 101
        Jan 2026 - Sep 2026

        Only one record is allowed.

    A second record for:

        Employee 101
        Jan 2026 - Sep 2026

    must be rejected.
    """

    __tablename__ = "kra_score_new"

    __table_args__ = (
        UniqueConstraint(
            "emp_id",
            "frommonth",
            "tomonth",
            "year",
            name="uq_kra_score_employee_period",
        ),
        {
            "schema": "public"
        },
    )

    # =========================================================
    # PRIMARY KEY
    # =========================================================

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        nullable=False,
    )

    # =========================================================
    # EMPLOYEE
    # =========================================================

    emp_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    # =========================================================
    # KRA DATE
    # =========================================================

    kra_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=False),
        nullable=True,
    )

    # =========================================================
    # TOTAL SCORES
    # =========================================================

    total_self_score: Mapped[float | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )

    total_rm_score: Mapped[float | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )

    total_tl_score: Mapped[float | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )

    total_tp_score: Mapped[float | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )

    # =========================================================
    # REMARKS
    # =========================================================

    rm_remark: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    tl_remark: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    top_management_remark: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # =========================================================
    # KRA PERIOD
    # =========================================================

    frommonth: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    tomonth: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    year: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    # =========================================================
    # AUDIT FIELDS
    # =========================================================

    createdon: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=False),
        nullable=True,
    )

    createdby: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )

    modifiedon: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=False),
        nullable=True,
    )

    modifiedby: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )

