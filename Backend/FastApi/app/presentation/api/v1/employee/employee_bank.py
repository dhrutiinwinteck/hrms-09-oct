from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.application.dtos.employee.employee_bank_dto import (
    EmployeeBankCreate,
    EmployeeBankUpdate,
    EmployeeBankResponse,
)

from app.infrastructure.database.connection import get_db_session

# CORRECT SERVICE IMPORT
from app.application.services.employee.employee_bank_service import (
    EmployeeBankService,
)


router = APIRouter(
    prefix="/employee-bank",
    tags=["Employee Bank"],
)


# ============================================================
# CREATE
# ============================================================

@router.post(
    "",
    response_model=EmployeeBankResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_employee_bank(
    bank_data: EmployeeBankCreate,
    db: Session = Depends(get_db_session),
):
    service = EmployeeBankService(db)

    return service.create_bank_details(bank_data)


# ============================================================
# GET BY ID
# ============================================================

@router.get(
    "/{bank_id}",
    response_model=EmployeeBankResponse,
)
def get_employee_bank(
    bank_id: int,
    db: Session = Depends(get_db_session),
):
    service = EmployeeBankService(db)

    return service.get_bank_details(bank_id)


# ============================================================
# GET BY EMPLOYEE ID
# ============================================================

@router.get(
    "/employee/{emp_id}",
    response_model=List[EmployeeBankResponse],
)
def get_employee_bank_by_employee(
    emp_id: int,
    db: Session = Depends(get_db_session),
):
    service = EmployeeBankService(db)

    return service.get_employee_bank_details(emp_id)


# ============================================================
# UPDATE
# ============================================================

@router.put(
    "/{bank_id}",
    response_model=EmployeeBankResponse,
)
def update_employee_bank(
    bank_id: int,
    bank_data: EmployeeBankUpdate,
    db: Session = Depends(get_db_session),
):
    service = EmployeeBankService(db)

    return service.update_bank_details(
        bank_id,
        bank_data,
    )


# ============================================================
# DELETE
# ============================================================

@router.delete(
    "/{bank_id}",
)
def delete_employee_bank(
    bank_id: int,
    db: Session = Depends(get_db_session),
):
    service = EmployeeBankService(db)

    return service.delete_bank_details(bank_id)