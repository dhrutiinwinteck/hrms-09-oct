from typing import Optional

from sqlalchemy.orm import Session

from app.infrastructure.models.payroll.payroll_setting import (
    PayrollSettingModel,
)

from app.infrastructure.repositories.payroll.payroll_setting_repository import (
    PayrollSettingRepository,
)


class PayrollSettingService:

    def __init__(self, db: Session):
        self.repository = PayrollSettingRepository(db)

    def get_settings(
        self,
    ) -> Optional[PayrollSettingModel]:

        return self.repository.get_settings()

    def create_settings(
        self,
        setting_data: dict,
    ) -> PayrollSettingModel:

        existing_setting = self.repository.get_settings()

        if existing_setting:
            raise ValueError(
                "Payroll settings already exist. Use update API."
            )

        return self.repository.create_settings(setting_data)

    def update_settings(
        self,
        setting_id: int,
        setting_data: dict,
    ) -> Optional[PayrollSettingModel]:

        return self.repository.update_settings(
            setting_id,
            setting_data,
        )