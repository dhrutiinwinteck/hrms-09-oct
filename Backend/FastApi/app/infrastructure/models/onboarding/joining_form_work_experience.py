

from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)

from sqlalchemy.orm import relationship

from app.infrastructure.database.base import Base


class JoiningFormWorkExperience(Base):
    __tablename__ = "employee_joining_work_experiences"

    experience_id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    joining_form_id = Column(
        BigInteger,
        ForeignKey(
            "employee_joining_forms.joining_form_id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    company_name = Column(
        String(255),
        nullable=False,
    )

    designation = Column(
        String(255),
        nullable=False,
    )

    from_date = Column(
        Date,
        nullable=False,
    )

    to_date = Column(
        Date,
        nullable=False,
    )

    experience_order = Column(
        Integer,
        nullable=False,
    )

    created_date = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        server_default=func.current_timestamp(),
    )

    joining_form = relationship(
        "JoiningForm",
        back_populates="work_experiences",
    )

    company_location = Column(String(255), nullable=True)
    company_country = Column(String(255), nullable=True)
    
    company_file = Column(String(1000), nullable=True)
    project = Column(String(255), nullable=True)
    employment_type = Column(String(100), nullable=True)
    contract_period = Column(String(100), nullable=True)
    notice_period = Column(String(100), nullable=True)