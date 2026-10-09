from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.infrastructure.models.kra.kra_master import KRAMaster

class IKRAMasterRepository(ABC):
    """
    Repository contract for KRA Master operations.
    """

    @abstractmethod
    def get_all(self) -> list["KRAMaster"]:
        pass

    @abstractmethod
    def get_by_id(
        self,
        kra_id: int,
    ) -> "KRAMaster | None":
        pass

    @abstractmethod
    def get_applicable(
        self,
        department_id: int,
        designation_id: int,
        year: int,
        frommonth: int,
        tomonth: int,
    ) -> list["KRAMaster"]:
        pass

    @abstractmethod
    def exists(
        self,
        kra_id: int,
    ) -> bool:
        pass

    @abstractmethod
    def create(
        self,
        entity: "KRAMaster",
    ) -> "KRAMaster":
        pass

    @abstractmethod
    def update(
        self,
        entity: "KRAMaster",
    ) -> "KRAMaster":
        pass

    @abstractmethod
    def delete(
        self,
        entity: "KRAMaster",
    ) -> None:
        pass
