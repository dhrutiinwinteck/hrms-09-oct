from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.application.dtos.permission.permission_dto import (
    SavePermissionsRequest,
)

from app.application.services.permission.permission_service import (
    PermissionService,
)

from app.presentation.dependencies.database import (
    get_transactional_db,
)


router = APIRouter()


# ============================================================
# GET ROLE PERMISSIONS
# ============================================================

@router.get(
    "/role/{role_id}"
)
def get_role_permissions(
    role_id: str,

    db: Session = Depends(
        get_transactional_db
    ),
):

    service = PermissionService(
        db
    )

    return service.get_permissions(
        target_type="role",
        target_id=role_id,
    )


# ============================================================
# SAVE ROLE PERMISSIONS
# ============================================================

@router.put(
    "/role/{role_id}"
)
def save_role_permissions(
    role_id: str,

    data: SavePermissionsRequest,

    db: Session = Depends(
        get_transactional_db
    ),
):

    data.target_type = "role"

    data.target_id = role_id

    service = PermissionService(
        db
    )

    return service.save_all_permissions(
        data
    )


# ============================================================
# GET USER PERMISSIONS
# ============================================================

@router.get(
    "/user/{user_id}"
)
def get_user_permissions(
    user_id: str,

    db: Session = Depends(
        get_transactional_db
    ),
):

    service = PermissionService(
        db
    )

    return service.get_permissions(
        target_type="user",
        target_id=user_id,
    )


# ============================================================
# SAVE USER PERMISSIONS
# ============================================================

@router.put(
    "/user/{user_id}"
)
def save_user_permissions(
    user_id: str,

    data: SavePermissionsRequest,

    db: Session = Depends(
        get_transactional_db
    ),
):

    data.target_type = "user"

    data.target_id = user_id

    service = PermissionService(
        db
    )

    return service.save_all_permissions(
        data
    )