from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class CreateApplicationInvitationRequest(BaseModel):
    """
    Request used by an authenticated employee to send
    an application invitation.

    The backend provides the default subject/message.
    The authenticated employee may optionally edit them
    before sending.

    The employee ID is NEVER accepted from the client.
    It is obtained from the authenticated JWT.
    """

    candidate_email: EmailStr = Field(
        ...,
        description="Email address of the candidate.",
    )

    subject: Optional[str] = Field(
        default=None,
        max_length=150,
        description=(
            "Optional custom email subject. "
            "If omitted or blank, the backend default subject is used."
        ),
    )

    message: Optional[str] = Field(
        default=None,
        max_length=10000,
        description=(
            "Optional custom email message. "
            "If omitted or blank, the backend default message is used."
        ),
    )

    @field_validator("subject", "message")
    @classmethod
    def normalize_optional_text(
        cls,
        value: Optional[str],
    ) -> Optional[str]:
        if value is None:
            return None

        value = value.strip()

        return value if value else None


class ApplicationInvitationEmailTemplateResponse(BaseModel):
    """
    Backend-provided default email template.
    """

    subject: str = Field(
        ...,
        description="Default email subject.",
    )

    message: str = Field(
        ...,
        description="Default email message.",
    )


class ApplicationInvitationResponse(BaseModel):
    """
    Response returned after an invitation is successfully
    created and the email has been sent.
    """

    success: bool

    message: str

    reference_id: int = Field(
        ...,
        description=(
            "Internal database-generated invitation reference number."
        ),
    )

    application_link: str = Field(
        ...,
        description="Candidate application URL.",
    )


class ApplicationInvitationValidationResponse(BaseModel):
    """
    Public response used to validate a candidate invitation token.
    """

    valid: bool

    candidate_email: Optional[str] = None

    status: Optional[str] = None