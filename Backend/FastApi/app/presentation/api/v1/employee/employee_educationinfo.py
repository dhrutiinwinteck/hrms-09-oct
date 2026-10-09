from typing import Annotated, List

from fastapi import (
    APIRouter,
    Depends,
    status,
)

from sqlalchemy.orm import Session

from app.presentation.dependencies.database import (
    get_transactional_db,
)

from app.infrastructure.repositories.employee.employee_educationinfo_repository import (
    EmployeeEducationInfoRepository,
)

from app.application.services.employee.employee_educationinfo_service import (
    EmployeeEducationInfoService,
)

from app.application.dtos.employee.employee_educationinfo import (
    EmployeeEducationInfoCreate,
    EmployeeEducationInfoUpdate,
    EmployeeEducationInfoResponse,
    EmployeeEducationInfoDeleteResponse,
)


router = APIRouter(
    prefix="/education-info",
    tags=["Employee Education Information"],
)


def get_education_service(
    db: Session = Depends(get_transactional_db),
) -> EmployeeEducationInfoService:

    repository = EmployeeEducationInfoRepository(db)

    return EmployeeEducationInfoService(repository)


ServiceDep = Annotated[
    EmployeeEducationInfoService,
    Depends(get_education_service),
]


# -----------------------------------------
# GET BY EDUCATION ID
# -----------------------------------------

@router.get(
    "/record/{education_id}",
    response_model=EmployeeEducationInfoResponse,
    status_code=status.HTTP_200_OK,
)
def get_education_by_id(
    education_id: int,
    service: ServiceDep,
):

    return service.get_by_id(education_id)


# -----------------------------------------
# GET ALL BY EMPLOYEE ID
# -----------------------------------------

@router.get(
    "/employee/{emp_id}",
    response_model=List[EmployeeEducationInfoResponse],
    status_code=status.HTTP_200_OK,
)
def get_education_by_employee_id(
    emp_id: int,
    service: ServiceDep,
):

    return service.get_by_emp_id(emp_id)


# -----------------------------------------
# CREATE
# -----------------------------------------

@router.post(
    "",
    response_model=EmployeeEducationInfoResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_education(
    education_data: EmployeeEducationInfoCreate,
    service: ServiceDep,
):

    return service.create(education_data)


# -----------------------------------------
# UPDATE
# -----------------------------------------

@router.put(
    "/{education_id}",
    response_model=EmployeeEducationInfoResponse,
    status_code=status.HTTP_200_OK,
)
def update_education(
    education_id: int,
    education_data: EmployeeEducationInfoUpdate,
    service: ServiceDep,
):

    return service.update(
        education_id,
        education_data,
    )


# -----------------------------------------
# DELETE
# -----------------------------------------

@router.delete(
    "/{education_id}",
    response_model=EmployeeEducationInfoDeleteResponse,
    status_code=status.HTTP_200_OK,
)
def delete_education(
    education_id: int,
    service: ServiceDep,
):

    return service.delete(education_id)