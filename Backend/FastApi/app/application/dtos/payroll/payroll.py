from pydantic import BaseModel
from datetime import datetime

class SalaryCalculationRequest(BaseModel):
    emp_id: int
    month: datetime

class PayslipResponse(BaseModel):
    emp_id: int
    full_name: str
    gross_salary: float
    net_pay: float
    month_name: str