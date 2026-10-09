from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Integer,
    String,
    Text,
    DateTime,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship as orm_relationship,
    foreign,
)

from app.infrastructure.database.base import Base


class JoiningFormEmergencyContact(Base):

    __tablename__ = "employee_joining_emergency_contacts"

    __table_args__ = {
        "schema": "public",
    }

    # ==========================================================
    # PRIMARY KEY
    # ==========================================================

    emergency_contact_id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    # ==========================================================
    # JOINING FORM ID
    # ==========================================================

    joining_form_id: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        index=True,
    )

    # ==========================================================
    # EMERGENCY CONTACT INFORMATION
    # ==========================================================

    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    relationship: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    phone_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    email_address: Mapped[str | None] = mapped_column(
        String(320),
        nullable=True,
    )

    address: Mapped[str | None] = mapped_column(
    Text,
    nullable=True,
    )

    contact_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    # ==========================================================
    # AUDIT
    # ==========================================================

    created_date: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    # ==========================================================
    # PARENT RELATIONSHIP
    # ==========================================================

    joining_form = orm_relationship(
        "JoiningForm",
        primaryjoin=(
            "foreign(JoiningFormEmergencyContact.joining_form_id) "
            "== JoiningForm.joining_form_id"
        ),
        back_populates="emergency_contacts",
    )