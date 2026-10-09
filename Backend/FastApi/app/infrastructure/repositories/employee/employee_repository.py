from typing import Any, List, Optional

from sqlalchemy.orm import Session, aliased

from app.domain.interfaces.employee.employee_interface import (
    IEmployeeRepository,
)

from app.infrastructure.models.employee.employee import (
    EmployeeModel,
)

from app.infrastructure.models.user.user import (
    UserModel,
)

from app.infrastructure.models.employee.designation import (
    DesignationModel,
)

from app.infrastructure.models.employee.department import (
    DepartmentModel,
)


class EmployeeRepository(IEmployeeRepository):

    def get_active_employees(self) -> List[EmployeeModel]:
        return (
            self.db.query(EmployeeModel)
            .filter(
                EmployeeModel.is_remove == 0,
                EmployeeModel.email.isnot(None),
                EmployeeModel.email != "",
            )
            .order_by(
                EmployeeModel.first_name.asc(),
                EmployeeModel.last_name.asc(),
            )
            .all()
        )

    def __init__(self, db: Session):
        self.db = db

    # ======================================================
    # BASE QUERY
    # ======================================================

    def _base_query(self):

        ManagerModel = aliased(EmployeeModel)

        return (
            self.db.query(
                EmployeeModel,

                DesignationModel.name.label(
                    "designation_name"
                ),

                DepartmentModel.name.label(
                    "department_name"
                ),

                ManagerModel.first_name.label(
                    "manager_first_name"
                ),

                ManagerModel.last_name.label(
                    "manager_last_name"
                ),
            )

            .outerjoin(
                DesignationModel,
                EmployeeModel.designation
                == DesignationModel.id,
            )

            .outerjoin(
                DepartmentModel,
                DesignationModel.depart_id
                == DepartmentModel.id,
            )

            .outerjoin(
                ManagerModel,
                EmployeeModel.reporting_manager
                == ManagerModel.id,
            )
        )

    # ======================================================
    # GET ALL
    # ======================================================

    def get_all_with_details(self) -> List[Any]:

        return (
            self._base_query()
            .order_by(
                EmployeeModel.id.asc()
            )
            .all()
        )

    # ======================================================
    # GET BY ID WITH DETAILS
    # ======================================================

    def get_by_id_with_details(
        self,
        emp_id: int,
    ) -> Optional[Any]:

        return (
            self._base_query()
            .filter(
                EmployeeModel.id == emp_id
            )
            .first()
        )

    # ======================================================
    # GET BY EMP CODE WITH DETAILS
    # ======================================================

    def get_by_emp_code_with_details(
        self,
        emp_code: str,
    ) -> Optional[Any]:

        return (
            self._base_query()
            .filter(
                EmployeeModel.emp_code == emp_code
            )
            .first()
        )

    # ======================================================
    # GET LAST EMPLOYEE
    # ======================================================

    def get_last_employee(
        self,
    ) -> Optional[EmployeeModel]:

        return (
            self.db.query(EmployeeModel)
            .order_by(
                EmployeeModel.emp_code.desc()
            )
            .first()
        )

    # ======================================================
    # GET BY ID
    # ======================================================

    def get_by_id(
        self,
        emp_id: int,
    ) -> Optional[EmployeeModel]:

        return (
            self.db.query(EmployeeModel)
            .filter(
                EmployeeModel.id == emp_id
            )
            .first()
        )

    # ======================================================
    # GET USER BY USERNAME
    # ======================================================

    def get_user_by_username(
        self,
        username: str,
    ) -> Optional[UserModel]:

        return (
            self.db.query(UserModel)
            .filter(
                UserModel.username == username
            )
            .first()
        )

    # ======================================================
    # GET DESIGNATION BY NAME
    # ======================================================

    def get_designation_by_name(
        self,
        designation_name: str,
    ) -> Optional[DesignationModel]:

        if not designation_name:
            return None

        return (
            self.db.query(DesignationModel)
            .filter(
                DesignationModel.name.ilike(
                    designation_name.strip()
                )
            )
            .first()
        )

    # ======================================================
    # ADD EMPLOYEE
    # ======================================================

    def add_employee(
        self,
        employee: EmployeeModel,
    ) -> None:

        self.db.add(employee)

    # ======================================================
    # ADD USER
    # ======================================================

    def add_user(
        self,
        user: UserModel,
    ) -> None:

        self.db.add(user)

    # ======================================================
    # COMMIT
    # ======================================================

    def commit(self) -> None:

        self.db.commit()

    # ======================================================
    # FLUSH
    # ======================================================

    def flush(self) -> None:

        self.db.flush()