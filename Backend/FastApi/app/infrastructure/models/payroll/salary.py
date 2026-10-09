from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from app.infrastructure.database.base import Base

class SalaryModel(Base):
    __tablename__ = "employee_salary"
    
    id = Column(Integer, primary_key=True)
    emp_id = Column(Integer, ForeignKey("employee_detail.id"))
    salary = Column(Numeric(18, 2))
    uan = Column(String(100))
    esic = Column(String(100))
    mode_pay = Column(Integer)

    