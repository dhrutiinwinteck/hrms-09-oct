from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, ForeignKey

from app.infrastructure.database.base import Base


class EmployeeBank(Base):
    __tablename__ = "employee_bank"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, index=True)

    emp_id = Column(
        Integer,
        ForeignKey("public.employee_detail.id"),
        nullable=False,
    )

    bank_name = Column(String, nullable=True)
    account_no = Column(String, nullable=True)
    ifsc_code = Column(String, nullable=True)

    createdby = Column(String, nullable=True)
    createdon = Column(DateTime, nullable=True, default=datetime.utcnow)

    modifiedby = Column(String, nullable=True)
    modifiedon = Column(DateTime, nullable=True)