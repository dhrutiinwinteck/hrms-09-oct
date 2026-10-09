from datetime import datetime
from enum import Enum

from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    text,
)

from app.infrastructure.database.base import Base


class ApplicationInvitationStatus(str, Enum):
    PENDING = "PENDING"
    USED = "USED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"


class ApplicationInvitation(Base):
    __tablename__ = "application_invitations"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True,
    )

    reference_id = Column(
        BigInteger,
        nullable=False,
        unique=True,
        server_default=text(
            "nextval('application_invitations_reference_id_seq')"
        ),
    )

    candidate_email = Column(
        String(320),
        nullable=False,
    )

    token_hash = Column(
        String(64),
        nullable=False,
        unique=True,
        index=True,
    )

    sent_by_employee_id = Column(
        Integer,
        ForeignKey(
            "employee_detail.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    status = Column(
        String(20),
        nullable=False,
        default=ApplicationInvitationStatus.PENDING.value,
        server_default=ApplicationInvitationStatus.PENDING.value,
        index=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    expires_at = Column(
        DateTime,
        nullable=False,
    )

    used_at = Column(
        DateTime,
        nullable=True,
    )