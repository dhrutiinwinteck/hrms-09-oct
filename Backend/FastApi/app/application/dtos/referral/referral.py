from pydantic import BaseModel


# ============================================================
# REFERRAL LINK RESPONSE
# ============================================================

class ReferralLinkResponse(BaseModel):
    """
    Response returned when an employee requests
    their permanent referral link.
    """

    referralToken: str
    referralUrl: str


# ============================================================
# REFERRAL TOKEN VALIDATION RESPONSE
# ============================================================

class ReferralTokenValidationResponse(BaseModel):
    """
    Response returned when a public candidate
    validates a referral token.
    """

    valid: bool