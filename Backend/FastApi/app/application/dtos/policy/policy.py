from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ============================================================
# POLICY RESPONSE
# ============================================================

class PolicyResponse(BaseModel):
    """
    API response for company policy.
    """

    id: int

    title: str

    description: Optional[str] = None

    documentUrl: Optional[str] = None

    version: int

    status: str

    # Employee code used internally for audit purposes.
    #
    # Example:
    #     IWT90
    createdBy: Optional[str] = None

    # Human-readable employee name for UI display.
    #
    # Example:
    #     Abhinav Chaudhari
    createdByName: Optional[str] = None

    # Reserved for future role resolution.
    creatorRole: Optional[str] = None

    createdAt: Optional[datetime] = None

    updatedAt: Optional[datetime] = None

    isAccepted: bool = False

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# POLICY CONTENT RESPONSE
# ============================================================

class PolicyContentResponse(BaseModel):
    """
    Live readable policy content.

    English:
        PDF/DOCX -> text

    Hindi:
        PDF/DOCX -> English -> Hindi

    Bengali:
        PDF/DOCX -> English -> Bengali

    Translation is NOT persisted.
    """

    success: bool

    message: str

    policy_id: int

    language: str

    title: str

    version: int

    content: str = Field(
        min_length=1
    )


# ============================================================
# POLICY LIST RESPONSE
# ============================================================

class PolicyListResponse(BaseModel):

    success: bool

    message: str

    data: list[PolicyResponse]


# ============================================================
# CREATE RESPONSE
# ============================================================

class PolicyCreateResponse(BaseModel):

    success: bool

    message: str

    data: PolicyResponse


# ============================================================
# DELETE RESPONSE
# ============================================================

class PolicyDeleteResponse(BaseModel):

    success: bool

    message: str


# ============================================================
# ACCEPT REQUEST
# ============================================================

class PolicyAcceptanceRequest(BaseModel):
    """
    Employee policy acceptance request.
    """

    policy_ids: list[int] = Field(
        ...,
        min_length=1,
        description="List of policy IDs to accept.",
    )


# ============================================================
# ACCEPT RESPONSE
# ============================================================

class PolicyAcceptanceResponse(BaseModel):

    success: bool

    message: str

    accepted_policy_ids: list[int] = Field(
        default_factory=list
    )


# ============================================================
# ACCEPTANCE ITEM
# ============================================================

class PolicyAcceptanceItemResponse(BaseModel):

    policy_id: int

    version: int

    accepted: bool

    accepted_on: datetime


# ============================================================
# EMPLOYEE ACCEPTANCE RESPONSE
# ============================================================

class EmployeePolicyAcceptanceResponse(BaseModel):

    success: bool

    message: str

    data: list[
        PolicyAcceptanceItemResponse
    ] = Field(
        default_factory=list
    )