from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy.orm import Session

from app.presentation.dependencies.database import (
    get_transactional_db,
)

from app.infrastructure.repositories.attendance.attendance_report_repository import (
    AttendanceReportRepository,
)

from app.application.services.attendance.attendance_report_service import (
    AttendanceReportService,
)


router = APIRouter()


def get_attendance_report_service(
    db: Session = Depends(
        get_transactional_db
    ),
) -> AttendanceReportService:

    repository = (
        AttendanceReportRepository(db)
    )

    return AttendanceReportService(
        repository
    )


# ================================================================
# ATTENDANCE HISTORY
# ================================================================

@router.get(
    "/history",
    summary="Get Monthly Attendance History",
)
def get_attendance_history(
    month: int = Query(
        ...,
        ge=1,
        le=12,
    ),

    year: int = Query(
        ...,
        ge=2000,
        le=2100,
    ),

    page: int = Query(
        1,
        ge=1,
    ),

    page_size: int = Query(
        10,
        ge=1,
        le=100,
    ),

    search: Optional[str] = Query(
        None
    ),

    employee_id: Optional[int] = Query(
        None,
        ge=1,
    ),

    service: AttendanceReportService = Depends(
        get_attendance_report_service
    ),
):

    try:

        return service.get_history(
            year=year,
            month=month,
            page=page,
            page_size=page_size,
            search=search,
            employee_id=employee_id,
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception as exc:

        print(
            "Attendance History Error:",
            repr(exc),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to load "
                "attendance history."
            ),
        )


# ================================================================
# EMPLOYEE DROPDOWN
# ================================================================

@router.get(
    "/employees",
    summary="Get Active Employees",
)
def get_attendance_employees(
    search: Optional[str] = Query(
        None
    ),

    service: AttendanceReportService = Depends(
        get_attendance_report_service
    ),
):

    try:

        return service.get_employees(
            search=search
        )

    except Exception as exc:

        print(
            "Attendance Employees Error:",
            repr(exc),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to load employees."
            ),
        )


# ================================================================
# CALCULATE LATE MARKS
# ================================================================

@router.get(
    "/calculate-late-marks",
    summary="Calculate Monthly Late Marks",
)
def calculate_late_marks(
    month: int = Query(
        ...,
        ge=1,
        le=12,
    ),

    year: int = Query(
        ...,
        ge=2000,
        le=2100,
    ),

    employee_id: Optional[int] = Query(
        None,
        ge=1,
    ),

    service: AttendanceReportService = Depends(
        get_attendance_report_service
    ),
):

    try:

        return service.calculate_late_marks(
            year=year,
            month=month,
            employee_id=employee_id,
        )

    except Exception as exc:

        print(
            "Late Marks Error:",
            repr(exc),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to calculate "
                "late marks."
            ),
        )