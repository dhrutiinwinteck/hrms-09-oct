import uuid

from fastapi import HTTPException

from app.domain.interfaces.employee.employee_interface import (
    IEmployeeRepository,
)

from app.infrastructure.models.employee.employee import (
    EmployeeModel,
)

from app.infrastructure.models.user.user import (
    UserModel,
)

from app.application.dtos.employee.employee import (
    EmployeeCreate,
    EmployeeUpdate,
)

from app.core.security import get_password_hash


class EmployeeService:

    def __init__(
        self,
        repo: IEmployeeRepository,
    ):

        self.repo = repo

    # ======================================================
    # GET ALL EMPLOYEES
    # ======================================================

    def list_all(self):

        results = (
            self.repo.get_all_with_details()
        )

        return [
            self._format_employee_row(row)
            for row in results
        ]

    # ======================================================
    # CREATE EMPLOYEE
    # ======================================================

    def create_employee(
        self,
        data: EmployeeCreate,
    ):

        # --------------------------------------------------
        # FIND DESIGNATION BY NAME
        # --------------------------------------------------

        designation = (
            self.repo.get_designation_by_name(
                data.designation
            )
        )

        if not designation:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Designation '{data.designation}' "
                    "not found"
                ),
            )

        # --------------------------------------------------
        # GENERATE EMPLOYEE CODE
        # --------------------------------------------------

        new_code = (
            self._generate_emp_code()
        )

        # --------------------------------------------------
        # PREPARE EMPLOYEE DATA
        # --------------------------------------------------

        employee_data = data.model_dump(
            exclude={
                "password",
                "designation",
            }
        )

        new_emp = EmployeeModel(
            emp_code=new_code,
            designation=designation.id,
            **employee_data,
            is_remove=0,
        )

        self.repo.add_employee(new_emp)

        self.repo.flush()

        # --------------------------------------------------
        # CREATE USER
        # --------------------------------------------------

        new_user = UserModel(
            id=str(uuid.uuid4()),
            username=new_code,
            email=data.email,
            passwordhash=get_password_hash(
                data.password
            ),
            status=1,
        )

        self.repo.add_user(new_user)

        self.repo.commit()

        # --------------------------------------------------
        # RETURN CREATED EMPLOYEE
        # --------------------------------------------------

        return self.get_employee_profile(
            new_code
        )

    # ======================================================
    # UPDATE EMPLOYEE
    # ======================================================

    def update_employee(
        self,
        emp_id: int,
        data: EmployeeUpdate,
    ):

        db_emp = (
            self.repo.get_by_id(emp_id)
        )

        if not db_emp:

            raise HTTPException(
                status_code=404,
                detail="Employee not found",
            )

        update_data = data.model_dump(
            exclude_unset=True
        )

        # --------------------------------------------------
        # CONVERT DESIGNATION NAME TO ID
        # --------------------------------------------------

        if "designation" in update_data:

            designation_name = (
                update_data["designation"]
            )

            if designation_name:

                designation = (
                    self.repo.get_designation_by_name(
                        designation_name
                    )
                )

                if not designation:

                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Designation "
                            f"'{designation_name}' "
                            "not found"
                        ),
                    )

                update_data["designation"] = (
                    designation.id
                )

            else:

                update_data["designation"] = None

        # --------------------------------------------------
        # UPDATE EMPLOYEE FIELDS
        # --------------------------------------------------

        for key, value in update_data.items():

            setattr(
                db_emp,
                key,
                value
            )

        self.repo.commit()

        updated_employee = (
            self.repo.get_by_id_with_details(
                emp_id
            )
        )

        if not updated_employee:

            raise HTTPException(
                status_code=404,
                detail="Updated employee not found",
            )

        return self._format_employee_row(
            updated_employee
        )

    # ======================================================
    # DELETE / DEACTIVATE
    # ======================================================

    def delete_employee(
        self,
        emp_id: int,
    ):

        db_emp = (
            self.repo.get_by_id(emp_id)
        )

        if not db_emp:

            raise HTTPException(
                status_code=404,
                detail="Employee not found",
            )

        db_emp.is_remove = 1

        db_user = (
            self.repo.get_user_by_username(
                db_emp.emp_code
            )
        )

        if db_user:

            db_user.status = 0

        self.repo.commit()

        return {
            "detail": (
                "Employee deactivated successfully"
            )
        }

    # ======================================================
    # GET PROFILE BY EMP CODE
    # ======================================================

    def get_employee_profile(
        self,
        emp_code: str,
    ):

        result = (
            self.repo.get_by_emp_code_with_details(
                emp_code
            )
        )

        if not result:

            raise HTTPException(
                status_code=404,
                detail="Employee not found",
            )

        return self._format_employee_row(
            result
        )

    # ======================================================
    # GENERATE EMP CODE
    # ======================================================

    def _generate_emp_code(
        self,
    ) -> str:

        last_emp = (
            self.repo.get_last_employee()
        )

        if (
            last_emp
            and last_emp.emp_code
            and last_emp.emp_code.startswith("IWT")
        ):

            try:

                last_num = int(
                    last_emp.emp_code.replace(
                        "IWT",
                        ""
                    )
                )

                return f"IWT{last_num + 1}"

            except ValueError:

                return (
                    f"IWT"
                    f"{uuid.uuid4().hex[:4].upper()}"
                )

        return "IWT1001"

    # ======================================================
    # FORMAT EMPLOYEE
    # ======================================================

    def _format_employee_row(
        self,
        row,
    ) -> dict:

        (
            emp,
            desig,
            dept,
            m_first,
            m_last,
        ) = row

        manager_name = (
            f"{m_first or ''} "
            f"{m_last or ''}"
        ).strip() or None

        full_name = (
            f"{emp.first_name or ''} "
            f"{emp.last_name or ''}"
        ).strip()

        return {

            "id": emp.id,

            "emp_code": emp.emp_code,

            "first_name": emp.first_name,

            "last_name": emp.last_name,

            "full_name": full_name,

            "email": emp.email,

            "phone": emp.phone,

            "designation": desig,

            "department": dept,

            "reporting_manager": manager_name,

            "doj": emp.doj,

            "photo": emp.photo,

            "gender": emp.gender,

            "is_remove": emp.is_remove,

            "emp_type": emp.emp_type,

            "company_name": emp.company_name,

            "company_location": emp.company_location,

            "company_country": emp.company_country,

            "project": emp.project,

            "contract_period": emp.contract_period,

            "notice_period": emp.notice_period,

            "personal_email": emp.personal_email,

            "createdon": emp.createdon,

            "createdby": emp.createdby,

            "modifiedby": emp.modifiedby,

            "modifiedon": emp.modifiedon,

        }