from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    DateTime,
    Integer,
    Numeric,
    String,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.infrastructure.database.base import Base

class KRAManager(Base):
    """
    SQLAlchemy model for:
    public.kra_score_log_new
    """

    __tablename__ = "kra_score_log_new"

    __table_args__ = {
        "schema": "public"
    }

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        nullable=False,
    )

    master_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    kra_score_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    isedited: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
    )

    self_score: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )

    key_improvement_area: Mapped[str | None] = mapped_column(
    String(500),
    nullable=True,
    )

    reporting_manager: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )

    rm_score: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )

    rm_remark: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    tl_score: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )

    tl_remark: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    tp_score: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )

    tp_remark: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    createdon: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    createdby: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    modifiedon: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    modifiedby: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

