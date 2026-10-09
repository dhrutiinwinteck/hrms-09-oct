from sqlalchemy import (
    Column,
    Integer,
    DateTime,
    ForeignKey,
    Float,
    Date,
    Boolean,
    Text,
)

from app.infrastructure.database.base import Base


class TimesheetModel(Base):

    __tablename__ = "timesheet"

    # ============================================================
    # EXISTING FIELDS
    # ============================================================

    id = Column(
        Integer,
        primary_key=True
    )

    emp_id = Column(
        Integer,
        ForeignKey("employee_detail.id")
    )

    date = Column(
        Date
    )

    punch_in = Column(
        DateTime,
        nullable=True
    )

    punch_out = Column(
        DateTime,
        nullable=True
    )

    working_hrs = Column(
        Float,
        nullable=True
    )

    total_break = Column(
        Float,
        default=0.0
    )

    last_break_in = Column(
        DateTime,
        nullable=True
    )

    last_break_out = Column(
        DateTime,
        nullable=True
    )

    # ============================================================
    # PUNCH-IN LOCATION
    # ============================================================

    punch_in_latitude = Column(
        Float,
        nullable=True
    )

    punch_in_longitude = Column(
        Float,
        nullable=True
    )

    punch_in_accuracy = Column(
        Float,
        nullable=True
    )

    punch_in_address = Column(
        Text,
        nullable=True
    )

    punch_in_distance_from_office = Column(
        Float,
        nullable=True
    )

    punch_in_inside_office = Column(
        Boolean,
        nullable=True
    )

    # ============================================================
    # PUNCH-OUT LOCATION
    # ============================================================

    punch_out_latitude = Column(
        Float,
        nullable=True
    )

    punch_out_longitude = Column(
        Float,
        nullable=True
    )

    punch_out_accuracy = Column(
        Float,
        nullable=True
    )

    punch_out_address = Column(
        Text,
        nullable=True
    )

    punch_out_distance_from_office = Column(
        Float,
        nullable=True
    )

    punch_out_inside_office = Column(
        Boolean,
        nullable=True
    )