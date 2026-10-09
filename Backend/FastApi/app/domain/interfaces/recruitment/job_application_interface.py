from abc import ABC, abstractmethod
from datetime import date 
from typing import Any, Dict, List, Optional

from app.infrastructure.models.recruitment.job_application import (
    JobApplication,
)


class IJobApplicationRepository(ABC):

    # ==========================================================
    # CREATE COMPLETE APPLICATION
    # ==========================================================

    @abstractmethod
    def create_complete_application(
        self,
        application_data: Dict[str, Any],
        emergency_contacts: List[Dict[str, Any]],
        work_experiences: List[Dict[str, Any]],
        education: List[Dict[str, Any]],
        references: List[Dict[str, Any]],
    ) -> JobApplication:
        pass

    # ==========================================================
    # GET ALL APPLICATIONS
    # ==========================================================

    @abstractmethod
    def get_all_applications(
        self,
    ) -> List[JobApplication]:
        pass

    # ==========================================================
    # GET APPLICATION BY ID
    # ==========================================================

    @abstractmethod
    def get_application_by_id(
        self,
        application_id: int,
    ) -> Optional[JobApplication]:
        pass

    # ==========================================================
    # UPDATE JOINING STATUS
    # ==========================================================

    @abstractmethod
    def update_joining_status(
        self,
        application_id: int,
        joining_status: str,
    ) -> Optional[JobApplication]:
        pass


        # ==========================================================
    # UPDATE APPLICATION JOINING DETAILS  CHange by Rohit
    # ==========================================================

    @abstractmethod
    def update_application_details(
        self,
        application_id: int,
        position_applied_for: str,
        joining_date: Optional[date],
        remark: Optional[str],
    ) -> Optional[JobApplication]:
        pass

       # ==========================================================
        # UPDATE APPLICATION JOINING DETAILS  CHange by ENd Rohit
        # ==========================================================
    # ==========================================================
    # DELETE APPLICATION
    # ==========================================================

    @abstractmethod
    def delete_application(
        self,
        application_id: int,
    ) -> Optional[JobApplication]:
        pass