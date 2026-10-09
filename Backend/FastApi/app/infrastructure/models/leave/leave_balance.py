from sqlalchemy import Column, Integer, String, Float, DateTime

from app.infrastructure.database.base import Base


class LeaveBalanceModel(Base):
    __tablename__ = "employee_leave_balance"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Stores employee CODE, e.g. IWT68
    emp_id = Column(String(100), nullable=True)

    year = Column(String, nullable=False)

    remained_casual_leave = Column(Float, nullable=True)

    remained_paid_leave = Column(Float, nullable=True)

    leave_type = Column(String(100), nullable=True)

    remained_comp_off = Column(Float, nullable=True)

    createdby = Column(String(100), nullable=True)

    createddate = Column(DateTime, nullable=True)

    modifiedby = Column(String(100), nullable=True)

    modifieddate = Column(DateTime, nullable=True)