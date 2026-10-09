from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.infrastructure.database.connection import get_db_session
from app.application.services.referral.referral_service import ReferralService
from app.application.dtos.referral.referral import (
    ReferralLinkResponse,
    ReferralTokenValidationResponse,
)
from app.core.security import get_current_user_id


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/referrals",
    tags=["Referrals"],
)


# ============================================================
# GET MY REFERRAL LINK
# ============================================================

@router.get(
    "/my-link",
    response_model=ReferralLinkResponse,
)
def get_my_referral_link(
    db: Session = Depends(get_db_session),
    employee_id: int = Depends(get_current_user_id),
):
    """
    Get or create the logged-in employee's permanent referral link.

    Authentication:
        Required.

    Flow:
        1. Get logged-in employee ID from JWT.
        2. Check whether the employee already has a referral.
        3. Create one if it does not exist.
        4. Return the referral token and application URL.
    """

    service = ReferralService(db)

    referral = service.get_or_create_referral(
        employee_id=employee_id
    )

    # Commit only the new referral record if one was created.
    db.commit()

    return ReferralLinkResponse(
        referralToken=referral.referral_token,
        referralUrl=f"/application/{referral.referral_token}",
    )


# ============================================================
# VALIDATE REFERRAL TOKEN
# ============================================================

@router.get(
    "/validate/{referral_token}",
    response_model=ReferralTokenValidationResponse,
)
def validate_referral_token(
    referral_token: str,
    db: Session = Depends(get_db_session),
):
    """
    Validate a referral token for a public candidate application.

    Authentication:
        Not required.

    Reason:
        Candidates opening a referral link are not logged
        into the HRMS system.

    Returns:
        {
            "valid": true
        }

    Raises:
        400 - Referral token is empty.
        404 - Referral token does not exist or is inactive.
    """

    service = ReferralService(db)

    # --------------------------------------------------------
    # Validate referral token
    # --------------------------------------------------------
    #
    # ReferralService.get_referral_by_token() already:
    #
    # 1. Checks whether the token is empty.
    # 2. Removes unnecessary whitespace.
    # 3. Checks the database.
    # 4. Checks that the referral is active.
    # 5. Raises 404 when the token is invalid.
    #
    service.get_referral_by_token(
        referral_token
    )

    # --------------------------------------------------------
    # Token is valid
    # --------------------------------------------------------

    return ReferralTokenValidationResponse(
        valid=True
    )