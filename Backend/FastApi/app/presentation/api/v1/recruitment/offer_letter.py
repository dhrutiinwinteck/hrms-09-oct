from __future__ import annotations

from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Response,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.application.dtos.recruitment.offer_letter import (
    OfferLetterCreateDto,
    OfferLetterListResponseDto,
    OfferLetterResponseDto,
    OfferLetterUpdateDto,
)
from app.application.services.recruitment.offer_letter_service import (
    OfferLetterService,
)
from app.core.security import get_current_user_id
from app.infrastructure.database.connection import get_db_session


router = APIRouter(
    prefix="/offer-letters",
    tags=["Offer Letters"],
)


def get_offer_letter_service(
    db: Session = Depends(get_db_session),
) -> OfferLetterService:

    return OfferLetterService(db)


@router.post(
    "",
    response_model=OfferLetterResponseDto,
    status_code=status.HTTP_201_CREATED,
)
def create_offer_letter(
    request: OfferLetterCreateDto,
    current_user_id: int = Depends(
        get_current_user_id,
    ),
    service: OfferLetterService = Depends(
        get_offer_letter_service,
    ),
) -> OfferLetterResponseDto:

    return service.create(
        request=request,
        current_user_id=current_user_id,
    )


@router.get(
    "",
    response_model=list[OfferLetterListResponseDto],
    status_code=status.HTTP_200_OK,
)
def get_offer_letters(
    service: OfferLetterService = Depends(
        get_offer_letter_service,
    ),
) -> list[OfferLetterListResponseDto]:

    return service.get_all()


@router.get(
    "/active",
    response_model=Optional[OfferLetterResponseDto],
    status_code=status.HTTP_200_OK,
)
def get_active_offer_letter(
    service: OfferLetterService = Depends(
        get_offer_letter_service,
    ),
) -> Optional[OfferLetterResponseDto]:

    return service.get_active()


@router.get(
    "/{offer_letter_id}",
    response_model=OfferLetterResponseDto,
    status_code=status.HTTP_200_OK,
)
def get_offer_letter(
    offer_letter_id: int,
    service: OfferLetterService = Depends(
        get_offer_letter_service,
    ),
) -> OfferLetterResponseDto:

    return service.get_by_id(
        offer_letter_id=offer_letter_id,
    )


@router.put(
    "/{offer_letter_id}",
    response_model=OfferLetterResponseDto,
    status_code=status.HTTP_200_OK,
)
def update_offer_letter(
    offer_letter_id: int,
    request: OfferLetterUpdateDto,
    current_user_id: int = Depends(
        get_current_user_id,
    ),
    service: OfferLetterService = Depends(
        get_offer_letter_service,
    ),
) -> OfferLetterResponseDto:

    return service.update(
        offer_letter_id=offer_letter_id,
        request=request,
        current_user_id=current_user_id,
    )


@router.post(
    "/{offer_letter_id}/logo",
    response_model=OfferLetterResponseDto,
    status_code=status.HTTP_200_OK,
)
async def upload_offer_letter_logo(
    offer_letter_id: int,
    file: UploadFile = File(...),
    current_user_id: int = Depends(
        get_current_user_id,
    ),
    service: OfferLetterService = Depends(
        get_offer_letter_service,
    ),
) -> OfferLetterResponseDto:

    return await service.update_logo(
        offer_letter_id=offer_letter_id,
        file=file,
        current_user_id=current_user_id,
    )


@router.post(
    "/{offer_letter_id}/signature",
    response_model=OfferLetterResponseDto,
    status_code=status.HTTP_200_OK,
)
async def upload_offer_letter_signature(
    offer_letter_id: int,
    file: UploadFile = File(...),
    current_user_id: int = Depends(
        get_current_user_id,
    ),
    service: OfferLetterService = Depends(
        get_offer_letter_service,
    ),
) -> OfferLetterResponseDto:

    return await service.update_signature(
        offer_letter_id=offer_letter_id,
        file=file,
        current_user_id=current_user_id,
    )


@router.post(
    "/{offer_letter_id}/stamp",
    response_model=OfferLetterResponseDto,
    status_code=status.HTTP_200_OK,
)
async def upload_offer_letter_stamp(
    offer_letter_id: int,
    file: UploadFile = File(...),
    current_user_id: int = Depends(
        get_current_user_id,
    ),
    service: OfferLetterService = Depends(
        get_offer_letter_service,
    ),
) -> OfferLetterResponseDto:

    return await service.update_stamp(
        offer_letter_id=offer_letter_id,
        file=file,
        current_user_id=current_user_id,
    )


@router.delete(
    "/{offer_letter_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_offer_letter(
    offer_letter_id: int,
    service: OfferLetterService = Depends(
        get_offer_letter_service,
    ),
) -> Response:

    service.delete(
        offer_letter_id=offer_letter_id,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )