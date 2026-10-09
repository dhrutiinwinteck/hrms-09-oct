# # from email.message import EmailMessage
# # from typing import Optional

# # import aiosmtplib

# # from app.core.config import settings


# # class EmailService:
# #     """Handles outbound email delivery through SMTP."""

# #     def __init__(self) -> None:
# #         self.server = settings.MAIL_SERVER
# #         self.port = settings.MAIL_PORT
# #         self.username = settings.MAIL_USERNAME
# #         self.password = settings.MAIL_PASSWORD
# #         self.mail_from = settings.MAIL_FROM
# #         self.mail_from_name = settings.MAIL_FROM_NAME
# #         self.start_tls = settings.MAIL_STARTTLS
# #         self.use_tls = settings.MAIL_SSL_TLS

# #     def _validate_configuration(self) -> None:
# #         missing = []

# #         if not self.server:
# #             missing.append("MAIL_SERVER")

# #         if not self.port:
# #             missing.append("MAIL_PORT")

# #         if not self.username:
# #             missing.append("MAIL_USERNAME")

# #         if not self.password:
# #             missing.append("MAIL_PASSWORD")

# #         if not self.mail_from:
# #             missing.append("MAIL_FROM")

# #         if missing:
# #             raise RuntimeError(
# #                 "SMTP configuration is incomplete. "
# #                 f"Missing: {', '.join(missing)}"
# #             )

# #         if self.start_tls and self.use_tls:
# #             raise RuntimeError(
# #                 "Invalid SMTP configuration: "
# #                 "MAIL_STARTTLS and MAIL_SSL_TLS cannot both be true."
# #             )

# #     async def send_email(
# #         self,
# #         recipient: str,
# #         subject: str,
# #         body: str,
# #         html_body: Optional[str] = None,
# #     ) -> None:
# #         """Send an email using the configured SMTP server."""

# #         self._validate_configuration()

# #         if not recipient or not recipient.strip():
# #             raise ValueError(
# #                 "Recipient email address is required."
# #             )

# #         if not subject or not subject.strip():
# #             raise ValueError(
# #                 "Email subject is required."
# #             )

# #         if not body or not body.strip():
# #             raise ValueError(
# #                 "Email body is required."
# #             )

# #         message = EmailMessage()

# #         message["From"] = (
# #             f"{self.mail_from_name} <{self.mail_from}>"
# #             if self.mail_from_name
# #             else self.mail_from
# #         )

# #         message["To"] = recipient.strip()
# #         message["Subject"] = subject.strip()

# #         message.set_content(
# #             body.strip()
# #         )

# #         if html_body:
# #             message.add_alternative(
# #                 html_body.strip(),
# #                 subtype="html",
# #             )

# #         try:
# #             await aiosmtplib.send(
# #                 message,
# #                 hostname=self.server,
# #                 port=self.port,
# #                 username=self.username,
# #                 password=self.password,
# #                 start_tls=self.start_tls,
# #                 use_tls=self.use_tls,
# #                 timeout=10,
# #             )

# #         except Exception as exc:
# #             raise RuntimeError(
# #                 f"Unable to send email to {recipient.strip()}: "
# #                 f"{type(exc).__name__}: {exc}"
# #             ) from exc


# from __future__ import annotations

# from email.message import EmailMessage
# from pathlib import Path
# from typing import Optional, Sequence

# import aiosmtplib

# from app.core.config import settings


# class EmailAttachment:
#     """
#     Represents an email attachment.

#     Attributes:
#         filename: Name displayed to the recipient.
#         content_type: MIME content type.
#         content: Raw file bytes.
#     """

#     def __init__(
#         self,
#         filename: str,
#         content_type: str,
#         content: bytes,
#     ) -> None:
#         self.filename = filename
#         self.content_type = content_type
#         self.content = content


# class EmailService:
#     """Handles outbound email delivery through SMTP."""

#     def __init__(self) -> None:
#         self.server = settings.MAIL_SERVER
#         self.port = settings.MAIL_PORT
#         self.username = settings.MAIL_USERNAME
#         self.password = settings.MAIL_PASSWORD
#         self.mail_from = settings.MAIL_FROM
#         self.mail_from_name = settings.MAIL_FROM_NAME
#         self.start_tls = settings.MAIL_STARTTLS
#         self.use_tls = settings.MAIL_SSL_TLS

#     def _validate_configuration(self) -> None:
#         missing: list[str] = []

#         if not self.server:
#             missing.append("MAIL_SERVER")

#         if not self.port:
#             missing.append("MAIL_PORT")

#         if not self.username:
#             missing.append("MAIL_USERNAME")

#         if not self.password:
#             missing.append("MAIL_PASSWORD")

#         if not self.mail_from:
#             missing.append("MAIL_FROM")

#         if missing:
#             raise RuntimeError(
#                 "SMTP configuration is incomplete. "
#                 f"Missing: {', '.join(missing)}"
#             )

#         if self.start_tls and self.use_tls:
#             raise RuntimeError(
#                 "Invalid SMTP configuration: "
#                 "MAIL_STARTTLS and MAIL_SSL_TLS cannot both be true."
#             )

#     async def send_email(
#         self,
#         recipient: str,
#         subject: str,
#         body: str,
#         html_body: Optional[str] = None,
#         attachments: Optional[Sequence[EmailAttachment]] = None,
#     ) -> None:
#         """
#         Send an email using the configured SMTP server.

#         Existing callers that do not provide attachments continue
#         to work without any changes.
#         """

#         self._validate_configuration()

#         if not recipient or not recipient.strip():
#             raise ValueError(
#                 "Recipient email address is required."
#             )

#         if not subject or not subject.strip():
#             raise ValueError(
#                 "Email subject is required."
#             )

#         if not body or not body.strip():
#             raise ValueError(
#                 "Email body is required."
#             )

#         message = EmailMessage()

#         message["From"] = (
#             f"{self.mail_from_name} <{self.mail_from}>"
#             if self.mail_from_name
#             else self.mail_from
#         )

#         message["To"] = recipient.strip()
#         message["Subject"] = subject.strip()

#         message.set_content(body.strip())

#         if html_body:
#             message.add_alternative(
#                 html_body.strip(),
#                 subtype="html",
#             )

#         if attachments:
#             for attachment in attachments:
#                 if not attachment.filename:
#                     raise ValueError(
#                         "Attachment filename is required."
#                     )

#                 if not attachment.content:
#                     raise ValueError(
#                         f"Attachment '{attachment.filename}' is empty."
#                     )

#                 maintype, subtype = self._parse_content_type(
#                     attachment.content_type
#                 )

#                 message.add_attachment(
#                     attachment.content,
#                     maintype=maintype,
#                     subtype=subtype,
#                     filename=attachment.filename,
#                 )

#         try:
#             await aiosmtplib.send(
#                 message,
#                 hostname=self.server,
#                 port=self.port,
#                 username=self.username,
#                 password=self.password,
#                 start_tls=self.start_tls,
#                 use_tls=self.use_tls,
#                 timeout=120,
#             )

#         except Exception as exc:
#             raise RuntimeError(
#                 f"Unable to send email to {recipient.strip()}: "
#                 f"{type(exc).__name__}: {exc}"
#             ) from exc

#     @staticmethod
#     def _parse_content_type(
#         content_type: Optional[str],
#     ) -> tuple[str, str]:
#         """
#         Convert a MIME content type into maintype/subtype.

#         Example:
#             application/pdf
#             -> ("application", "pdf")
#         """

#         if not content_type:
#             return "application", "octet-stream"

#         normalized = content_type.strip().lower()

#         if "/" not in normalized:
#             return "application", "octet-stream"

#         maintype, subtype = normalized.split(
#             "/",
#             maxsplit=1,
#         )

#         return maintype, subtype





from __future__ import annotations

from email.message import EmailMessage
from typing import Optional, Sequence

import aiosmtplib

from app.core.config import settings


class EmailAttachment:
    """
    Represents an email attachment.

    Attributes:
        filename: Name displayed to the recipient.
        content_type: MIME content type.
        content: Raw file bytes.
    """

    def __init__(
        self,
        filename: str,
        content_type: str,
        content: bytes,
    ) -> None:
        self.filename = filename
        self.content_type = content_type
        self.content = content


class EmailService:
    """Handles outbound email delivery through SMTP."""

    def __init__(self) -> None:
        self.server = settings.MAIL_SERVER
        self.port = settings.MAIL_PORT
        self.username = settings.MAIL_USERNAME
        self.password = settings.MAIL_PASSWORD
        self.mail_from = settings.MAIL_FROM
        self.mail_from_name = settings.MAIL_FROM_NAME
        self.start_tls = settings.MAIL_STARTTLS
        self.use_tls = settings.MAIL_SSL_TLS

    def _validate_configuration(self) -> None:
        missing: list[str] = []

        if not self.server:
            missing.append("MAIL_SERVER")

        if not self.port:
            missing.append("MAIL_PORT")

        if not self.username:
            missing.append("MAIL_USERNAME")

        if not self.password:
            missing.append("MAIL_PASSWORD")

        if not self.mail_from:
            missing.append("MAIL_FROM")

        if missing:
            raise RuntimeError(
                "SMTP configuration is incomplete. "
                f"Missing: {', '.join(missing)}"
            )

        if self.start_tls and self.use_tls:
            raise RuntimeError(
                "Invalid SMTP configuration: "
                "MAIL_STARTTLS and MAIL_SSL_TLS cannot both be true."
            )

    async def send_email(
        self,
        recipient: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        attachments: Optional[Sequence[EmailAttachment]] = None,
    ) -> None:
        """
        Send an email using the configured SMTP server.

        Existing callers that do not provide attachments
        continue to work without any changes.
        """

        self._validate_configuration()

        if not recipient or not recipient.strip():
            raise ValueError(
                "Recipient email address is required."
            )

        if not subject or not subject.strip():
            raise ValueError(
                "Email subject is required."
            )

        if not body or not body.strip():
            raise ValueError(
                "Email body is required."
            )

        message = EmailMessage()

        message["From"] = (
            f"{self.mail_from_name} <{self.mail_from}>"
            if self.mail_from_name
            else self.mail_from
        )

        message["To"] = recipient.strip()
        message["Subject"] = subject.strip()

        message.set_content(body.strip())

        if html_body:
            message.add_alternative(
                html_body.strip(),
                subtype="html",
            )

        if attachments:
            for attachment in attachments:

                if not attachment.filename:
                    raise ValueError(
                        "Attachment filename is required."
                    )

                if not attachment.content:
                    raise ValueError(
                        f"Attachment '{attachment.filename}' is empty."
                    )

                maintype, subtype = self._parse_content_type(
                    attachment.content_type
                )

                message.add_attachment(
                    attachment.content,
                    maintype=maintype,
                    subtype=subtype,
                    filename=attachment.filename,
                )

        try:
            await aiosmtplib.send(
                message,
                hostname=self.server,
                port=self.port,
                username=self.username,
                password=self.password,
                start_tls=self.start_tls,
                use_tls=self.use_tls,

                # Increased from 120 seconds.
                # Large attachments can take longer during
                # SMTP DATA processing.
                timeout=300,
            )

        except Exception as exc:
            raise RuntimeError(
                f"Unable to send email to {recipient.strip()}: "
                f"{type(exc).__name__}: {exc}"
            ) from exc

    @staticmethod
    def _parse_content_type(
        content_type: Optional[str],
    ) -> tuple[str, str]:
        """
        Convert a MIME content type into maintype/subtype.

        Example:
            application/pdf
            -> ("application", "pdf")
        """

        if not content_type:
            return "application", "octet-stream"

        normalized = content_type.strip().lower()

        if "/" not in normalized:
            return "application", "octet-stream"

        maintype, subtype = normalized.split(
            "/",
            maxsplit=1,
        )

        return maintype, subtype