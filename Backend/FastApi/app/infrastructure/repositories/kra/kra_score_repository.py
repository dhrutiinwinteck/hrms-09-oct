from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.domain.interfaces.kra.kra_score_interface import IKRAScoreRepository
from app.infrastructure.models.kra.kra_manager import KRAManager
from app.infrastructure.models.kra.kra_score import KRAScore

class KRAScoreRepository(IKRAScoreRepository):
    """
    PostgreSQL implementation of IKRAScoreRepository.
    """

    def create(
        self,
        db: Session,
        entity: KRAScore,
    ) -> KRAScore:

        db.add(entity)
        db.flush()

        return entity

    def get_by_id(
        self,
        db: Session,
        score_id: int,
    ) -> KRAScore | None:

        statement = (
            select(KRAScore)
            .where(
                KRAScore.id == score_id
            )
        )

        return db.execute(
            statement
        ).scalar_one_or_none()

    def get_all(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
    ) -> list[KRAScore]:

        statement = (
            select(KRAScore)
            .order_by(
                KRAScore.id.desc()
            )
            .offset(skip)
            .limit(limit)
        )

        return list(
            db.execute(statement)
            .scalars()
            .all()
        )

    def get_by_employee(
        self,
        db: Session,
        employee_id: int,
        skip: int = 0,
        limit: int = 100,
    ) -> list[KRAScore]:

        statement = (
            select(KRAScore)
            .where(
                KRAScore.emp_id == employee_id
            )
            .order_by(
                KRAScore.year.desc(),
                KRAScore.frommonth.desc(),
                KRAScore.id.desc(),
            )
            .offset(skip)
            .limit(limit)
        )

        return list(
            db.execute(statement)
            .scalars()
            .all()
        )

    def get_existing_employee_period(
        self,
        db: Session,
        employee_id: int,
        year: int,
        frommonth: int,
        tomonth: int,
    ) -> KRAScore | None:

        statement = (
            select(KRAScore)
            .where(
                KRAScore.emp_id == employee_id,
                KRAScore.year == year,
                KRAScore.frommonth == frommonth,
                KRAScore.tomonth == tomonth,
            )
            .limit(1)
        )

        return db.execute(
            statement
        ).scalar_one_or_none()

    def get_logs_by_score_id(
        self,
        db: Session,
        score_id: int,
    ) -> list[KRAManager]:

        statement = (
            select(KRAManager)
            .where(
                KRAManager.kra_score_id == score_id
            )
            .order_by(
                KRAManager.id.asc()
            )
        )

        return list(
            db.execute(statement)
            .scalars()
            .all()
        )

    def get_logs_by_score_ids(
        self,
        db: Session,
        score_ids: list[int],
    ) -> list[KRAManager]:

        if not score_ids:
            return []

        statement = (
            select(KRAManager)
            .where(
                KRAManager.kra_score_id.in_(score_ids)
            )
            .order_by(
                KRAManager.id.asc()
            )
        )

        return list(
            db.execute(statement)
            .scalars()
            .all()
        )

    def create_log(
        self,
        db: Session,
        entity: KRAManager,
    ) -> KRAManager:

        db.add(entity)
        db.flush()

        return entity

    def update(
        self,
        db: Session,
        entity: KRAScore,
        values: dict,
    ) -> KRAScore:

        for field, value in values.items():
            setattr(
                entity,
                field,
                value,
            )

        db.flush()

        return entity

    def delete(
        self,
        db: Session,
        entity: KRAScore,
    ) -> None:

        db.execute(
            delete(KRAManager).where(
                KRAManager.kra_score_id == entity.id
            )
        )

        db.delete(entity)
        db.flush()

