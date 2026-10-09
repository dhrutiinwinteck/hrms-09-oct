from abc import ABC, abstractmethod
from typing import Optional

from app.infrastructure.models.payroll.payroll_setting import (
    PayrollSettingModel,
)


class PayrollSettingInterface(ABC):

    @abstractmethod
    def get_settings(
        self,
    ) -> Optional[PayrollSettingModel]:
        pass

    @abstractmethod
    def create_settings(
        self,
        setting_data: dict,
    ) -> PayrollSettingModel:
        pass

    @abstractmethod
    def update_settings(
        self,
        setting_id: int,
        setting_data: dict,
    ) -> Optional[PayrollSettingModel]:
        pass