from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.application.dtos.employee.employee_familyinfo import (
    EmployeeFamilyInfoCreate,
    EmployeeFamilyInfoResponse,
    EmployeeFamilyInfoUpdate,
)

from app.application.services.employee.employee_familyinfo_service import (
    EmployeeFamilyInfoService,
)

from app.infrastructure.database.connection import (
    get_db_session,
)

from app.infrastructure.repositories.employee.employee_familyinfo_repository import (
    EmployeeFamilyInfoRepository,
)


router = APIRouter(
    prefix="/employee-familyinfo",
    tags=["Employee Family Information"],
)


def get_familyinfo_service(
    db: Session = Depends(get_db_session),
) -> EmployeeFamilyInfoService:

    repository = EmployeeFamilyInfoRepository(db)

    return EmployeeFamilyInfoService(
        db=db,
        repository=repository,
    )


@router.post(
    "",
    response_model=EmployeeFamilyInfoResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_family_info(
    request: EmployeeFamilyInfoCreate,
    service: EmployeeFamilyInfoService = Depends(
        get_familyinfo_service
    ),
    x_user: Optional[str] = Header(
        default=None,
        alias="X-User",
    ),
):
    try:
        return service.create(
            request=request,
            current_user=x_user,
        )

    except SQLAlchemyError:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create employee family information.",
        )


@router.get(
    "/{family_id}",
    response_model=EmployeeFamilyInfoResponse,
)
def get_family_info_by_id(
    family_id: int,
    service: EmployeeFamilyInfoService = Depends(
        get_familyinfo_service
    ),
):

    family_info = service.get_by_id(family_id)

    if family_info is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee family information not found.",
        )

    return family_info


@router.get(
    "/employee/{emp_id}",
    response_model=List[EmployeeFamilyInfoResponse],
)
def get_family_info_by_employee_id(
    emp_id: int,
    service: EmployeeFamilyInfoService = Depends(
        get_familyinfo_service
    ),
):

    return service.get_by_employee_id(emp_id)


@router.put(
    "/{family_id}",
    response_model=EmployeeFamilyInfoResponse,
)
def update_family_info(
    family_id: int,
    request: EmployeeFamilyInfoUpdate,
    service: EmployeeFamilyInfoService = Depends(
        get_familyinfo_service
    ),
    x_user: Optional[str] = Header(
        default=None,
        alias="X-User",
    ),
):

    try:
        updated = service.update(
            family_id=family_id,
            request=request,
            current_user=x_user,
        )

        if updated is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee family information not found.",
            )

        return updated

    except HTTPException:

        raise

    except SQLAlchemyError:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update employee family information.",
        )


@router.delete(
    "/{family_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_family_info(
    family_id: int,
    service: EmployeeFamilyInfoService = Depends(
        get_familyinfo_service
    ),
):

    try:
        deleted = service.delete(family_id)

        if not deleted:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee family information not found.",
            )

    except HTTPException:

        raise

    except SQLAlchemyError:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to delete employee family information.",
        )