from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    func,
)

from app.infrastructure.database.base import Base


class EmployeeReferral(Base):
    __tablename__ = "employee_referrals"

    id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    employee_id = Column(
        Integer,
        ForeignKey("employee_detail.id"),
        nullable=False,
    )

    referral_token = Column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=func.current_timestamp(),
        server_default=func.current_timestamp(),
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        default=func.current_timestamp(),
        server_default=func.current_timestamp(),
    )

    __table_args__ = (
        UniqueConstraint(
            "employee_id",
            name="uq_employee_referrals_employee_id",
        ),
    )