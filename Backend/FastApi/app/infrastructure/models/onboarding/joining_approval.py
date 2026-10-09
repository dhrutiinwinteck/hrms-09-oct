from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Column,
    Date,
    DateTime,
    String,
    Text,
    func,
)

from app.infrastructure.database.base import Base


class JoiningApproval(Base):
    __tablename__ = "joining_approvals"

    application_id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    candidate_name = Column(
        String(255),
        nullable=False,
    )

    email = Column(
        String(320),
        nullable=False,
    )

    department = Column(
        String(255),
        nullable=True,
    )

    designation = Column(
        String(255),
        nullable=True,
    )

    location = Column(
        String(255),
        nullable=True,
    )

    joining_date = Column(
        Date,
        nullable=True,
    )

    applied_on = Column(
        Date,
        nullable=False,
        server_default=func.current_date(),
    )

    status = Column(
        String(20),
        nullable=False,
        server_default="PENDING",
        default="PENDING",
    )

    created_date = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
        default=datetime.utcnow,
    )

    modified_date = Column(
        DateTime,
        nullable=True,
    )