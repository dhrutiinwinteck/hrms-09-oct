from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.application.dtos.kra.kra_master_dto import (
    KRAMasterCreateRequest,
    KRAMasterUpdateRequest,
)

from app.infrastructure.models.kra.kra_master import KRAMaster

from app.infrastructure.repositories.kra.kra_master_repository import (
    KRAMasterRepository,
)

class KRAMasterService:

    def __init__(
        self,
        db: Session,
    ) -> None:

        self._db = db
        self._repository = KRAMasterRepository(db)

    # =========================================================
    # GET ALL
    # =========================================================

    def get_all(
        self,
    ) -> list[KRAMaster]:

        return self._repository.get_all()

    # =========================================================
    # GET BY ID
    # =========================================================

    def get_by_id(
        self,
        kra_id: int,
    ) -> KRAMaster:

        entity = (
            self._repository.get_by_id(
                kra_id
            )
        )

        if entity is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"KRA Master with id "
                    f"{kra_id} was not found."
                ),
            )

        return entity

    # =========================================================
    # GET APPLICABLE KRA
    # =========================================================

    def get_applicable(
        self,
        department_id: int,
        designation_id: int,
        year: int,
        frommonth: int,
        tomonth: int,
    ) -> list[KRAMaster]:

        if department_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid department ID.",
            )

        if designation_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid designation ID.",
            )

        if year < 2000 or year > 2100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid year.",
            )

        if not 1 <= frommonth <= 12:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid from month.",
            )

        if not 1 <= tomonth <= 12:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid to month.",
            )

        if frommonth > tomonth:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "frommonth cannot be greater "
                    "than tomonth."
                ),
            )

        return self._repository.get_applicable(
            department_id=department_id,
            designation_id=designation_id,
            year=year,
            frommonth=frommonth,
            tomonth=tomonth,
        )

    # =========================================================
    # CREATE
    # =========================================================

    def create(
        self,
        request: KRAMasterCreateRequest,
    ) -> KRAMaster:

        entity = KRAMaster(
            department_id=request.department_id,
            designation_id=request.designation_id,
            focused_area=request.focused_area,
            weightage=request.weightage,
            frommonth=request.frommonth,
            tomonth=request.tomonth,
            year=request.year,
            status=request.status,
            createdby=request.createdby,
            createdon=datetime.now(),
            modifiedby=None,
            modifiedon=None,
        )

        try:
            return self._repository.create(
                entity
            )

        except IntegrityError as exc:
            self._db.rollback()

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Unable to create KRA Master "
                    "because of a database constraint."
                ),
            ) from exc

        except SQLAlchemyError as exc:
            self._db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "An error occurred while "
                    "creating KRA Master."
                ),
            ) from exc

    # =========================================================
    # UPDATE
    # =========================================================

    def update(
        self,
        kra_id: int,
        request: KRAMasterUpdateRequest,
    ) -> KRAMaster:

        entity = self.get_by_id(
            kra_id
        )

        entity.department_id = (
            request.department_id
        )

        entity.designation_id = (
            request.designation_id
        )

        entity.focused_area = (
            request.focused_area
        )

        entity.weightage = (
            request.weightage
        )

        entity.frommonth = (
            request.frommonth
        )

        entity.tomonth = (
            request.tomonth
        )

        entity.year = (
            request.year
        )

        entity.status = (
            request.status
        )

        entity.modifiedby = (
            request.modifiedby
        )

        entity.modifiedon = (
            datetime.now()
        )

        try:
            return self._repository.update(
                entity
            )

        except IntegrityError as exc:
            self._db.rollback()

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Unable to update KRA Master "
                    "because of a database constraint."
                ),
            ) from exc

        except SQLAlchemyError as exc:
            self._db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "An error occurred while "
                    "updating KRA Master."
                ),
            ) from exc

    # =========================================================
    # DELETE
    # =========================================================

    def delete(
        self,
        kra_id: int,
    ) -> None:

        entity = self.get_by_id(
            kra_id
        )

        try:
            self._repository.delete(
                entity
            )

        except IntegrityError as exc:
            self._db.rollback()

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "KRA Master cannot be deleted "
                    "because it is referenced by "
                    "another record."
                ),
            ) from exc

        except SQLAlchemyError as exc:
            self._db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "An error occurred while "
                    "deleting KRA Master."
                ),
            ) from exc

