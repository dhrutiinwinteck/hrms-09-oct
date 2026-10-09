from sqlalchemy import (
    Column,
    Integer,
    SmallInteger,
    DateTime,
)

from app.infrastructure.database.base import Base


class LeaveAccrualRunLogModel(Base):

    __tablename__ = "leaveaccrualrunlog"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    runyear = Column(
        Integer,
        nullable=False
    )

    runmonth = Column(
        SmallInteger,
        nullable=False
    )

    ranat = Column(
        DateTime,
        nullable=False
    )

    rowsaffected = Column(
        Integer,
        nullable=False
    )