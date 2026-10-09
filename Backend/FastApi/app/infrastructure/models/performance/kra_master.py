from sqlalchemy import Column, Integer, String, DateTime, func
from app.infrastructure.database.base import Base

class KraMasterNew(Base):
    __tablename__ = "kra_master_new"
    id = Column(Integer, primary_key=True)
    department_id = Column(Integer)
    designation_id = Column(Integer)
    focused_area = Column(String)
    weightage = Column(Integer)
    frommonth = Column(Integer)
    tomonth = Column(Integer)
    year = Column(Integer)
    status = Column(Integer, default=1)
    createdby = Column(String(128))
    createdon = Column(DateTime, default=func.now())
    modifiedby = Column(String(128))
    modifiedon = Column(DateTime, onupdate=func.now())