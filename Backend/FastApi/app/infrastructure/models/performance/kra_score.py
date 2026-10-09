from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric
from app.infrastructure.database.base import Base

class KraScoreNew(Base):
    __tablename__ = "kra_score_new"
    id = Column(Integer, primary_key=True)
    emp_id = Column(Integer, ForeignKey("employee_detail.id"))
    kra_date = Column(DateTime)
    frommonth = Column(Integer)
    tomonth = Column(Integer)
    year = Column(Integer)
    total_self_score = Column(Numeric(18, 2))
    total_tl_score = Column(Numeric(18, 2), default=0)
    total_rm_score = Column(Numeric(18, 2), default=0)
    total_tp_score = Column(Numeric(18, 2), default=0)
    tl_remark = Column(String)
    rm_remark = Column(String)
    top_management_remark = Column(String)