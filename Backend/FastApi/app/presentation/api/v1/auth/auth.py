from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.presentation.dependencies.database import get_transactional_db

from app.application.dtos.auth.auth import (
    ChangePasswordRequest,
    ChangePasswordRequest1,
    LoginRequest,
)

from app.application.services.auth.auth_service import AuthService


router = APIRouter()


@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_transactional_db),
):
    service = AuthService(db)

    return service.authenticate(data)


@router.post("/change-password")
def change_password(
    data: ChangePasswordRequest,
    db: Session = Depends(get_transactional_db),
):
    return AuthService(db).change_password(data)


@router.post("/change-password1")
def change_password1(
    data: ChangePasswordRequest1,
    db: Session = Depends(get_transactional_db),
):
    """
    Update user password using their Employee Code (IWTxxx)
    """
    service = AuthService(db)

    return service.change_password1(data)