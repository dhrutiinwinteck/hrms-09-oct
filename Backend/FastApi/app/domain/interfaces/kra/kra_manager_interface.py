from abc import ABC, abstractmethod
from typing import Any, TYPE_CHECKING

if TYPE_CHECKING:
    from app.infrastructure.models.kra.kra_manager import KRAManager

class IKRAManagerRepository(ABC):
    """
    Repository contract for KRA Manager operations.

    Authorization, hierarchy and manager/TL/top-management
    query behavior remains inside the infrastructure implementation.
    """

    @abstractmethod
    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> list["KRAManager"]:
        pass

    @abstractmethod
    def get_all_for_manager(
        self,
        employee_id: int,
        skip: int = 0,
        limit: int = 100,
    ) -> list["KRAManager"]:
        pass

    @abstractmethod
    def get_by_id(
        self,
        record_id: int,
    ) -> "KRAManager | None":
        pass

    @abstractmethod
    def get_by_id_for_manager(
        self,
        record_id: int,
        employee_id: int,
    ) -> "KRAManager | None":
        pass

    @abstractmethod
    def get_employee_id_by_score_id(
        self,
        kra_score_id: int,
    ) -> int | None:
        pass

    @abstractmethod
    def get_employee_hierarchy(
        self,
        employee_id: int,
    ) -> dict[str, object] | None:
        pass

    @abstractmethod
    def is_team_leader(
        self,
        employee_id: int,
    ) -> bool:
        pass

    @abstractmethod
    def get_score_permissions(
        self,
        target_employee_id: int,
        evaluator_id: int,
    ) -> dict[str, bool]:
        pass

    @abstractmethod
    def get_manager_display_data(
        self,
        entity: "KRAManager",
    ) -> dict[str, Any]:
        pass

    @abstractmethod
    def exists(
        self,
        record_id: int,
    ) -> bool:
        pass

    @abstractmethod
    def create(
        self,
        entity: "KRAManager",
    ) -> "KRAManager":
        pass

    @abstractmethod
    def update(
        self,
        entity: "KRAManager",
    ) -> "KRAManager":
        pass

    @abstractmethod
    def delete(
        self,
        entity: "KRAManager",
    ) -> None:
        pass

