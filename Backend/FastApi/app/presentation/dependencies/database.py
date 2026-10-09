from collections.abc import Generator

from sqlalchemy.orm import Session

from app.infrastructure.database.connection import get_db_session


def get_transactional_db() -> Generator[Session, None, None]:
    """
    Provides a SQLAlchemy session for an API request.

    The underlying database session is created by
    infrastructure.database.connection.get_db_session().

    Successful request:
        Commit transaction.

    Failed request:
        Rollback transaction.

    Finally:
        Close the underlying database session.
    """

    db_generator = get_db_session()
    db = next(db_generator)

    try:
        yield db
        db.commit()

    except Exception:
        db.rollback()
        raise

    finally:
        try:
            next(db_generator)
        except StopIteration:
            pass