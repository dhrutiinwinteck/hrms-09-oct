from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any, Mapping, Optional
import os

from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader


class AppointmentLetterPdfService:
    """
    Production Appointment Letter PDF generator.

    IMPORTANT:
    The original 6-page Appointment Letter PDF is the visual/legal master.
    We do NOT recreate its legal content in ReportLab.

    We only overlay employee-specific values on the original PDF:
      - candidate name
      - designation
      - posting/location
      - CTC
      - probation
      - joining date
      - salary bifurcation values

    Therefore pages 1-6, logo, legal text, footer, fonts, borders and spacing
    remain exactly those of the approved master PDF.
    """

    DEFAULT_PROBATION = "3 Months"

    # Coordinates below are based on the supplied 595.6 x 842.0 pt master.
    # They are expressed as TOP-origin rectangles:
    # (left, top, right, bottom)
    #
    # This makes them easier to verify against the PDF text positions.

    # ------------------------- PAGE 1 -------------------------

    P1_DATE = (408, 134, 528, 153)

    # Only the candidate name after "Dear". "Dear" itself is preserved.
    P1_CANDIDATE_NAME = (91, 181, 143, 199)

    # Only the designation in:
    # "...appoint you as IT Helpdesk & Vendor Management in..."
    P1_DESIGNATION = (338, 204, 523, 223)

    # Only "Thane office" in:
    # "Your initial posting will be at our Thane office."
    P1_POSTING = (221, 262, 289, 280)

    # Only:
    # "Rs xyz/- [CTC xxx only per annum]."
    P1_CTC = (374, 331, 524, 349)

    # Only "30 Days" in the probation paragraph.
    P1_PROBATION = (260, 562, 304, 579)

    # ------------------------- PAGE 4 -------------------------

    # "0/0/2026" in DATE OF JOINING paragraph.
    P4_JOINING_DATE = (232, 587, 276, 603)

    # "3 Months’" in the same paragraph.
    P4_PROBATION = (478, 587, 525, 603)

    # ------------------------- PAGE 6 -------------------------

    # Header values. Labels ("EMP NAME:", "DESIGNATION:", etc.) must remain.
    P6_NAME_VALUE = (138, 199, 369, 216)
    P6_DESIGNATION_VALUE = (450, 199, 554, 216)
    P6_SALARY_MONTH_VALUE = (208, 214, 369, 231)
    P6_CTC_VALUE = (449, 214, 554, 231)

    # Value columns only. Table labels and borders are never covered.
    P6_MONTHLY_VALUE_X = (430, 463)
    P6_ANNUAL_VALUE_X = (519, 554)

    # Top-coordinate row ranges from the supplied master.
    # Each row contains one monthly and one annual value.
    P6_ROWS = {
        "basic": (260, 277),
        "hra": (275, 292),
        "conveyance": (290, 307),
        "education_allowance": (305, 322),
        "special_allowance": (321, 338),
        "sub_total_1": (336, 353),
        "lta": (367, 384),
        "medical": (383, 400),
        "mediclaim": (398, 415),
        "professional_tax": (414, 430),
        "sub_total_deduction": (429, 446),
        "pf": (459, 476),
        "gratuity": (474, 490),
        "sub_total": (489, 505),
        "gross_ctc": (519, 535),
    }

    # The master already contains the correct logo. It is preserved by default.
    # If a configured/uploaded logo is supplied, it can be used as a replacement.
    P6_LOGO = (76, 69, 524, 128)  # TOP-origin, approximate logo area

    def __init__(self, base_dir: str | Path | None = None) -> None:
        self.base_dir = (
            Path(base_dir).resolve()
            if base_dir
            else Path(__file__).resolve().parents[3]
        )

    # ==================================================================
    # PUBLIC API
    # ==================================================================

    def generate(
        self,
        package: Any = None,
        application: Any = None,
        destination_path: str | Path | None = None,
        candidate_name: str | None = None,
        **kwargs: Any,
    ) -> Path:
        if destination_path is None:
            raise ValueError("destination_path is required")

        output = Path(destination_path)
        output.parent.mkdir(parents=True, exist_ok=True)

        master_path = self._find_master_template(kwargs.get("template_path"))

        if master_path is None:
            raise FileNotFoundError(
                "Approved Appointment Letter master PDF was not found. "
                "Put the original 6-page PDF at: "
                "templates/documents/appointment_letter/"
                "Appointment Letter Draft.pdf"
            )

        self._validate_master(master_path)

        data = self._build_data(
            package=package,
            application=application,
            candidate_name=candidate_name,
            extra=kwargs,
        )

        reader = PdfReader(str(master_path))

        writer = PdfWriter()

        for page_index, source_page in enumerate(reader.pages, start=1):
            width = float(source_page.mediabox.width)
            height = float(source_page.mediabox.height)

            overlay_path = output.parent / (
                f".appointment_letter_overlay_{os.getpid()}_{page_index}.pdf"
            )

            try:
                self._create_overlay(
                    overlay_path=overlay_path,
                    page_number=page_index,
                    page_width=width,
                    page_height=height,
                    data=data,
                )

                overlay_reader = PdfReader(str(overlay_path))
                source_page.merge_page(overlay_reader.pages[0])
                writer.add_page(source_page)

            finally:
                try:
                    overlay_path.unlink(missing_ok=True)
                except OSError:
                    pass

        with output.open("wb") as file:
            writer.write(file)

        if not output.exists() or output.stat().st_size == 0:
            raise RuntimeError(
                f"Appointment Letter PDF was not created: {output}"
            )

        # Final safety check: the result must still contain six pages and
        # substantial master text. This catches accidental blank-template use.
        final_reader = PdfReader(str(output))
        if len(final_reader.pages) != 6:
            raise RuntimeError(
                f"Generated Appointment Letter must contain 6 pages; "
                f"found {len(final_reader.pages)}."
            )

        for idx in (1, 2, 3, 4, 5, 6):
            text = final_reader.pages[idx - 1].extract_text() or ""
            if len(text.strip()) < 100:
                raise RuntimeError(
                    f"Generated Appointment Letter page {idx} is unexpectedly "
                    f"empty. The master PDF was not preserved correctly."
                )

        return output

    # ==================================================================
    # DATA
    # ==================================================================

    def _build_data(
        self,
        package: Any,
        application: Any,
        candidate_name: Any,
        extra: Mapping[str, Any],
    ) -> dict[str, Any]:

        name = (
            candidate_name
            or self._first(
                package,
                "candidate_name",
                "candidateName",
                "full_name",
                "fullName",
                "name",
            )
            or self._first(
                application,
                "candidate_name",
                "candidateName",
                "full_name",
                "fullName",
                "name",
            )
            or "Employee"
        )

        designation = (
            self._first(
                package,
                "designation",
                "position",
                "job_title",
                "jobTitle",
                "designation_name",
                "designationName",
            )
            or self._first(
                application,
                "designation",
                "position",
                "job_title",
                "jobTitle",
                "applied_position",
                "appliedPosition",
                "designation_name",
                "designationName",
            )
            or ""
        )

        posting = (
            self._first(
                package,
                "location",
                "place_of_posting",
                "placeOfPosting",
                "posting_location",
                "postingLocation",
            )
            or self._first(
                application,
                "location",
                "place_of_posting",
                "placeOfPosting",
                "posting_location",
                "postingLocation",
            )
            or "Thane office"
        )

        joining_date = (
            self._first(
                package,
                "joining_date",
                "joiningDate",
                "date_of_joining",
                "dateOfJoining",
            )
            or self._first(
                application,
                "joining_date",
                "joiningDate",
                "date_of_joining",
                "dateOfJoining",
            )
        )

        appointment_date = (
            self._first(
                package,
                "appointment_date",
                "appointmentDate",
                "issue_date",
                "issueDate",
            )
            or self._first(
                application,
                "appointment_date",
                "appointmentDate",
                "issue_date",
                "issueDate",
            )
            or self._first(package, "created_at", "createdAt")
            or self._first(application, "created_at", "createdAt")
            or date.today()
        )

        annual_ctc = (
            self._first(
                package,
                "annual_ctc",
                "annualCtc",
                "ctc",
                "total_ctc",
                "totalCtc",
            )
            or self._first(
                application,
                "annual_ctc",
                "annualCtc",
                "ctc",
                "total_ctc",
                "totalCtc",
                "salary",
                "salary_amount",
                "salaryAmount",
            )
        )

        probation = (
            self._first(
                package,
                "probation_period",
                "probationPeriod",
                "probation",
            )
            or self._first(
                application,
                "probation_period",
                "probationPeriod",
                "probation",
            )
            or self.DEFAULT_PROBATION
        )

        salary_from_month = (
            self._first(
                package,
                "salary_from_month",
                "salaryFromMonth",
            )
            or self._first(
                application,
                "salary_from_month",
                "salaryFromMonth",
            )
            or joining_date
        )

        salary = self._salary(package, application)

        # If gross CTC annual/monthly were not explicitly supplied, use the
        # package's annual CTC only as a final fallback for the annual gross row.
        if salary.get("gross_ctc_annual") in (None, ""):
            salary["gross_ctc_annual"] = annual_ctc

        return {
            "name": str(name).strip(),
            "designation": str(designation).strip(),
            "posting": str(posting).strip(),
            "appointment_date": self._ordinal_date_value(appointment_date),
            "joining_date": self._join_date(joining_date),
            "annual_ctc": annual_ctc,
            "ctc_text": self._ctc_text(annual_ctc),
            "ctc_number": self._money(annual_ctc),
            "probation": self._probation(probation),
            "salary_month": self._month(salary_from_month),
            "salary": salary,
            "logo_path": self._find_logo(
                extra.get("logo_path")
                or self._first(package, "logo_path", "logoPath")
            ),
        }

    def _salary(self, package: Any, application: Any) -> dict[str, Any]:
        """
        Read the exact onboarding fields.

        Frontend fields:
          basic_monthly / basic_annual
          hra_monthly / hra_annual
          conveyance_monthly / conveyance_annual
          education_allowance_monthly / education_allowance_annual
          special_allowance_monthly / special_allowance_annual
          lta_monthly / lta_annual
          medical_monthly / medical_annual
          mediclaim_monthly / mediclaim_annual
          professional_tax_monthly / professional_tax_annual
          pf_monthly / pf_annual
          gratuity_monthly / gratuity_annual
          sub_total_1_monthly / sub_total_1_annual
          sub_total_deduction_monthly / sub_total_deduction_annual
          sub_total_monthly / sub_total_annual
          gross_ctc_monthly / gross_ctc_annual
        """

        fields = (
            "basic",
            "hra",
            "conveyance",
            "education_allowance",
            "special_allowance",
            "lta",
            "medical",
            "mediclaim",
            "professional_tax",
            "pf",
            "gratuity",
            "sub_total_1",
            "sub_total_deduction",
            "sub_total",
            "gross_ctc",
        )

        result: dict[str, Any] = {}

        for field in fields:
            monthly = self._first(
                package,
                f"{field}_monthly",
            )
            annual = self._first(
                package,
                f"{field}_annual",
            )

            if monthly in (None, ""):
                monthly = self._first(
                    application,
                    f"{field}_monthly",
                    field if field not in {
                        "sub_total_1",
                        "sub_total_deduction",
                        "sub_total",
                        "gross_ctc",
                    } else field,
                )

            if annual in (None, ""):
                annual = self._first(
                    application,
                    f"{field}_annual",
                    field if field not in {
                        "sub_total_1",
                        "sub_total_deduction",
                        "sub_total",
                        "gross_ctc",
                    } else field,
                )

            result[f"{field}_monthly"] = monthly
            result[f"{field}_annual"] = annual

        return result

    # ==================================================================
    # OVERLAY
    # ==================================================================

    def _create_overlay(
        self,
        overlay_path: Path,
        page_number: int,
        page_width: float,
        page_height: float,
        data: dict[str, Any],
    ) -> None:
        c = canvas.Canvas(
            str(overlay_path),
            pagesize=(page_width, page_height),
        )

        if page_number == 1:
            self._page1(c, page_width, page_height, data)
        elif page_number == 4:
            self._page4(c, page_width, page_height, data)
        elif page_number == 6:
            self._page6(c, page_width, page_height, data)

        c.showPage()
        c.save()

    def _page1(
        self,
        c: canvas.Canvas,
        page_width: float,
        page_height: float,
        d: dict[str, Any],
    ) -> None:
        # IMPORTANT: every white rectangle below covers only the old value,
        # never the surrounding legal text.

        self._cover_top(c, self.P1_DATE, page_width, page_height)
        self._draw_fit_top(
            c, d["appointment_date"],
            self.P1_DATE, page_width, page_height,
            align="right", font_size=10,
        )

        self._cover_top(c, self.P1_CANDIDATE_NAME, page_width, page_height)
        self._draw_fit_top(
            c, d["name"],
            self.P1_CANDIDATE_NAME, page_width, page_height,
            align="left", font_size=10,
        )

        self._cover_top(c, self.P1_DESIGNATION, page_width, page_height)
        self._draw_fit_top(
            c, d["designation"],
            self.P1_DESIGNATION, page_width, page_height,
            align="left", font_size=10,
        )

        self._cover_top(c, self.P1_POSTING, page_width, page_height)
        self._draw_fit_top(
            c, d["posting"],
            self.P1_POSTING, page_width, page_height,
            align="left", font_size=10,
        )

        self._cover_top(c, self.P1_CTC, page_width, page_height)
        ctc_line = (
            f"Rs {self._money(d['annual_ctc'])}/- "
            f"[CTC {self._money(d['annual_ctc'])} only per annum]."
        )
        self._draw_fit_top(
            c, ctc_line,
            self.P1_CTC, page_width, page_height,
            align="left", font_size=9.5,
        )

        self._cover_top(c, self.P1_PROBATION, page_width, page_height)
        self._draw_fit_top(
            c, d["probation"],
            self.P1_PROBATION, page_width, page_height,
            align="left", font_size=10,
        )

    def _page4(
        self,
        c: canvas.Canvas,
        page_width: float,
        page_height: float,
        d: dict[str, Any],
    ) -> None:
        self._cover_top(c, self.P4_JOINING_DATE, page_width, page_height)
        self._draw_fit_top(
            c, d["joining_date"],
            self.P4_JOINING_DATE, page_width, page_height,
            align="left", font_size=10,
        )

        self._cover_top(c, self.P4_PROBATION, page_width, page_height)
        self._draw_fit_top(
            c, f"{d['probation']}’",
            self.P4_PROBATION, page_width, page_height,
            align="left", font_size=10,
        )

    def _page6(
        self,
        c: canvas.Canvas,
        page_width: float,
        page_height: float,
        d: dict[str, Any],
    ) -> None:
        # Preserve the exact master logo unless a specific uploaded logo is
        # available. This keeps the approved document visually identical.
        if d.get("logo_path"):
            self._cover_top(c, self.P6_LOGO, page_width, page_height)
            self._draw_image_top(
                c,
                d["logo_path"],
                self.P6_LOGO,
                page_width,
                page_height,
            )

        # Header: cover ONLY the value portion, preserving labels and borders.
        self._cover_top(c, self.P6_NAME_VALUE, page_width, page_height)
        self._draw_fit_top(
            c, d["name"],
            self.P6_NAME_VALUE, page_width, page_height,
            align="left", font_size=10,
        )

        self._cover_top(c, self.P6_DESIGNATION_VALUE, page_width, page_height)
        self._draw_fit_top(
            c, d["designation"],
            self.P6_DESIGNATION_VALUE, page_width, page_height,
            align="left", font_size=9,
        )

        self._cover_top(c, self.P6_SALARY_MONTH_VALUE, page_width, page_height)
        self._draw_fit_top(
            c, d["salary_month"],
            self.P6_SALARY_MONTH_VALUE, page_width, page_height,
            align="left", font_size=9,
        )

        self._cover_top(c, self.P6_CTC_VALUE, page_width, page_height)
        self._draw_fit_top(
            c, d["ctc_number"],
            self.P6_CTC_VALUE, page_width, page_height,
            align="right", font_size=9,
        )

        # Every salary value supplied by the onboarding form is written here.
        for field, top_box in self.P6_ROWS.items():
            monthly = d["salary"].get(f"{field}_monthly")
            annual = d["salary"].get(f"{field}_annual")

            # If the current record has no value for a component, preserve
            # whatever the approved master already contains.
            if monthly in (None, "") and annual in (None, ""):
                continue

            row_top, row_bottom = top_box

            monthly_box = (
                self.P6_MONTHLY_VALUE_X[0],
                row_top,
                self.P6_MONTHLY_VALUE_X[1],
                row_bottom,
            )
            annual_box = (
                self.P6_ANNUAL_VALUE_X[0],
                row_top,
                self.P6_ANNUAL_VALUE_X[1],
                row_bottom,
            )

            self._cover_top(c, monthly_box, page_width, page_height)
            self._cover_top(c, annual_box, page_width, page_height)

            if monthly not in (None, ""):
                self._draw_fit_top(
                    c,
                    self._money(monthly),
                    monthly_box,
                    page_width,
                    page_height,
                    align="right",
                    font_size=8.5,
                )

            if annual not in (None, ""):
                self._draw_fit_top(
                    c,
                    self._money(annual),
                    annual_box,
                    page_width,
                    page_height,
                    align="right",
                    font_size=8.5,
                )

    # ==================================================================
    # DRAWING HELPERS
    # ==================================================================

    @staticmethod
    def _top_to_bottom(
        box: tuple[float, float, float, float],
        page_height: float,
    ) -> tuple[float, float, float, float]:
        x1, top, x2, bottom = box
        return x1, page_height - bottom, x2, page_height - top

    def _cover_top(
        self,
        c: canvas.Canvas,
        box: tuple[float, float, float, float],
        page_width: float,
        page_height: float,
    ) -> None:
        x1, y1, x2, y2 = self._top_to_bottom(box, page_height)
        c.setFillColorRGB(1, 1, 1)
        c.rect(
            x1,
            y1,
            x2 - x1,
            y2 - y1,
            stroke=0,
            fill=1,
        )

    def _draw_fit_top(
        self,
        c: canvas.Canvas,
        value: Any,
        box: tuple[float, float, float, float],
        page_width: float,
        page_height: float,
        *,
        align: str = "left",
        font_size: float = 10,
        bold: bool = False,
    ) -> None:
        text = "" if value is None else str(value)
        if not text:
            return

        x1, top, x2, bottom = box
        max_width = max(1, x2 - x1 - 2)

        font = "Helvetica-Bold" if bold else "Helvetica"
        size = font_size

        while size > 6 and c.stringWidth(text, font, size) > max_width:
            size -= 0.25

        y = page_height - bottom + ((bottom - top) - size) / 2 + 1.5

        c.setFillColorRGB(0, 0, 0)
        c.setFont(font, size)

        if align == "right":
            c.drawRightString(x2 - 1, y, text)
        elif align == "center":
            c.drawCentredString((x1 + x2) / 2, y, text)
        else:
            c.drawString(x1 + 1, y, text)

    def _draw_image_top(
        self,
        c: canvas.Canvas,
        image_path: str,
        box: tuple[float, float, float, float],
        page_width: float,
        page_height: float,
    ) -> None:
        x1, y1, x2, y2 = self._top_to_bottom(box, page_height)
        c.drawImage(
            ImageReader(image_path),
            x1,
            y1,
            width=x2 - x1,
            height=y2 - y1,
            preserveAspectRatio=True,
            anchor="c",
            mask="auto",
        )

    # ==================================================================
    # MASTER / ASSET DISCOVERY
    # ==================================================================

    def _find_master_template(self, supplied: Any = None) -> Optional[Path]:
        candidates: list[Path] = []

        if supplied:
            p = Path(str(supplied))
            candidates.append(p if p.is_absolute() else self.base_dir / p)

        relative_candidates = [
            "templates/documents/appointment_letter/Appointment Letter Draft.pdf",
            "templates/documents/appointment_letter/Appointment Letter Draft - MASTER TEMPLATE.pdf",
            "templates/documents/appointment_letter/Appointment Letter Draft(2).pdf",
            "templates/documents/appointment_letter.pdf",
            "templates/documents/Appointment Letter Draft.pdf",
            "app/templates/documents/appointment_letter/Appointment Letter Draft.pdf",
        ]

        candidates.extend(self.base_dir / p for p in relative_candidates)

        for candidate in candidates:
            try:
                candidate = candidate.resolve()
            except OSError:
                continue

            # Never use an already-generated candidate PDF as the master.
            if "uploads" in candidate.parts and "onboarding" in candidate.parts:
                continue

            if candidate.exists() and candidate.is_file():
                return candidate

        return None

    @staticmethod
    def _validate_master(path: Path) -> None:
        reader = PdfReader(str(path))

        if len(reader.pages) != 6:
            raise RuntimeError(
                f"Appointment Letter master must have exactly 6 pages. "
                f"Found {len(reader.pages)} in {path}."
            )

        minimum_text_lengths = {
            1: 1000,
            2: 1000,
            3: 1000,
            4: 1000,
            5: 300,
            6: 500,
        }

        for page_number, minimum in minimum_text_lengths.items():
            text = reader.pages[page_number - 1].extract_text() or ""

            if len(text.strip()) < minimum:
                raise RuntimeError(
                    f"Appointment Letter master page {page_number} appears "
                    f"to be blank/incomplete ({len(text.strip())} text chars). "
                    f"Use the original approved 6-page Appointment Letter PDF, "
                    f"not the previously generated PDF."
                )

    def _find_logo(self, supplied: Any = None) -> Optional[str]:
        candidates: list[Path] = []

        if supplied:
            p = Path(str(supplied))
            candidates.append(p if p.is_absolute() else self.base_dir / p)

        logo_folder = self.base_dir / "uploads" / "offer_letter"

        if logo_folder.exists():
            candidates.extend(
                sorted(
                    [
                        p for p in logo_folder.iterdir()
                        if p.is_file()
                        and p.name.lower().startswith("logo_")
                    ],
                    key=lambda p: p.stat().st_mtime,
                    reverse=True,
                )
            )

        for candidate in candidates:
            if candidate.exists() and candidate.is_file():
                return str(candidate)

        return None

    # ==================================================================
    # VALUE HELPERS
    # ==================================================================

    @staticmethod
    def _first(obj: Any, *names: str) -> Any:
        if obj is None:
            return None

        if isinstance(obj, Mapping):
            for name in names:
                value = obj.get(name)
                if value not in (None, ""):
                    return value
            return None

        for name in names:
            try:
                value = getattr(obj, name, None)
            except Exception:
                value = None

            if value not in (None, ""):
                return value

        return None

    @staticmethod
    def _parse_date(value: Any) -> Optional[date]:
        if value in (None, ""):
            return None

        if isinstance(value, datetime):
            return value.date()

        if isinstance(value, date):
            return value

        text = str(value).strip()

        for fmt in (
            "%Y-%m-%d",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%dT%H:%M:%S.%f",
            "%d-%m-%Y",
            "%d/%m/%Y",
            "%d %B %Y",
            "%B %d, %Y",
        ):
            try:
                return datetime.strptime(text, fmt).date()
            except ValueError:
                pass

        return None

    @classmethod
    def _ordinal_date_value(cls, value: Any) -> str:
        parsed = cls._parse_date(value)

        if parsed is None:
            return "" if value in (None, "") else str(value)

        day = parsed.day

        if 10 <= day % 100 <= 20:
            suffix = "th"
        else:
            suffix = {
                1: "st",
                2: "nd",
                3: "rd",
            }.get(day % 10, "th")

        return f"{day}{suffix} {parsed.strftime('%B %Y')}"

    @classmethod
    def _join_date(cls, value: Any) -> str:
        parsed = cls._parse_date(value)

        if parsed is None:
            return "" if value in (None, "") else str(value)

        return f"{parsed.day}/{parsed.month}/{parsed.year}"

    @classmethod
    def _month(cls, value: Any) -> str:
        parsed = cls._parse_date(value)

        if parsed is None:
            return "" if value in (None, "") else str(value)

        return parsed.strftime("%B %Y")

    @staticmethod
    def _probation(value: Any) -> str:
        if value in (None, ""):
            return AppointmentLetterPdfService.DEFAULT_PROBATION

        text = str(value).strip()

        if text.isdigit():
            return f"{text} Months"

        return text

    @staticmethod
    def _money(value: Any) -> str:
        if value in (None, ""):
            return ""

        try:
            number = Decimal(
                str(value)
                .replace(",", "")
                .replace("₹", "")
                .replace("Rs.", "")
                .replace("Rs", "")
                .replace("/-", "")
                .strip()
            )
            return f"{number:,.2f}"
        except (InvalidOperation, ValueError):
            return str(value)

    @staticmethod
    def _ctc_text(value: Any) -> str:
        money = AppointmentLetterPdfService._money(value)

        if not money:
            return ""

        return f"Rs {money}/-"

