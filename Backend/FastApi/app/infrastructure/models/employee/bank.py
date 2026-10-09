from sqlalchemy import Column, Integer, String, ForeignKey
from app.infrastructure.database.base import Base

class BankModel(Base):
    __tablename__ = "employee_bank"
    
    id = Column(Integer, primary_key=True)
    emp_id = Column(Integer, ForeignKey("employee_detail.id"))
    bank_name = Column(String(500))
    account_no = Column(String(100))
    ifsc_code = Column(String(100))
    # branch_name REMOVED because it doesn't exist in your DB