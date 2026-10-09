from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    Integer,
    String,
    Text,
    ForeignKey,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.database.base import Base


class PolicyAcceptance(Base):
    __tablename__ = "policy_acceptance"

    __table_args__ = {
        "schema": "public",
    }

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    policy_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("public.policy.id"),
        nullable=False,
    )

    employee_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    version: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    accepted: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )

    accepted_on: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    ip_address: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    user_agent: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )