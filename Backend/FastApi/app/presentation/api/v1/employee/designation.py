from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.presentation.dependencies.database import get_transactional_db

from app.infrastructure.repositories.employee.designation_repository import (
    DesignationRepository,
)

from app.application.services.employee.designation_service import (
    DesignationService,
)

from app.application.dtos.employee.designation import (
    DesignationCreate,
    DesignationUpdate,
    DesignationResponse,
)


router = APIRouter()


# Helper to inject service with its repository dependency
def get_designation_service(
    db: Session = Depends(get_transactional_db),
):
    repo = DesignationRepository(db)
    return DesignationService(repo)


@router.get("/", response_model=List[DesignationResponse])
def get_all(
    service: DesignationService = Depends(get_designation_service),
):
    return service.list_all()


@router.post("/", response_model=DesignationResponse)
def create(
    data: DesignationCreate,
    service: DesignationService = Depends(get_designation_service),
):
    return service.create(data.name, data.depart_id)


@router.put("/{id}", response_model=DesignationResponse)
def update(
    id: int,
    data: DesignationUpdate,
    service: DesignationService = Depends(get_designation_service),
):
    # Assuming update always sends both values or you can add logic in service for partial updates
    return service.update(id, data.name, data.depart_id)


@router.delete("/{id}")
def delete(
    id: int,
    service: DesignationService = Depends(get_designation_service),
):
    return service.delete(id)