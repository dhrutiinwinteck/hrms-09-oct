from typing import List

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.presentation.dependencies.database import get_transactional_db

from app.application.services.employee.employee_service import (
    EmployeeService,
)

from app.application.dtos.employee.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
)

from app.infrastructure.repositories.employee.employee_repository import (
    EmployeeRepository,
)


router = APIRouter()


# ==========================================================
# GET ALL EMPLOYEES
# ==========================================================

@router.get(
    "/",
    response_model=List[EmployeeResponse],
)
def get_all_employees(
    db: Session = Depends(get_transactional_db),
):
    repo = EmployeeRepository(db)
    service = EmployeeService(repo)

    return service.list_all()


# ==========================================================
# CREATE EMPLOYEE
# ==========================================================

@router.post(
    "/",
    response_model=EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_employee(
    data: EmployeeCreate,
    db: Session = Depends(get_transactional_db),
):
    repo = EmployeeRepository(db)
    service = EmployeeService(repo)

    return service.create_employee(data)


# ==========================================================
# GET EMPLOYEE PROFILE BY EMP CODE
#
# Example:
# GET /api/v1/employees/profile/IWT68
# ==========================================================

@router.get(
    "/profile/{emp_code}",
)
def get_profile(
    emp_code: str,
    db: Session = Depends(get_transactional_db),
):
    repo = EmployeeRepository(db)
    service = EmployeeService(repo)

    return service.get_employee_profile(
        emp_code
    )


# ==========================================================
# GET EMPLOYEE ID BY EMP CODE
#
# Example:
# GET /api/v1/employees/get-id/IWT68
# ==========================================================

@router.get(
    "/get-id/{emp_code}",
)
def get_employee_id(
    emp_code: str,
    db: Session = Depends(get_transactional_db),
):
    repo = EmployeeRepository(db)

    employee = repo.get_by_emp_code_with_details(
        emp_code
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Employee with Emp_code "
                f"'{emp_code}' not found"
            ),
        )

    emp, desig, dept, m_first, m_last = employee

    return {
        "emp_id": emp.id,
        "emp_code": emp.emp_code,
    }


# ==========================================================
# UPDATE EMPLOYEE
# ==========================================================

@router.patch(
    "/{emp_id}",
    response_model=EmployeeResponse,
)
def update_employee(
    emp_id: int,
    data: EmployeeUpdate,
    db: Session = Depends(get_transactional_db),
):
    repo = EmployeeRepository(db)
    service = EmployeeService(repo)

    return service.update_employee(
        emp_id,
        data
    )


# ==========================================================
# DELETE / DEACTIVATE EMPLOYEE
# ==========================================================

@router.delete(
    "/{emp_id}"
)
def delete_employee(
    emp_id: int,
    db: Session = Depends(get_transactional_db),
):
    repo = EmployeeRepository(db)
    service = EmployeeService(repo)

    return service.delete_employee(
        emp_id
    )