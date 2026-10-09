import uuid

from datetime import datetime
from pathlib import Path
from typing import Any

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.application.dtos.payroll.payroll_setting import (
    PayrollSettingResponse,
)
from app.application.services.payroll.payroll_setting_service import (
    PayrollSettingService,
)
from app.core.config import settings
from app.infrastructure.database.connection import (
    get_db_session,
)


router = APIRouter(
    prefix="/payroll/settings",
    tags=["Payroll Settings"],
)


# ============================================================
# COMPANY LOGO DIRECTORY
# ============================================================

UPLOAD_DIRECTORY = (
    settings.BASE_DIR
    / "uploads"
    / "company_logo"
)

UPLOAD_DIRECTORY.mkdir(
    parents=True,
    exist_ok=True,
)


# ============================================================
# ALLOWED IMAGE TYPES
# ============================================================

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}


# ============================================================
# SAVE COMPANY LOGO
# ============================================================

def save_company_logo(file: UploadFile) -> str:
    """
    Validate and save the company logo.

    Returns:
        Relative public path of the saved company logo.
    """

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only JPG, JPEG, PNG and WEBP "
                "images are allowed."
            ),
        )

    original_name = Path(
        file.filename or "company_logo"
    ).name

    file_extension = Path(
        original_name
    ).suffix.lower()

    unique_filename = (
        f"{datetime.now().strftime('%Y%m%d%H%M%S')}_"
        f"{uuid.uuid4().hex}"
        f"{file_extension}"
    )

    file_path = UPLOAD_DIRECTORY / unique_filename

    try:
        with open(file_path, "wb") as destination:
            destination.write(file.file.read())

    except OSError as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to save company logo.",
        ) from exc

    # This path is stored in the database.
    return f"/uploads/company_logo/{unique_filename}"


# ============================================================
# GET PAYROLL SETTINGS
# ============================================================

@router.get(
    "",
    response_model=PayrollSettingResponse | None,
)
async def get_payroll_settings(
    db: Session = Depends(get_db_session),
):
    """
    Get existing payroll settings.
    """

    service = PayrollSettingService(db)

    return service.get_settings()


# ============================================================
# SERVE COMPANY LOGO
# ============================================================

@router.get(
    "/uploads/company_logo/{file_name}",
    include_in_schema=False,
)
async def get_company_logo(
    file_name: str,
):
    """
    Serve a company logo from the uploads directory.
    """

    # Prevent directory traversal
    safe_file_name = Path(file_name).name

    if safe_file_name != file_name:
        raise HTTPException(
            status_code=400,
            detail="Invalid file name.",
        )

    file_path = UPLOAD_DIRECTORY / safe_file_name

    if not file_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Company logo not found.",
        )

    return FileResponse(
        path=str(file_path),
    )


# ============================================================
# CREATE PAYROLL SETTINGS
# ============================================================

@router.post(
    "",
    response_model=PayrollSettingResponse,
)
async def add_payroll_settings(
    company_name: str = Form(...),
    company_address: str | None = Form(None),
    company_contact: str | None = Form(None),
    basic_earning: int = Form(0),
    hra: int = Form(0),
    conveyance_allowance: int = Form(0),
    provident_fund: int = Form(0),
    esic: int = Form(0),
    professional_tax: int = Form(0),
    created_by: str | None = Form(None),
    company_logo: UploadFile | None = File(None),
    db: Session = Depends(get_db_session),
):
    """
    Create payroll settings.
    """

    service = PayrollSettingService(db)

    setting_data: dict[str, Any] = {
        "company_name": company_name,
        "company_address": company_address,
        "company_contact": company_contact,
        "basic_earning": basic_earning,
        "hra": hra,
        "conveyance_allowance": conveyance_allowance,
        "provident_fund": provident_fund,
        "esic": esic,
        "professional_tax": professional_tax,
        "created_by": created_by,
        "created_on": datetime.now(),
    }

    if company_logo:
        setting_data["company_logo"] = save_company_logo(
            company_logo
        )

    try:
        # Service is synchronous. Do not use await.
        setting = service.create_settings(
            setting_data
        )

        return setting

    except ValueError as exc:
        raise HTTPException(
            status_code=409,
            detail=str(exc),
        )


# ============================================================
# UPDATE PAYROLL SETTINGS
# ============================================================

@router.put(
    "/{setting_id}",
    response_model=PayrollSettingResponse,
)
async def edit_payroll_settings(
    setting_id: int,
    company_name: str | None = Form(None),
    company_address: str | None = Form(None),
    company_contact: str | None = Form(None),
    basic_earning: int | None = Form(None),
    hra: int | None = Form(None),
    conveyance_allowance: int | None = Form(None),
    provident_fund: int | None = Form(None),
    esic: int | None = Form(None),
    professional_tax: int | None = Form(None),
    modified_by: str | None = Form(None),
    company_logo: UploadFile | None = File(None),
    db: Session = Depends(get_db_session),
):
    """
    Update existing payroll settings.
    """

    service = PayrollSettingService(db)

    setting_data: dict[str, Any] = {
        "company_name": company_name,
        "company_address": company_address,
        "company_contact": company_contact,
        "basic_earning": basic_earning,
        "hra": hra,
        "conveyance_allowance": conveyance_allowance,
        "provident_fund": provident_fund,
        "esic": esic,
        "professional_tax": professional_tax,
        "modified_by": modified_by,
        "modified_on": datetime.now(),
    }

    # Preserve existing values when fields are not provided.
    setting_data = {
        key: value
        for key, value in setting_data.items()
        if value is not None
    }

    if company_logo:
        setting_data["company_logo"] = save_company_logo(
            company_logo
        )

    # Service is synchronous. Do not use await.
    setting = service.update_settings(
        setting_id,
        setting_data,
    )

    if setting is None:
        raise HTTPException(
            status_code=404,
            detail="Payroll settings not found.",
        )

    return setting