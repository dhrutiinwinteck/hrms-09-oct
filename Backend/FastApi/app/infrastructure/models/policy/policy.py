from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.infrastructure.database.base import Base


class Policy(Base):

    __tablename__ = "policy"

    __table_args__ = {
        "schema": "public",
    }

    # ============================================================
    # PRIMARY KEY
    # ============================================================

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    # ============================================================
    # POLICY NAME
    # ============================================================

    policy_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # ============================================================
    # DESCRIPTION
    # ============================================================

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # ============================================================
    # POLICY FILE
    # ============================================================

    policy_file: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    # ============================================================
    # VERSION
    # ============================================================

    version: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    # ============================================================
    # ACTIVE
    # ============================================================

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    # ============================================================
    # CREATED BY
    # ============================================================

    createdby: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    # ============================================================
    # CREATED ON
    # ============================================================

    createdon: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ============================================================
    # MODIFIED BY
    # ============================================================

    modifiedby: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    # ============================================================
    # MODIFIED ON
    # ============================================================

    modifiedon: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )