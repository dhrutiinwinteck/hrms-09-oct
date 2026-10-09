from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.database.base import Base


# ============================================================
# EXPENSE CATEGORY
# ============================================================

class ExpenseCategoryModel(Base):
    __tablename__ = "exp_category"

    id: Mapped[int] = mapped_column(
        "id",
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    category_name: Mapped[str] = mapped_column(
        "category_name",
        String(150),
        nullable=False,
    )

    status: Mapped[int] = mapped_column(
        "status",
        SmallInteger,
        nullable=False,
        default=1,
    )

    created_by: Mapped[str | None] = mapped_column(
        "createdby",
        String(256),
        nullable=True,
    )

    created_on: Mapped[datetime | None] = mapped_column(
        "createdon",
        DateTime,
        nullable=True,
    )

    modified_by: Mapped[str | None] = mapped_column(
        "modifiedby",
        String(256),
        nullable=True,
    )

    modified_on: Mapped[datetime | None] = mapped_column(
        "modifiedon",
        DateTime,
        nullable=True,
    )


# ============================================================
# EXPENSE SUBCATEGORY
# ============================================================

class ExpenseSubCategoryModel(Base):
    __tablename__ = "exp_sub_category"

    id: Mapped[int] = mapped_column(
        "id",
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    category_id: Mapped[int] = mapped_column(
        "category_id",
        ForeignKey("exp_category.id"),
        nullable=False,
    )

    sub_category_name: Mapped[str] = mapped_column(
        "sub_category_name",
        String(150),
        nullable=False,
    )

    status: Mapped[int] = mapped_column(
        "status",
        SmallInteger,
        nullable=False,
        default=1,
    )

    created_by: Mapped[str | None] = mapped_column(
        "createdby",
        String(256),
        nullable=True,
    )

    created_on: Mapped[datetime | None] = mapped_column(
        "createdon",
        DateTime,
        nullable=True,
    )

    modified_by: Mapped[str | None] = mapped_column(
        "modifiedby",
        String(256),
        nullable=True,
    )

    modified_on: Mapped[datetime | None] = mapped_column(
        "modifiedon",
        DateTime,
        nullable=True,
    )


# ============================================================
# EXPENSE
# ============================================================

class ExpenseModel(Base):
    __tablename__ = "expense"

    id: Mapped[int] = mapped_column(
        "id",
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    type: Mapped[int] = mapped_column(
        "type",
        Integer,
        nullable=False,
        default=0,
    )

    description: Mapped[str] = mapped_column(
        "description",
        Text,
        nullable=False,
    )

    category_id: Mapped[int] = mapped_column(
        "category",
        ForeignKey("exp_category.id"),
        nullable=False,
    )

    sub_category_id: Mapped[int | None] = mapped_column(
        "sub_category",
        ForeignKey("exp_sub_category.id"),
        nullable=True,
    )

    amount: Mapped[Decimal] = mapped_column(
        "amount",
        Numeric(18, 2),
        nullable=False,
    )

    expense_from: Mapped[datetime] = mapped_column(
        "expense_from",
        DateTime,
        nullable=False,
    )

    expense_to: Mapped[datetime] = mapped_column(
        "expense_to",
        DateTime,
        nullable=False,
    )

    bill: Mapped[str | None] = mapped_column(
        "bill",
        String(500),
        nullable=True,
    )

    bill1: Mapped[str | None] = mapped_column(
        "bill1",
        String(500),
        nullable=True,
    )

    bill2: Mapped[str | None] = mapped_column(
        "bill2",
        String(500),
        nullable=True,
    )

    bill3: Mapped[str | None] = mapped_column(
        "bill3",
        String(500),
        nullable=True,
    )

    bill4: Mapped[str | None] = mapped_column(
        "bill4",
        String(500),
        nullable=True,
    )

    on_site_location: Mapped[str | None] = mapped_column(
        "on_site_location",
        String(250),
        nullable=True,
    )

    status_hr: Mapped[int] = mapped_column(
        "status_hr",
        Integer,
        nullable=False,
        default=10,
    )

    status_promoter: Mapped[int] = mapped_column(
        "status_promoter",
        Integer,
        nullable=False,
        default=10,
    )

    reject_reason_hr: Mapped[str | None] = mapped_column(
        "reject_reason_hr",
        Text,
        nullable=True,
    )

    reject_reason_promoter: Mapped[str | None] = mapped_column(
        "reject_reason_promoter",
        Text,
        nullable=True,
    )

    created_by: Mapped[str] = mapped_column(
        "createdby",
        String(256),
        nullable=False,
    )

    created_on: Mapped[datetime] = mapped_column(
        "createdon",
        DateTime,
        nullable=False,
    )

    modified_by: Mapped[str | None] = mapped_column(
        "modifiedby",
        String(256),
        nullable=True,
    )

    modified_on: Mapped[datetime | None] = mapped_column(
        "modifiedon",
        DateTime,
        nullable=True,
    )