# from datetime import date
# from typing import Optional

# from fastapi import APIRouter, Depends, Query
# from sqlalchemy.orm import Session

# from app.presentation.dependencies.database import (
#     get_transactional_db,
# )

# from app.core.security import get_current_user_id

# from app.infrastructure.repositories.attendance.attendance_repository import (
#     AttendanceRepository,
# )

# from app.infrastructure.repositories.attendance.attendance_admin_repository import (
#     AttendanceAdminRepository,
# )

# from app.application.services.attendance.attendance_service import (
#     AttendanceService,
# )

# from app.application.services.attendance.attendance_admin_service import (
#     AttendanceAdminService,
# )

# from app.application.services.attendance.location_service import (
#     LocationService,
# )

# from app.application.dtos.attendance.attendance import (
#     AttendanceUpdate,
#     AttendanceResponse,
# )

# from app.application.dtos.attendance.attendance_location import (
#     PunchLocationRequest,
# )

# from app.application.dtos.attendance.attendance_admin import (
#     LateMarkRequest,
# )


# router = APIRouter()


# # ================================================================
# # EXISTING ATTENDANCE SERVICE
# # ================================================================

# def get_attendance_service(
#     db: Session = Depends(get_transactional_db),
# ):
#     repo = AttendanceRepository(db)
#     location_service = LocationService()

#     return AttendanceService(
#         repo=repo,
#         location_service=location_service,
#     )


# # ================================================================
# # ADMIN ATTENDANCE SERVICE
# # ================================================================

# def get_attendance_admin_service(
#     db: Session = Depends(get_transactional_db),
# ):
#     repository = AttendanceAdminRepository(db)

#     return AttendanceAdminService(
#         repository=repository
#     )


# # ================================================================
# # PUNCH IN
# # ================================================================

# @router.post("/punch-in")
# def punch_in(
#     location: PunchLocationRequest,
#     emp_id: int = Depends(get_current_user_id),
#     service: AttendanceService = Depends(
#         get_attendance_service
#     ),
# ):
#     return service.punch_in(
#         emp_id=emp_id,
#         location=location,
#     )


# # ================================================================
# # BREAK IN
# # ================================================================

# @router.post("/break-in")
# def break_in(
#     emp_id: int = Depends(get_current_user_id),
#     service: AttendanceService = Depends(
#         get_attendance_service
#     ),
# ):
#     return service.break_in(emp_id)


# # ================================================================
# # BREAK OUT
# # ================================================================

# @router.post("/break-out")
# def break_out(
#     emp_id: int = Depends(get_current_user_id),
#     service: AttendanceService = Depends(
#         get_attendance_service
#     ),
# ):
#     return service.break_out(emp_id)


# # ================================================================
# # PUNCH OUT
# # ================================================================

# @router.post("/punch-out")
# def punch_out(
#     location: PunchLocationRequest,
#     emp_id: int = Depends(get_current_user_id),
#     service: AttendanceService = Depends(
#         get_attendance_service
#     ),
# ):
#     return service.punch_out(
#         emp_id=emp_id,
#         location=location,
#     )


# # =================================================================
# # ADMIN ATTENDANCE
# # =================================================================


# # ================================================================
# # ATTENDANCE HISTORY
# #
# # GET
# # /api/v1/attendance/history
# # ================================================================

# @router.get("/history")
# def get_attendance_history(
#     page: int = Query(
#         default=1,
#         ge=1,
#     ),

#     page_size: int = Query(
#         default=10,
#         ge=1,
#         le=200,
#     ),

#     from_date: Optional[date] = Query(
#         default=None,
#     ),

#     to_date: Optional[date] = Query(
#         default=None,
#     ),

#     emp_id: Optional[int] = Query(
#         default=None,
#         ge=1,
#     ),

#     department_id: Optional[int] = Query(
#         default=None,
#         ge=1,
#     ),

#     search: Optional[str] = Query(
#         default=None,
#     ),

#     service: AttendanceAdminService = Depends(
#         get_attendance_admin_service
#     ),
# ):
#     return service.history(
#         page=page,
#         page_size=page_size,
#         from_date=from_date,
#         to_date=to_date,
#         emp_id=emp_id,
#         department_id=department_id,
#         search=search,
#     )


# # ================================================================
# # ATTENDANCE EMPLOYEES
# #
# # GET
# # /api/v1/attendance/employees
# # ================================================================

# @router.get("/employees")
# def get_attendance_employees(
#     service: AttendanceAdminService = Depends(
#         get_attendance_admin_service
#     ),
# ):
#     return service.employees()


# # ================================================================
# # ATTENDANCE SUMMARY
# #
# # GET
# # /api/v1/attendance/summary
# # ================================================================

# @router.get("/summary")
# def get_attendance_summary(
#     from_date: date = Query(...),

#     to_date: date = Query(...),

#     emp_id: Optional[int] = Query(
#         default=None,
#         ge=1,
#     ),

#     service: AttendanceAdminService = Depends(
#         get_attendance_admin_service
#     ),
# ):
#     return service.summary(
#         from_date=from_date,
#         to_date=to_date,
#         emp_id=emp_id,
#     )


# # ================================================================
# # ATTENDANCE OVERVIEW
# #
# # GET
# # /api/v1/attendance/overview
# # ================================================================

# @router.get("/overview")
# def get_attendance_overview(
#     from_date: date = Query(...),

#     to_date: date = Query(...),

#     emp_id: Optional[int] = Query(
#         default=None,
#         ge=1,
#     ),

#     service: AttendanceAdminService = Depends(
#         get_attendance_admin_service
#     ),
# ):
#     return service.overview(
#         from_date=from_date,
#         to_date=to_date,
#         emp_id=emp_id,
#     )


# # ================================================================
# # ATTENDANCE FILTER
# #
# # GET
# # /api/v1/attendance/filter
# # ================================================================

# @router.get("/filter")
# def get_attendance_filter(
#     service: AttendanceAdminService = Depends(
#         get_attendance_admin_service
#     ),
# ):
#     return service.filters()


# # ================================================================
# # ATTENDANCE EXPORT
# #
# # GET
# # /api/v1/attendance/export
# # ================================================================

# @router.get("/export")
# def export_attendance(
#     from_date: date = Query(...),

#     to_date: date = Query(...),

#     emp_id: Optional[int] = Query(
#         default=None,
#         ge=1,
#     ),

#     department_id: Optional[int] = Query(
#         default=None,
#         ge=1,
#     ),

#     search: Optional[str] = Query(
#         default=None,
#     ),

#     service: AttendanceAdminService = Depends(
#         get_attendance_admin_service
#     ),
# ):
#     return service.export(
#         from_date=from_date,
#         to_date=to_date,
#         emp_id=emp_id,
#         department_id=department_id,
#         search=search,
#     )


# # ================================================================
# # ATTENDANCE HISTORY EXPORT
# #
# # Kept separately because your frontend may use either endpoint.
# #
# # GET
# # /api/v1/attendance/history/export
# # ================================================================

# @router.get("/history/export")
# def export_attendance_history(
#     from_date: date = Query(...),

#     to_date: date = Query(...),

#     emp_id: Optional[int] = Query(
#         default=None,
#         ge=1,
#     ),

#     department_id: Optional[int] = Query(
#         default=None,
#         ge=1,
#     ),

#     search: Optional[str] = Query(
#         default=None,
#     ),

#     service: AttendanceAdminService = Depends(
#         get_attendance_admin_service
#     ),
# ):
#     return service.export(
#         from_date=from_date,
#         to_date=to_date,
#         emp_id=emp_id,
#         department_id=department_id,
#         search=search,
#     )


# # ================================================================
# # LATE MARK CALCULATION
# #
# # POST
# # /api/v1/attendance/late-marks/calculate
# # ================================================================

# @router.post("/late-marks/calculate")
# def calculate_late_marks(
#     request: LateMarkRequest,

#     service: AttendanceAdminService = Depends(
#         get_attendance_admin_service
#     ),
# ):
#     return service.calculate_late_marks(
#         from_date=request.from_date,
#         to_date=request.to_date,
#         emp_id=request.emp_id,
#         grace_minutes=request.grace_minutes,
#     )


# # =================================================================
# # EXISTING GENERIC ATTENDANCE APIs
# #
# # IMPORTANT:
# # Keep these AFTER the named routes above.
# # =================================================================


# # ================================================================
# # GET ALL ATTENDANCE
# #
# # GET
# # /api/v1/attendance/
# # ================================================================

# @router.get("/")
# def get_all_attendance(
#     page: int = Query(
#         default=1,
#         ge=1,
#         description="Page number",
#     ),

#     page_size: int = Query(
#         default=50,
#         ge=1,
#         le=100,
#         description="Number of records per page",
#     ),

#     service: AttendanceService = Depends(
#         get_attendance_service
#     ),
# ):
#     return service.get_all_records(
#         page=page,
#         page_size=page_size,
#     )


# # ================================================================
# # GET ATTENDANCE BY ID
# #
# # IMPORTANT:
# # This must remain AFTER /history, /employees, etc.
# # ================================================================

# @router.get(
#     "/{attendance_id}",
#     response_model=AttendanceResponse,
# )
# def get_attendance_by_id(
#     attendance_id: int,

#     service: AttendanceService = Depends(
#         get_attendance_service
#     ),
# ):
#     return service.get_record_by_id(
#         attendance_id
#     )


# # ================================================================
# # UPDATE ATTENDANCE
# # ================================================================

# @router.patch("/{attendance_id}")
# def update_attendance(
#     attendance_id: int,

#     data: AttendanceUpdate,

#     service: AttendanceService = Depends(
#         get_attendance_service
#     ),
# ):
#     return service.update_record(
#         attendance_id,
#         data,
#     )


# # ================================================================
# # DELETE ATTENDANCE
# # ================================================================

# @router.delete("/{attendance_id}")
# def delete_attendance(
#     attendance_id: int,

#     service: AttendanceService = Depends(
#         get_attendance_service
#     ),
# ):
#     return service.delete_record(
#         attendance_id
#     )

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.presentation.dependencies.database import get_transactional_db
from app.core.security import get_current_user_id

from app.infrastructure.repositories.attendance.attendance_repository import (
    AttendanceRepository,
)
from app.infrastructure.repositories.attendance.attendance_admin_repository import (
    AttendanceAdminRepository,
)

from app.infrastructure.repositories.attendance.attendance_report_repository import (
    AttendanceReportRepository,
)

from app.application.services.attendance.attendance_service import (
    AttendanceService,
)
from app.application.services.attendance.attendance_admin_service import (
    AttendanceAdminService,
)
from app.application.services.attendance.attendance_report_service import (
    AttendanceReportService,
)
from app.application.services.attendance.location_service import (
    LocationService,
)

from app.application.dtos.attendance.attendance import (
    AttendanceUpdate,
    AttendanceResponse,
)
from app.application.dtos.attendance.attendance_location import (
    PunchLocationRequest,
)
from app.application.dtos.attendance.attendance_admin import (
    LateMarkRequest,
)


router = APIRouter()


def get_attendance_service(
    db: Session = Depends(get_transactional_db),
) -> AttendanceService:
    return AttendanceService(
        repo=AttendanceRepository(db),
        location_service=LocationService(),
    )


def get_attendance_admin_service(
    db: Session = Depends(get_transactional_db),
) -> AttendanceAdminService:
    return AttendanceAdminService(
        repository=AttendanceAdminRepository(db)
    )


def get_attendance_report_service(
    db: Session = Depends(get_transactional_db),
) -> AttendanceReportService:
    return AttendanceReportService(
        repository=AttendanceReportRepository(db)
    )


# ================================================================
# EMPLOYEE ATTENDANCE
# ================================================================

@router.post("/punch-in")
def punch_in(
    location: PunchLocationRequest,
    emp_id: int = Depends(get_current_user_id),
    service: AttendanceService = Depends(get_attendance_service),
):
    return service.punch_in(
        emp_id=emp_id,
        location=location,
    )


@router.post("/break-in")
def break_in(
    emp_id: int = Depends(get_current_user_id),
    service: AttendanceService = Depends(get_attendance_service),
):
    return service.break_in(emp_id)


@router.post("/break-out")
def break_out(
    emp_id: int = Depends(get_current_user_id),
    service: AttendanceService = Depends(get_attendance_service),
):
    return service.break_out(emp_id)


@router.post("/punch-out")
def punch_out(
    location: PunchLocationRequest,
    emp_id: int = Depends(get_current_user_id),
    service: AttendanceService = Depends(get_attendance_service),
):
    return service.punch_out(
        emp_id=emp_id,
        location=location,
    )


# ================================================================
# ADMIN ATTENDANCE
# ================================================================

@router.get("/history")
def get_attendance_history(
    month: Optional[int] = Query(
        None,
        ge=1,
        le=12,
    ),
    year: Optional[int] = Query(
        None,
        ge=2000,
        le=2100,
    ),
    page: int = Query(
        1,
        ge=1,
    ),
    page_size: int = Query(
        20,
        ge=1,
        le=200,
    ),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    emp_id: Optional[int] = Query(
        None,
        ge=1,
    ),
    department_id: Optional[int] = Query(
        None,
        ge=1,
    ),
    search: Optional[str] = Query(None),
    service: AttendanceReportService = Depends(
        get_attendance_report_service
    ),
    admin_service: AttendanceAdminService = Depends(
        get_attendance_admin_service
    ),
):
    # Monthly report is the .NET attendance-history replica.
    if month is not None or year is not None:
        if month is None or year is None:
            from fastapi import HTTPException
            raise HTTPException(
                status_code=400,
                detail="Both month and year are required.",
            )

        return service.get_history(
            year=year,
            month=month,
            page=page,
            page_size=page_size,
            search=search,
            employee_id=emp_id,
        )

    # Preserve the existing date-range admin history API.
    return admin_service.history(
        page=page,
        page_size=page_size,
        from_date=from_date,
        to_date=to_date,
        emp_id=emp_id,
        department_id=department_id,
        search=search,
    )


@router.get("/employees")
def get_attendance_employees(
    search: Optional[str] = Query(None),
    service: AttendanceReportService = Depends(
        get_attendance_report_service
    ),
):
    return service.get_employees(search=search)


@router.get("/monthly-numbers")
def get_monthly_attendance_numbers(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=2100),
    employee_id: Optional[int] = Query(
        None,
        ge=1,
    ),
    service: AttendanceReportService = Depends(
        get_attendance_report_service
    ),
):
    return service.get_monthly_numbers(
        year=year,
        month=month,
        employee_id=employee_id,
    )


@router.get("/calculate-late-marks")
def calculate_late_marks(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=2100),
    employee_id: Optional[int] = Query(
        None,
        ge=1,
    ),
    service: AttendanceReportService = Depends(
        get_attendance_report_service
    ),
):
    return service.calculate_late_marks(
        year=year,
        month=month,
        employee_id=employee_id,
    )


# Existing admin endpoints remain available.

@router.get("/summary")
def get_attendance_summary(
    from_date: date = Query(...),
    to_date: date = Query(...),
    emp_id: Optional[int] = Query(None, ge=1),
    service: AttendanceAdminService = Depends(
        get_attendance_admin_service
    ),
):
    return service.summary(
        from_date=from_date,
        to_date=to_date,
        emp_id=emp_id,
    )


@router.get("/overview")
def get_attendance_overview(
    from_date: date = Query(...),
    to_date: date = Query(...),
    emp_id: Optional[int] = Query(None, ge=1),
    service: AttendanceAdminService = Depends(
        get_attendance_admin_service
    ),
):
    return service.overview(
        from_date=from_date,
        to_date=to_date,
        emp_id=emp_id,
    )


@router.get("/filter")
def get_attendance_filter(
    service: AttendanceAdminService = Depends(
        get_attendance_admin_service
    ),
):
    return service.filters()


@router.get("/export")
def export_attendance(
    from_date: date = Query(...),
    to_date: date = Query(...),
    emp_id: Optional[int] = Query(None, ge=1),
    department_id: Optional[int] = Query(None, ge=1),
    search: Optional[str] = Query(None),
    service: AttendanceAdminService = Depends(
        get_attendance_admin_service
    ),
):
    return service.export(
        from_date=from_date,
        to_date=to_date,
        emp_id=emp_id,
        department_id=department_id,
        search=search,
    )


@router.get("/history/export")
def export_attendance_history(
    from_date: date = Query(...),
    to_date: date = Query(...),
    emp_id: Optional[int] = Query(None, ge=1),
    department_id: Optional[int] = Query(None, ge=1),
    search: Optional[str] = Query(None),
    service: AttendanceAdminService = Depends(
        get_attendance_admin_service
    ),
):
    return service.export(
        from_date=from_date,
        to_date=to_date,
        emp_id=emp_id,
        department_id=department_id,
        search=search,
    )


@router.post("/late-marks/calculate")
def calculate_admin_late_marks(
    request: LateMarkRequest,
    service: AttendanceAdminService = Depends(
        get_attendance_admin_service
    ),
):
    return service.calculate_late_marks(
        from_date=request.from_date,
        to_date=request.to_date,
        emp_id=request.emp_id,
        grace_minutes=request.grace_minutes,
    )


# ================================================================
# GENERIC ATTENDANCE
# ================================================================

@router.get("/")
def get_all_attendance(
    page: int = Query(
        1,
        ge=1,
        description="Page number",
    ),
    page_size: int = Query(
        50,
        ge=1,
        le=100,
        description="Number of records per page",
    ),
    service: AttendanceService = Depends(
        get_attendance_service
    ),
):
    return service.get_all_records(
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{attendance_id}",
    response_model=AttendanceResponse,
)
def get_attendance_by_id(
    attendance_id: int,
    service: AttendanceService = Depends(
        get_attendance_service
    ),
):
    return service.get_record_by_id(attendance_id)


@router.patch("/{attendance_id}")
def update_attendance(
    attendance_id: int,
    data: AttendanceUpdate,
    service: AttendanceService = Depends(
        get_attendance_service
    ),
):
    return service.update_record(
        attendance_id,
        data,
    )


@router.delete("/{attendance_id}")
def delete_attendance(
    attendance_id: int,
    service: AttendanceService = Depends(
        get_attendance_service
    ),
):
    return service.delete_record(attendance_id)
