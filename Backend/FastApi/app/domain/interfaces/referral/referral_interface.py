from abc import ABC, abstractmethod
from typing import Optional

from app.infrastructure.models.referral.referral import EmployeeReferral


class IReferralRepository(ABC):
    """
    Interface for employee referral repository operations.
    """

    @abstractmethod
    def get_by_employee_id(
        self,
        employee_id: int,
    ) -> Optional[EmployeeReferral]:
        """
        Get the active referral for an employee.
        """
        pass

    @abstractmethod
    def get_by_token(
        self,
        referral_token: str,
    ) -> Optional[EmployeeReferral]:
        """
        Get an active referral using its referral token.
        """
        pass

    @abstractmethod
    def create(
        self,
        employee_id: int,
        referral_token: str,
    ) -> EmployeeReferral:
        """
        Create a referral for an employee.
        """
        pass