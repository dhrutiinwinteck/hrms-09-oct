# from __future__ import annotations

# import html
# import re
# from datetime import date, datetime
# from decimal import Decimal
# from pathlib import Path
# from typing import Any, Optional

# from reportlab.lib import colors
# from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
# from reportlab.lib.pagesizes import A3, A4, A5, LEGAL, LETTER
# from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
# from reportlab.lib.units import mm
# from reportlab.platypus import (
#     Image,
#     Paragraph,
#     SimpleDocTemplate,
#     Spacer,
#     Table,
#     TableStyle,
# )

# from app.core.config import settings
# from app.infrastructure.repositories.recruitment.offer_letter_repository import (
#     OfferLetterRepository,
# )


# class OfferLetterPdfService:
#     """
#     Generates a candidate-specific Offer Letter PDF.

#     Data sources:

#     1. Active Offer Letter Settings
#     2. Candidate Job Application
#     3. Candidate Onboarding Document Package

#     The generated file is always a new candidate-specific PDF.
#     """

#     PAGE_SIZES = {
#         "A4": A4,
#         "A3": A3,
#         "A5": A5,
#         "LETTER": LETTER,
#         "LEGAL": LEGAL,
#     }

#     MERGE_FIELD_PATTERN = re.compile(
#         r"\{\{\s*([A-Za-z0-9_]+)\s*\}\}"
#     )

#     def __init__(self, db) -> None:
#         self.repository = OfferLetterRepository(db)

#     # ==========================================================
#     # PUBLIC
#     # ==========================================================

#     def generate(
#         self,
#         package: Any,
#         application: Any,
#         destination_path: Path,
#         candidate_name: Optional[str] = None,
#     ) -> Path:

#         template = self.repository.get_active()

#         if template is None:
#             raise RuntimeError(
#                 "No active Offer Letter template is configured."
#             )

#         destination_path = Path(destination_path)

#         destination_path.parent.mkdir(
#             parents=True,
#             exist_ok=True,
#         )

#         values = self._build_merge_values(
#             template=template,
#             package=package,
#             application=application,
#             candidate_name=candidate_name,
#         )

#         page_size = self.PAGE_SIZES.get(
#             str(template.page_size or "A4").upper(),
#             A4,
#         )

#         document = SimpleDocTemplate(
#             str(destination_path),
#             pagesize=page_size,
#             rightMargin=20 * mm,
#             leftMargin=20 * mm,
#             topMargin=18 * mm,
#             bottomMargin=18 * mm,
#             title=values.get(
#                 "OfferLetterTitle",
#                 "Offer Letter",
#             ),
#             author=values.get(
#                 "CompanyName",
#                 "",
#             ),
#         )

#         styles = self._build_styles()

#         story = []

#         # ======================================================
#         # COMPANY LOGO
#         # ======================================================

#         if (
#             template.show_company_logo
#             and template.company_logo
#         ):
#             logo_path = self._resolve_file_path(
#                 template.company_logo
#             )

#             if logo_path and logo_path.exists():
#                 logo = Image(str(logo_path))

#                 self._resize_image(
#                     logo,
#                     max_width=65 * mm,
#                     max_height=30 * mm,
#                 )

#                 story.append(
#                     logo
#                 )

#                 story.append(
#                     Spacer(1, 3 * mm)
#                 )

#         # ======================================================
#         # COMPANY NAME
#         # ======================================================

#         company_name = self._text(
#             values.get("CompanyName")
#         )

#         if company_name:
#             story.append(
#                 Paragraph(
#                     html.escape(company_name),
#                     styles["company_name"],
#                 )
#             )

#         # ======================================================
#         # OFFICE ADDRESS
#         # ======================================================

#         office_address = self._text(
#             values.get("OfficeAddress")
#         )

#         if office_address:
#             story.append(
#                 Paragraph(
#                     self._paragraph_text(
#                         office_address
#                     ),
#                     styles["address"],
#                 )
#             )

#         story.append(
#             Spacer(1, 5 * mm)
#         )

#         # ======================================================
#         # TITLE
#         # ======================================================

#         title = (
#             self._text(
#                 values.get("OfferLetterTitle")
#             )
#             or "Offer Letter"
#         )

#         story.append(
#             Paragraph(
#                 html.escape(title),
#                 styles["title"],
#             )
#         )

#         # ======================================================
#         # OFFER DATE
#         # ======================================================

#         offer_date = self._text(
#             values.get("OfferDate")
#         )

#         if offer_date:
#             story.append(
#                 Paragraph(
#                     f"<b>Date:</b> "
#                     f"{html.escape(offer_date)}",
#                     styles["date_right"],
#                 )
#             )

#             story.append(
#                 Spacer(1, 5 * mm)
#             )

#         # ======================================================
#         # CANDIDATE DETAILS
#         # ======================================================

#         candidate_rows = []

#         candidate_name_value = self._text(
#             values.get("CandidateName")
#         )

#         candidate_address = self._text(
#             values.get("CandidateAddress")
#         )

#         candidate_contact = self._text(
#             values.get("CandidateContactNo")
#         )

#         candidate_email = self._text(
#             values.get("CandidateEmail")
#         )

#         if candidate_name_value:
#             candidate_rows.append(
#                 self._detail_row(
#                     "Name",
#                     candidate_name_value,
#                     styles,
#                 )
#             )

#         if candidate_address:
#             candidate_rows.append(
#                 self._detail_row(
#                     "Address",
#                     candidate_address,
#                     styles,
#                 )
#             )

#         if candidate_contact:
#             candidate_rows.append(
#                 self._detail_row(
#                     "Contact No.",
#                     candidate_contact,
#                     styles,
#                 )
#             )

#         if candidate_email:
#             candidate_rows.append(
#                 self._detail_row(
#                     "Personal Email ID",
#                     candidate_email,
#                     styles,
#                 )
#             )

#         if candidate_rows:
#             candidate_table = Table(
#                 candidate_rows,
#                 colWidths=[
#                     42 * mm,
#                     118 * mm,
#                 ],
#                 hAlign="LEFT",
#             )

#             candidate_table.setStyle(
#                 self._detail_table_style()
#             )

#             story.append(
#                 candidate_table
#             )

#             story.append(
#                 Spacer(1, 7 * mm)
#             )

#         # ======================================================
#         # LETTER BODY
#         # ======================================================

#         body_template = (
#             template.letter_body_template
#             or ""
#         )

#         rendered_body = self._replace_merge_fields(
#             body_template,
#             values,
#         )

#         if rendered_body.strip():
#             story.extend(
#                 self._build_body_paragraphs(
#                     rendered_body,
#                     styles["body"],
#                 )
#             )

#         # ======================================================
#         # FALLBACK EMPLOYMENT DETAILS
#         # ======================================================
#         #
#         # IMPORTANT:
#         # We only render this table when the template body
#         # does NOT already contain the corresponding fields.
#         #
#         # This prevents duplicate Position / Joining Date /
#         # CTC information.
#         # ======================================================

#         employment_rows = []

#         employment_fields = [
#             (
#                 "Position",
#                 values.get("Position"),
#                 "{{Position}}",
#             ),
#             (
#                 "Reporting Manager",
#                 values.get("ManagerName"),
#                 "{{ManagerName}}",
#             ),
#             (
#                 "Joining Date",
#                 values.get("JoiningDate"),
#                 "{{JoiningDate}}",
#             ),
#             (
#                 "Interview Date",
#                 values.get("InterviewDate"),
#                 "{{InterviewDate}}",
#             ),
#             (
#                 "Probation Period",
#                 values.get("ProbationPeriod"),
#                 "{{ProbationPeriod}}",
#             ),
#             (
#                 "Annual CTC",
#                 values.get("CTC"),
#                 "{{CTC}}",
#             ),
#         ]

#         for label, value, merge_token in employment_fields:

#             if not value:
#                 continue

#             if merge_token in body_template:
#                 continue

#             employment_rows.append(
#                 self._detail_row(
#                     label,
#                     str(value),
#                     styles,
#                 )
#             )

#         if employment_rows:

#             story.append(
#                 Spacer(1, 2 * mm)
#             )

#             story.append(
#                 Paragraph(
#                     "Employment Details",
#                     styles["section_heading"],
#                 )
#             )

#             story.append(
#                 Spacer(1, 2 * mm)
#             )

#             employment_table = Table(
#                 employment_rows,
#                 colWidths=[
#                     50 * mm,
#                     110 * mm,
#                 ],
#                 hAlign="LEFT",
#             )

#             employment_table.setStyle(
#                 self._detail_table_style()
#             )

#             story.append(
#                 employment_table
#             )

#             story.append(
#                 Spacer(1, 6 * mm)
#             )

#         # ======================================================
#         # JOB DUTIES
#         # ======================================================

#         job_duties = self._text(
#             values.get("JobDuties")
#         )

#         if (
#             job_duties
#             and "{{JobDuties}}" not in body_template
#         ):
#             story.append(
#                 Paragraph(
#                     "Job Duties",
#                     styles["section_heading"],
#                 )
#             )

#             story.extend(
#                 self._build_body_paragraphs(
#                     job_duties,
#                     styles["body"],
#                 )
#             )

#         # ======================================================
#         # ACCEPTANCE
#         # ======================================================

#         acceptance_text = self._text(
#             values.get("AcceptanceText")
#         )

#         if (
#             template.show_candidate_acceptance
#             and acceptance_text
#             and "{{AcceptanceText}}"
#             not in body_template
#         ):
#             story.append(
#                 Spacer(1, 3 * mm)
#             )

#             story.append(
#                 Paragraph(
#                     "Acceptance",
#                     styles["section_heading"],
#                 )
#             )

#             story.extend(
#                 self._build_body_paragraphs(
#                     acceptance_text,
#                     styles["body"],
#                 )
#             )

#         # ======================================================
#         # SIGNATURE
#         # ======================================================

#         signature_path = self._resolve_file_path(
#             template.signature_file_path
#         )

#         stamp_path = self._resolve_file_path(
#             template.stamp_file_path
#         )

#         signature_cells = []

#         if signature_path and signature_path.exists():
#             signature = Image(
#                 str(signature_path)
#             )

#             self._resize_image(
#                 signature,
#                 max_width=45 * mm,
#                 max_height=22 * mm,
#             )

#             signature_cells.append(
#                 signature
#             )

#         if stamp_path and stamp_path.exists():
#             stamp = Image(
#                 str(stamp_path)
#             )

#             self._resize_image(
#                 stamp,
#                 max_width=35 * mm,
#                 max_height=35 * mm,
#             )

#             signature_cells.append(
#                 stamp
#             )

#         hr_name = self._text(
#             values.get("HRSignatoryName")
#         )

#         hr_designation = self._text(
#             values.get("HRDesignation")
#         )

#         signature_block = []

#         if signature_cells:
#             signature_block.append(
#                 signature_cells
#             )

#         if hr_name:
#             signature_block.append(
#                 [
#                     Paragraph(
#                         f"<b>{html.escape(hr_name)}</b>",
#                         styles["body"],
#                     )
#                 ]
#             )

#         if hr_designation:
#             signature_block.append(
#                 [
#                     Paragraph(
#                         html.escape(hr_designation),
#                         styles["body"],
#                     )
#                 ]
#             )

#         if signature_block:

#             story.append(
#                 Spacer(1, 8 * mm)
#             )

#             signature_table = Table(
#                 signature_block,
#                 colWidths=[
#                     160 * mm
#                 ],
#                 hAlign="LEFT",
#             )

#             signature_table.setStyle(
#                 TableStyle(
#                     [
#                         (
#                             "VALIGN",
#                             (0, 0),
#                             (-1, -1),
#                             "BOTTOM",
#                         ),
#                         (
#                             "LEFTPADDING",
#                             (0, 0),
#                             (-1, -1),
#                             0,
#                         ),
#                         (
#                             "RIGHTPADDING",
#                             (0, 0),
#                             (-1, -1),
#                             0,
#                         ),
#                         (
#                             "TOPPADDING",
#                             (0, 0),
#                             (-1, -1),
#                             1,
#                         ),
#                         (
#                             "BOTTOMPADDING",
#                             (0, 0),
#                             (-1, -1),
#                             1,
#                         ),
#                     ]
#                 )
#             )

#             story.append(
#                 signature_table
#             )

#         # ======================================================
#         # SINGAPORE ADDRESS
#         # ======================================================

#         if template.show_singapore_address:

#             singapore_address = self._text(
#                 values.get(
#                     "SingaporeOSAddress"
#                 )
#             )

#             if singapore_address:
#                 story.append(
#                     Spacer(1, 7 * mm)
#                 )

#                 story.append(
#                     Paragraph(
#                         self._paragraph_text(
#                             singapore_address
#                         ),
#                         styles["footer"],
#                     )
#                 )

#         # ======================================================
#         # FOOTER ADDRESS
#         # ======================================================

#         if template.show_office_address_footer:

#             if office_address:
#                 story.append(
#                     Spacer(1, 3 * mm)
#                 )

#                 story.append(
#                     Paragraph(
#                         self._paragraph_text(
#                             office_address
#                         ),
#                         styles["footer"],
#                     )
#                 )

#         # ======================================================
#         # BUILD
#         # ======================================================

#         document.build(story)

#         if not destination_path.exists():
#             raise RuntimeError(
#                 "Offer Letter PDF was not generated."
#             )

#         if destination_path.stat().st_size == 0:
#             raise RuntimeError(
#                 "Generated Offer Letter PDF is empty."
#             )

#         return destination_path

#     # ==========================================================
#     # MERGE DATA
#     # ==========================================================

#     def _build_merge_values(
#         self,
#         template: Any,
#         package: Any,
#         application: Any,
#         candidate_name: Optional[str],
#     ) -> dict[str, str]:

#         candidate_name_value = (
#             candidate_name
#             or getattr(
#                 application,
#                 "full_name",
#                 None,
#             )
#             or ""
#         )

#         if not candidate_name_value:

#             first_name = getattr(
#                 application,
#                 "first_name",
#                 None,
#             ) or ""

#             last_name = getattr(
#                 application,
#                 "last_name",
#                 None,
#             ) or ""

#             candidate_name_value = (
#                 f"{first_name} {last_name}"
#             ).strip()

#         candidate_email = (
#             getattr(
#                 application,
#                 "email",
#                 None,
#             )
#             or getattr(
#                 application,
#                 "candidate_email",
#                 None,
#             )
#             or ""
#         )

#         candidate_contact = (
#             getattr(
#                 application,
#                 "phone_number",
#                 None,
#             )
#             or getattr(
#                 application,
#                 "phone",
#                 None,
#             )
#             or getattr(
#                 application,
#                 "contact_no",
#                 None,
#             )
#             or getattr(
#                 application,
#                 "mobile_number",
#                 None,
#             )
#             or ""
#         )

#         candidate_address = (
#             getattr(
#                 application,
#                 "candidate_address",
#                 None,
#             )
#             or getattr(
#                 application,
#                 "address",
#                 None,
#             )
#             or getattr(
#                 application,
#                 "current_address",
#                 None,
#             )
#             or getattr(
#                 application,
#                 "permanent_address",
#                 None,
#             )
#             or ""
#         )

#         annual_ctc = getattr(
#             package,
#             "annual_ctc",
#             None,
#         )

#         return {
#             "OfferLetterTitle":
#                 self._format_value(
#                     template.offer_letter_title
#                 ),

#             "CompanyName":
#                 self._format_value(
#                     template.company_name
#                 ),

#             "OfficeAddress":
#                 self._format_value(
#                     template.office_address
#                 ),

#             "SingaporeOSAddress":
#                 self._format_value(
#                     template.singapore_os_address
#                 ),

#             "OfferDate":
#                 self._format_date(
#                     template.offer_date
#                 ),

#             "CandidateName":
#                 self._format_value(
#                     candidate_name_value
#                 ),

#             "CandidateAddress":
#                 self._format_value(
#                     candidate_address
#                 ),

#             "CandidateContactNo":
#                 self._format_value(
#                     candidate_contact
#                 ),

#             "CandidateEmail":
#                 self._format_value(
#                     candidate_email
#                 ),

#             # Candidate-specific
#             # onboarding package values.
#             "Position":
#                 self._format_value(
#                     getattr(
#                         package,
#                         "designation",
#                         None,
#                     )
#                     or template.position
#                 ),

#             "ManagerName":
#                 self._format_value(
#                     getattr(
#                         package,
#                         "reporting_manager",
#                         None,
#                     )
#                     or template.reporting_manager
#                 ),

#             "ManagerDesignation":
#                 self._format_value(
#                     template.reporting_manager_designation
#                 ),

#             "JoiningDate":
#                 self._format_date(
#                     getattr(
#                         package,
#                         "joining_date",
#                         None,
#                     )
#                     or template.joining_date
#                 ),

#             "InterviewDate":
#                 self._format_date(
#                     getattr(
#                         package,
#                         "interview_date",
#                         None,
#                     )
#                 ),

#             "SalaryFromMonth":
#                 self._format_date(
#                     getattr(
#                         package,
#                         "salary_from_month",
#                         None,
#                     )
#                 ),

#             "ProbationPeriod":
#                 self._format_probation(
#                     template.probation_period,
#                     template.probation_period_unit,
#                 ),

#             "CTC":
#                 self._format_currency(
#                     annual_ctc
#                 ),

#             "JobDuties":
#                 self._format_value(
#                     template.job_duties
#                 ),

#             "AcceptanceText":
#                 self._format_value(
#                     template.acceptance_text
#                 ),

#             "HRSignatoryName":
#                 self._format_value(
#                     template.hr_signatory_name
#                 ),

#             "HRDesignation":
#                 self._format_value(
#                     template.hr_designation
#                 ),

#             "PageSize":
#                 self._format_value(
#                     template.page_size
#                 ),
#         }

#     # ==========================================================
#     # MERGE FIELDS
#     # ==========================================================

#     def _replace_merge_fields(
#         self,
#         template_text: str,
#         values: dict[str, str],
#     ) -> str:

#         if not template_text:
#             return ""

#         def replace(match):

#             field_name = match.group(1)

#             return values.get(
#                 field_name,
#                 match.group(0),
#             )

#         return self.MERGE_FIELD_PATTERN.sub(
#             replace,
#             template_text,
#         )

#     # ==========================================================
#     # STYLES
#     # ==========================================================

#     def _build_styles(self):

#         styles = getSampleStyleSheet()

#         return {
#             "company_name": ParagraphStyle(
#                 "OfferCompanyName",
#                 parent=styles["Normal"],
#                 fontName="Helvetica-Bold",
#                 fontSize=14,
#                 leading=18,
#                 alignment=TA_LEFT,
#                 spaceAfter=2 * mm,
#             ),

#             "address": ParagraphStyle(
#                 "OfferAddress",
#                 parent=styles["Normal"],
#                 fontName="Helvetica",
#                 fontSize=9.5,
#                 leading=13,
#                 alignment=TA_LEFT,
#             ),

#             "title": ParagraphStyle(
#                 "OfferTitle",
#                 parent=styles["Title"],
#                 fontName="Helvetica-Bold",
#                 fontSize=16,
#                 leading=20,
#                 alignment=TA_CENTER,
#                 spaceAfter=4 * mm,
#             ),

#             "date_right": ParagraphStyle(
#                 "OfferDateRight",
#                 parent=styles["Normal"],
#                 fontName="Helvetica",
#                 fontSize=10,
#                 leading=14,
#                 alignment=TA_RIGHT,
#             ),

#             "body": ParagraphStyle(
#                 "OfferBody",
#                 parent=styles["BodyText"],
#                 fontName="Helvetica",
#                 fontSize=10.5,
#                 leading=15,
#                 alignment=TA_LEFT,
#                 spaceAfter=4 * mm,
#             ),

#             "section_heading": ParagraphStyle(
#                 "OfferSectionHeading",
#                 parent=styles["Heading3"],
#                 fontName="Helvetica-Bold",
#                 fontSize=11,
#                 leading=14,
#                 alignment=TA_LEFT,
#                 spaceAfter=2 * mm,
#             ),

#             "footer": ParagraphStyle(
#                 "OfferFooter",
#                 parent=styles["Normal"],
#                 fontName="Helvetica",
#                 fontSize=8,
#                 leading=10,
#                 alignment=TA_CENTER,
#                 textColor=colors.grey,
#             ),
#         }

#     # ==========================================================
#     # TABLE HELPERS
#     # ==========================================================

#     def _detail_row(
#         self,
#         label: str,
#         value: str,
#         styles: dict,
#     ):

#         return [
#             Paragraph(
#                 f"<b>{html.escape(label)}</b>",
#                 styles["body"],
#             ),
#             Paragraph(
#                 self._paragraph_text(value),
#                 styles["body"],
#             ),
#         ]

#     def _detail_table_style(self):

#         return TableStyle(
#             [
#                 (
#                     "VALIGN",
#                     (0, 0),
#                     (-1, -1),
#                     "TOP",
#                 ),
#                 (
#                     "LEFTPADDING",
#                     (0, 0),
#                     (-1, -1),
#                     0,
#                 ),
#                 (
#                     "RIGHTPADDING",
#                     (0, 0),
#                     (-1, -1),
#                     8,
#                 ),
#                 (
#                     "TOPPADDING",
#                     (0, 0),
#                     (-1, -1),
#                     1,
#                 ),
#                 (
#                     "BOTTOMPADDING",
#                     (0, 0),
#                     (-1, -1),
#                     1,
#                 ),
#             ]
#         )

#     # ==========================================================
#     # BODY
#     # ==========================================================

#     def _build_body_paragraphs(
#         self,
#         text: str,
#         style,
#     ) -> list:

#         if not text:
#             return []

#         text = self._clean_html(text)

#         blocks = re.split(
#             r"\n\s*\n",
#             text,
#         )

#         result = []

#         for block in blocks:

#             block = block.strip()

#             if not block:
#                 continue

#             result.append(
#                 Paragraph(
#                     self._safe_paragraph_markup(
#                         block
#                     ),
#                     style,
#                 )
#             )

#         return result

#     # ==========================================================
#     # HTML
#     # ==========================================================

#     def _clean_html(
#         self,
#         value: str,
#     ) -> str:

#         if not value:
#             return ""

#         value = html.unescape(value)

#         value = re.sub(
#             r"<br\s*/?>",
#             "\n",
#             value,
#             flags=re.IGNORECASE,
#         )

#         value = re.sub(
#             r"</p\s*>",
#             "\n\n",
#             value,
#             flags=re.IGNORECASE,
#         )

#         value = re.sub(
#             r"<p[^>]*>",
#             "",
#             value,
#             flags=re.IGNORECASE,
#         )

#         value = re.sub(
#             r"<li[^>]*>",
#             "• ",
#             value,
#             flags=re.IGNORECASE,
#         )

#         value = re.sub(
#             r"</li\s*>",
#             "\n",
#             value,
#             flags=re.IGNORECASE,
#         )

#         value = re.sub(
#             r"<[^>]+>",
#             "",
#             value,
#         )

#         return value.strip()

#     def _safe_paragraph_markup(
#         self,
#         value: str,
#     ) -> str:

#         if not value:
#             return ""

#         value = html.escape(value)

#         return value.replace(
#             "\n",
#             "<br/>",
#         )

#     # ==========================================================
#     # PATH
#     # ==========================================================

#     def _resolve_file_path(
#         self,
#         value: Optional[str],
#     ) -> Optional[Path]:

#         if not value:
#             return None

#         normalized = str(value).replace(
#             "\\",
#             "/",
#         ).lstrip("/")

#         path = Path(normalized)

#         if path.is_absolute():
#             return path

#         return Path(
#             settings.BASE_DIR
#         ) / path

#     # ==========================================================
#     # IMAGE
#     # ==========================================================

#     def _resize_image(
#         self,
#         image: Image,
#         max_width: float,
#         max_height: float,
#     ) -> None:

#         width = float(
#             image.imageWidth
#             or max_width
#         )

#         height = float(
#             image.imageHeight
#             or max_height
#         )

#         ratio = min(
#             max_width / width,
#             max_height / height,
#             1,
#         )

#         image.drawWidth = (
#             width * ratio
#         )

#         image.drawHeight = (
#             height * ratio
#         )

#     # ==========================================================
#     # FORMATTING
#     # ==========================================================

#     def _format_date(
#         self,
#         value: Any,
#     ) -> str:

#         if value is None:
#             return ""

#         if isinstance(
#             value,
#             datetime,
#         ):
#             return value.strftime(
#                 "%d %B %Y"
#             )

#         if isinstance(
#             value,
#             date,
#         ):
#             return value.strftime(
#                 "%d %B %Y"
#             )

#         return str(value)

#     def _format_currency(
#         self,
#         value: Any,
#     ) -> str:

#         if value is None:
#             return ""

#         try:

#             amount = Decimal(
#                 str(value)
#             )

#             return (
#                 f"₹{amount:,.2f}"
#             )

#         except Exception:

#             return str(value)

#     def _format_probation(
#         self,
#         value: Any,
#         unit: Any,
#     ) -> str:

#         if value is None:
#             return ""

#         return (
#             f"{value} "
#             f"{str(unit or 'Months')}"
#         )

#     def _format_value(
#         self,
#         value: Any,
#     ) -> str:

#         if value is None:
#             return ""

#         return str(value)

#     def _text(
#         self,
#         value: Any,
#     ) -> str:

#         if value is None:
#             return ""

#         return str(value).strip()

#     def _paragraph_text(
#         self,
#         value: str,
#     ) -> str:

#         value = html.escape(
#             self._text(value)
#         )

#         return value.replace(
#             "\n",
#             "<br/>",
#         )






from __future__ import annotations

import html
import re
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path
from typing import Any, Optional

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A3, A4, A5, LEGAL, LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.platypus import (
    Flowable,
    Image,
    KeepInFrame,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.core.config import settings
from app.infrastructure.repositories.recruitment.offer_letter_repository import (
    OfferLetterRepository,
)


class _SignatureStampFlowable(Flowable):
    """Renders the signature and stamp with the same overlap as LivePreview."""

    def __init__(
        self,
        signature_path: Optional[Path],
        stamp_path: Optional[Path],
        signature_width: float = 105 / 560 * 178 * mm,
        signature_height: float = 54 / 792 * 250 * mm,
        stamp_width: float = 56 / 560 * 178 * mm,
        stamp_height: float = 54 / 792 * 250 * mm,
        stamp_offset_x: float = 35 / 560 * 178 * mm,
    ) -> None:
        super().__init__()
        self.signature_path = signature_path
        self.stamp_path = stamp_path
        self.signature_width = signature_width
        self.signature_height = signature_height
        self.stamp_width = stamp_width
        self.stamp_height = stamp_height
        self.stamp_offset_x = stamp_offset_x
        self.width = max(signature_width, stamp_offset_x + stamp_width)
        self.height = max(signature_height, stamp_height)

    def wrap(self, avail_width: float, avail_height: float) -> tuple[float, float]:
        return min(self.width, avail_width), self.height

    def draw(self) -> None:
        if self.signature_path and self.signature_path.exists():
            self.canv.drawImage(
                ImageReader(str(self.signature_path)),
                0,
                0,
                width=self.signature_width,
                height=self.signature_height,
                preserveAspectRatio=True,
                anchor="sw",
                mask="auto",
            )

        if self.stamp_path and self.stamp_path.exists():
            self.canv.drawImage(
                ImageReader(str(self.stamp_path)),
                self.stamp_offset_x,
                0,
                width=self.stamp_width,
                height=self.stamp_height,
                preserveAspectRatio=True,
                anchor="sw",
                mask="auto",
            )


class OfferLetterPdfService:
    """
    Generates the candidate-specific Offer Letter PDF.

    The PDF is intentionally rendered as two fixed logical pages so that
    its structure matches the React LivePreview:

        Page 1:
            logo
            offer-letter title
            offer date
            candidate details
            letter body
            footer

        Page 2:
            logo
            closing message
            HR signature + stamp
            HR name/designation
            HR date line
            candidate acceptance section
            footer
    """

    PAGE_SIZES = {
        "A4": A4,
        "A3": A3,
        "A5": A5,
        "LETTER": LETTER,
        "LEGAL": LEGAL,
    }

    MERGE_FIELD_PATTERN = re.compile(
        r"\{\{\s*([A-Za-z0-9_]+)\s*\}\}"
    )

    def __init__(self, db) -> None:
        self.repository = OfferLetterRepository(db)

    def generate(
        self,
        package: Any,
        application: Any,
        destination_path: Path,
        candidate_name: Optional[str] = None,
    ) -> Path:
        template = self.repository.get_active()

        if template is None:
            raise RuntimeError(
                "No active Offer Letter template is configured."
            )

        destination_path = Path(destination_path)
        destination_path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        values = self._build_merge_values(
            template=template,
            package=package,
            application=application,
            candidate_name=candidate_name,
        )

        page_size = self.PAGE_SIZES.get(
            str(template.page_size or "A4").upper(),
            A4,
        )

        page_width, page_height = page_size

        # The React preview reserves approximately 42px horizontal padding
        # from a 560px wide document. Keep the same proportional margins.
        horizontal_margin = page_width * (42 / 560)

        # Reserve the bottom area for the fixed footer.
        top_margin = page_height * (28 / 792)
        bottom_margin = page_height * (115 / 792)

        document = SimpleDocTemplate(
            str(destination_path),
            pagesize=page_size,
            rightMargin=horizontal_margin,
            leftMargin=horizontal_margin,
            topMargin=top_margin,
            bottomMargin=bottom_margin,
            title=values.get("OfferLetterTitle") or "Offer Letter",
            author=values.get("CompanyName") or "",
        )

        styles = self._build_styles(page_width)
        document._offer_template = template

        logo_path = (
            self._resolve_file_path(template.company_logo)
            if template.show_company_logo and template.company_logo
            else None
        )

        signature_path = self._resolve_file_path(
            getattr(template, "signature_file_path", None)
        )
        stamp_path = self._resolve_file_path(
            getattr(template, "stamp_file_path", None)
        )

        page_one = self._build_page_one(
            template=template,
            values=values,
            styles=styles,
            logo_path=logo_path,
            page_width=page_width,
            page_height=page_height,
        )

        page_two = self._build_page_two(
            template=template,
            values=values,
            styles=styles,
            logo_path=logo_path,
            signature_path=signature_path,
            stamp_path=stamp_path,
            page_width=page_width,
            page_height=page_height,
        )

        story: list[Any] = [
            KeepInFrame(
                maxWidth=page_width - (2 * horizontal_margin),
                maxHeight=page_height - top_margin - bottom_margin,
                content=page_one,
                mode="shrink",
            ),
            PageBreak(),
            KeepInFrame(
                maxWidth=page_width - (2 * horizontal_margin),
                maxHeight=page_height - top_margin - bottom_margin,
                content=page_two,
                mode="shrink",
            ),
        ]

        document.build(
            story,
            onFirstPage=self._draw_footer,
            onLaterPages=self._draw_footer,
        )

        if not destination_path.exists():
            raise RuntimeError(
                "Offer Letter PDF was not generated."
            )

        if destination_path.stat().st_size == 0:
            raise RuntimeError(
                "Generated Offer Letter PDF is empty."
            )

        return destination_path

    def _build_page_one(
        self,
        template: Any,
        values: dict[str, str],
        styles: dict[str, ParagraphStyle],
        logo_path: Optional[Path],
        page_width: float,
        page_height: float,
    ) -> list[Any]:
        story: list[Any] = []

        story.extend(
            self._build_logo_block(
                logo_path=logo_path,
                company_name=values.get("CompanyName", ""),
                page_width=page_width,
                page_height=page_height,
            )
        )

        title = (
            self._text(values.get("OfferLetterTitle"))
            or "Offer Letter"
        )

        story.append(
            Paragraph(
                html.escape(title),
                styles["document_title"],
            )
        )

        offer_date = self._text(values.get("OfferDate"))

        if offer_date:
            story.append(
                Spacer(1, page_height * (28 / 792))
            )
            story.append(
                Paragraph(
                    html.escape(offer_date),
                    styles["date_right"],
                )
            )

        # Match LivePreview exactly: it starts with "Mr.," rather than
        # repeating the candidate name in the address block.
        story.append(
            Spacer(1, page_height * (32 / 792))
        )

        story.append(
            Paragraph(
                "<b>Mr.,</b>",
                styles["candidate"],
            )
        )

        candidate_address = self._text(
            values.get("CandidateAddress")
        )
        candidate_contact = self._text(
            values.get("CandidateContactNo")
        )
        candidate_email = self._text(
            values.get("CandidateEmail")
        )

        if candidate_address:
            story.append(
                Paragraph(
                    f"<b>Address:</b> "
                    f"{self._paragraph_text(candidate_address)}",
                    styles["candidate"],
                )
            )

        if candidate_contact:
            story.append(
                Paragraph(
                    f"<b>Contact No.:</b> "
                    f"{html.escape(candidate_contact)}",
                    styles["candidate"],
                )
            )

        if candidate_email:
            story.append(
                Spacer(1, 8 / 792 * page_height)
            )
            story.append(
                Paragraph(
                    f"<b>Personal Email ID:</b> "
                    f"{html.escape(candidate_email)}",
                    styles["candidate"],
                )
            )

        story.append(
            Spacer(1, page_height * (24 / 792))
        )

        rendered_body = self._replace_merge_fields(
            template.letter_body_template or "",
            values,
        )

        if rendered_body.strip():
            story.extend(
                self._build_body_paragraphs(
                    rendered_body,
                    styles["body"],
                )
            )

        return story

    def _build_page_two(
        self,
        template: Any,
        values: dict[str, str],
        styles: dict[str, ParagraphStyle],
        logo_path: Optional[Path],
        signature_path: Optional[Path],
        stamp_path: Optional[Path],
        page_width: float,
        page_height: float,
    ) -> list[Any]:
        story: list[Any] = []

        story.extend(
            self._build_logo_block(
                logo_path=logo_path,
                company_name=values.get("CompanyName", ""),
                page_width=page_width,
                page_height=page_height,
            )
        )

        story.append(
            Spacer(1, page_height * (17 / 792))
        )

        story.append(
            Paragraph(
                (
                    "We are excited to have you join our team! "
                    "If you have any questions, please feel free "
                    "to reach out at any time."
                ),
                styles["closing_message"],
            )
        )

        story.append(
            Spacer(1, page_height * (38 / 792))
        )

        left_story: list[Any] = [
            Paragraph(
                "Sincerely,",
                styles["signature_text"],
            ),
            Spacer(1, page_height * (12 / 792)),
            _SignatureStampFlowable(
                signature_path=signature_path,
                stamp_path=stamp_path,
            ),
        ]

        hr_name = self._text(
            values.get("HRSignatoryName")
        )
        hr_designation = self._text(
            values.get("HRDesignation")
        )

        if hr_name:
            left_story.extend(
                [
                    Spacer(1, 2),
                    Paragraph(
                        f"<b>{html.escape(hr_name)}</b>",
                        styles["signature_text"],
                    ),
                ]
            )

        if hr_designation:
            left_story.append(
                Paragraph(
                    html.escape(hr_designation),
                    styles["signature_text"],
                )
            )

        left_story.extend(
            [
                Spacer(1, page_height * (91 / 792)),
                Table(
                    [
                        [
                            Paragraph(
                                "Date:",
                                styles["small_text"],
                            ),
                            "",
                        ]
                    ],
                    colWidths=[
                        page_width * (30 / 560),
                        page_width * (82 / 560),
                    ],
                    style=TableStyle(
                        [
                            (
                                "VALIGN",
                                (0, 0),
                                (-1, -1),
                                "MIDDLE",
                            ),
                            (
                                "LEFTPADDING",
                                (0, 0),
                                (-1, -1),
                                0,
                            ),
                            (
                                "RIGHTPADDING",
                                (0, 0),
                                (-1, -1),
                                0,
                            ),
                            (
                                "TOPPADDING",
                                (0, 0),
                                (-1, -1),
                                0,
                            ),
                            (
                                "BOTTOMPADDING",
                                (0, 0),
                                (-1, -1),
                                0,
                            ),
                            (
                                "LINEBELOW",
                                (1, 0),
                                (1, 0),
                                0.5,
                                colors.HexColor("#7c8b91"),
                            ),
                        ]
                    ),
                ),
            ]
        )

        acceptance_story: list[Any] = []

        if template.show_candidate_acceptance:
            acceptance_text = (
                self._text(values.get("AcceptanceText"))
                or ""
            )

            acceptance_story.append(
                Paragraph(
                    f"({html.escape(acceptance_text)})",
                    styles["acceptance"],
                )
            )

            acceptance_story.append(
                Spacer(1, page_height * (57 / 792))
            )

            acceptance_story.extend(
                [
                    self._build_acceptance_line(
                        "Signature:",
                        styles["small_text"],
                        page_width,
                    ),
                    Spacer(1, page_height * (24 / 792)),
                    self._build_acceptance_line(
                        "Name:",
                        styles["small_text"],
                        page_width,
                    ),
                ]
            )

        column_width = (
            page_width
            - (2 * page_width * (42 / 560))
        )

        left_width = column_width * (1 / 1.95)
        right_width = column_width - left_width - (
            page_width * (34 / 560)
        )

        signature_acceptance_table = Table(
            [
                [
                    left_story,
                    acceptance_story,
                ]
            ],
            colWidths=[left_width, right_width],
            hAlign="LEFT",
        )

        signature_acceptance_table.setStyle(
            TableStyle(
                [
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "TOP",
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        0,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        0,
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        0,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        0,
                    ),
                ]
            )
        )

        story.append(signature_acceptance_table)

        return story

    def _build_logo_block(
        self,
        logo_path: Optional[Path],
        company_name: str,
        page_width: float,
        page_height: float,
    ) -> list[Any]:
        result: list[Any] = []

        logo_width = page_width * (245 / 560)
        logo_height = page_height * (72 / 792)

        if logo_path and logo_path.exists():
            logo = Image(
                str(logo_path),
                width=logo_width,
                height=logo_height,
            )
            logo.hAlign = "CENTER"
            logo._restrictSize(
                logo_width,
                logo_height,
            )
            result.append(logo)
        else:
            fallback = (
                "<font color='#4aaf62'>inwin</font>"
                "<font color='#1d7ca0'><b>teck</b></font>"
            )

            result.append(
                Paragraph(
                    fallback,
                    ParagraphStyle(
                        "FallbackLogo",
                        fontName="Helvetica-Bold",
                        fontSize=page_height * (37 / 792),
                        leading=page_height * (37 / 792),
                        alignment=TA_CENTER,
                        spaceAfter=0,
                    ),
                )
            )

        result.append(
            Spacer(
                1,
                page_height * (2 / 792),
            )
        )

        return result

    def _build_acceptance_line(
        self,
        label: str,
        style: ParagraphStyle,
        page_width: float,
    ) -> Table:
        return Table(
            [
                [
                    Paragraph(
                        html.escape(label),
                        style,
                    ),
                    "",
                ]
            ],
            colWidths=[
                page_width * (40 / 560),
                page_width * (82 / 560),
            ],
            style=TableStyle(
                [
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "MIDDLE",
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        0,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        0,
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        0,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        0,
                    ),
                    (
                        "LINEBELOW",
                        (1, 0),
                        (1, 0),
                        0.5,
                        colors.HexColor("#7c8b91"),
                    ),
                ]
            ),
        )

    def _draw_footer(
        self,
        canvas,
        document,
    ) -> None:
        page_number = canvas.getPageNumber()

        template = getattr(document, "_offer_template", None)

        if template is None:
            return

        page_width, _ = document.pagesize

        left = document.leftMargin
        right = page_width - document.rightMargin

        if template.show_office_address_footer:
            office_address = self._text(
                template.office_address
            )

            singapore_address = (
                self._text(
                    template.singapore_os_address
                )
                if template.show_singapore_address
                else ""
            )

            lines: list[str] = []

            if office_address:
                lines.extend(
                    [
                        html.unescape(line).strip()
                        for line in office_address.splitlines()
                        if line.strip()
                    ]
                )

            if singapore_address:
                singapore_lines = [
                    html.unescape(line).strip()
                    for line in singapore_address.splitlines()
                    if line.strip()
                ]

                lines.extend(singapore_lines)

                if lines:
                    lines[-1] = f"{lines[-1]} (O/S)"

            canvas.saveState()
            canvas.setFillColor(colors.HexColor("#263d45"))
            canvas.setFont(
                "Helvetica-Bold",
                document.pagesize[1] * (8.5 / 792),
            )

            footer_y = document.pagesize[1] * (27 / 792)

            for index, line in enumerate(reversed(lines)):
                canvas.drawCentredString(
                    page_width / 2,
                    footer_y + (
                        index + 1
                    ) * document.pagesize[1] * (10 / 792),
                    line,
                )

            canvas.setFillColor(colors.HexColor("#7a8c94"))
            canvas.setFont(
                "Helvetica",
                document.pagesize[1] * (8 / 792),
            )

            canvas.drawCentredString(
                page_width / 2,
                footer_y,
                f"Page {page_number} of 2",
            )
            canvas.restoreState()

            return

        canvas.saveState()
        canvas.setFillColor(colors.HexColor("#7a8c94"))
        canvas.setFont(
            "Helvetica",
            document.pagesize[1] * (8 / 792),
        )
        canvas.drawCentredString(
            page_width / 2,
            document.pagesize[1] * (27 / 792),
            f"Page {page_number} of 2",
        )
        canvas.restoreState()

    def _build_merge_values(
        self,
        template: Any,
        package: Any,
        application: Any,
        candidate_name: Optional[str],
    ) -> dict[str, str]:
        candidate_name_value = (
            candidate_name
            or getattr(application, "full_name", None)
            or ""
        )

        if not candidate_name_value:
            first_name = (
                getattr(application, "first_name", None)
                or ""
            )
            last_name = (
                getattr(application, "last_name", None)
                or ""
            )
            candidate_name_value = (
                f"{first_name} {last_name}"
            ).strip()

        candidate_email = (
            getattr(application, "email", None)
            or getattr(
                application,
                "candidate_email",
                None,
            )
            or ""
        )

        candidate_contact = (
            getattr(
                application,
                "phone_number",
                None,
            )
            or getattr(
                application,
                "phone",
                None,
            )
            or getattr(
                application,
                "contact_no",
                None,
            )
            or getattr(
                application,
                "mobile_number",
                None,
            )
            or ""
        )

        candidate_address = (
            getattr(
                application,
                "candidate_address",
                None,
            )
            or getattr(
                application,
                "address",
                None,
            )
            or getattr(
                application,
                "current_address",
                None,
            )
            or getattr(
                application,
                "permanent_address",
                None,
            )
            or ""
        )

        annual_ctc = getattr(
            package,
            "annual_ctc",
            None,
        )

        return {
            "OfferLetterTitle": self._format_value(
                template.offer_letter_title
            ),
            "CompanyName": self._format_value(
                template.company_name
            ),
            "OfficeAddress": self._format_value(
                template.office_address
            ),
            "SingaporeOSAddress": self._format_value(
                template.singapore_os_address
            ),
            "OfferDate": self._format_date(
                template.offer_date
            ),
            "CandidateName": self._format_value(
                candidate_name_value
            ),
            "CandidateAddress": self._format_value(
                candidate_address
            ),
            "CandidateContactNo": self._format_value(
                candidate_contact
            ),
            "CandidateEmail": self._format_value(
                candidate_email
            ),
            "Position": self._format_value(
                getattr(package, "designation", None)
                or template.position
            ),
            "ManagerName": self._format_value(
                getattr(
                    package,
                    "reporting_manager",
                    None,
                )
                or template.reporting_manager
            ),
            "ManagerDesignation": self._format_value(
                template.reporting_manager_designation
            ),
            "JoiningDate": self._format_date(
                getattr(
                    package,
                    "joining_date",
                    None,
                )
                or template.joining_date
            ),
            "InterviewDate": self._format_date(
                getattr(
                    package,
                    "interview_date",
                    None,
                )
            ),
            "SalaryFromMonth": self._format_date(
                getattr(
                    package,
                    "salary_from_month",
                    None,
                )
            ),
            "ProbationPeriod": self._format_probation(
                template.probation_period,
                template.probation_period_unit,
            ),
            "CTC": self._format_currency(
                annual_ctc
            ),
            "JobDuties": self._format_value(
                template.job_duties
            ),
            "AcceptanceText": self._format_value(
                template.acceptance_text
            ),
            "HRSignatoryName": self._format_value(
                template.hr_signatory_name
            ),
            "HRDesignation": self._format_value(
                template.hr_designation
            ),
            "PageSize": self._format_value(
                template.page_size
            ),
        }

    def _replace_merge_fields(
        self,
        template_text: str,
        values: dict[str, str],
    ) -> str:
        if not template_text:
            return ""

        def replace(match: re.Match[str]) -> str:
            field_name = match.group(1)
            return values.get(
                field_name,
                match.group(0),
            )

        return self.MERGE_FIELD_PATTERN.sub(
            replace,
            template_text,
        )

    def _build_styles(
        self,
        page_width: float,
    ) -> dict[str, ParagraphStyle]:
        styles = getSampleStyleSheet()

        return {
            "document_title": ParagraphStyle(
                "OfferDocumentTitle",
                parent=styles["Normal"],
                fontName="Helvetica-Bold",
                fontSize=page_width * (14 / 560),
                leading=page_width * (17 / 560),
                alignment=TA_CENTER,
                textColor=colors.HexColor("#202f35"),
                underline=True,
                spaceAfter=0,
            ),
            "date_right": ParagraphStyle(
                "OfferDocumentDate",
                parent=styles["Normal"],
                fontName="Helvetica",
                fontSize=page_width * (9.5 / 560),
                leading=page_width * (12 / 560),
                alignment=TA_RIGHT,
                textColor=colors.HexColor("#35464d"),
            ),
            "candidate": ParagraphStyle(
                "OfferCandidate",
                parent=styles["Normal"],
                fontName="Helvetica",
                fontSize=page_width * (9.5 / 560),
                leading=page_width * (14.7 / 560),
                alignment=TA_LEFT,
                textColor=colors.HexColor("#24383f"),
                spaceAfter=0,
            ),
            "body": ParagraphStyle(
                "OfferBody",
                parent=styles["BodyText"],
                fontName="Helvetica",
                fontSize=page_width * (9.5 / 560),
                leading=page_width * (15 / 560),
                alignment=TA_LEFT,
                textColor=colors.HexColor("#24383f"),
                spaceAfter=page_width * (11 / 560),
            ),
            "closing_message": ParagraphStyle(
                "OfferClosingMessage",
                parent=styles["Normal"],
                fontName="Helvetica",
                fontSize=page_width * (9.5 / 560),
                leading=page_width * (14.7 / 560),
                alignment=TA_LEFT,
                textColor=colors.HexColor("#24383f"),
                spaceAfter=0,
            ),
            "signature_text": ParagraphStyle(
                "OfferSignatureText",
                parent=styles["Normal"],
                fontName="Helvetica",
                fontSize=page_width * (9.5 / 560),
                leading=page_width * (12.5 / 560),
                alignment=TA_LEFT,
                textColor=colors.HexColor("#24383f"),
                spaceAfter=0,
            ),
            "small_text": ParagraphStyle(
                "OfferSmallText",
                parent=styles["Normal"],
                fontName="Helvetica",
                fontSize=page_width * (9 / 560),
                leading=page_width * (11 / 560),
                alignment=TA_LEFT,
                textColor=colors.HexColor("#263d45"),
                spaceAfter=0,
            ),
            "acceptance": ParagraphStyle(
                "OfferAcceptance",
                parent=styles["Normal"],
                fontName="Helvetica-Bold",
                fontSize=page_width * (9.5 / 560),
                leading=page_width * (13.8 / 560),
                alignment=TA_CENTER,
                textColor=colors.HexColor("#24383f"),
                spaceAfter=0,
            ),
        }

    def _build_body_paragraphs(
        self,
        text: str,
        style: ParagraphStyle,
    ) -> list[Paragraph]:
        if not text:
            return []

        text = self._clean_html(text)

        blocks = re.split(
            r"\n\s*\n",
            text,
        )

        result: list[Paragraph] = []

        for block in blocks:
            block = block.strip()

            if not block:
                continue

            result.append(
                Paragraph(
                    self._safe_paragraph_markup(block),
                    style,
                )
            )

        return result

    def _clean_html(
        self,
        value: str,
    ) -> str:
        if not value:
            return ""

        value = html.unescape(value)

        value = re.sub(
            r"<br\s*/?>",
            "\n",
            value,
            flags=re.IGNORECASE,
        )

        value = re.sub(
            r"</p\s*>",
            "\n\n",
            value,
            flags=re.IGNORECASE,
        )

        value = re.sub(
            r"<p[^>]*>",
            "",
            value,
            flags=re.IGNORECASE,
        )

        value = re.sub(
            r"<li[^>]*>",
            "• ",
            value,
            flags=re.IGNORECASE,
        )

        value = re.sub(
            r"</li\s*>",
            "\n",
            value,
            flags=re.IGNORECASE,
        )

        value = re.sub(
            r"<[^>]+>",
            "",
            value,
        )

        return value.strip()

    def _safe_paragraph_markup(
        self,
        value: str,
    ) -> str:
        if not value:
            return ""

        value = html.escape(value)

        return value.replace(
            "\n",
            "<br/>",
        )

    def _paragraph_text(
        self,
        value: str,
    ) -> str:
        return html.escape(
            self._text(value)
        ).replace(
            "\n",
            "<br/>",
        )

    def _resolve_file_path(
        self,
        value: Optional[str],
    ) -> Optional[Path]:
        if not value:
            return None

        normalized = (
            str(value)
            .replace("\\", "/")
            .lstrip("/")
        )

        path = Path(normalized)

        if path.is_absolute():
            return path

        return (
            Path(settings.BASE_DIR)
            / path
        )

    @staticmethod
    def _format_date(
        value: Any,
    ) -> str:
        if value is None:
            return ""

        if isinstance(value, datetime):
            return OfferLetterPdfService._format_date_value(
                value.date()
            )

        if isinstance(value, date):
            return OfferLetterPdfService._format_date_value(
                value
            )

        raw = str(value).strip()

        if not raw:
            return ""

        try:
            parsed = date.fromisoformat(
                raw[:10]
            )
            return OfferLetterPdfService._format_date_value(
                parsed
            )
        except ValueError:
            return raw

    @staticmethod
    def _format_date_value(value: date) -> str:
        month = value.strftime("%B")
        day = value.day
        year = value.year

        if 11 <= day <= 13:
            ordinal = f"{day}th"
        else:
            ordinal = {
                1: f"{day}st",
                2: f"{day}nd",
                3: f"{day}rd",
            }.get(
                day % 10,
                f"{day}th",
            )

        return f"{month} {ordinal}, {year}"

    @staticmethod
    def _format_currency(
        value: Any,
    ) -> str:
        if value is None:
            return ""

        try:
            amount = Decimal(str(value))
            return f"₹{amount:,.2f}"
        except Exception:
            return str(value)

    @staticmethod
    def _format_probation(
        value: Any,
        unit: Any,
    ) -> str:
        if value is None:
            return ""

        return (
            f"{value} "
            f"{str(unit or 'Months')}"
        )

    @staticmethod
    def _format_value(
        value: Any,
    ) -> str:
        if value is None:
            return ""

        return str(value)

    @staticmethod
    def _text(
        value: Any,
    ) -> str:
        if value is None:
            return ""

        return str(value).strip()
