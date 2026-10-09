from pathlib import Path
from email.message import EmailMessage
import mimetypes
import smtplib

from app.core.config import settings

class PolicyEmailError(Exception):
    """Raised when a policy email cannot be sent."""

class PolicyEmailService:
    """
    Service responsible for sending policy emails
    with policy documents attached.
    """

    def send_policy_email(
        self,
        recipient_email: str,
        employee_name: str,
        policies: list[dict],
    ) -> None:

        # ====================================================
        # VALIDATE RECIPIENT
        # ====================================================

        if not recipient_email:
            raise PolicyEmailError(
                "Employee email address is missing."
            )

        if not policies:
            raise PolicyEmailError(
                "No policies were provided for email."
            )

        # ====================================================
        # VALIDATE SMTP CONFIGURATION
        # ====================================================

        if not settings.MAIL_USERNAME:
            raise PolicyEmailError(
                "MAIL_USERNAME is not configured."
            )

        if not settings.MAIL_PASSWORD:
            raise PolicyEmailError(
                "MAIL_PASSWORD is not configured."
            )

        sender_email = (
            settings.MAIL_FROM
            or settings.MAIL_USERNAME
        )

        # ====================================================
        # CREATE EMAIL
        # ====================================================

        message = EmailMessage()

        message["Subject"] = (
            "HRMS Policy Acceptance"
        )

        message["From"] = (
            f"{settings.MAIL_FROM_NAME} "
            f"<{sender_email}>"
        )

        message["To"] = recipient_email

        # ====================================================
        # POLICY DETAILS
        # ====================================================

        policy_rows = []

        for policy in policies:

            policy_name = str(
                policy.get(
                    "policy_name",
                    "Policy",
                )
            )

            version = policy.get(
                "version",
                1,
            )

            policy_rows.append(
                f"""
                <li>
                    <strong>{policy_name}</strong>
                    - Version {version}
                </li>
                """
            )

        policies_html = "".join(
            policy_rows
        )

        # ====================================================
        # HTML BODY
        # ====================================================

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>HRMS Policy Acceptance</title>
        </head>

        <body
            style="
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
            "
        >

            <h2>
                HRMS Policy Acceptance
            </h2>

            <p>
                Dear {employee_name},
            </p>

            <p>
                You have successfully accepted
                the following HRMS policies:
            </p>

            <ul>
                {policies_html}
            </ul>

            <p>
                The applicable policy documents
                are attached to this email.
            </p>

            <p>
                Please retain this email
                for your records.
            </p>

            <br>

            <p>
                Regards,<br>
                <strong>
                    {settings.MAIL_FROM_NAME}
                </strong>
            </p>

        </body>
        </html>
        """

        # ====================================================
        # PLAIN TEXT BODY
        # ====================================================

        plain_body = (
            f"Dear {employee_name},\n\n"
            "You have successfully accepted "
            "the following HRMS policies:\n\n"
        )

        for policy in policies:

            plain_body += (
                f"- {policy.get('policy_name', 'Policy')} "
                f"(Version {policy.get('version', 1)})\n"
            )

        plain_body += (
            "\nThe applicable policy documents "
            "are attached to this email.\n\n"
            "Regards,\n"
            f"{settings.MAIL_FROM_NAME}"
        )

        message.set_content(
            plain_body
        )

        message.add_alternative(
            html_body,
            subtype="html",
        )

        # ====================================================
        # ATTACH POLICY DOCUMENTS
        # ====================================================

        attached_files = 0

        for policy in policies:

            file_path_value = policy.get(
                "file_path"
            )

            if not file_path_value:
                continue

            file_path = Path(
                file_path_value
            )

            if not file_path.exists():
                raise PolicyEmailError(
                    "Policy document not found: "
                    f"{file_path.name}"
                )

            file_data = file_path.read_bytes()

            mime_type, _ = (
                mimetypes.guess_type(
                    file_path.name
                )
            )

            if mime_type:

                maintype, subtype = (
                    mime_type.split(
                        "/",
                        1,
                    )
                )

            else:

                maintype = "application"
                subtype = "octet-stream"

            message.add_attachment(
                file_data,
                maintype=maintype,
                subtype=subtype,
                filename=file_path.name,
            )

            attached_files += 1

        if attached_files == 0:
            raise PolicyEmailError(
                "No policy document could be attached."
            )

        # ====================================================
        # SEND EMAIL
        # ====================================================

        try:

            if settings.MAIL_USE_SSL:

                with smtplib.SMTP_SSL(
                    settings.MAIL_HOST,
                    settings.MAIL_PORT,
                    timeout=30,
                ) as smtp:

                    smtp.login(
                        settings.MAIL_USERNAME,
                        settings.MAIL_PASSWORD,
                    )

                    smtp.send_message(
                        message
                    )

            else:

                with smtplib.SMTP(
                    settings.MAIL_HOST,
                    settings.MAIL_PORT,
                    timeout=30,
                ) as smtp:

                    smtp.ehlo()

                    if settings.MAIL_USE_TLS:

                        smtp.starttls()
                        smtp.ehlo()

                    smtp.login(
                        settings.MAIL_USERNAME,
                        settings.MAIL_PASSWORD,
                    )

                    smtp.send_message(
                        message
                    )

        except (
            OSError,
            smtplib.SMTPException,
        ) as exc:

            raise PolicyEmailError(
                "Unable to send policy email: "
                f"{exc}"
            ) from exc

