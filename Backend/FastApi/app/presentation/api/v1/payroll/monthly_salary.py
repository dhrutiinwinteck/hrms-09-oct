from io import BytesIO
from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    Query,
)
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from openpyxl.styles import Font
from sqlalchemy.orm import Session

from app.application.services.payroll.monthly_salary_service import (
    MonthlySalaryService,
)

from app.infrastructure.repositories.payroll.monthly_salary_repository import (
    MonthlySalaryRepository,
)

from app.infrastructure.database.connection import get_db_session


router = APIRouter(
    prefix="/monthly-salary",
    tags=["Monthly Salary"],
)


def get_monthly_salary_service(
    db: Session = Depends(get_db_session),
) -> MonthlySalaryService:

    repository = MonthlySalaryRepository(db)

    return MonthlySalaryService(repository)


@router.get(
    "",
    summary="Get Monthly Salary Sheet",
)
def get_monthly_salary_sheet(
    month: Annotated[
        int,
        Query(
            ge=1,
            le=12,
            description="Salary month",
        ),
    ],

    year: Annotated[
        int,
        Query(
            ge=2000,
            le=2100,
            description="Salary year",
        ),
    ],

    service: MonthlySalaryService = Depends(
        get_monthly_salary_service
    ),
):
    return service.get_monthly_salary_sheet(
        month=month,
        year=year,
    )


@router.get(
    "/export",
    summary="Export Monthly Salary Sheet",
)
def export_monthly_salary_sheet(
    month: Annotated[
        int,
        Query(
            ge=1,
            le=12,
            description="Salary month",
        ),
    ],

    year: Annotated[
        int,
        Query(
            ge=2000,
            le=2100,
            description="Salary year",
        ),
    ],

    service: MonthlySalaryService = Depends(
        get_monthly_salary_service
    ),
):

    result = service.get_monthly_salary_sheet(
        month=month,
        year=year,
    )

    workbook = Workbook()

    worksheet = workbook.active

    if worksheet is None:
        raise RuntimeError(
            "Unable to create Excel worksheet"
        )

    worksheet.title = "Monthly Salary"

    headers = [
        "Employee Name",
        "UAN",
        "ESIC",
        "Bank Name",
        "Account No",
        "IFSC",
        "Net Salary (₹)",
    ]

    worksheet.append(headers)

    for cell in worksheet[1]:
        cell.font = Font(bold=True)

    for employee in result["data"]:

        worksheet.append(
            [
                employee["employee_name"],
                employee["uan"],
                employee["esic"],
                employee["bank_name"],
                employee["account_no"],
                employee["ifsc"],
                employee["net_salary"],
            ]
        )

    column_widths = {
        "A": 25,
        "B": 18,
        "C": 18,
        "D": 25,
        "E": 22,
        "F": 18,
        "G": 18,
    }

    for column, width in column_widths.items():
        worksheet.column_dimensions[
            column
        ].width = width

    output = BytesIO()

    workbook.save(output)

    output.seek(0)

    filename = (
        f"Monthly_Salary_{year}_{month:02d}.xlsx"
    )

    return StreamingResponse(
        output,
        media_type=(
            "application/vnd.openxmlformats-officedocument"
            ".spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )