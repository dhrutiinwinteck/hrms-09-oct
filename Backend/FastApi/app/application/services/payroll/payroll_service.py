from sqlalchemy.orm import Session
from datetime import datetime
from fastapi import HTTPException

from app.infrastructure.models.payroll.salary import SalaryModel
from app.infrastructure.models.employee.employee import EmployeeModel
from app.infrastructure.models.payroll.payslip import PayslipModel
from app.infrastructure.models.payroll.payroll_setting import PayrollSettingModel


class PayrollService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_monthly_salary(self, emp_id: int, month: datetime):
        # 1. Fetch Employee and Salary details
        emp = (
            self.db.query(EmployeeModel)
            .filter(EmployeeModel.id == emp_id)
            .first()
        )

        sal_data = (
            self.db.query(SalaryModel)
            .filter(SalaryModel.emp_id == emp_id)
            .first()
        )

        settings = self.db.query(PayrollSettingModel).first()

        if not sal_data or not settings:
            raise HTTPException(
                status_code=404,
                detail="Salary data or Payroll settings missing",
            )

        gross_salary = float(sal_data.salary)

        # 2. Logic: IF UAN EXISTS
        if sal_data.uan:
            basic = gross_salary * 0.6
            hra = gross_salary * 0.2
            conveyance = gross_salary * 0.2

            # PF Logic: 1800 if basic > 15000, else 12%
            pf = (
                1800.0
                if basic >= 15001
                else (basic * 0.12)
            )

        else:
            # Logic if no UAN (Fixed conveyance)
            conveyance = 1600.0
            basic = (gross_salary - conveyance) * 0.5
            hra = basic * 0.5
            pf = 0.0

        # 3. Professional Tax (PT) Logic
        pt = 0.0

        gender_str = (
            str(emp.gender).lower()
            if emp.gender
            else "male"
        )

        if "female" in gender_str:
            pt = 200.0 if gross_salary >= 25000 else 0.0
        else:
            pt = 200.0

        # 4. Final Totals
        total_deductions = pf + pt
        net_pay = gross_salary - total_deductions

        # 5. Save to Payslip Table
        new_payslip = PayslipModel(
            emp_id=emp_id,
            month=month,
            salary=gross_salary,
            basic=basic,
            hra=hra,
            pf=pf,
            pt=pt,
            total_earnings=gross_salary,
            total_deduction=total_deductions,
            net_pay=net_pay,
        )

        self.db.add(new_payslip)
        self.db.commit()

        return {
            "emp_name": emp.first_name,
            "net_pay": net_pay,
            "month": month.strftime("%B %Y"),
        }