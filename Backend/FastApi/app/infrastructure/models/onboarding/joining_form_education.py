from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import relationship

from app.infrastructure.database.base import Base


class JoiningFormEducation(Base):
    __tablename__ = "employee_joining_education"

    education_id = Column(
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

    highest_qualification = Column(
        String(255),
        nullable=False,
    )

    specialization = Column(
        String(255),
        nullable=False,
    )

    institute = Column(
        String(255),
        nullable=False,
    )

    board_university = Column(
    String(255),
    nullable=True,
    )

    passing_year = Column(
        Integer,
        nullable=False,
    )

    percentage_cgpa = Column(
        String(50),
        nullable=False,
    )

    education_order = Column(
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
        back_populates="education",
    )