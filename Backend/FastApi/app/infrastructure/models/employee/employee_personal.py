from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Date,
    DateTime,
    ForeignKey,
)


from app.infrastructure.database.base import Base


class EmployeePersonalModel(Base):
    __tablename__ = "employee_personal"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    emp_id = Column(
        Integer,
        ForeignKey("employee_detail.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    passport_no = Column(String, nullable=True)
    passport_file = Column(String, nullable=True)

    aadhar_no = Column(String, nullable=True)
    aadhar_file_front = Column(String, nullable=True)
    aadhar_file_back = Column(String, nullable=True)

    date_of_birth = Column(Date, nullable=True)

    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)

    current_address = Column(Text, nullable=True)
    permanent_address = Column(Text, nullable=True)

    marital_status = Column(Integer, nullable=True)
    marriage_date = Column(Date, nullable=True)

    pan_no = Column(String, nullable=True)
    pan_file = Column(String, nullable=True)

    createdby = Column(String, nullable=True)
    createdon = Column(DateTime, nullable=True)

    modifiedby = Column(String, nullable=True)
    modifiedon = Column(DateTime, nullable=True)