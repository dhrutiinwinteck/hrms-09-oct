import secrets
import string

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.infrastructure.repositories.referral.referral_repository import (
    ReferralRepository,
)


class ReferralService:
    """
    Business logic for the Refer & Earn feature.
    """

    def __init__(self, db: Session):
        self.db = db
        self.repository = ReferralRepository(db)

    def get_or_create_referral(
        self,
        employee_id: int,
    ):
        """
        Get the employee's existing referral link.

        If the employee does not have a referral yet,
        create a new unique referral token.
        """

        # --------------------------------------------------
        # 1. Check whether employee already has a referral
        # --------------------------------------------------

        existing_referral = self.repository.get_by_employee_id(
            employee_id
        )

        if existing_referral:
            return existing_referral

        # --------------------------------------------------
        # 2. Generate a unique referral token
        # --------------------------------------------------

        referral_token = self._generate_unique_token()

        # --------------------------------------------------
        # 3. Save referral
        # --------------------------------------------------

        referral = self.repository.create(
            employee_id=employee_id,
            referral_token=referral_token,
        )

        return referral

    def get_referral_by_token(
        self,
        referral_token: str,
    ):
        """
        Find an active referral using its referral token.
        """

        if not referral_token or not referral_token.strip():
            raise HTTPException(
                status_code=400,
                detail="Referral token is required.",
            )

        token = referral_token.strip()

        referral = self.repository.get_by_token(token)

        if referral is None:
            raise HTTPException(
                status_code=404,
                detail="Invalid or inactive referral link.",
            )

        return referral

    def _generate_unique_token(
        self,
        length: int = 12,
    ) -> str:
        """
        Generate a unique referral token.
        """

        characters = string.ascii_uppercase + string.digits

        for _ in range(10):
            token = "".join(
                secrets.choice(characters)
                for _ in range(length)
            )

            existing = self.repository.get_by_token(token)

            if existing is None:
                return token

        raise HTTPException(
            status_code=500,
            detail="Unable to generate a unique referral token.",
        )