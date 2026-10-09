from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from app.infrastructure.database.base import Base


class EmployeeModel(Base):
    __tablename__ = "employee_detail"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    photo = Column(
        String,
        nullable=True
    )

    first_name = Column(
        String(500),
        nullable=True
    )

    last_name = Column(
        String(500),
        nullable=True
    )

    gender = Column(
        String,
        nullable=True
    )

    email = Column(
        String,
        nullable=True
    )

    phone = Column(
        String(50),
        nullable=True
    )

    designation = Column(
        Integer,
        ForeignKey("designation.id"),
        nullable=True
    )

    doj = Column(
        DateTime,
        nullable=True
    )

    reporting_manager = Column(
        Integer,
        ForeignKey("employee_detail.id"),
        nullable=True
    )

    emp_code = Column(
        String(255),
        unique=True,
        nullable=True
    )

    createdon = Column(
        DateTime,
        nullable=True
    )

    createdby = Column(
        String(255),
        nullable=True
    )

    modifiedby = Column(
        String(255),
        nullable=True
    )

    modifiedon = Column(
        DateTime,
        nullable=True
    )

    is_remove = Column(
        Integer,
        default=0,
        nullable=False
    )

    emp_type = Column(
        String(50),
        nullable=True
    )

    company_name = Column(
        String,
        nullable=True
    )

    company_location = Column(
        String,
        nullable=True
    )

    company_country = Column(
        String(150),
        nullable=True
    )

    project = Column(
        String(500),
        nullable=True
    )

    contract_period = Column(
        DateTime,
        nullable=True
    )

    notice_period = Column(
        Integer,
        nullable=True
    )

    personal_email = Column(
        String,
        nullable=True
    )