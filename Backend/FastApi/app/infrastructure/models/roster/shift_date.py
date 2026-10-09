from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.infrastructure.database.base import Base


class ShiftDateModel(Base):
    """
    SQLAlchemy model for date-wise employee shift assignments.

    Maps to the existing PostgreSQL public.employeeshiftdates table.
    """

    __tablename__ = "employeeshiftdates"
    __table_args__ = {"schema": "public"}

    shiftdateid = Column(
        Integer,
        primary_key=True,
        nullable=False,
    )

    empshiftid = Column(
        Integer,
        nullable=False,
    )

    empid = Column(
        Integer,
        nullable=False,
    )

    patternid = Column(
        Integer,
        nullable=False,
    )

    dates = Column(
        DateTime,
        nullable=False,
    )

    dayofweek = Column(
        String,
        nullable=True,
    )

    isweekoff = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    isleave = Column(
        Boolean,
        nullable=False,
        default=False,
    )