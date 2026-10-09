from datetime import datetime
from sqlalchemy import Boolean

from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    ForeignKey,
    String,
    func,
)
from sqlalchemy.orm import relationship as orm_relationship

from app.infrastructure.database.base import Base


class JoiningFormReference(Base):

    __tablename__ = "employee_joining_references"

    # ==========================================================
    # PRIMARY KEY
    # ==========================================================

    reference_id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    # ==========================================================
    # FOREIGN KEY
    # ==========================================================

    joining_form_id = Column(
        BigInteger,
        ForeignKey(
            "employee_joining_forms.joining_form_id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # ==========================================================
    # REFERENCE DETAILS
    # ==========================================================

    full_name = Column(
        String(255),
        nullable=False,
    )

    designation = Column(
        String(255),
        nullable=False,
    )

    company_organization = Column(
        String(255),
        nullable=False,
    )

    email_address = Column(
        String(320),
        nullable=False,
    )

    phone_number = Column(
        String(50),
        nullable=False,
    )

    # NOTE:
    # "relationship" is a database column.
    # SQLAlchemy relationship() is imported as orm_relationship.

    relationship = Column(
        String(100),
        nullable=False,
    )

    # ==========================================================
    # AUDIT
    # ==========================================================
    can_contact = Column(
    Boolean,
    nullable=False,
    default=False,
    server_default="false",
    )


    created_date = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        server_default=func.current_timestamp(),
    )

    # ==========================================================
    # RELATIONSHIP TO JOINING FORM
    # ==========================================================

    joining_form = orm_relationship(
        "JoiningForm",
        back_populates="references",
    )