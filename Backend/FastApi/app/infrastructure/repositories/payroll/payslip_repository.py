from datetime import datetime
from typing import Optional

from sqlalchemy import MetaData, Table, select, func, and_
from sqlalchemy.orm import Session


class PayslipRepository:

    def __init__(self, db: Session):
        self.db = db

        # IMPORTANT:
        # Your get_transactional_db returns normal Session.
        # Do NOT use db.sync_session.

        self.metadata = MetaData()

        self.employee = Table(
            "employee_detail",
            self.metadata,
            autoload_with=db.get_bind()
        )

        self.employee_salary = Table(
            "employee_salary",
            self.metadata,
            autoload_with=db.get_bind()
        )

        self.employee_bank = Table(
            "employee_bank",
            self.metadata,
            autoload_with=db.get_bind()
        )

        self.employee_personal = Table(
            "employee_personal",
            self.metadata,
            autoload_with=db.get_bind()
        )

        self.employee_leave_balance = Table(
            "employee_leave_balance",
            self.metadata,
            autoload_with=db.get_bind()
        )

        self.leave_log = Table(
            "leave_log",
            self.metadata,
            autoload_with=db.get_bind()
        )

        self.holiday = Table(
            "holiday",
            self.metadata,
            autoload_with=db.get_bind()
        )

        self.timesheet = Table(
            "timesheet",
            self.metadata,
            autoload_with=db.get_bind()
        )

        self.payroll_setting = Table(
            "payroll_setting",
            self.metadata,
            autoload_with=db.get_bind()
        )

        self.payslip = Table(
            "payslip",
            self.metadata,
            autoload_with=db.get_bind()
        )

        self.designation = Table(
            "designation",
            self.metadata,
            autoload_with=db.get_bind()
        )

        self.department = Table(
            "department",
            self.metadata,
            autoload_with=db.get_bind()
        )

    # =========================================================
    # EMPLOYEES
    # =========================================================

    def get_employees(self):

        stmt = (
            select(
                self.employee.c.id,
                self.employee.c.emp_code,
                self.employee.c.first_name,
                self.employee.c.last_name
            )
            .where(
                self.employee.c.is_remove == 0
            )
            .order_by(
                self.employee.c.first_name
            )
        )

        rows = self.db.execute(stmt).fetchall()

        result = []

        for row in rows:

            first_name = row.first_name or ""
            last_name = row.last_name or ""

            result.append({
                "id": row.id,
                "emp_id": row.id,
                "emp_code": row.emp_code,
                "first_name": first_name,
                "last_name": last_name,
                "employee_name": (
                    f"{first_name} {last_name}"
                ).strip()
            })

        return result

    # =========================================================
    # EMPLOYEE BY ID
    # =========================================================

    def get_employee(self, emp_id: int):

        stmt = select(
            self.employee
        ).where(
            self.employee.c.id == emp_id
        )

        row = self.db.execute(stmt).first()

        if not row:
            return None

        return dict(row._mapping)

    # =========================================================
    # EMPLOYEE BY CODE
    # =========================================================

    def get_employee_by_code(
        self,
        emp_code: str
    ):

        stmt = select(
            self.employee
        ).where(
            self.employee.c.emp_code == emp_code
        )

        row = self.db.execute(stmt).first()

        if not row:
            return None

        return dict(row._mapping)

    # =========================================================
    # SALARY
    # =========================================================

    def get_employee_salary(
        self,
        emp_id: int
    ):

        stmt = (
            select(
                self.employee_salary
            )
            .where(
                self.employee_salary.c.emp_id
                == emp_id
            )
            .order_by(
                self.employee_salary.c.id.desc()
            )
        )

        row = self.db.execute(stmt).first()

        if not row:
            return None

        return dict(row._mapping)

    # =========================================================
    # PAYROLL SETTING
    # =========================================================

    def get_payroll_setting(self):

        stmt = (
            select(
                self.payroll_setting
            )
            .order_by(
                self.payroll_setting.c.id.desc()
            )
        )

        row = self.db.execute(stmt).first()

        if not row:
            return None

        return dict(row._mapping)

    # =========================================================
    # CHECK PAYSLIP
    # =========================================================

    def get_existing_payslip(
        self,
        emp_id: int,
        year: int,
        month: int
    ):

        stmt = (
            select(
                self.payslip
            )
            .where(
                and_(
                    self.payslip.c.emp_id == emp_id,
                    func.extract(
                        "year",
                        self.payslip.c.month
                    ) == year,
                    func.extract(
                        "month",
                        self.payslip.c.month
                    ) == month
                )
            )
            .order_by(
                self.payslip.c.id.desc()
            )
        )

        row = self.db.execute(stmt).first()

        if not row:
            return None

        return dict(row._mapping)

    # =========================================================
    # HOLIDAYS
    # =========================================================

    def get_holidays(
        self,
        first_date,
        last_date
    ):

        stmt = (
            select(
                self.holiday
            )
            .where(
                and_(
                    self.holiday.c.holiday_date
                    >= first_date,

                    self.holiday.c.holiday_date
                    <= last_date,

                    self.holiday.c.status == 1
                )
            )
        )

        rows = self.db.execute(stmt).fetchall()

        return [
            dict(row._mapping)
            for row in rows
        ]

    # =========================================================
    # TIMESHEET
    # =========================================================

    def get_timesheets(
        self,
        emp_id: int,
        first_date,
        last_date
    ):

        stmt = (
            select(
                self.timesheet
            )
            .where(
                and_(
                    self.timesheet.c.emp_id == emp_id,

                    self.timesheet.c.date
                    >= first_date,

                    self.timesheet.c.date
                    <= last_date
                )
            )
        )

        rows = self.db.execute(stmt).fetchall()

        return [
            dict(row._mapping)
            for row in rows
        ]

    # =========================================================
    # LEAVE LOG
    # =========================================================

    def get_leaves(
        self,
        emp_id: int,
        first_date,
        last_date
    ):

        stmt = (
            select(
                self.leave_log
            )
            .where(
                and_(
                    self.leave_log.c.emp_id == emp_id,

                    self.leave_log.c.leave_from
                    <= last_date,

                    self.leave_log.c.leave_to
                    >= first_date,

                    # Only approved leaves should affect
                    # payslip calculation.
                    self.leave_log.c.status == 1
                )
            )
        )

        rows = self.db.execute(stmt).fetchall()

        return [
            dict(row._mapping)
            for row in rows
        ]

    # =========================================================
    # LEAVE BALANCE
    # =========================================================

    def get_leave_balance(
        self,
        emp_code: str,
        year: int
    ):

        stmt = (
            select(
                self.employee_leave_balance
            )
            .where(
                and_(
                    self.employee_leave_balance.c.emp_id
                    == emp_code,

                    self.employee_leave_balance.c.year
                    == str(year)
                )
            )
            .order_by(
                self.employee_leave_balance.c.id.desc()
            )
        )

        row = self.db.execute(stmt).first()

        if not row:
            return None

        return dict(row._mapping)

    # =========================================================
    # CREATE PAYSLIP
    # =========================================================

    def create_payslip(
        self,
        data: dict
    ):

        allowed_columns = {
            column.name
            for column in self.payslip.columns
        }

        insert_data = {
            key: value
            for key, value in data.items()
            if key in allowed_columns
        }

        result = self.db.execute(
            self.payslip.insert().values(
                **insert_data
            )
        )

        self.db.flush()

        return result.inserted_primary_key[0]

    # =========================================================
    # GET PAYSLIP
    # =========================================================

    def get_payslip(
        self,
        payslip_id: int
    ):

        stmt = (
            select(
                self.payslip
            )
            .where(
                self.payslip.c.id == payslip_id
            )
        )

        row = self.db.execute(stmt).first()

        if not row:
            return None

        return dict(row._mapping)

    # =========================================================
    # LIST PAYSLIPS
    # =========================================================

    def get_payslips(
        self,
        emp_id: Optional[int] = None,
        year: Optional[int] = None,
        month: Optional[int] = None
    ):

        stmt = (
            select(
                self.payslip,
                self.employee.c.emp_code,
                self.employee.c.first_name,
                self.employee.c.last_name
            )
            .select_from(
                self.payslip.join(
                    self.employee,
                    self.payslip.c.emp_id
                    == self.employee.c.id
                )
            )
        )

        conditions = []

        if emp_id is not None:

            conditions.append(
                self.payslip.c.emp_id == emp_id
            )

        if year is not None:

            conditions.append(
                func.extract(
                    "year",
                    self.payslip.c.month
                ) == year
            )

        if month is not None:

            conditions.append(
                func.extract(
                    "month",
                    self.payslip.c.month
                ) == month
            )

        if conditions:

            stmt = stmt.where(
                and_(*conditions)
            )

        stmt = stmt.order_by(
            self.payslip.c.month.desc()
        )

        rows = self.db.execute(stmt).fetchall()

        return [
            dict(row._mapping)
            for row in rows
        ]


        # =========================================================
    # PAYSLIPS BY EMPLOYEE ID
    # =========================================================

    def get_payslips_by_employee_id(
        self,
        emp_id: int
    ):

        stmt = (
            select(
                self.payslip,
                self.employee.c.emp_code,
                self.employee.c.first_name,
                self.employee.c.last_name
            )
            .select_from(
                self.payslip.join(
                    self.employee,
                    self.payslip.c.emp_id
                    == self.employee.c.id
                )
            )
            .where(
                self.payslip.c.emp_id == emp_id
            )
            .order_by(
                self.payslip.c.month.desc()
            )
        )

        rows = self.db.execute(stmt).fetchall()

        return [
            dict(row._mapping)
            for row in rows
        ]

    # =========================================================
    # PAYSLIPS BY EMPLOYEE CODE
    # =========================================================

    def get_payslips_by_employee_code(
        self,
        emp_code: str
    ):

        stmt = (
            select(
                self.payslip,
                self.employee.c.emp_code,
                self.employee.c.first_name,
                self.employee.c.last_name
            )
            .select_from(
                self.payslip.join(
                    self.employee,
                    self.payslip.c.emp_id
                    == self.employee.c.id
                )
            )
            .where(
                self.employee.c.emp_code == emp_code
            )
            .order_by(
                self.payslip.c.month.desc()
            )
        )

        rows = self.db.execute(stmt).fetchall()

        return [
            dict(row._mapping)
            for row in rows
        ]

    # =========================================================
    # FULL PAYSLIP
    # =========================================================

    def get_full_payslip(
        self,
        payslip_id: int
    ):

        payslip = self.get_payslip(
            payslip_id
        )

        if not payslip:
            return None

        emp_id = payslip.get(
            "emp_id"
        )

        employee = self.get_employee(
            emp_id
        )

        salary = self.get_employee_salary(
            emp_id
        )

        personal = None

        stmt = (
            select(
                self.employee_personal
            )
            .where(
                self.employee_personal.c.emp_id
                == emp_id
            )
            .order_by(
                self.employee_personal.c.id.desc()
            )
        )

        row = self.db.execute(stmt).first()

        if row:
            personal = dict(
                row._mapping
            )

        bank = None

        stmt = (
            select(
                self.employee_bank
            )
            .where(
                self.employee_bank.c.emp_id
                == emp_id
            )
            .order_by(
                self.employee_bank.c.id.desc()
            )
        )

        row = self.db.execute(stmt).first()

        if row:
            bank = dict(
                row._mapping
            )

        setting = self.get_payroll_setting()

        designation = None
        department = None

        if employee:

            designation_id = employee.get(
                "designation"
            )

            if designation_id:

                stmt = select(
                    self.designation
                ).where(
                    self.designation.c.id
                    == designation_id
                )

                row = self.db.execute(
                    stmt
                ).first()

                if row:

                    designation = dict(
                        row._mapping
                    )

                    department_id = designation.get(
                        "depart_id"
                    )

                    if department_id:

                        stmt = select(
                            self.department
                        ).where(
                            self.department.c.id
                            == department_id
                        )

                        row = self.db.execute(
                            stmt
                        ).first()

                        if row:

                            department = dict(
                                row._mapping
                            )

        mode_pay = None

        if salary:
            mode_pay = salary.get(
                "mode_pay"
            )

        if mode_pay == 6:
            pay_mode = "Bank Transfer"
        elif mode_pay == 2:
            pay_mode = "Cash"
        elif mode_pay == 3:
            pay_mode = "Cheque"
        else:
            pay_mode = "Other"

        return {
            **payslip,

            "employee": employee,

            "salary_details": salary,

            "personal": personal,

            "bank": bank,

            "designation": designation,

            "department": department,

            "pay_mode": pay_mode,

            "company": setting
        }

    # =========================================================
    # DELETE
    # =========================================================

    def delete_payslip(
        self,
        payslip_id: int
    ):

        result = self.db.execute(
            self.payslip.delete()
            .where(
                self.payslip.c.id
                == payslip_id
            )
        )

        self.db.flush()

        return result.rowcount > 0

    # =========================================================
    # UPDATE PAYROLL SETTINGS
    # =========================================================

    def update_payroll_setting(
        self,
        data: dict
    ):

        setting = self.get_payroll_setting()

        if not setting:

            allowed = {
                column.name
                for column in self.payroll_setting.columns
            }

            insert_data = {
                key: value
                for key, value in data.items()
                if key in allowed
            }

            result = self.db.execute(
                self.payroll_setting.insert().values(
                    **insert_data
                )
            )

            self.db.flush()

            return result.inserted_primary_key[0]

        setting_id = setting["id"]

        allowed = {
            column.name
            for column in self.payroll_setting.columns
        }

        update_data = {
            key: value
            for key, value in data.items()
            if key in allowed
            and key != "id"
        }

        if update_data:

            self.db.execute(
                self.payroll_setting
                .update()
                .where(
                    self.payroll_setting.c.id
                    == setting_id
                )
                .values(
                    **update_data
                )
            )

            self.db.flush()

        return setting_id