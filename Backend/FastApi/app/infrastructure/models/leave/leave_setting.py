from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
)

from app.infrastructure.database.base import Base


class LeaveSettingModel(Base):

    __tablename__ = "leave_setting"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    leave_type = Column(
        Integer,
        nullable=False
    )

    leave_number = Column(
        Integer,
        nullable=False
    )

    createdon = Column(
        DateTime,
        nullable=False
    )

    createdby = Column(
        String(255),
        nullable=False
    )

    modifiedon = Column(
        DateTime,
        nullable=True
    )

    modifiedby = Column(
        String(255),
        nullable=True
    )