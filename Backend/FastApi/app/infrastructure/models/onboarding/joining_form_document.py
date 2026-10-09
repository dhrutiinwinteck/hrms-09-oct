from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    ForeignKey,
    String,
    func,
)
from sqlalchemy.orm import relationship

from app.infrastructure.database.base import Base


class JoiningFormDocument(Base):
    __tablename__ = "employee_joining_documents"

    document_id = Column(
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

    document_type = Column(
        String(100),
        nullable=False,
    )

    original_file_name = Column(
        String(255),
        nullable=False,
    )

    stored_file_name = Column(
        String(255),
        nullable=False,
    )

    file_path = Column(
        String(500),
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
        back_populates="documents",
    )