from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.infrastructure.database.base import Base

class TimesheetLogModel(Base):
    __tablename__ = "timesheet_log"
    
    id = Column(Integer, primary_key=True)
    emp_id = Column(Integer, ForeignKey("employee_detail.id"))
    activity = Column(String(10))  # PI, PO, BI, BO
    log = Column(DateTime)