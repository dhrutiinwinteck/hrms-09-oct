from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, Boolean
from app.infrastructure.database.base import Base

class KraScoreLogNew(Base):
    __tablename__ = "kra_score_log_new"
    id = Column(Integer, primary_key=True)
    kra_score_id = Column(Integer, ForeignKey("kra_score_new.id"))
    master_id = Column(Integer, ForeignKey("kra_master_new.id"))
    self_score = Column(Numeric(18, 2))
    tl_score = Column(Numeric(18, 2), default=0)
    rm_score = Column(Numeric(18, 2), default=0)
    tp_score = Column(Numeric(18, 2), default=0)
    key_improvement_area = Column(String)
    tp_remark = Column(String)
    is_edited = Column(Boolean, default=False) # To handle one-time edit logic