from __future__ import annotations

from datetime import date
from typing import Any, Dict, List

from abc import ABC, abstractmethod


class IRosterRepository(ABC):
    """
    Repository contract for read-only weekly roster operations.
    """

    @abstractmethod
    def get_weekly_roster(
        self,
        week_start: date,
        week_end: date,
    ) -> List[Dict[str, Any]]:
        """
        Get all employee roster records between week_start
        and week_end inclusive.
        """
        raise NotImplementedError