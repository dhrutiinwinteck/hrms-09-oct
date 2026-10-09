from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.domain.interfaces.kra.kra_master_interface import IKRAMasterRepository
from app.infrastructure.models.kra.kra_master import KRAMaster

class KRAMasterRepository(IKRAMasterRepository):
    """
    PostgreSQL implementation of IKRAMasterRepository.
    """

    def __init__(
        self,
        db: Session,
    ) -> None:

        self._db = db

    def get_all(
        self,
    ) -> list[KRAMaster]:

        statement = (
            select(KRAMaster)
            .order_by(
                KRAMaster.id.desc()
            )
        )

        return list(
            self._db.scalars(statement).all()
        )

    def get_by_id(
        self,
        kra_id: int,
    ) -> KRAMaster | None:

        statement = (
            select(KRAMaster)
            .where(
                KRAMaster.id == kra_id
            )
        )

        return self._db.scalar(statement)

    def get_applicable(
        self,
        department_id: int,
        designation_id: int,
        year: int,
        frommonth: int,
        tomonth: int,
    ) -> list[KRAMaster]:

        statement = (
            select(KRAMaster)
            .where(
                KRAMaster.department_id == department_id,
                KRAMaster.designation_id == designation_id,
                KRAMaster.year == year,
                KRAMaster.frommonth == frommonth,
                KRAMaster.tomonth == tomonth,
                KRAMaster.status == 1,
            )
            .order_by(
                KRAMaster.id.asc()
            )
        )

        return list(
            self._db.scalars(statement).all()
        )

    def exists(
        self,
        kra_id: int,
    ) -> bool:

        statement = (
            select(KRAMaster.id)
            .where(
                KRAMaster.id == kra_id
            )
        )

        return (
            self._db.scalar(statement)
            is not None
        )

    def create(
        self,
        entity: KRAMaster,
    ) -> KRAMaster:

        try:
            self._db.add(entity)

            self._db.commit()
            self._db.refresh(entity)

            return entity

        except SQLAlchemyError:
            self._db.rollback()
            raise

    def update(
        self,
        entity: KRAMaster,
    ) -> KRAMaster:

        try:
            self._db.commit()
            self._db.refresh(entity)

            return entity

        except SQLAlchemyError:
            self._db.rollback()
            raise

    def delete(
        self,
        entity: KRAMaster,
    ) -> None:

        try:
            self._db.delete(entity)
            self._db.commit()

        except SQLAlchemyError:
            self._db.rollback()
            raise

