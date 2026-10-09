from sqlalchemy.orm import Session

from app.domain.interfaces.user.user_interface import (
    IUserRepository,
)

from app.infrastructure.models.user.user import (
    UserModel,
)

from app.domain.entities.user import User


class UserRepository(IUserRepository):

    def __init__(self, db: Session):
        self.db = db

    def get_by_username(
        self,
        username: str,
    ):
        db_user = (
            self.db.query(UserModel)
            .filter(
                UserModel.username == username
            )
            .first()
        )

        if not db_user:
            return None

        return User(
            id=db_user.id,
            username=db_user.username,
            email=db_user.email,
            status=db_user.status,
        )