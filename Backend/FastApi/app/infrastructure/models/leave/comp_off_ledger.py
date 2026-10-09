from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    BigInteger,
    DateTime,
    Numeric,
    String,
    CheckConstraint,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.database.base import Base


class CompOffLedgerModel(Base):

    __tablename__ = "comp_off_ledger"

    __table_args__ = (

        Index(
            "idx_comp_off_ledger_emp_id",
            "emp_id",
        ),

        Index(
            "idx_comp_off_ledger_request_id",
            "comp_off_request_id",
        ),

        CheckConstraint(
            "transaction_type IN ('Credit', 'Debit')",
            name="chk_comp_off_transaction_type",
        ),

        CheckConstraint(
            "quantity > 0",
            name="chk_comp_off_quantity",
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
    # TRANSACTION
    # ========================================================

    transaction_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    quantity: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )

    balance_after: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )

    # ========================================================
    # REFERENCES
    # ========================================================

    comp_off_request_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        nullable=True,
    )

    leave_log_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        nullable=True,
    )

    # ========================================================
    # TRANSACTION DATE
    # ========================================================

    transaction_date: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )

    # ========================================================
    # REMARKS
    # ========================================================

    remarks: Mapped[Optional[str]] = mapped_column(
        String(1000),
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