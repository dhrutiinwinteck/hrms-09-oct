from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    DateTime,
    String,
)

from app.infrastructure.database.base import Base


class PayslipModel(Base):

    __tablename__ = "Payslip"

    id = Column(
        "Id",
        Integer,
        primary_key=True,
        index=True
    )

    emp_id = Column(
        "Emp_Id",
        Integer,
        nullable=False,
        index=True
    )

    month = Column(
        "Month",
        DateTime,
        nullable=False,
        index=True
    )

    salary = Column(
        "Salary",
        Numeric(18, 2),
        default=0
    )

    day_paid = Column(
        "Day_Paid",
        Integer,
        default=0
    )

    lop_absent = Column(
        "LOP_Absent",
        Numeric(18, 2),
        default=0
    )

    basic = Column(
        "Basic",
        Numeric(18, 2),
        default=0
    )

    hra = Column(
        "HRA",
        Numeric(18, 2),
        default=0
    )

    conveyance_allowance = Column(
        "Conveyance_Allowance",
        Numeric(18, 2),
        default=0
    )

    special_allowance = Column(
        "Special_Allowance",
        Numeric(18, 2),
        default=0
    )

    other_earning = Column(
        "Other_Earning",
        Numeric(18, 2),
        default=0
    )

    night_allowance = Column(
        "Night_Allowance",
        Numeric(18, 2),
        default=0
    )

    pf = Column(
        "PF",
        Numeric(18, 2),
        default=0
    )

    pf_employer = Column(
        "PF_Employer",
        Numeric(18, 2),
        default=0
    )

    esic = Column(
        "ESIC",
        Numeric(18, 2),
        default=0
    )

    pt = Column(
        "PT",
        Numeric(18, 2),
        default=0
    )

    other_deduction = Column(
        "Other_Deduction",
        Numeric(18, 2),
        default=0
    )

    total_earnings = Column(
        "Total_Earnings",
        Numeric(18, 2),
        default=0
    )

    total_deduction = Column(
        "Total_Deduction",
        Numeric(18, 2),
        default=0
    )

    net_pay = Column(
        "Net_Pay",
        Numeric(18, 2),
        default=0
    )

    availed_leave = Column(
        "Availed_leave",
        Numeric(18, 2),
        default=0
    )

    balance_leave = Column(
        "Balance_leave",
        Numeric(18, 2),
        default=0
    )

    created_by = Column(
        "CreatedBy",
        String(200),
        nullable=True
    )

    created_on = Column(
        "CreatedOn",
        DateTime,
        nullable=True
    )

    modified_by = Column(
        "ModifiedBy",
        String(200),
        nullable=True
    )

    modified_on = Column(
        "ModifiedOn",
        DateTime,
        nullable=True
    )