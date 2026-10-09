from typing import Optional

from sqlalchemy.orm import Session

from app.infrastructure.models.referral.referral import EmployeeReferral


class ReferralRepository:
    """
    Repository for employee referral database operations.
    """

    def __init__(self, db: Session):
        self.db = db

    def get_by_employee_id(
        self,
        employee_id: int,
    ) -> Optional[EmployeeReferral]:
        """
        Get the active referral record for an employee.
        """

        return (
            self.db.query(EmployeeReferral)
            .filter(
                EmployeeReferral.employee_id == employee_id,
                EmployeeReferral.is_active.is_(True),
            )
            .first()
        )

    def get_by_token(
        self,
        referral_token: str,
    ) -> Optional[EmployeeReferral]:
        """
        Find an active referral using its unique token.
        """

        return (
            self.db.query(EmployeeReferral)
            .filter(
                EmployeeReferral.referral_token == referral_token,
                EmployeeReferral.is_active.is_(True),
            )
            .first()
        )

    def create(
        self,
        employee_id: int,
        referral_token: str,
    ) -> EmployeeReferral:
        """
        Create a new referral record for an employee.
        """

        referral = EmployeeReferral(
            employee_id=employee_id,
            referral_token=referral_token,
            is_active=True,
        )

        self.db.add(referral)
        self.db.flush()

        return referral