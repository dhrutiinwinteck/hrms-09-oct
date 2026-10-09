from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    SmallInteger,
)
from sqlalchemy.orm import relationship

from app.infrastructure.database.base import Base


class ResignationModel(Base):
    __tablename__ = "employee_resignation"

    # ========================================================
    # PRIMARY KEY
    # ========================================================

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    # ========================================================
    # EMPLOYEE
    # ========================================================

    emp_id = Column(
        Integer,
        ForeignKey("employee_detail.id"),
        nullable=False
    )

    # ========================================================
    # EMPLOYEE RELATIONSHIP
    # ========================================================

    employee = relationship(
        "EmployeeModel",
        foreign_keys=[emp_id]
    )

    # ========================================================
    # REASON
    # ========================================================

    reason = Column(
        String(500),
        nullable=True
    )

    # ========================================================
    # RESIGNATION / TERMINATION
    # ========================================================

    is_resignation = Column(
        SmallInteger,
        default=1,
        nullable=False
    )

    is_termination = Column(
        SmallInteger,
        default=0,
        nullable=False
    )

    # ========================================================
    # RESIGNATION DATE
    # ========================================================

    from_date = Column(
        DateTime,
        nullable=True
    )

    # ========================================================
    # NOTICE PERIOD
    # ========================================================

    notice_period = Column(
        Integer,
        nullable=True
    )

    # ========================================================
    # HR STATUS
    # ========================================================
    # 0 = Pending
    # 1 = Approved
    # 2 = Rejected
    # ========================================================

    hr_status = Column(
        Integer,
        default=0,
        nullable=False
    )

    # ========================================================
    # PROMOTER STATUS
    # ========================================================
    # 0 = Pending
    # 1 = Approved
    # 2 = Rejected
    # ========================================================

    promoter_status = Column(
        Integer,
        default=0,
        nullable=False
    )

    # ========================================================
    # CREATED DATE
    # ========================================================

    createdon = Column(
        DateTime,
        nullable=True
    )