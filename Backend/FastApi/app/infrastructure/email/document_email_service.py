from __future__ import annotations

from pathlib import Path
from typing import Sequence

from app.infrastructure.email.email_service import (
    EmailAttachment,
    EmailService,
)


class DocumentEmailService:
    """
    Handles emails related specifically to onboarding documents.

    This service does NOT handle SMTP directly.
    It uses the common EmailService for actual email delivery.
    """

    def __init__(self) -> None:
        self.email_service = EmailService()

    async def send_onboarding_documents(
        self,
        recipient: str,
        candidate_name: str,
        attachments: Sequence[EmailAttachment],
    ) -> None:
        """
        Send the onboarding document email to the candidate.
        """

        subject = "Your Onboarding Documents"

        body = f"""
Dear {candidate_name},

Congratulations and welcome to the team.

Please find your onboarding documents attached to this email.

The attached documents may include:

- Offer Letter
- Appointment Letter
- HR Policy
- Leave Policy
- Company Introduction

Please review the documents carefully and keep them for your records.

If you have any questions regarding the documents, please contact the HR team.

Regards,
HR Team
"""

        await self.email_service.send_email(
            recipient=recipient,
            subject=subject,
            body=body,
            attachments=attachments,
        )

    @staticmethod
    def create_attachment(
        file_path: str | Path,
        filename: str | None = None,
        content_type: str = "application/pdf",
    ) -> EmailAttachment:
        """
        Convert a file on disk into an EmailAttachment.
        """

        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(
                f"Onboarding document not found: {path}"
            )

        if not path.is_file():
            raise ValueError(
                f"Onboarding document path is not a file: {path}"
            )

        content = path.read_bytes()

        if not content:
            raise ValueError(
                f"Onboarding document is empty: {path}"
            )

        return EmailAttachment(
            filename=filename or path.name,
            content_type=content_type,
            content=content,
        )