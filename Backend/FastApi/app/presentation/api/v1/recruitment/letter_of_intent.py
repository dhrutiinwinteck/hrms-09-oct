from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.application.dtos.recruitment.letter_of_intent import (
    LetterOfIntentSettingsResponse,
    LetterOfIntentSettingsUpdate,
)
from app.application.services.recruitment.letter_of_intent_service import (
    LetterOfIntentSettingsService,
)
from app.core.config import settings
from app.core.security import get_current_username
from app.infrastructure.database.connection import (
    get_db_session,
)
from app.infrastructure.repositories.recruitment.letter_of_intent_repository import (
    LetterOfIntentSettingsRepository,
)


router = APIRouter(
    prefix="/recruitment/letter-of-intent",
    tags=["Letter of Intent"],
)


# ============================================================
# FILE VALIDATION
# ============================================================

ALLOWED_LOGO_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024


ALLOWED_STAMP_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

MAX_STAMP_SIZE_BYTES = 2 * 1024 * 1024


ALLOWED_SIGNATURE_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

MAX_SIGNATURE_SIZE_BYTES = 2 * 1024 * 1024


# ============================================================
# SERVICE
# ============================================================

def get_service(
    db: Session = Depends(get_db_session),
) -> LetterOfIntentSettingsService:

    repository = LetterOfIntentSettingsRepository(db)

    return LetterOfIntentSettingsService(
        repository,
    )


# ============================================================
# GET SETTINGS
# ============================================================

@router.get(
    "/settings",
    response_model=LetterOfIntentSettingsResponse,
    status_code=status.HTTP_200_OK,
)
def get_letter_of_intent_settings(
    _username: str = Depends(get_current_username),
    service: LetterOfIntentSettingsService = Depends(
        get_service,
    ),
) -> LetterOfIntentSettingsResponse:

    return service.get_settings()


# ============================================================
# UPDATE SETTINGS
# ============================================================

@router.put(
    "/settings",
    response_model=LetterOfIntentSettingsResponse,
    status_code=status.HTTP_200_OK,
)
def update_letter_of_intent_settings(
    payload: LetterOfIntentSettingsUpdate,
    username: str = Depends(get_current_username),
    service: LetterOfIntentSettingsService = Depends(
        get_service,
    ),
) -> LetterOfIntentSettingsResponse:

    return service.update_settings(
        payload,
        username,
    )


# ============================================================
# UPLOAD COMPANY LOGO
# ============================================================

@router.post(
    "/settings/logo",
    response_model=LetterOfIntentSettingsResponse,
    status_code=status.HTTP_200_OK,
)
def upload_letter_of_intent_logo(
    file: UploadFile = File(...),
    username: str = Depends(get_current_username),
    service: LetterOfIntentSettingsService = Depends(
        get_service,
    ),
) -> LetterOfIntentSettingsResponse:

    extension = ALLOWED_LOGO_CONTENT_TYPES.get(
        file.content_type or "",
    )

    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                "Only JPG, PNG, and WEBP logo files "
                "are supported."
            ),
        )

    content = file.file.read(
        MAX_LOGO_SIZE_BYTES + 1,
    )

    if len(content) > MAX_LOGO_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Company logo must not exceed 2 MB.",
        )

    upload_directory = Path(
        settings.LETTER_OF_INTENT_UPLOAD_DIRECTORY,
    )

    upload_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    filename = (
        f"company-logo-{uuid4().hex}{extension}"
    )

    destination = (
        upload_directory / filename
    )

    destination.write_bytes(content)

    try:
        payload = LetterOfIntentSettingsUpdate(
            company_logo=(
                "/uploads/letter-of-intent/"
                f"{filename}"
            ),
        )

        return service.update_settings(
            payload,
            username,
        )

    except Exception:
        destination.unlink(
            missing_ok=True,
        )
        raise


# ============================================================
# UPLOAD HR STAMP
# ============================================================

@router.post(
    "/settings/stamp",
    response_model=LetterOfIntentSettingsResponse,
    status_code=status.HTTP_200_OK,
)
def upload_letter_of_intent_stamp(
    file: UploadFile = File(...),
    username: str = Depends(get_current_username),
    service: LetterOfIntentSettingsService = Depends(
        get_service,
    ),
) -> LetterOfIntentSettingsResponse:

    extension = ALLOWED_STAMP_CONTENT_TYPES.get(
        file.content_type or "",
    )

    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                "Only JPG, PNG, and WEBP stamp files "
                "are supported."
            ),
        )

    content = file.file.read(
        MAX_STAMP_SIZE_BYTES + 1,
    )

    if len(content) > MAX_STAMP_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="HR stamp must not exceed 2 MB.",
        )

    upload_directory = Path(
        settings.LETTER_OF_INTENT_UPLOAD_DIRECTORY,
    )

    upload_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    filename = (
        f"hr-stamp-{uuid4().hex}{extension}"
    )

    destination = (
        upload_directory / filename
    )

    destination.write_bytes(content)

    try:
        payload = LetterOfIntentSettingsUpdate(
            stamp_image_path=(
                "/uploads/letter-of-intent/"
                f"{filename}"
            ),
        )

        return service.update_settings(
            payload,
            username,
        )

    except Exception:
        destination.unlink(
            missing_ok=True,
        )
        raise


# ============================================================
# UPLOAD HR SIGNATURE
# ============================================================

@router.post(
    "/settings/signature",
    response_model=LetterOfIntentSettingsResponse,
    status_code=status.HTTP_200_OK,
)
def upload_letter_of_intent_signature(
    file: UploadFile = File(...),
    username: str = Depends(get_current_username),
    service: LetterOfIntentSettingsService = Depends(
        get_service,
    ),
) -> LetterOfIntentSettingsResponse:

    extension = ALLOWED_SIGNATURE_CONTENT_TYPES.get(
        file.content_type or "",
    )

    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                "Only JPG, PNG, and WEBP signature files "
                "are supported."
            ),
        )

    content = file.file.read(
        MAX_SIGNATURE_SIZE_BYTES + 1,
    )

    if len(content) > MAX_SIGNATURE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="HR signature must not exceed 2 MB.",
        )

    upload_directory = Path(
        settings.LETTER_OF_INTENT_UPLOAD_DIRECTORY,
    )

    upload_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    filename = (
        f"hr-signature-{uuid4().hex}{extension}"
    )

    destination = (
        upload_directory / filename
    )

    destination.write_bytes(content)

    try:
        payload = LetterOfIntentSettingsUpdate(
            signature_image_path=(
                "/uploads/letter-of-intent/"
                f"{filename}"
            ),
        )

        return service.update_settings(
            payload,
            username,
        )

    except Exception:
        destination.unlink(
            missing_ok=True,
        )
        raise