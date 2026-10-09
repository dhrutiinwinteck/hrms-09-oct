from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
)

from app.infrastructure.database.base import Base


class EmployeeEducationInfoModel(Base):

    __tablename__ = "employee_educationinfo"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    emp_id = Column(
        Integer,
        ForeignKey("employee_detail.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    name_school_university = Column(
        String,
        nullable=True,
    )

    location_school_uni = Column(
        String,
        nullable=True,
    )

    degree_subject = Column(
        String,
        nullable=True,
    )

    year_of_passing = Column(
        DateTime,
        nullable=True,
    )

    marks_obtained = Column(
        String,
        nullable=True,
    )

    certificates = Column(
        Text,
        nullable=True,
    )

    createdby = Column(
        String,
        nullable=True,
    )

    createdon = Column(
        DateTime,
        nullable=True,
    )

    modifiedby = Column(
        String,
        nullable=True,
    )

    modifiedon = Column(
        DateTime,
        nullable=True,
    )