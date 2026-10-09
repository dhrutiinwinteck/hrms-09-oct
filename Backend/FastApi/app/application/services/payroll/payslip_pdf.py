from io import BytesIO
from decimal import Decimal

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    ParagraphStyle,
    getSampleStyleSheet,
)
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from app.application.services.payroll.number_to_words import (
    number_to_words,
)


def money(value):

    if value is None:
        return "0.00"

    try:
        return f"{Decimal(str(value)):,.2f}"
    except Exception:
        return "0.00"


def generate_payslip_pdf(
    payslip: dict,
) -> bytes:

    output = BytesIO()

    document = SimpleDocTemplate(
        output,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )

    styles = getSampleStyleSheet()

    heading_style = ParagraphStyle(
        "PayslipHeading",
        parent=styles["Heading1"],
        alignment=TA_CENTER,
        fontSize=16,
        leading=20,
    )

    center_style = ParagraphStyle(
        "PayslipCenter",
        parent=styles["Normal"],
        alignment=TA_CENTER,
        fontSize=9,
        leading=12,
    )

    normal_style = ParagraphStyle(
        "PayslipNormal",
        parent=styles["Normal"],
        fontSize=9,
        leading=12,
    )

    story = []

    # ---------------------------------------------------------
    # COMPANY
    # ---------------------------------------------------------

    company_name = (
        payslip.get("company_name")
        or "Company"
    )

    story.append(
        Paragraph(
            company_name,
            heading_style,
        )
    )

    if payslip.get("company_address"):

        story.append(
            Paragraph(
                str(
                    payslip[
                        "company_address"
                    ]
                ),
                center_style,
            )
        )

    if payslip.get("company_contact"):

        story.append(
            Paragraph(
                str(
                    payslip[
                        "company_contact"
                    ]
                ),
                center_style,
            )
        )

    story.append(
        Spacer(1, 8)
    )

    # ---------------------------------------------------------
    # MONTH
    # ---------------------------------------------------------

    month = payslip.get("month")

    month_text = ""

    if month:
        month_text = month.strftime(
            "%B %Y"
        )

    story.append(
        Paragraph(
            f"<b>PAYSLIP - {month_text}</b>",
            center_style,
        )
    )

    story.append(
        Spacer(1, 12)
    )

    # ---------------------------------------------------------
    # EMPLOYEE DETAILS
    # ---------------------------------------------------------

    employee_name = (
        f"{payslip.get('first_name') or ''} "
        f"{payslip.get('last_name') or ''}"
    ).strip()

    doj = ""

    if payslip.get("doj"):
        doj = payslip["doj"].strftime(
            "%d-%m-%Y"
        )

    employee_data = [
        [
            "<b>Employee Name</b>",
            employee_name,
            "<b>Employee ID</b>",
            payslip.get("emp_code") or "",
        ],
        [
            "<b>Department</b>",
            payslip.get("department") or "",
            "<b>Designation</b>",
            payslip.get("designation") or "",
        ],
        [
            "<b>Date of Joining</b>",
            doj,
            "<b>Payment Mode</b>",
            payslip.get("pay_mode") or "Other",
        ],
    ]

    employee_table = Table(
        employee_data,
        colWidths=[
            35 * mm,
            55 * mm,
            35 * mm,
            55 * mm,
        ],
    )

    employee_table.setStyle(
        TableStyle(
            [
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey,
                ),
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.lightgrey,
                ),
                (
                    "BACKGROUND",
                    (2, 0),
                    (2, -1),
                    colors.lightgrey,
                ),
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
                    5,
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    5,
                ),
            ]
        )
    )

    story.append(employee_table)

    story.append(
        Spacer(1, 12)
    )

    # ---------------------------------------------------------
    # EARNINGS / DEDUCTIONS
    # ---------------------------------------------------------

    earnings_data = [
        [
            "Earnings",
            "Amount",
            "Deductions",
            "Amount",
        ],
        [
            "Basic",
            money(
                payslip.get("basic")
            ),
            "Provident Fund",
            money(
                payslip.get("pf")
            ),
        ],
        [
            "HRA",
            money(
                payslip.get("hra")
            ),
            "ESIC",
            money(
                payslip.get("esic")
            ),
        ],
        [
            "Conveyance Allowance",
            money(
                payslip.get(
                    "conveyance_allowance"
                )
            ),
            "Professional Tax",
            money(
                payslip.get("pt")
            ),
        ],
        [
            "Special Allowance",
            money(
                payslip.get(
                    "special_allowance"
                )
            ),
            "Other Deduction",
            money(
                payslip.get(
                    "other_deduction"
                )
            ),
        ],
        [
            "Other Earnings",
            money(
                payslip.get(
                    "other_earning"
                )
            ),
            "Night Allowance",
            money(
                payslip.get(
                    "night_allowance"
                )
            ),
        ],
        [
            "Total Earnings",
            money(
                payslip.get(
                    "total_earnings"
                )
            ),
            "Total Deductions",
            money(
                payslip.get(
                    "total_deduction"
                )
            ),
        ],
        [
            "Net Pay",
            money(
                payslip.get("net_pay")
            ),
            "",
            "",
        ],
    ]

    earnings_table = Table(
        earnings_data,
        colWidths=[
            55 * mm,
            35 * mm,
            55 * mm,
            35 * mm,
        ],
    )

    earnings_table.setStyle(
        TableStyle(
            [
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey,
                ),
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.lightgrey,
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold",
                ),
                (
                    "FONTNAME",
                    (0, 6),
                    (-1, 7),
                    "Helvetica-Bold",
                ),
                (
                    "ALIGN",
                    (1, 1),
                    (1, -1),
                    "RIGHT",
                ),
                (
                    "ALIGN",
                    (3, 1),
                    (3, -1),
                    "RIGHT",
                ),
            ]
        )
    )

    story.append(earnings_table)

    story.append(
        Spacer(1, 10)
    )

    # ---------------------------------------------------------
    # AMOUNT IN WORDS
    # ---------------------------------------------------------

    net_pay = int(
        float(
            payslip.get(
                "net_pay"
            ) or 0
        )
    )

    story.append(
        Paragraph(
            f"<b>In words: "
            f"{number_to_words(net_pay)} only</b>",
            normal_style,
        )
    )

    story.append(
        Spacer(1, 15)
    )

    # ---------------------------------------------------------
    # LEAVE / ATTENDANCE
    # ---------------------------------------------------------

    leave_data = [
        [
            "Days Paid",
            str(
                payslip.get(
                    "day_paid"
                ) or 0
            ),
            "LOP / Absent",
            str(
                payslip.get(
                    "lop_absent"
                ) or 0
            ),
        ],
        [
            "Availed Leave",
            str(
                payslip.get(
                    "availed_leave"
                ) or 0
            ),
            "Balance Leave",
            str(
                payslip.get(
                    "balance_leave"
                ) or 0
            ),
        ],
    ]

    leave_table = Table(
        leave_data,
        colWidths=[
            40 * mm,
            30 * mm,
            40 * mm,
            30 * mm,
        ],
    )

    leave_table.setStyle(
        TableStyle(
            [
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey,
                ),
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.lightgrey,
                ),
                (
                    "BACKGROUND",
                    (2, 0),
                    (2, -1),
                    colors.lightgrey,
                ),
            ]
        )
    )

    story.append(leave_table)

    story.append(
        Spacer(1, 30)
    )

    story.append(
        Paragraph(
            "This is a system-generated payslip "
            "and does not require a signature.",
            center_style,
        )
    )

    story.append(
        Spacer(1, 20)
    )

    story.append(
        Paragraph(
            "Centrum Business Square, A-401, "
            "Rd Number 16, Neheru Nagar, "
            "Wagle Industrial Estate, "
            "Thane (West), Maharashtra 400604",
            center_style,
        )
    )

    document.build(story)

    return output.getvalue()