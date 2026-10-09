from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query
)
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.presentation.dependencies.database import (
    get_transactional_db
)

from app.infrastructure.repositories.payroll.payslip_repository import (
    PayslipRepository
)

from app.application.services.payroll.payslip_service import (
    PayslipService
)


router = APIRouter(
    prefix="/payslips",
    tags=["Payslips"]
)


# =========================================================
# SERVICE
# =========================================================

def get_service(
    db: Session = Depends(
        get_transactional_db
    )
):

    repository = PayslipRepository(
        db
    )

    return PayslipService(
        repository
    )


# =========================================================
# 1. ACTIVE EMPLOYEES
# =========================================================

@router.get("/employees")
def get_employees(
    service: PayslipService = Depends(
        get_service
    )
):

    try:

        return service.get_employees()

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to get employees: {str(exc)}"
        )


# =========================================================
# 2. LIST PAYSLIPS
# =========================================================

@router.get("")
@router.get("/")
def get_payslips(
    emp_id: Optional[int] = Query(
        None
    ),
    year: Optional[int] = Query(
        None
    ),
    month: Optional[int] = Query(
        None,
        ge=1,
        le=12
    ),
    service: PayslipService = Depends(
        get_service
    )
):

    try:

        return service.get_payslips(
            emp_id=emp_id,
            year=year,
            month=month
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to get payslips: {str(exc)}"
        )


# =========================================================
# 2A. PAYSLIPS BY EMPLOYEE ID
# =========================================================

@router.get("/employee/{emp_id}")
def get_employee_payslips(
    emp_id: int,
    service: PayslipService = Depends(
        get_service
    )
):

    try:

        result = (
            service
            .get_payslips_by_employee_id(
                emp_id
            )
        )

        return {
            "success": True,
            "data": result
        }

    except ValueError as exc:

        raise HTTPException(
            status_code=404,
            detail=str(exc)
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to get employee payslips: "
                f"{str(exc)}"
            )
        )


# =========================================================
# 2B. PAYSLIPS BY EMPLOYEE CODE
# =========================================================

@router.get("/employee-code/{emp_code}")
def get_employee_payslips_by_code(
    emp_code: str,
    service: PayslipService = Depends(
        get_service
    )
):

    try:

        result = (
            service
            .get_payslips_by_employee_code(
                emp_code
            )
        )

        return {
            "success": True,
            "data": result
        }

    except ValueError as exc:

        raise HTTPException(
            status_code=404,
            detail=str(exc)
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to get employee payslips: "
                f"{str(exc)}"
            )
        )

# =========================================================
# 3. CHECK
# =========================================================

@router.get("/check")
def check_payslip(
    emp_id: int = Query(
        ...
    ),
    year: int = Query(
        ...
    ),
    month: int = Query(
        ...,
        ge=1,
        le=12
    ),
    service: PayslipService = Depends(
        get_service
    )
):

    try:

        return service.check_payslip(
            emp_id,
            year,
            month
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to check payslip: {str(exc)}"
        )


# =========================================================
# 4. GENERATE
# =========================================================

@router.post("/generate")
def generate_payslip(
    emp_id: int = Query(
        ...
    ),
    year: int = Query(
        ...
    ),
    month: int = Query(
        ...,
        ge=1,
        le=12
    ),
    service: PayslipService = Depends(
        get_service
    )
):

    try:

        result = service.generate_payslip(
            emp_id,
            year,
            month
        )

        return {
            "success": True,
            "message": (
                "Payslip generated successfully"
            ),
            "data": result
        }

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate payslip: {str(exc)}"
        )


# =========================================================
# 5. PAYROLL SETTINGS
# =========================================================

@router.get("/payroll-settings")
def get_payroll_settings(
    service: PayslipService = Depends(
        get_service
    )
):

    try:

        return service.get_payroll_settings()

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to get payroll settings: {str(exc)}"
        )


# =========================================================
# 6. UPDATE PAYROLL SETTINGS
# =========================================================

@router.put("/payroll-settings")
def update_payroll_settings(
    data: dict,
    service: PayslipService = Depends(
        get_service
    )
):

    try:

        return service.update_payroll_settings(
            data
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to update payroll settings: {str(exc)}"
        )


# =========================================================
# 7. PDF
# =========================================================

@router.get("/{payslip_id}/pdf")
def get_payslip_pdf(
    payslip_id: int,
    service: PayslipService = Depends(
        get_service
    )
):

    try:

        pdf = service.generate_pdf(
            payslip_id
        )

        return Response(
            content=pdf,
            media_type="application/pdf",
            headers={
                "Content-Disposition":
                    f'inline; filename="Payslip_{payslip_id}.pdf"'
            }
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=404,
            detail=str(exc)
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate PDF: {str(exc)}"
        )


# =========================================================
# 8. DELETE
# =========================================================

@router.delete("/{payslip_id}")
def delete_payslip(
    payslip_id: int,
    service: PayslipService = Depends(
        get_service
    )
):

    try:

        result = service.delete_payslip(
            payslip_id
        )

        return {
            "success": True,
            "message": (
                "Payslip deleted successfully"
            ),
            "data": result
        }

    except ValueError as exc:

        raise HTTPException(
            status_code=404,
            detail=str(exc)
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete payslip: {str(exc)}"
        )


# =========================================================
# 9. SINGLE PAYSLIP
# =========================================================

@router.get("/{payslip_id}")
def get_payslip(
    payslip_id: int,
    service: PayslipService = Depends(
        get_service
    )
):

    try:

        result = service.get_payslip(
            payslip_id
        )

        if not result:

            raise HTTPException(
                status_code=404,
                detail="Payslip not found"
            )

        return {
            "success": True,
            "data": result
        }

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to get payslip: {str(exc)}"
        )