from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class GeneratePayslipRequest(BaseModel):
    emp_id: int
    month: date


class SendPayslipEmailResponse(BaseModel):
    success: bool
    message: str
    email: Optional[str] = None
    file_name: Optional[str] = None


class PayrollSettingUpdate(BaseModel):
    company_logo: Optional[str] = None
    company_name: Optional[str] = None
    company_address: Optional[str] = None
    company_contact: Optional[str] = None

    basic_earning: Optional[Decimal] = None
    hra: Optional[Decimal] = None
    conveyance_allowance: Optional[Decimal] = None

    provident_fund: Optional[Decimal] = None
    esic: Optional[Decimal] = None
    professional_tax: Optional[Decimal] = None