from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import date
from typing import Any, Dict, List, Optional


class IShiftAssignmentRepository(ABC):
    """
    Repository contract for shift assignment operations.

    The concrete implementation is responsible for PostgreSQL
    persistence through SQLAlchemy.
    """

    @abstractmethod
    def employee_exists(
        self,
        employee_id: int,
    ) -> bool:
        """
        Check whether an employee exists.
        """
        raise NotImplementedError

    @abstractmethod
    def get_active_employees(
        self,
    ) -> List[Dict[str, Any]]:
        """
        Return active employees available for shift assignment.
        """
        raise NotImplementedError

    @abstractmethod
    def get_shift_patterns(
        self,
    ) -> List[Dict[str, Any]]:
        """
        Return available shift patterns.
        """
        raise NotImplementedError

    @abstractmethod
    def shift_pattern_exists(
        self,
        pattern_id: int,
    ) -> bool:
        """
        Check whether a shift pattern exists.
        """
        raise NotImplementedError

    @abstractmethod
    def create_assignment(
        self,
        employee_id: int,
        start_date: date,
        end_date: date,
        week_off_days: Optional[str],
        leave_days: Optional[str],
        created_by: Optional[str],
    ) -> int:
        """
        Create the parent employee shift assignment.

        Returns:
            Newly created assignment ID.
        """
        raise NotImplementedError

    @abstractmethod
    def create_assignment_dates(
        self,
        emp_shift_id: int,
        employee_id: int,
        generated_dates: List[Dict[str, Any]],
    ) -> None:
        """
        Create the generated date-wise shift records.
        """
        raise NotImplementedError

    @abstractmethod
    def get_assignment(
        self,
        assignment_id: int,
    ) -> Optional[Dict[str, Any]]:
        """
        Get one shift assignment by ID.
        """
        raise NotImplementedError

    @abstractmethod
    def get_assignment_dates(
        self,
        assignment_id: int,
    ) -> List[Dict[str, Any]]:
        """
        Get all date-wise shift records for an assignment.
        """
        raise NotImplementedError

    @abstractmethod
    def get_all_assignments(
        self,
    ) -> List[Dict[str, Any]]:
        """
        Get all shift assignments.
        """
        raise NotImplementedError

    @abstractmethod
    def update_assignment(
        self,
        assignment_id: int,
        employee_id: int,
        start_date: date,
        end_date: date,
        week_off_days: Optional[str],
        leave_days: Optional[str],
        modified_by: Optional[str],
    ) -> None:
        """
        Update the parent shift assignment.
        """
        raise NotImplementedError

    @abstractmethod
    def delete_assignment_dates(
        self,
        assignment_id: int,
    ) -> None:
        """
        Delete all date-wise records belonging to an assignment.
        """
        raise NotImplementedError

    @abstractmethod
    def delete_assignment(
        self,
        assignment_id: int,
    ) -> bool:
        """
        Delete the parent shift assignment.

        Returns:
            True when a record was deleted.
        """
        raise NotImplementedError