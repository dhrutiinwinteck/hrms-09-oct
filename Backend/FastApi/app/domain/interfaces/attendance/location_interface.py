from abc import ABC, abstractmethod
from typing import Optional


class ILocationService(ABC):

    @abstractmethod
    def validate_location(
        self,
        latitude: float,
        longitude: float,
        accuracy: float
    ) -> dict:
        pass

    @abstractmethod
    def reverse_geocode(
        self,
        latitude: float,
        longitude: float
    ) -> Optional[str]:
        pass

    @abstractmethod
    def process_location(
        self,
        latitude: float,
        longitude: float,
        accuracy: float
    ) -> dict:
        pass