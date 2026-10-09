from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    status,
)

from sqlalchemy.orm import Session

from app.presentation.dependencies.database import (
    get_transactional_db,
)

from app.infrastructure.repositories.employee.employee_personal_repository import (
    EmployeePersonalRepository,
)

from app.application.services.employee.employee_personal_service import (
    EmployeePersonalService,
)

from app.application.dtos.employee.employee_personal import (
    EmployeePersonalCreate,
    EmployeePersonalUpdate,
    EmployeePersonalResponse,
)


router = APIRouter(
    prefix="/personal-details",
    tags=["Employee Personal Details"],
)


# -----------------------------------------
# SERVICE DEPENDENCY
# -----------------------------------------

def get_personal_service(
    db: Session = Depends(get_transactional_db),
) -> EmployeePersonalService:

    repository = EmployeePersonalRepository(db)

    return EmployeePersonalService(
        repository
    )


ServiceDep = Annotated[
    EmployeePersonalService,
    Depends(get_personal_service),
]


# -----------------------------------------
# GET ALL PERSONAL DETAILS
# -----------------------------------------

@router.get(
    "/",
    response_model=list[EmployeePersonalResponse],
    status_code=status.HTTP_200_OK,
)
def get_all_personal_details(
    service: ServiceDep,
):

    return service.get_all()


# -----------------------------------------
# GET PERSONAL DETAILS BY EMPLOYEE ID
# -----------------------------------------

@router.get(
    "/{emp_id}",
    response_model=EmployeePersonalResponse,
    status_code=status.HTTP_200_OK,
)
def get_personal_details_by_emp_id(
    emp_id: int,
    service: ServiceDep,
):

    return service.get_by_emp_id(
        emp_id
    )


# -----------------------------------------
# CREATE PERSONAL DETAILS
# -----------------------------------------

@router.post(
    "",
    response_model=EmployeePersonalResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_personal_details(
    personal_data: EmployeePersonalCreate,
    service: ServiceDep,
):

    return service.create(
        personal_data
    )


# -----------------------------------------
# UPDATE PERSONAL DETAILS
# -----------------------------------------

@router.put(
    "/{emp_id}",
    response_model=EmployeePersonalResponse,
    status_code=status.HTTP_200_OK,
)
def update_personal_details(
    emp_id: int,
    personal_data: EmployeePersonalUpdate,
    service: ServiceDep,
):

    return service.update(
        emp_id,
        personal_data,
    )


# -----------------------------------------
# DELETE PERSONAL DETAILS
# -----------------------------------------

@router.delete(
    "/{emp_id}",
    status_code=status.HTTP_200_OK,
)
def delete_personal_details(
    emp_id: int,
    service: ServiceDep,
):

    return service.delete(
        emp_id
    )