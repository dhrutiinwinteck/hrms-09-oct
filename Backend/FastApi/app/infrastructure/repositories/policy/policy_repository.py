from sqlalchemy.orm import Session

from app.domain.interfaces.policy.policy_interface import (
    IPolicyRepository,
)

from app.infrastructure.models.employee.employee import (
    EmployeeModel,
)

from app.infrastructure.models.policy.policy import (
    Policy,
)

from app.infrastructure.models.policy.policy_acceptance import (
    PolicyAcceptance,
)


class PolicyRepository(IPolicyRepository):
    """
    Repository for Policy and Policy Acceptance persistence.

    Transaction commits are managed by the service layer.
    """

    # ============================================================
    # GET ALL
    # ============================================================

    def get_all(
        self,
        db: Session,
        include_inactive: bool = True,
    ) -> list[Policy]:

        query = db.query(Policy)

        if not include_inactive:
            query = query.filter(
                Policy.is_active.is_(True)
            )

        return query.order_by(
            Policy.id.desc()
        ).all()

    # ============================================================
    # GET ACTIVE
    # ============================================================

    def get_active(
        self,
        db: Session,
    ) -> list[Policy]:

        return (
            db.query(Policy)
            .filter(
                Policy.is_active.is_(True)
            )
            .order_by(
                Policy.id.desc()
            )
            .all()
        )

    # ============================================================
    # GET BY ID
    # ============================================================

    def get_by_id(
        self,
        db: Session,
        policy_id: int,
    ) -> Policy | None:

        return (
            db.query(Policy)
            .filter(
                Policy.id == policy_id
            )
            .first()
        )

    # ============================================================
    # GET BY NAME
    # ============================================================

    def get_by_name(
        self,
        db: Session,
        policy_name: str,
    ) -> Policy | None:

        return (
            db.query(Policy)
            .filter(
                Policy.policy_name == policy_name
            )
            .first()
        )

    # ============================================================
    # CREATE
    # ============================================================

    def create(
        self,
        db: Session,
        policy: Policy,
    ) -> Policy:

        db.add(policy)
        db.flush()
        db.refresh(policy)

        return policy

    # ============================================================
    # UPDATE
    # ============================================================

    def update(
        self,
        db: Session,
        policy: Policy,
    ) -> Policy:

        db.add(policy)
        db.flush()
        db.refresh(policy)

        return policy

    # ============================================================
    # DELETE
    # ============================================================

    def delete(
        self,
        db: Session,
        policy: Policy,
    ) -> None:

        db.delete(policy)
        db.flush()

    # ============================================================
    # GET EMPLOYEE BY CODE
    # ============================================================

    def get_employee_by_code(
        self,
        db: Session,
        employee_code: str,
    ) -> EmployeeModel | None:

        return (
            db.query(EmployeeModel)
            .filter(
                EmployeeModel.emp_code == employee_code
            )
            .first()
        )

    # ============================================================
    # GET EMPLOYEE NAMES BY CODES
    # ============================================================

    def get_employee_names_by_codes(
        self,
        db: Session,
        employee_codes: set[str],
    ) -> dict[str, str]:

        if not employee_codes:
            return {}

        employees = (
            db.query(EmployeeModel)
            .filter(
                EmployeeModel.emp_code.in_(
                    employee_codes
                )
            )
            .all()
        )

        employee_names: dict[str, str] = {}

        for employee in employees:

            if not employee.emp_code:
                continue

            first_name = (
                employee.first_name or ""
            ).strip()

            last_name = (
                employee.last_name or ""
            ).strip()

            full_name = (
                f"{first_name} {last_name}"
            ).strip()

            employee_names[
                employee.emp_code
            ] = full_name or employee.emp_code

        return employee_names

    # ============================================================
    # GET EMPLOYEE BY ID
    # ============================================================

    def get_employee_by_id(
        self,
        db: Session,
        employee_id: int,
    ) -> EmployeeModel | None:

        return (
            db.query(EmployeeModel)
            .filter(
                EmployeeModel.id == employee_id
            )
            .first()
        )

    # ============================================================
    # GET ACCEPTANCE
    # ============================================================

    def get_acceptance(
        self,
        db: Session,
        employee_id: int,
        policy_id: int,
        version: int,
    ) -> PolicyAcceptance | None:

        return (
            db.query(PolicyAcceptance)
            .filter(
                PolicyAcceptance.employee_id
                == employee_id,

                PolicyAcceptance.policy_id
                == policy_id,

                PolicyAcceptance.version
                == version,
            )
            .first()
        )

    # ============================================================
    # GET EMPLOYEE ACCEPTANCES
    # ============================================================

    def get_employee_acceptances(
        self,
        db: Session,
        employee_id: int,
    ) -> list[PolicyAcceptance]:

        return (
            db.query(PolicyAcceptance)
            .filter(
                PolicyAcceptance.employee_id
                == employee_id
            )
            .order_by(
                PolicyAcceptance.id.desc()
            )
            .all()
        )

    # ============================================================
    # CREATE ACCEPTANCE
    # ============================================================

    def create_acceptance(
        self,
        db: Session,
        acceptance: PolicyAcceptance,
    ) -> PolicyAcceptance:

        db.add(acceptance)
        db.flush()
        db.refresh(acceptance)

        return acceptance