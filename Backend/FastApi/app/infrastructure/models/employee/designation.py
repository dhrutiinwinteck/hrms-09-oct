from sqlalchemy import Column, Integer, Text, ForeignKey
from app.infrastructure.database.base import Base

class DesignationModel(Base):
    __tablename__ = "designation"
    
    id = Column(Integer, primary_key=True)
    depart_id = Column(Integer, ForeignKey("department.id"))
    name = Column(Text)