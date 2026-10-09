from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.presentation.dependencies.database import get_transactional_db

from app.infrastructure.repositories.dashboard.dashboard_repository import (
    DashboardRepository,
)

from app.application.services.dashboard.dashboard_service import DashboardService

from app.application.dtos.dashboard.dashboard import DashboardStats


router = APIRouter()


# Dependency Injection setup
def get_dashboard_service(
    db: Session = Depends(get_transactional_db),
):
    repo = DashboardRepository(db)
    return DashboardService(repo)


@router.get("/summary", response_model=DashboardStats)
def get_summary(
    service: DashboardService = Depends(get_dashboard_service),
):
    """
    Returns statistics for the dashboard:
    - Total Employee Count
    - Present Today Count
    - Employees on Leave Today
    - Birthday Alerts
    """
    return service.get_dashboard_summary()