from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.infrastructure.models.user.user import UserModel

from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
)

from app.application.dtos.auth.auth import (
    ChangePasswordRequest,
    ChangePasswordRequest1,
    LoginRequest,
    TokenResponse,
)


class AuthService:

    def __init__(self, db: Session):
        self.db = db

    def authenticate(self, data: LoginRequest):

        user = (
            self.db.query(UserModel)
            .filter(
                UserModel.username == data.username
            )
            .first()
        )

        if not user or not verify_password(
            data.password,
            user.passwordhash
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials"
            )

        if user.status != 1:
            raise HTTPException(
                status_code=403,
                detail="User is inactive"
            )

        token = create_access_token(
            subject=user.username
        )

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            username=user.username
        )

    def change_password(
        self,
        data: ChangePasswordRequest
    ):

        user = (
            self.db.query(UserModel)
            .filter(
                UserModel.email == data.email
            )
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        user.passwordhash = get_password_hash(
            data.password
        )

        self.db.commit()

        return {
            "message": "Password changed successfully"
        }

    def change_password1(
        self,
        data: ChangePasswordRequest1
    ):

        # 1. Find user by Employee Code
        # (stored in 'username' column)

        user = (
            self.db.query(UserModel)
            .filter(
                UserModel.username == data.emp_code
            )
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Employee with code "
                    f"{data.emp_code} "
                    f"not found in user accounts"
                )
            )

        # 2. Hash the new password and update

        user.passwordhash = get_password_hash(
            data.password
        )

        # 3. Save changes

        self.db.commit()

        return {
            "message": (
                f"Password for {data.emp_code} "
                "has been changed successfully"
            )
        }