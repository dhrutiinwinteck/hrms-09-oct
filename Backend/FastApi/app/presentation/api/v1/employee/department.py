from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.presentation.dependencies.database import get_transactional_db

from app.infrastructure.repositories.employee.department_repository import (
    DepartmentRepository,
)

from app.application.services.employee.department_service import DepartmentService

from app.application.dtos.employee.department import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
)


router = APIRouter()


# Helper to inject service with repository
def get_department_service(
    db: Session = Depends(get_transactional_db),
):
    repo = DepartmentRepository(db)
    return DepartmentService(repo)


@router.get("/", response_model=List[DepartmentResponse])
def get_all(
    service: DepartmentService = Depends(get_department_service),
):
    return service.list_all()


@router.post("/", response_model=DepartmentResponse)
def create(
    data: DepartmentCreate,
    service: DepartmentService = Depends(get_department_service),
):
    return service.create(data.name)


@router.put("/{id}", response_model=DepartmentResponse)
def update(
    id: int,
    data: DepartmentUpdate,
    service: DepartmentService = Depends(get_department_service),
):
    return service.update(id, data.name)


@router.delete("/{id}")
def delete(
    id: int,
    service: DepartmentService = Depends(get_department_service),
):
    return service.delete(id)