from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.application.dtos.employee.employee_experienceinfo import (
    EmployeeExperienceInfoCreate,
    EmployeeExperienceInfoListResponse,
    EmployeeExperienceInfoResponse,
    EmployeeExperienceInfoUpdate,
)

from app.application.services.employee.employee_experienceinfo_service import (
    EmployeeExperienceInfoService,
)

from app.infrastructure.database.connection import get_db_session


router = APIRouter(
    prefix="/employee-experience",
)


@router.post(
    "",
    response_model=EmployeeExperienceInfoResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_employee_experience(
    request: EmployeeExperienceInfoCreate,
    db: Session = Depends(get_db_session),
):

    service = EmployeeExperienceInfoService(db)

    try:

        return service.create(request)

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except SQLAlchemyError as exc:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create employee experience.",
        ) from exc


@router.get(
    "/{emp_id}",
    response_model=EmployeeExperienceInfoListResponse,
    status_code=status.HTTP_200_OK,
)
def get_employee_experience(
    emp_id: int,
    db: Session = Depends(get_db_session),
):

    if emp_id <= 0:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee ID must be greater than zero.",
        )

    service = EmployeeExperienceInfoService(db)

    records = service.get_by_employee_id(emp_id)

    return EmployeeExperienceInfoListResponse(
        success=True,
        message="Employee experience records retrieved successfully.",
        data=records,
    )


@router.get(
    "/detail/{experience_id}",
    response_model=EmployeeExperienceInfoResponse,
    status_code=status.HTTP_200_OK,
)
def get_employee_experience_by_id(
    experience_id: int,
    db: Session = Depends(get_db_session),
):

    if experience_id <= 0:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Experience ID must be greater than zero.",
        )

    service = EmployeeExperienceInfoService(db)

    experience = service.get_by_id(experience_id)

    if experience is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee experience record not found.",
        )

    return experience


@router.put(
    "/{experience_id}",
    response_model=EmployeeExperienceInfoResponse,
    status_code=status.HTTP_200_OK,
)
def update_employee_experience(
    experience_id: int,
    request: EmployeeExperienceInfoUpdate,
    db: Session = Depends(get_db_session),
):

    if experience_id <= 0:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Experience ID must be greater than zero.",
        )

    service = EmployeeExperienceInfoService(db)

    try:

        updated = service.update(
            experience_id,
            request,
        )

        if updated is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee experience record not found.",
            )

        return updated

    except HTTPException:

        raise

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except SQLAlchemyError as exc:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update employee experience.",
        ) from exc


@router.delete(
    "/{experience_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_employee_experience(
    experience_id: int,
    db: Session = Depends(get_db_session),
):

    if experience_id <= 0:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Experience ID must be greater than zero.",
        )

    service = EmployeeExperienceInfoService(db)

    try:

        deleted = service.delete(experience_id)

        if not deleted:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee experience record not found.",
            )

        return None

    except HTTPException:

        raise

    except SQLAlchemyError as exc:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to delete employee experience.",
        ) from exc