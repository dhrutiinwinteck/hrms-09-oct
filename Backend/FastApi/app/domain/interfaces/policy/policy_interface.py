from abc import ABC, abstractmethod
from typing import TYPE_CHECKING, Optional


if TYPE_CHECKING:

    from sqlalchemy.orm import Session

    from app.infrastructure.models.employee.employee import (
        EmployeeModel,
    )

    from app.infrastructure.models.policy.policy import (
        Policy,
    )

    from app.infrastructure.models.policy.policy_acceptance import (
        PolicyAcceptance,
    )


class IPolicyRepository(ABC):
    """
    Repository contract for Policy persistence.

    Responsibilities:

        - Policy CRUD
        - Employee lookup
        - Creator lookup
        - Policy acceptance persistence
        - Employee acceptance history
    """

    # ============================================================
    # GET ALL
    # ============================================================

    @abstractmethod
    def get_all(
        self,
        db: "Session",
        include_inactive: bool = True,
    ) -> list["Policy"]:
        pass

    # ============================================================
    # GET ACTIVE
    # ============================================================

    @abstractmethod
    def get_active(
        self,
        db: "Session",
    ) -> list["Policy"]:
        pass

    # ============================================================
    # GET BY ID
    # ============================================================

    @abstractmethod
    def get_by_id(
        self,
        db: "Session",
        policy_id: int,
    ) -> Optional["Policy"]:
        pass

    # ============================================================
    # GET BY NAME
    # ============================================================

    @abstractmethod
    def get_by_name(
        self,
        db: "Session",
        policy_name: str,
    ) -> Optional["Policy"]:
        pass

    # ============================================================
    # CREATE
    # ============================================================

    @abstractmethod
    def create(
        self,
        db: "Session",
        policy: "Policy",
    ) -> "Policy":
        pass

    # ============================================================
    # UPDATE
    # ============================================================

    @abstractmethod
    def update(
        self,
        db: "Session",
        policy: "Policy",
    ) -> "Policy":
        pass

    # ============================================================
    # DELETE
    # ============================================================

    @abstractmethod
    def delete(
        self,
        db: "Session",
        policy: "Policy",
    ) -> None:
        pass

    # ============================================================
    # GET EMPLOYEE BY CODE
    # ============================================================

    @abstractmethod
    def get_employee_by_code(
        self,
        db: "Session",
        employee_code: str,
    ) -> Optional["EmployeeModel"]:
        pass

    # ============================================================
    # GET EMPLOYEE NAMES BY CODES
    # ============================================================

    @abstractmethod
    def get_employee_names_by_codes(
        self,
        db: "Session",
        employee_codes: set[str],
    ) -> dict[str, str]:
        pass

    # ============================================================
    # GET EMPLOYEE BY ID
    # ============================================================

    @abstractmethod
    def get_employee_by_id(
        self,
        db: "Session",
        employee_id: int,
    ) -> Optional["EmployeeModel"]:
        pass

    # ============================================================
    # GET ACCEPTANCE
    # ============================================================

    @abstractmethod
    def get_acceptance(
        self,
        db: "Session",
        employee_id: int,
        policy_id: int,
        version: int,
    ) -> Optional["PolicyAcceptance"]:
        pass

    # ============================================================
    # GET EMPLOYEE ACCEPTANCES
    # ============================================================

    @abstractmethod
    def get_employee_acceptances(
        self,
        db: "Session",
        employee_id: int,
    ) -> list["PolicyAcceptance"]:
        pass

    # ============================================================
    # CREATE ACCEPTANCE
    # ============================================================

    @abstractmethod
    def create_acceptance(
        self,
        db: "Session",
        acceptance: "PolicyAcceptance",
    ) -> "PolicyAcceptance":
        pass