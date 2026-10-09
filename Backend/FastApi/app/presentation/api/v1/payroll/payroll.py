from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.presentation.dependencies.database import get_transactional_db

from app.application.services.payroll.payroll_service import PayrollService

from app.application.dtos.payroll.payroll import SalaryCalculationRequest


router = APIRouter()


@router.post("/generate")
def generate_payslip(
    data: SalaryCalculationRequest,
    db: Session = Depends(get_transactional_db),
):
    service = PayrollService(db)

    return service.calculate_monthly_salary(
        data.emp_id,
        data.month,
    )