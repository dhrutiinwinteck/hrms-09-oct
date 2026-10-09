from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.application.dtos.employee.employee_salary import (
    EmployeeSalaryCreate,
    EmployeeSalaryResponse,
    EmployeeSalaryUpdate,
)
from app.application.services.employee.employee_salary_service import (
    EmployeeSalaryService,
)

from app.infrastructure.database.connection import get_db_session

router = APIRouter(
    prefix="/employee-salary",
    tags=["Employee Salary"]
)


@router.post(
    "/",
    response_model=EmployeeSalaryResponse,
    status_code=status.HTTP_201_CREATED
)
def create_employee_salary(
    data: EmployeeSalaryCreate,
    db: Session = Depends(get_db_session)
):

    service = EmployeeSalaryService(db)

    try:

        return service.create(data)

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc)
        )

    except SQLAlchemyError:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create employee salary details."
        )


@router.get(
    "/employee/{emp_id}",
    response_model=EmployeeSalaryResponse
)
def get_employee_salary(
    emp_id: int,
    db: Session = Depends(get_db_session)
):

    service = EmployeeSalaryService(db)

    result = service.get_by_employee_id(emp_id)

    if result is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Salary details not found for this employee."
        )

    return result


@router.get(
    "/{salary_id}",
    response_model=EmployeeSalaryResponse
)
def get_employee_salary_by_id(
    salary_id: int,
    db: Session = Depends(get_db_session)
):

    service = EmployeeSalaryService(db)

    result = service.get_by_id(salary_id)

    if result is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Salary details not found."
        )

    return result


@router.put(
    "/{salary_id}",
    response_model=EmployeeSalaryResponse
)
def update_employee_salary(
    salary_id: int,
    data: EmployeeSalaryUpdate,
    db: Session = Depends(get_db_session)
):

    service = EmployeeSalaryService(db)

    try:

        result = service.update(salary_id, data)

        if result is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Salary details not found."
            )

        return result

    except HTTPException:

        raise

    except SQLAlchemyError:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update employee salary details."
        )


@router.delete(
    "/{salary_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_employee_salary(
    salary_id: int,
    db: Session = Depends(get_db_session)
):

    service = EmployeeSalaryService(db)

    try:

        result = service.delete(salary_id)

        if not result:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Salary details not found."
            )

    except HTTPException:

        raise

    except SQLAlchemyError:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to delete employee salary details."
        )