from __future__ import annotations

from datetime import datetime, time
from typing import Optional

from sqlalchemy import DateTime, Integer, String, Time
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.database.base import Base


class ShiftPatternModel(Base):
    """
    SQLAlchemy model for the shift_pattern table.
    """

    __tablename__ = "shiftpattern"

    patternid: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    patternname: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    starttime: Mapped[time] = mapped_column(
        Time(timezone=False),
        nullable=False,
    )

    endtime: Mapped[time] = mapped_column(
        Time(timezone=False),
        nullable=False,
    )

    createdby: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    createddate: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
    )

    modifiedby: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    modifieddate: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=False),
        nullable=True,
    )