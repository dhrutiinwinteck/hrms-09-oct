from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from typing import List

from app.presentation.dependencies.database import get_transactional_db

from app.application.services.performance.kra_service import KRAService

from app.application.dtos.performance.kra_dto import (
    KRAMasterResponse,
    KRAAssessmentResponse,
)


router = APIRouter()


# ==========================================================
# MASTER GET ROUTES
# ==========================================================


@router.get(
    "/master",
    response_model=List[KRAMasterResponse],
)
def list_all_master_goals(
    db: Session = Depends(get_transactional_db),
):
    return KRAService(db).get_all_masters()


@router.get(
    "/master/{id}",
    response_model=KRAMasterResponse,
)
def get_master_goal(
    id: int,
    db: Session = Depends(get_transactional_db),
):
    return KRAService(db).get_master_by_id(id)


# ==========================================================
# ASSESSMENT GET ROUTES
# ==========================================================


@router.get(
    "/assessment",
    response_model=List[KRAAssessmentResponse],
)
def list_all_assessments(
    db: Session = Depends(get_transactional_db),
):
    # Note: For massive lists, you might want to exclude
    # 'logs' to save bandwidth
    return KRAService(db).get_all_assessments()


@router.get(
    "/assessment/{id}",
    response_model=KRAAssessmentResponse,
)
def get_detailed_assessment(
    id: int,
    db: Session = Depends(get_transactional_db),
):
    return KRAService(db).get_assessment_by_id(id)


@router.get(
    "/my-history/{emp_id}",
    response_model=List[KRAAssessmentResponse],
)
def get_history(
    emp_id: int,
    db: Session = Depends(get_transactional_db),
):
    return KRAService(db).get_employee_history(emp_id)