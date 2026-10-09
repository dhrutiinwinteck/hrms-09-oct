from sqlalchemy import Column, Integer, String, Date, DateTime, func
from app.infrastructure.database.base import Base

class HolidayModel(Base):
    __tablename__ = "holiday"
    
    id = Column(Integer, primary_key=True)
    holiday_name = Column(String(255))
    holiday_date = Column(Date)
    status = Column(Integer, default=1)      # 1: Active, 0: Deactive
    createdon = Column(DateTime, default=func.now())
    createdby = Column(String(128))
    modifiedon = Column(DateTime, onupdate=func.now())
    modifiedby = Column(String(128), nullable=True)