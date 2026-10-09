from __future__ import annotations

import html
import io
import re

from datetime import date, datetime
from pathlib import Path
from typing import Any, Optional

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4, LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.platypus import (
    Flowable,
    Image,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.infrastructure.email.email_service import EmailAttachment
from app.infrastructure.models.recruitment.letter_of_intent import (
    LetterOfIntentSettingsModel,
)


PX_TO_MM = 25.4 / 96


class _SignatureStampOverlay(Flowable):
    """
    Matches the frontend Live Preview signature/stamp layout.

    Frontend reference:
        .loi-signature-images
            width: 175px
            height: 62px

        .loi-signature-image
            left: 0
            top: 7px
            max-width: 100px
            max-height: 45px

        .loi-signature-stamp
            left: 35px
            top: -10px
            max-width: 60px
            max-height: 60px
    """

    ROW_WIDTH = 175 * PX_TO_MM * mm
    ROW_HEIGHT = 72 * PX_TO_MM * mm

    SIGNATURE_LEFT = 0 * PX_TO_MM * mm
    SIGNATURE_BOTTOM = 7 * PX_TO_MM * mm
    SIGNATURE_MAX_WIDTH = 100 * PX_TO_MM * mm
    SIGNATURE_MAX_HEIGHT = 45 * PX_TO_MM * mm

    STAMP_LEFT = 35 * PX_TO_MM * mm
    STAMP_BOTTOM = 10 * PX_TO_MM * mm
    STAMP_MAX_WIDTH = 60 * PX_TO_MM * mm
    STAMP_MAX_HEIGHT = 60 * PX_TO_MM * mm

    def __init__(
        self,
        signature_path: Optional[Path],
        stamp_path: Optional[Path],
    ) -> None:
        super().__init__()
        self.signature_path = signature_path
        self.stamp_path = stamp_path
        self.width = self.ROW_WIDTH
        self.height = self.ROW_HEIGHT

    @staticmethod
    def _fit_size(
        path: Path,
        max_width: float,
        max_height: float,
    ) -> Optional[tuple[float, float]]:
        try:
            image_reader = ImageReader(str(path))
            source_width, source_height = image_reader.getSize()

            if source_width <= 0 or source_height <= 0:
                return None

            scale = min(
                max_width / float(source_width),
                max_height / float(source_height),
            )

            return (
                float(source_width) * scale,
                float(source_height) * scale,
            )
        except Exception:
            return None

    def wrap(self, avail_width: float, avail_height: float):
        return self.width, self.height

    def draw(self) -> None:
        canvas = self.canv

        if self.signature_path:
            signature_size = self._fit_size(
                self.signature_path,
                self.SIGNATURE_MAX_WIDTH,
                self.SIGNATURE_MAX_HEIGHT,
            )

            if signature_size is not None:
                signature_width, signature_height = signature_size

                canvas.drawImage(
                    str(self.signature_path),
                    self.SIGNATURE_LEFT,
                    self.SIGNATURE_BOTTOM,
                    width=signature_width,
                    height=signature_height,
                    preserveAspectRatio=True,
                    mask="auto",
                )

        if self.stamp_path:
            stamp_size = self._fit_size(
                self.stamp_path,
                self.STAMP_MAX_WIDTH,
                self.STAMP_MAX_HEIGHT,
            )

            if stamp_size is not None:
                stamp_width, stamp_height = stamp_size

                canvas.drawImage(
                    str(self.stamp_path),
                    self.STAMP_LEFT,
                    self.STAMP_BOTTOM,
                    width=stamp_width,
                    height=stamp_height,
                    preserveAspectRatio=True,
                    mask="auto",
                )


class LetterOfIntentPdfService:
    """
    Generates a candidate-specific Letter of Intent PDF.

    The service always reads the latest Letter of Intent settings
    from the database at the time the candidate is approved.

    Candidate-specific information comes from JobApplication.
    """

    def __init__(self, db) -> None:
        self.db = db

    def generate_pdf(self, application: Any) -> EmailAttachment:
        settings = (
            self.db.query(LetterOfIntentSettingsModel)
            .filter(LetterOfIntentSettingsModel.setting_key == "default")
            .first()
        )

        if settings is None:
            raise RuntimeError("Letter of Intent settings were not found.")

        candidate_name = " ".join(
            part.strip()
            for part in [
                getattr(application, "first_name", None),
                getattr(application, "last_name", None),
            ]
            if part and str(part).strip()
        ).strip() or "Candidate"

        candidate_email = self._clean_value(
            getattr(application, "email", None),
            "",
        )

        candidate_phone = self._clean_value(
            getattr(application, "phone_number", None),
            "",
        )

        candidate_address = self._get_candidate_address(application)

        joining_date = (
            getattr(application, "joining_date", None)
            or getattr(settings, "joining_date", None)
        )

        position_role = (
            getattr(application, "position_applied_for", None)
            or getattr(settings, "position_role", None)
            or ""
        )

        letter_date = (
            getattr(settings, "letter_date", None)
            or date.today()
        )

        company_name = self._clean_value(
            getattr(settings, "company_name", None),
            "Inwinteck Pvt Ltd",
        )

        registered_address = self._clean_value(
            getattr(settings, "registered_office_address", None),
            "",
        )

        logo_path = self._resolve_asset_path(
            getattr(settings, "company_logo", None)
        )

        signature_path = self._resolve_asset_path(
            getattr(settings, "signature_image_path", None)
        )

        stamp_path = self._resolve_asset_path(
            getattr(settings, "stamp_image_path", None)
        )

        page_size = self._get_page_size(
            getattr(settings, "page_size", None)
        )

        buffer = io.BytesIO()

        document = SimpleDocTemplate(
            buffer,
            pagesize=page_size,
            rightMargin=20 * mm,
            leftMargin=20 * mm,
            topMargin=16 * mm,
            bottomMargin=18 * mm,
            title=f"Letter of Intent - {candidate_name}",
            author=company_name,
        )

        styles = self._build_styles()
        story: list[Any] = []

        if (
            getattr(settings, "show_company_logo", True)
            and logo_path
        ):
            logo = self._build_image(
                logo_path,
                max_width=55 * mm,
                max_height=25 * mm,
            )

            if logo is not None:
                story.append(
                    Table(
                        [[logo]],
                        colWidths=[page_size[0] - 40 * mm],
                        style=TableStyle(
                            [
                                (
                                    "ALIGN",
                                    (0, 0),
                                    (-1, -1),
                                    "CENTER",
                                ),
                                (
                                    "VALIGN",
                                    (0, 0),
                                    (-1, -1),
                                    "MIDDLE",
                                ),
                                (
                                    "BOTTOMPADDING",
                                    (0, 0),
                                    (-1, -1),
                                    6,
                                ),
                            ]
                        ),
                    )
                )

        letter_title = self._clean_value(
            getattr(settings, "letter_title", None),
            "LETTER OF INTENT TO HIRE",
        )

        story.append(
            Paragraph(
                html.escape(letter_title.upper()),
                styles["title"],
            )
        )

        story.append(Spacer(1, 7 * mm))

        story.append(
            Paragraph(
                f"Date: {self._format_date(letter_date)}",
                styles["date"],
            )
        )

        story.append(Spacer(1, 8 * mm))

        candidate_details: list[str] = [
            f"<b>{html.escape(candidate_name)}</b>"
        ]

        if candidate_address:
            candidate_details.extend(
                self._address_lines(candidate_address)
            )

        if candidate_phone:
            candidate_details.append(
                f"Contact no: {html.escape(candidate_phone)}"
            )

        if candidate_email:
            candidate_details.append(
                f"Email: {html.escape(candidate_email)}"
            )

        story.append(
            Paragraph(
                "<br/>".join(candidate_details),
                styles["body"],
            )
        )

        story.append(Spacer(1, 5 * mm))

        if position_role:
            story.append(
                Paragraph(
                    f"<b>Position:</b> {html.escape(position_role)}",
                    styles["body"],
                )
            )
            story.append(Spacer(1, 3 * mm))

        letter_body = getattr(settings, "letter_body", None) or ""

        merge_values = {
            "CandidateName": candidate_name,
            "FullName": candidate_name,
            "CandidateEmail": candidate_email,
            "CandidatePhone": candidate_phone,
            "PhoneNumber": candidate_phone,
            "CandidateAddress": candidate_address,
            "Address": candidate_address,
            "Position": position_role,
            "PositionRole": position_role,
            "JoiningDate": self._format_date(joining_date),
            "LetterDate": self._format_date(letter_date),
            "CompanyName": company_name,
            "RegisteredOfficeAddress": registered_address,
            "CompanyAddress": registered_address,
            "ShiftTiming": self._clean_value(
                getattr(settings, "shift_timing", None),
                "",
            ),
            "ProbationPeriod": self._clean_value(
                getattr(settings, "probation_period_months", None),
                "",
            ),
            "ProbationPeriodMonths": self._clean_value(
                getattr(settings, "probation_period_months", None),
                "",
            ),
            "HRSignatoryName": self._clean_value(
                getattr(settings, "hr_signatory_name", None),
                "Authorized Signatory",
            ),
            "HRDesignation": self._clean_value(
                getattr(settings, "hr_designation", None),
                "",
            ),
            "ReferenceContact": self._clean_value(
                getattr(settings, "reference_contact", None),
                "",
            ),
        }

        letter_body = self._replace_merge_fields(
            letter_body,
            merge_values,
        )

        letter_body = self._remove_legacy_signature_block(letter_body)
        body_markup = self._prepare_body_markup(letter_body)

        if body_markup.strip():
            story.append(
                Paragraph(
                    body_markup,
                    styles["body"],
                )
            )

        show_signature_section = getattr(
            settings,
            "show_hr_signature_section",
            True,
        )

        if show_signature_section:
            story.append(
                Spacer(
                    1,
                    17 * PX_TO_MM * mm,
                )
            )

            story.append(
                Paragraph(
                    "Sincerely,",
                    styles["signature_greeting"],
                )
            )

            story.append(
                Spacer(
                    1,
                    5 * PX_TO_MM * mm,
                )
            )

            signature_block = self._build_signature_block(
                signature_path=signature_path,
                stamp_path=stamp_path,
                styles=styles,
                settings=settings,
            )

            if signature_block is not None:
                story.append(signature_block)

        document.build(
            story,
            onFirstPage=lambda canvas, doc: self._draw_footer(
                canvas,
                doc,
                settings,
            ),
            onLaterPages=lambda canvas, doc: self._draw_footer(
                canvas,
                doc,
                settings,
            ),
        )

        pdf_bytes = buffer.getvalue()
        buffer.close()

        if not pdf_bytes:
            raise RuntimeError("Generated Letter of Intent PDF is empty.")

        safe_candidate_name = self._safe_filename(candidate_name)
        filename = f"Letter-of-Intent-{safe_candidate_name}.pdf"

        return EmailAttachment(
            filename=filename,
            content_type="application/pdf",
            content=pdf_bytes,
        )

    @staticmethod
    def _build_styles():
        base_styles = getSampleStyleSheet()

        return {
            "title": ParagraphStyle(
                "LOITitle",
                parent=base_styles["Title"],
                fontName="Helvetica-Bold",
                fontSize=12,
                leading=16,
                alignment=TA_CENTER,
                textColor=colors.black,
                underline=True,
                spaceAfter=0,
            ),
            "date": ParagraphStyle(
                "LOIDate",
                parent=base_styles["Normal"],
                fontName="Helvetica",
                fontSize=9,
                leading=12,
                alignment=TA_RIGHT,
                textColor=colors.black,
            ),
            "body": ParagraphStyle(
                "LOIBody",
                parent=base_styles["Normal"],
                fontName="Helvetica",
                fontSize=9,
                leading=13,
                alignment=TA_LEFT,
                textColor=colors.black,
                spaceAfter=4,
            ),
            "footer": ParagraphStyle(
                "LOIFooter",
                parent=base_styles["Normal"],
                fontName="Helvetica",
                fontSize=7,
                leading=9,
                alignment=TA_CENTER,
                textColor=colors.black,
            ),
            "signature_greeting": ParagraphStyle(
                "LOISignatureGreeting",
                parent=base_styles["Normal"],
                fontName="Helvetica",
                fontSize=7.8 * 72 / 96,
                leading=7.8 * 72 / 96 * 1.35,
                alignment=TA_LEFT,
                textColor=colors.black,
                spaceAfter=0,
            ),
            "signature_name": ParagraphStyle(
                "LOISignatureName",
                parent=base_styles["Normal"],
                fontName="Helvetica-Bold",
                fontSize=7.8 * 72 / 96,
                leading=7.8 * 72 / 96 * 1.35,
                alignment=TA_LEFT,
                textColor=colors.black,
                spaceAfter=0,
            ),
            "signature_designation": ParagraphStyle(
                "LOISignatureDesignation",
                parent=base_styles["Normal"],
                fontName="Helvetica",
                fontSize=7.7 * 72 / 96,
                leading=7.7 * 72 / 96 * 1.35,
                alignment=TA_LEFT,
                textColor=colors.black,
                spaceAfter=0,
            ),
        }

    def _build_signature_block(
        self,
        signature_path: Optional[Path],
        stamp_path: Optional[Path],
        styles,
        settings,
    ):
        overlay = _SignatureStampOverlay(
            signature_path=signature_path,
            stamp_path=stamp_path,
        )

        signatory_name = self._clean_value(
            getattr(settings, "hr_signatory_name", None),
            "Authorized Signatory",
        )

        signature_name = Paragraph(
            html.escape(signatory_name),
            styles["signature_name"],
        )

        designation = Paragraph(
            "Human Resource Management",
            styles["signature_designation"],
        )

        return KeepTogether(
            [
                overlay,
                Spacer(
                    1,
                    4 * PX_TO_MM * mm,
                ),
                signature_name,
                designation,
            ]
        )

    @staticmethod
    def _draw_footer(canvas, document, settings):
        if not getattr(
            settings,
            "show_registered_office_footer",
            True,
        ):
            return

        footer_text = (
            getattr(
                settings,
                "registered_office_address",
                None,
            )
            or ""
        )

        company_name = (
            getattr(
                settings,
                "company_name",
                None,
            )
            or "Inwinteck Pvt Ltd"
        )

        if footer_text:
            footer = (
                f"(REGD. OFFICE) {company_name} - {footer_text}"
            )
        else:
            footer = f"(REGD. OFFICE) {company_name}"

        canvas.saveState()

        width, _ = canvas._pagesize
        y = 11 * mm

        canvas.setStrokeColor(colors.lightgrey)
        canvas.setLineWidth(0.5)
        canvas.line(
            20 * mm,
            y + 4 * mm,
            width - 20 * mm,
            y + 4 * mm,
        )

        canvas.setFont("Helvetica", 7)
        canvas.setFillColor(colors.black)
        canvas.drawCentredString(
            width / 2,
            y,
            footer,
        )

        canvas.restoreState()

    @staticmethod
    def _replace_merge_fields(
        text: str,
        values: dict[str, Any],
    ) -> str:
        if not text:
            return ""

        result = text

        for field_name, value in values.items():
            placeholder = f"{{{{{field_name}}}}}"

            if value is None:
                replacement = ""
            else:
                replacement = html.escape(str(value))

            result = result.replace(
                placeholder,
                replacement,
            )

        return result

    @staticmethod
    def _remove_legacy_signature_block(text: str) -> str:
        if not text:
            return ""

        pattern = re.compile(
            r"(?is)"
            r"(?:<[^>]*>\s*)*"
            r"Sincerely\s*,?"
            r".*$"
        )

        match = pattern.search(text)

        if match:
            return text[:match.start()].strip()

        return text.strip()

    @staticmethod
    def _prepare_body_markup(body: str) -> str:
        if not body:
            return ""

        result = body.strip()

        result = re.sub(
            r"(?is)</?(?:html|body|head|style|script)[^>]*>",
            "",
            result,
        )

        result = re.sub(
            r"(?is)</?(?:div|section|article)[^>]*>",
            "<br/>",
            result,
        )

        result = re.sub(
            r"(?is)<p[^>]*>",
            "",
            result,
        )

        result = re.sub(
            r"(?is)</p>",
            "<br/><br/>",
            result,
        )

        result = re.sub(
            r"(?is)<li[^>]*>",
            "• ",
            result,
        )

        result = re.sub(
            r"(?is)</li>",
            "<br/>",
            result,
        )

        result = re.sub(
            r"(?is)</?(?:ul|ol)[^>]*>",
            "<br/>",
            result,
        )

        if "<" not in result:
            result = html.escape(result)
            result = result.replace("\r\n", "\n")
            result = result.replace("\n", "<br/>")
        else:
            result = result.replace("\r\n", "<br/>")
            result = result.replace("\n", "<br/>")

        result = re.sub(
            r"(?:<br\s*/?>\s*){4,}",
            "<br/><br/>",
            result,
            flags=re.IGNORECASE,
        )

        return result.strip()

    @staticmethod
    def _get_candidate_address(application: Any) -> str:
        current_address = getattr(
            application,
            "current_address",
            None,
        ) or ""

        permanent_address = getattr(
            application,
            "permanent_address",
            None,
        ) or ""

        current_address = str(current_address).strip()
        permanent_address = str(permanent_address).strip()

        if current_address:
            return current_address

        if permanent_address:
            return permanent_address

        return ""

    @staticmethod
    def _address_lines(address: str) -> list[str]:
        if not address:
            return []

        lines = re.split(
            r"[\r\n]+",
            address.strip(),
        )

        return [
            html.escape(line.strip())
            for line in lines
            if line.strip()
        ]

    @staticmethod
    def _build_image(
        path: Path,
        max_width: float,
        max_height: float,
    ):
        if not path.exists():
            return None

        try:
            image = Image(
                str(path),
                width=max_width,
                height=max_height,
                kind="proportional",
                hAlign="LEFT",
            )

            image._restrictSize(
                max_width,
                max_height,
            )

            return image
        except Exception:
            return None

    @staticmethod
    def _resolve_asset_path(
        value: Optional[str],
    ) -> Optional[Path]:
        if not value:
            return None

        raw_value = str(value).strip()

        if not raw_value:
            return None

        if raw_value.startswith(
            (
                "http://",
                "https://",
                "data:",
            )
        ):
            return None

        raw_path = Path(raw_value)
        candidates: list[Path] = []

        if raw_path.is_absolute():
            candidates.append(raw_path)
        else:
            cleaned = raw_value.lstrip("/\\")

            backend_root = (
                Path(__file__)
                .resolve()
                .parents[4]
            )

            candidates.extend(
                [
                    Path.cwd() / cleaned,
                    backend_root / cleaned,
                    backend_root / "uploads" / Path(cleaned).name,
                ]
            )

        for candidate in candidates:
            try:
                if candidate.exists():
                    return candidate.resolve()
            except OSError:
                continue

        return None

    @staticmethod
    def _get_page_size(value: Optional[str]):
        normalized = str(value or "A4").strip().upper()

        if normalized == "LETTER":
            return LETTER

        return A4

    @staticmethod
    def _format_date(value: Any) -> str:
        if value is None:
            return ""

        if isinstance(value, datetime):
            value = value.date()

        if isinstance(value, date):
            return value.strftime("%d %B %Y")

        text = str(value).strip()

        if not text:
            return ""

        return text

    @staticmethod
    def _clean_value(
        value: Any,
        default: Any = "",
    ) -> str:
        if value is None:
            return str(default)

        text = str(value).strip()

        if not text:
            return str(default)

        return text

    @staticmethod
    def _safe_filename(value: str) -> str:
        result = re.sub(
            r"[^A-Za-z0-9._-]+",
            "-",
            value.strip(),
        )

        result = result.strip("-.")

        return result or "Candidate"
