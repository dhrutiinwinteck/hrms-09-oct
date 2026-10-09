from sqlalchemy import Column, Integer, Text
from app.infrastructure.database.base import Base

class DepartmentModel(Base):
    __tablename__ = "department"
    
    id = Column(Integer, primary_key=True)
    name = Column(Text, nullable=False)