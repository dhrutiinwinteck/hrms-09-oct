from __future__ import annotations

from typing import Optional, Sequence

from app.infrastructure.email.email_service import (
    EmailAttachment,
    EmailService,
)


class ResignationEmailService:
    """
    Application service responsible for sending resignation emails.

    This service intentionally does not persist email records because
    the current requirement is email delivery only.
    """

    def __init__(
        self,
        email_service: Optional[EmailService] = None,
    ) -> None:
        self._email_service = (
            email_service
            if email_service is not None
            else EmailService()
        )

    async def send(
        self,
        recipient_email: str,
        subject: str,
        body: str,
        attachments: Optional[
            Sequence[EmailAttachment]
        ] = None,
    ) -> None:

        recipient_email = recipient_email.strip()
        subject = subject.strip()
        body = body.strip()

        if not recipient_email:
            raise ValueError(
                "Employee email address is required."
            )

        if not subject:
            raise ValueError(
                "Email subject is required."
            )

        if not body:
            raise ValueError(
                "Email body is required."
            )

        await self._email_service.send_email(
            recipient=recipient_email,
            subject=subject,
            body=body,
            attachments=attachments,
        )