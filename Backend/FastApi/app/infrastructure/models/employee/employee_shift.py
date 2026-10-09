from sqlalchemy import Column, Date, Integer, String

from app.infrastructure.database.base import Base


class EmployeeShift(Base):
    """
    SQLAlchemy model for employee shift assignments.

    Stores which shift pattern is assigned to an employee,
    the assignment validity period, and the employee's
    week-off configuration.
    """

    __tablename__ = "employeeshift"

    empshiftid = Column(
        Integer,
        primary_key=True,
        nullable=False,
    )

    empid = Column(
        Integer,
        nullable=True,
    )

    patternid = Column(
        Integer,
        nullable=True,
    )

    startdate = Column(
        Date,
        nullable=True,
    )

    enddate = Column(
        Date,
        nullable=True,
    )

    weekoffdays = Column(
        String,
        nullable=True,
    )

    leavedays = Column(
        String,
        nullable=True,
    )

    weekoffmode = Column(
        String(20),
        nullable=False,
        default="MANUAL",
    )

    rotationstartpair = Column(
        String(30),
        nullable=True,
    )