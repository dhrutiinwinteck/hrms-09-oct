from sqlalchemy import (
    Boolean,
    Column,
    Integer,
    String,
    text,
)

from app.infrastructure.database.base import Base


class UserModel(Base):
    __tablename__ = "aspnetusers"

    id = Column(
        String(128),
        primary_key=True,
    )

    username = Column(
        String(256),
        unique=True,
        nullable=False,
    )

    email = Column(
        String(256),
        nullable=True,
    )

    passwordhash = Column(
        "passwordhash",
        String,
        nullable=True,
    )

    emailconfirmed = Column(
        Boolean,
        nullable=False,
        default=False,
        server_default=text("false"),
    )

    phonenumberconfirmed = Column(
        Boolean,
        nullable=False,
        default=False,
        server_default=text("false"),
    )

    twofactorenabled = Column(
        Boolean,
        nullable=False,
        default=False,
        server_default=text("false"),
    )

    lockoutenabled = Column(
        Boolean,
        nullable=False,
        default=False,
        server_default=text("false"),
    )

    accessfailedcount = Column(
        Integer,
        nullable=False,
        default=0,
        server_default=text("0"),
    )

    status = Column(
        Integer,
        nullable=False,
        default=1,
        server_default=text("1"),
    )