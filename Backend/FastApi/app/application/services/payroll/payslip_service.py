from calendar import monthrange
from datetime import date, datetime
from decimal import Decimal
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from app.infrastructure.repositories.payroll.payslip_repository import (
    PayslipRepository,
)


class PayslipService:

    def __init__(
        self,
        repository: PayslipRepository
    ):
        self.repository = repository

    # =========================================================
    # DECIMAL
    # =========================================================

    @staticmethod
    def decimal(value):

        if value is None:
            return Decimal("0")

        try:
            return Decimal(str(value))
        except Exception:
            return Decimal("0")

    # =========================================================
    # EMPLOYEES
    # =========================================================

    def get_employees(self):

        return self.repository.get_employees()


        # =========================================================
    # PAYSLIPS BY EMPLOYEE ID
    # =========================================================

    def get_payslips_by_employee_id(
        self,
        emp_id: int
    ):

        employee = (
            self.repository.get_employee(emp_id)
        )

        if not employee:
            raise ValueError(
                "Employee not found"
            )

        rows = (
            self.repository
            .get_payslips_by_employee_id(
                emp_id
            )
        )

        return self._format_employee_payslips(
            rows
        )

    # =========================================================
    # PAYSLIPS BY EMPLOYEE CODE
    # =========================================================

    def get_payslips_by_employee_code(
        self,
        emp_code: str
    ):

        employee = (
            self.repository
            .get_employee_by_code(
                emp_code
            )
        )

        if not employee:
            raise ValueError(
                "Employee not found"
            )

        rows = (
            self.repository
            .get_payslips_by_employee_code(
                emp_code
            )
        )

        return self._format_employee_payslips(
            rows
        )

    # =========================================================
    # FORMAT EMPLOYEE PAYSLIPS
    # =========================================================

    def _format_employee_payslips(
        self,
        rows: list
    ):

        result = []

        today = date.today()

        for row in rows:

            payslip_month = row.get(
                "month"
            )

            can_view = False

            if payslip_month:

                if hasattr(
                    payslip_month,
                    "date"
                ):
                    payslip_month = (
                        payslip_month.date()
                    )

                release_date = (
                    payslip_month.replace(
                        day=5
                    )
                )

                can_view = (
                    today >= release_date
                )

            first_name = (
                row.get("first_name")
                or ""
            )

            last_name = (
                row.get("last_name")
                or ""
            )

            result.append({

                "id": row.get("id"),

                "emp_id": row.get(
                    "emp_id"
                ),

                "emp_code": row.get(
                    "emp_code"
                ),

                "employee_name": (
                    f"{first_name} "
                    f"{last_name}"
                ).strip(),

                "month": row.get(
                    "month"
                ),

                "salary": row.get(
                    "salary"
                ),

                "day_paid": row.get(
                    "day_paid"
                ),

                "lop_absent": row.get(
                    "lop_absent"
                ),

                "total_earnings": row.get(
                    "total_earnings"
                ),

                "total_deduction": row.get(
                    "total_deduction"
                ),

                "net_pay": row.get(
                    "net_pay"
                ),

                "can_view": can_view
            })

        return result

    # =========================================================
    # PAYSLIP LIST
    # =========================================================

    def get_payslips(
        self,
        emp_id=None,
        year=None,
        month=None
    ):

        rows = self.repository.get_payslips(
            emp_id,
            year,
            month
        )

        result = []

        today = date.today()

        for row in rows:

            payslip_month = row.get(
                "month"
            )

            can_view = False

            if payslip_month:

                if hasattr(
                    payslip_month,
                    "date"
                ):
                    payslip_month = (
                        payslip_month.date()
                    )

                release_date = payslip_month.replace(
                    day=5
                )

                can_view = (
                    today >= release_date
                )

            first_name = (
                row.get("first_name")
                or ""
            )

            last_name = (
                row.get("last_name")
                or ""
            )

            result.append({

                "id": row.get("id"),

                "emp_id": row.get(
                    "emp_id"
                ),

                "emp_code": row.get(
                    "emp_code"
                ),

                "employee_name": (
                    f"{first_name} "
                    f"{last_name}"
                ).strip(),

                "month": row.get(
                    "month"
                ),

                "salary": row.get(
                    "salary"
                ),

                "day_paid": row.get(
                    "day_paid"
                ),

                "lop_absent": row.get(
                    "lop_absent"
                ),

                "total_earnings": row.get(
                    "total_earnings"
                ),

                "total_deduction": row.get(
                    "total_deduction"
                ),

                "net_pay": row.get(
                    "net_pay"
                ),

                "can_view": can_view
            })

        return result

    # =========================================================
    # CHECK
    # =========================================================

    def check_payslip(
        self,
        emp_id: int,
        year: int,
        month: int
    ):

        setting = (
            self.repository
            .get_payroll_setting()
        )

        if not setting:

            return {
                "res": "NoPayrollSetting",
                "message": (
                    "Payroll setting not found"
                )
            }

        existing = (
            self.repository
            .get_existing_payslip(
                emp_id,
                year,
                month
            )
        )

        if existing:

            return {
                "res": "Slip",
                "message": (
                    "Salary generated for this month"
                ),
                "payslip": existing
            }

        salary = (
            self.repository
            .get_employee_salary(
                emp_id
            )
        )

        if not salary:

            return {
                "res": "NoSalaryFound",
                "message": (
                    "No salary found for employee"
                )
            }

        salary_amount = self.decimal(
            salary.get("salary")
        )

        if salary_amount <= 0:

            return {
                "res": "NoSalaryFound",
                "message": (
                    "No salary found for employee"
                )
            }

        calculation = self.calculate_salary(
            emp_id,
            year,
            month
        )

        return {
            "res": "success",
            "message": (
                "Salary details found"
            ),
            "ps": calculation
        }

    # =========================================================
    # CALCULATE
    # =========================================================

    def calculate_salary(
        self,
        emp_id: int,
        year: int,
        month: int
    ):

        employee = (
            self.repository
            .get_employee(emp_id)
        )

        if not employee:

            raise ValueError(
                "Employee not found"
            )

        salary_data = (
            self.repository
            .get_employee_salary(
                emp_id
            )
        )

        if not salary_data:

            raise ValueError(
                "Employee salary not found"
            )

        salary = self.decimal(
            salary_data.get("salary")
        )

        if salary <= 0:

            raise ValueError(
                "Employee salary is zero"
            )

        setting = (
            self.repository
            .get_payroll_setting()
        )

        if not setting:

            raise ValueError(
                "Payroll setting not found"
            )

        days_in_month = monthrange(
            year,
            month
        )[1]

        first_date = date(
            year,
            month,
            1
        )

        last_date = date(
            year,
            month,
            days_in_month
        )

        # -----------------------------------------------------
        # TIMESHEET
        # -----------------------------------------------------

        timesheets = (
            self.repository
            .get_timesheets(
                emp_id,
                first_date,
                last_date
            )
        )

        working_days = len(
            {
                (
                    x.get("date").date()
                    if hasattr(
                        x.get("date"),
                        "date"
                    )
                    else x.get("date")
                )
                for x in timesheets
                if x.get("date") is not None
            }
        )

        # -----------------------------------------------------
        # WEEKENDS
        # -----------------------------------------------------

        weekends = 0

        for day_number in range(
            1,
            days_in_month + 1
        ):

            current_date = date(
                year,
                month,
                day_number
            )

            if current_date.weekday() in (
                5,
                6
            ):
                weekends += 1

        # -----------------------------------------------------
        # HOLIDAYS
        # -----------------------------------------------------

        holidays = (
            self.repository
            .get_holidays(
                first_date,
                last_date
            )
        )

        holiday_dates = set()

        for holiday in holidays:

            holiday_date = holiday.get(
                "holiday_date"
            )

            if holiday_date:

                if hasattr(
                    holiday_date,
                    "date"
                ):
                    holiday_date = (
                        holiday_date.date()
                    )

                holiday_dates.add(
                    holiday_date
                )

        holiday_count = len(
            holiday_dates
        )

        # -----------------------------------------------------
        # APPROVED LEAVES
        # -----------------------------------------------------

        leaves = (
            self.repository
            .get_leaves(
                emp_id,
                first_date,
                last_date
            )
        )

        availed_leave = Decimal(
            "0"
        )

        lop_absent = Decimal(
            "0"
        )

        for leave in leaves:

            leave_from = leave.get(
                "leave_from"
            )

            leave_to = leave.get(
                "leave_to"
            )

            if not leave_from or not leave_to:
                continue

            if hasattr(
                leave_from,
                "date"
            ):
                leave_from = (
                    leave_from.date()
                )

            if hasattr(
                leave_to,
                "date"
            ):
                leave_to = (
                    leave_to.date()
                )

            effective_from = max(
                leave_from,
                first_date
            )

            effective_to = min(
                leave_to,
                last_date
            )

            if effective_from > effective_to:
                continue

            days = self.decimal(
                leave.get(
                    "no_of_days"
                )
            )

            if days <= 0:

                days = Decimal(
                    (
                        effective_to
                        - effective_from
                    ).days + 1
                )

            leave_type = str(
                leave.get(
                    "leave_type"
                )
                or ""
            ).lower()

            availed_leave += days

            if "lop" in leave_type:

                lop_absent += days

        # -----------------------------------------------------
        # DAY PAID
        # -----------------------------------------------------

        day_paid = (
            working_days
            + weekends
            + holiday_count
        )

        if day_paid > days_in_month:

            day_paid = days_in_month

        # -----------------------------------------------------
        # DAILY SALARY
        # -----------------------------------------------------

        daily_salary = (
            salary
            / Decimal(days_in_month)
        )

        total_earnings = (
            daily_salary
            * Decimal(day_paid)
        )

        # -----------------------------------------------------
        # BASIC
        # -----------------------------------------------------

        basic_percentage = self.decimal(
            setting.get(
                "basic_earning"
            )
        )

        basic = (
            total_earnings
            * basic_percentage
            / Decimal("100")
        )

        # -----------------------------------------------------
        # HRA
        # -----------------------------------------------------

        hra_percentage = self.decimal(
            setting.get(
                "hra"
            )
        )

        hra = (
            basic
            * hra_percentage
            / Decimal("100")
        )

        # -----------------------------------------------------
        # CONVEYANCE
        # -----------------------------------------------------

        conveyance = self.decimal(
            setting.get(
                "conveyance_allowance"
            )
        )

        # -----------------------------------------------------
        # SPECIAL
        # -----------------------------------------------------

        special_allowance = (
            total_earnings
            - basic
            - hra
            - conveyance
        )

        # -----------------------------------------------------
        # DEDUCTIONS
        # -----------------------------------------------------

        pf = self.decimal(
            setting.get(
                "provident_fund"
            )
        )

        esic = self.decimal(
            setting.get(
                "esic"
            )
        )

        pt = self.decimal(
            setting.get(
                "professional_tax"
            )
        )

        other_earning = Decimal(
            "0"
        )

        night_allowance = Decimal(
            "0"
        )

        other_deduction = Decimal(
            "0"
        )

        pf_employer = Decimal(
            "0"
        )

        total_deduction = (
            pf
            + esic
            + pt
            + other_deduction
        )

        net_pay = (
            total_earnings
            - total_deduction
        )

        # -----------------------------------------------------
        # LEAVE BALANCE
        # -----------------------------------------------------

        balance_leave = Decimal(
            "0"
        )

        leave_balance = (
            self.repository
            .get_leave_balance(
                employee.get("emp_code"),
                year
            )
        )

        if leave_balance:

            balance_leave = (
                self.decimal(
                    leave_balance.get(
                        "remained_paid_leave"
                    )
                )
                +
                self.decimal(
                    leave_balance.get(
                        "remained_casual_leave"
                    )
                )
                +
                self.decimal(
                    leave_balance.get(
                        "remained_comp_off"
                    )
                )
            )

        return {

            "Salary": salary,

            "Day_Paid": day_paid,

            "LOP_Absent": lop_absent,

            "Basic": basic,

            "HRA": hra,

            "Conveyance_Allowance": conveyance,

            "Special_Allowance": special_allowance,

            "Other_Earning": other_earning,

            "Night_Allowance": night_allowance,

            "PF": pf,

            "PF_Employer": pf_employer,

            "ESIC": esic,

            "PT": pt,

            "Other_Deduction": other_deduction,

            "Total_Earnings": total_earnings,

            "Total_Deduction": total_deduction,

            "Net_Pay": net_pay,

            "Availed_leave": availed_leave,

            "Balance_leave": balance_leave
        }

    # =========================================================
    # GENERATE
    # =========================================================

    def generate_payslip(
        self,
        emp_id: int,
        year: int,
        month: int
    ):

        existing = (
            self.repository
            .get_existing_payslip(
                emp_id,
                year,
                month
            )
        )

        if existing:

            raise ValueError(
                "Payslip already generated "
                "for this employee and month"
            )

        calculation = (
            self.calculate_salary(
                emp_id,
                year,
                month
            )
        )

        data = {

            "month": date(
                year,
                month,
                1
            ),

            "emp_id": emp_id,

            "salary": calculation[
                "Salary"
            ],

            "day_paid": calculation[
                "Day_Paid"
            ],

            "lop_absent": calculation[
                "LOP_Absent"
            ],

            "basic": calculation[
                "Basic"
            ],

            "hra": calculation[
                "HRA"
            ],

            "conveyance_allowance":
                calculation[
                    "Conveyance_Allowance"
                ],

            "special_allowance":
                calculation[
                    "Special_Allowance"
                ],

            "other_earning":
                calculation[
                    "Other_Earning"
                ],

            "pf": calculation[
                "PF"
            ],

            "esic": calculation[
                "ESIC"
            ],

            "pt": calculation[
                "PT"
            ],

            "other_deduction":
                calculation[
                    "Other_Deduction"
                ],

            "total_earnings":
                calculation[
                    "Total_Earnings"
                ],

            "total_deduction":
                calculation[
                    "Total_Deduction"
                ],

            "net_pay":
                calculation[
                    "Net_Pay"
                ],

            "availed_leave":
                calculation[
                    "Availed_leave"
                ],

            "balance_leave":
                calculation[
                    "Balance_leave"
                ],

            "night_allowance":
                calculation[
                    "Night_Allowance"
                ],

            "pf_employer":
                calculation[
                    "PF_Employer"
                ],

            "createdon":
                datetime.now()
        }

        payslip_id = (
            self.repository
            .create_payslip(
                data
            )
        )

        return {
            "id": payslip_id,
            **calculation
        }


        # =========================================================
    # NORMALIZE FULL PAYSLIP RESPONSE
    # =========================================================

    def normalize_payslip_response(self, data: dict):

        if not data:
            return None

        employee = data.get("employee") or {}
        personal = data.get("personal") or {}
        bank = data.get("bank") or {}
        salary_details = data.get("salary_details") or {}
        company = data.get("company") or {}
        designation = data.get("designation") or {}
        department = data.get("department") or {}

        first_name = employee.get("first_name") or ""
        last_name = employee.get("last_name") or ""

        employee_name = (
            f"{first_name} {last_name}"
        ).strip()

        return {
            # -------------------------------------------------
            # EXISTING PAYSLIP DATA
            # -------------------------------------------------

            **data,

            # -------------------------------------------------
            # EMPLOYEE DETAILS
            # -------------------------------------------------

            "emp_id": data.get("emp_id"),

            "emp_code": employee.get("emp_code"),

            "first_name": first_name,

            "last_name": last_name,

            "employee_name": employee_name,

            "doj": employee.get("doj"),

            "location": employee.get(
                "company_location"
            ),

            # -------------------------------------------------
            # PERSONAL DETAILS
            # -------------------------------------------------

            "pan_no": personal.get("pan_no"),

            "aadhar_no": personal.get("aadhar_no"),

            "passport_no": personal.get("passport_no"),

            "email": personal.get("email"),

            "phone": personal.get("phone"),

            "current_address": personal.get(
                "current_address"
            ),

            "permanent_address": personal.get(
                "permanent_address"
            ),

            # -------------------------------------------------
            # BANK DETAILS
            # -------------------------------------------------

            "bank_name": bank.get("bank_name"),

            "account_no": bank.get("account_no"),

            "ifsc_code": bank.get("ifsc_code"),

            # -------------------------------------------------
            # SALARY DETAILS
            # -------------------------------------------------

            "uan": salary_details.get("uan"),

            "esic_no": salary_details.get("esic"),

            "mode_pay": salary_details.get("mode_pay"),

            "pay_mode": data.get("pay_mode"),

            # -------------------------------------------------
            # DESIGNATION AND DEPARTMENT
            # -------------------------------------------------

            "designation_name": designation.get("name"),

            "department_name": department.get("name"),

            # -------------------------------------------------
            # COMPANY DETAILS
            # -------------------------------------------------

            "company_logo": company.get("company_logo"),

            "company_name": company.get("company_name"),

            "company_address": company.get(
                "company_address"
            ),

            "company_contact": company.get(
                "company_contact"
            )
        }

    # =========================================================
    # DETAIL
    # =========================================================

    def get_payslip(
        self,
        payslip_id: int
    ):

        data = (
            self.repository
            .get_full_payslip(
                payslip_id
            )
        )

        if not data:
            return None

        return self.normalize_payslip_response(
            data
        )

    # =========================================================
    # PDF
    # =========================================================

    def generate_pdf(
        self,
        payslip_id: int
    ):

        data = self.get_payslip(
            payslip_id
        )

        if not data:

            raise ValueError(
                "Payslip not found"
            )

        payslip = data
        employee = (
            data.get("employee")
            or {}
        )

        company = (
            data.get("company")
            or {}
        )

        department = (
            data.get("department")
            or {}
        )

        designation = (
            data.get("designation")
            or {}
        )

        buffer = BytesIO()

        document = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=20 * mm,
            rightMargin=20 * mm,
            topMargin=15 * mm,
            bottomMargin=15 * mm
        )

        styles = getSampleStyleSheet()

        story = []

        company_name = (
            company.get(
                "company_name"
            )
            or "Company"
        )

        story.append(
            Paragraph(
                f"<b>{company_name}</b>",
                styles["Title"]
            )
        )

        story.append(
            Spacer(
                1,
                5
            )
        )

        story.append(
            Paragraph(
                str(
                    company.get(
                        "company_address"
                    )
                    or ""
                ),
                styles["Normal"]
            )
        )

        story.append(
            Paragraph(
                str(
                    company.get(
                        "company_contact"
                    )
                    or ""
                ),
                styles["Normal"]
            )
        )

        story.append(
            Spacer(
                1,
                10
            )
        )

        month_value = payslip.get(
            "month"
        )

        month_text = ""

        if month_value:

            if hasattr(
                month_value,
                "strftime"
            ):

                month_text = (
                    month_value.strftime(
                        "%B %Y"
                    )
                )

            else:

                month_text = str(
                    month_value
                )

        story.append(
            Paragraph(
                f"<b>PAYSLIP - {month_text}</b>",
                styles["Heading2"]
            )
        )

        story.append(
            Spacer(
                1,
                10
            )
        )

        employee_name = (
            f"{employee.get('first_name') or ''} "
            f"{employee.get('last_name') or ''}"
        ).strip()

        employee_table = Table(
            [
                [
                    "Employee Name",
                    employee_name
                ],
                [
                    "Employee ID",
                    employee.get(
                        "emp_code"
                    ) or ""
                ],
                [
                    "Department",
                    department.get(
                        "name"
                    ) or ""
                ],
                [
                    "Designation",
                    designation.get(
                        "name"
                    ) or ""
                ],
                [
                    "Payment Mode",
                    data.get(
                        "pay_mode"
                    ) or "Other"
                ],
                [
                    "Day Paid",
                    str(
                        payslip.get(
                            "day_paid"
                        )
                        or 0
                    )
                ],
                [
                    "LOP / Absent",
                    str(
                        payslip.get(
                            "lop_absent"
                        )
                        or 0
                    )
                ]
            ],
            colWidths=[
                50 * mm,
                120 * mm
            ]
        )

        employee_table.setStyle(
            TableStyle([
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.lightgrey
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP"
                )
            ])
        )

        story.append(
            employee_table
        )

        story.append(
            Spacer(
                1,
                12
            )
        )

        def amount(field):

            value = self.decimal(
                payslip.get(field)
            )

            return f"{value:.2f}"

        earnings = Table(
            [
                ["Earnings", "Amount"],

                ["Basic", amount("basic")],

                ["HRA", amount("hra")],

                [
                    "Conveyance Allowance",
                    amount(
                        "conveyance_allowance"
                    )
                ],

                [
                    "Special Allowance",
                    amount(
                        "special_allowance"
                    )
                ],

                [
                    "Other Earnings",
                    amount(
                        "other_earning"
                    )
                ],

                [
                    "Night Allowance",
                    amount(
                        "night_allowance"
                    )
                ],

                [
                    "Total Earnings",
                    amount(
                        "total_earnings"
                    )
                ]
            ],
            colWidths=[
                120 * mm,
                50 * mm
            ]
        )

        earnings.setStyle(
            TableStyle([
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.lightgrey
                ),
                (
                    "BACKGROUND",
                    (0, -1),
                    (-1, -1),
                    colors.lightgrey
                )
            ])
        )

        story.append(
            earnings
        )

        story.append(
            Spacer(
                1,
                12
            )
        )

        deductions = Table(
            [
                ["Deductions", "Amount"],

                ["PF", amount("pf")],

                ["ESIC", amount("esic")],

                ["Professional Tax", amount("pt")],

                [
                    "Other Deduction",
                    amount(
                        "other_deduction"
                    )
                ],

                [
                    "Total Deduction",
                    amount(
                        "total_deduction"
                    )
                ],

                [
                    "Net Pay",
                    amount("net_pay")
                ]
            ],
            colWidths=[
                120 * mm,
                50 * mm
            ]
        )

        deductions.setStyle(
            TableStyle([
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.lightgrey
                ),
                (
                    "BACKGROUND",
                    (0, -2),
                    (-1, -1),
                    colors.lightgrey
                )
            ])
        )

        story.append(
            deductions
        )

        story.append(
            Spacer(
                1,
                15
            )
        )

        story.append(
            Paragraph(
                "<b>This is a system generated payslip.</b>",
                styles["Normal"]
            )
        )

        document.build(
            story
        )

        buffer.seek(0)

        return buffer.read()

    # =========================================================
    # DELETE
    # =========================================================

    def delete_payslip(
        self,
        payslip_id: int
    ):

        existing = (
            self.repository
            .get_payslip(
                payslip_id
            )
        )

        if not existing:

            raise ValueError(
                "Payslip not found"
            )

        self.repository.delete_payslip(
            payslip_id
        )

        return {
            "id": payslip_id
        }

    # =========================================================
    # PAYROLL SETTINGS
    # =========================================================

    def get_payroll_settings(self):

        return (
            self.repository
            .get_payroll_setting()
        )

    # =========================================================
    # UPDATE SETTINGS
    # =========================================================

    def update_payroll_settings(
        self,
        data: dict
    ):

        setting_id = (
            self.repository
            .update_payroll_setting(
                data
            )
        )

        return {
            "id": setting_id
        }