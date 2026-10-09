from sqlalchemy import Column, Integer, String, Float, DateTime

from app.infrastructure.database.base import Base


class LeaveLogModel(Base):
    __tablename__ = "leave_log"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Employee Detail ID
    emp_id = Column(Integer, nullable=False)

    # Employee code, e.g. IWT68
    emp_code = Column(String(50), nullable=True)

    leave_from = Column(DateTime, nullable=True)

    leave_to = Column(DateTime, nullable=True)

    leave_reason = Column(String(500), nullable=True)

    status = Column(Integer, nullable=False, default=0)

    approved_by = Column(Integer, nullable=True)

    approved_on = Column(DateTime, nullable=True)

    createdby = Column(String(255), nullable=True)

    createdon = Column(DateTime, nullable=True)

    modifiedby = Column(String(255), nullable=True)

    modifiedon = Column(DateTime, nullable=True)

    leave_type = Column(String(100), nullable=True)

    no_of_days = Column(Float, nullable=True)

    half_day_from = Column(String(10), nullable=True)

    half_day_to = Column(String(10), nullable=True)