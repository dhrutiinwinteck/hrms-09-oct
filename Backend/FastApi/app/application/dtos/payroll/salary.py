from pydantic import BaseModel
from typing import Optional

class SalaryBankUpdate(BaseModel):
    emp_id: int
    salary: float
    uan: Optional[str] = None
    esic: Optional[str] = None
    mode_pay: int
    bank_name: str
    account_no: str
    ifsc_code: str
    # branch_name REMOVED

class SalaryBankResponse(BaseModel):
    emp_id: int
    salary: float
    bank_name: str
    account_no: str

    class Config:
        from_attributes = True