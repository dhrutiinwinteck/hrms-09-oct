from datetime import datetime

from sqlalchemy import (
    DateTime,
    Identity,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.infrastructure.database.base import Base

class KRAMaster(Base):
    """
    SQLAlchemy model for:
    public.kra_master_new
    """

    __tablename__ = "kra_master_new"

    __table_args__ = {
        "schema": "public"
    }

    id: Mapped[int] = mapped_column(
        Integer,
        Identity(),
        primary_key=True,
        nullable=False,
    )

    department_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    designation_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    focused_area: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    weightage: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    frommonth: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    tomonth: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    year: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    status: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    createdby: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    createdon: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    modifiedby: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    modifiedon: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

