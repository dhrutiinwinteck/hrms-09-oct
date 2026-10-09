from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

    from app.infrastructure.models.kra.kra_manager import KRAManager
    from app.infrastructure.models.kra.kra_score import KRAScore

class IKRAScoreRepository(ABC):
    """
    Interface / contract for KRA Score repository.
    """

    @abstractmethod
    def create(
        self,
        db: "Session",
        entity: "KRAScore",
    ) -> "KRAScore":
        pass

    @abstractmethod
    def get_by_id(
        self,
        db: "Session",
        score_id: int,
    ) -> "KRAScore | None":
        pass

    @abstractmethod
    def get_all(
        self,
        db: "Session",
        skip: int = 0,
        limit: int = 100,
    ) -> list["KRAScore"]:
        pass

    @abstractmethod
    def get_by_employee(
        self,
        db: "Session",
        employee_id: int,
        skip: int = 0,
        limit: int = 100,
    ) -> list["KRAScore"]:
        pass

    @abstractmethod
    def get_existing_employee_period(
        self,
        db: "Session",
        employee_id: int,
        year: int,
        frommonth: int,
        tomonth: int,
    ) -> "KRAScore | None":
        pass

    @abstractmethod
    def get_logs_by_score_id(
        self,
        db: "Session",
        score_id: int,
    ) -> list["KRAManager"]:
        pass

    @abstractmethod
    def get_logs_by_score_ids(
        self,
        db: "Session",
        score_ids: list[int],
    ) -> list["KRAManager"]:
        pass

    @abstractmethod
    def create_log(
        self,
        db: "Session",
        entity: "KRAManager",
    ) -> "KRAManager":
        pass

    @abstractmethod
    def update(
        self,
        db: "Session",
        entity: "KRAScore",
        values: dict,
    ) -> "KRAScore":
        pass

    @abstractmethod
    def delete(
        self,
        db: "Session",
        entity: "KRAScore",
    ) -> None:
        pass

