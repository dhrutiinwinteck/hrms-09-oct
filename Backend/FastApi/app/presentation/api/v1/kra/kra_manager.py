from fastapi import (
    APIRouter,
    Depends,
    Query,
    status,
)
from sqlalchemy.orm import Session

from app.application.dtos.kra.kra_manager_dto import (
    KRAManagerCreateRequest,
    KRAManagerResponse,
    KRAManagerUpdateRequest,
)
from app.application.services.kra.kra_manager_service import (
    KRAManagerService,
)
from app.core.security import (
    get_current_user_id,
)
from app.infrastructure.database.connection import (
    get_db_session,
)

# ============================================================
# Router
# ============================================================

router = APIRouter()

# ============================================================
# CREATE
# ============================================================

@router.post(
    "/manager",
    response_model=KRAManagerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create KRA Manager record",
)
def create_kra_manager(
    request: KRAManagerCreateRequest,
    db: Session = Depends(get_db_session),
    employee_id: int = Depends(get_current_user_id),
) -> KRAManagerResponse:

    service = KRAManagerService(db)

    return service.create(
        request=request,
        employee_id=employee_id,
    )

# ============================================================
# LIST
# ============================================================

@router.get(
    "/manager",
    response_model=list[KRAManagerResponse],
    status_code=status.HTTP_200_OK,
    summary="List KRA Manager records",
)
def list_kra_manager_records(
    skip: int = Query(
        default=0,
        ge=0,
    ),
    limit: int = Query(
        default=100,
        ge=1,
        le=500,
    ),
    db: Session = Depends(get_db_session),
    employee_id: int = Depends(get_current_user_id),
) -> list[KRAManagerResponse]:

    service = KRAManagerService(db)

    return service.get_all_for_manager(
        employee_id=employee_id,
        skip=skip,
        limit=limit,
    )

# ============================================================
# GET BY ID
# ============================================================

@router.get(
    "/manager/{record_id}",
    response_model=KRAManagerResponse,
    status_code=status.HTTP_200_OK,
    summary="Get KRA Manager record",
)
def get_kra_manager(
    record_id: int,
    db: Session = Depends(get_db_session),
    employee_id: int = Depends(get_current_user_id),
) -> KRAManagerResponse:

    service = KRAManagerService(db)

    return service.get_by_id_for_manager(
        record_id=record_id,
        employee_id=employee_id,
    )

# ============================================================
# UPDATE
# ============================================================

@router.put(
    "/manager/{record_id}",
    response_model=KRAManagerResponse,
    status_code=status.HTTP_200_OK,
    summary="Update KRA Manager record",
)
def update_kra_manager(
    record_id: int,
    request: KRAManagerUpdateRequest,
    db: Session = Depends(get_db_session),
    employee_id: int = Depends(get_current_user_id),
) -> KRAManagerResponse:

    service = KRAManagerService(db)

    return service.update(
        record_id=record_id,
        request=request,
        employee_id=employee_id,
    )

# ============================================================
# DELETE
# ============================================================

@router.delete(
    "/manager/{record_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete KRA Manager record",
)
def delete_kra_manager(
    record_id: int,
    db: Session = Depends(get_db_session),
    employee_id: int = Depends(get_current_user_id),
) -> None:

    service = KRAManagerService(db)

    service.delete(
        record_id=record_id,
        employee_id=employee_id,
    )

    return None

