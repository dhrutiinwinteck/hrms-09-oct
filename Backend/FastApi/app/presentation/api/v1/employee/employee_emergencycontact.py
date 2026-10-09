import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.application.dtos.employee.employee_emergencycontact import (
    EmployeeEmergencyContactCreate,
    EmployeeEmergencyContactResponse,
    EmployeeEmergencyContactUpdate,
)
from app.application.services.employee.employee_emergencycontact_service import (
    EmployeeEmergencyContactService,
)
from app.infrastructure.database.connection import get_db_session


# ============================================================
# LOGGER
# ============================================================

logger = logging.getLogger(__name__)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/employee-emergencycontact",
    tags=["Employee Emergency Contact"],
)


# ============================================================
# SERVICE DEPENDENCY
# ============================================================

def get_service(
    db: Session = Depends(get_db_session),
) -> EmployeeEmergencyContactService:
    return EmployeeEmergencyContactService(db=db)


# ============================================================
# CREATE
# ============================================================

@router.post(
    "",
    response_model=EmployeeEmergencyContactResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_employee_emergencycontact(
    data: EmployeeEmergencyContactCreate,
    service: EmployeeEmergencyContactService = Depends(get_service),
):
    try:
        return service.create(data)

    except SQLAlchemyError as exc:
        logger.exception(
            "Database error while creating employee emergency contact: %s",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create employee emergency contact.",
        ) from exc

    except Exception as exc:
        logger.exception(
            "Unexpected error while creating employee emergency contact: %s",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error while creating employee emergency contact.",
        ) from exc


# ============================================================
# GET ALL
# ============================================================

@router.get(
    "",
    response_model=List[EmployeeEmergencyContactResponse],
)
def get_all_employee_emergencycontacts(
    service: EmployeeEmergencyContactService = Depends(get_service),
):
    try:
        return service.get_all()

    except SQLAlchemyError as exc:
        logger.exception(
            "Database error while fetching all employee emergency contacts: %s",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch employee emergency contacts.",
        ) from exc

    except Exception as exc:
        logger.exception(
            "Unexpected error while fetching all employee emergency contacts: %s",
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error while fetching employee emergency contacts.",
        ) from exc


# ============================================================
# GET BY EMPLOYEE ID
# ============================================================

@router.get(
    "/employee/{emp_id}",
    response_model=List[EmployeeEmergencyContactResponse],
)
def get_employee_emergencycontacts_by_employee(
    emp_id: int,
    service: EmployeeEmergencyContactService = Depends(get_service),
):
    if emp_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee ID must be greater than zero.",
        )

    try:
        return service.get_by_employee_id(emp_id)

    except SQLAlchemyError as exc:
        logger.exception(
            "Database error while fetching emergency contacts for employee ID %s: %s",
            emp_id,
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch employee emergency contacts.",
        ) from exc

    except Exception as exc:
        logger.exception(
            "Unexpected error while fetching emergency contacts for employee ID %s: %s",
            emp_id,
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error while fetching employee emergency contacts.",
        ) from exc


# ============================================================
# GET BY RECORD ID
# ============================================================

@router.get(
    "/{record_id}",
    response_model=EmployeeEmergencyContactResponse,
)
def get_employee_emergencycontact(
    record_id: int,
    service: EmployeeEmergencyContactService = Depends(get_service),
):
    if record_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Record ID must be greater than zero.",
        )

    try:
        record = service.get_by_id(record_id)

        if record is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee emergency contact not found.",
            )

        return record

    except HTTPException:
        raise

    except SQLAlchemyError as exc:
        logger.exception(
            "Database error while fetching emergency contact ID %s: %s",
            record_id,
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch employee emergency contact.",
        ) from exc

    except Exception as exc:
        logger.exception(
            "Unexpected error while fetching emergency contact ID %s: %s",
            record_id,
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error while fetching employee emergency contact.",
        ) from exc


# ============================================================
# UPDATE
# ============================================================

@router.put(
    "/{record_id}",
    response_model=EmployeeEmergencyContactResponse,
)
def update_employee_emergencycontact(
    record_id: int,
    data: EmployeeEmergencyContactUpdate,
    service: EmployeeEmergencyContactService = Depends(get_service),
):
    if record_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Record ID must be greater than zero.",
        )

    try:
        record = service.update(
            record_id=record_id,
            data=data,
        )

        if record is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee emergency contact not found.",
            )

        return record

    except HTTPException:
        raise

    except SQLAlchemyError as exc:
        logger.exception(
            "Database error while updating emergency contact ID %s: %s",
            record_id,
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update employee emergency contact.",
        ) from exc

    except Exception as exc:
        logger.exception(
            "Unexpected error while updating emergency contact ID %s: %s",
            record_id,
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error while updating employee emergency contact.",
        ) from exc


# ============================================================
# DELETE
# ============================================================

@router.delete(
    "/{record_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_employee_emergencycontact(
    record_id: int,
    service: EmployeeEmergencyContactService = Depends(get_service),
):
    if record_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Record ID must be greater than zero.",
        )

    try:
        deleted = service.delete(record_id)

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee emergency contact not found.",
            )

        return None

    except HTTPException:
        raise

    except SQLAlchemyError as exc:
        logger.exception(
            "Database error while deleting emergency contact ID %s: %s",
            record_id,
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete employee emergency contact.",
        ) from exc

    except Exception as exc:
        logger.exception(
            "Unexpected error while deleting emergency contact ID %s: %s",
            record_id,
            exc,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error while deleting employee emergency contact.",
        ) from exc