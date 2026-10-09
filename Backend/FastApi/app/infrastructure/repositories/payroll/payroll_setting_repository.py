from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.interfaces.payroll.payroll_setting_interface import (
    PayrollSettingInterface,
)

from app.infrastructure.models.payroll.payroll_setting import (
    PayrollSettingModel,
)


class PayrollSettingRepository(PayrollSettingInterface):

    def __init__(self, db: Session):
        self.db = db

    def get_settings(
        self,
    ) -> Optional[PayrollSettingModel]:

        result = self.db.execute(
            select(PayrollSettingModel)
            .order_by(PayrollSettingModel.id.asc())
            .limit(1)
        )

        return result.scalar_one_or_none()

    def create_settings(
        self,
        setting_data: dict,
    ) -> PayrollSettingModel:

        setting = PayrollSettingModel(**setting_data)

        self.db.add(setting)
        self.db.commit()
        self.db.refresh(setting)

        return setting

    def update_settings(
        self,
        setting_id: int,
        setting_data: dict,
    ) -> Optional[PayrollSettingModel]:

        result = self.db.execute(
            select(PayrollSettingModel).where(
                PayrollSettingModel.id == setting_id
            )
        )

        setting = result.scalar_one_or_none()

        if setting is None:
            return None

        for key, value in setting_data.items():
            if value is not None:
                setattr(setting, key, value)

        self.db.commit()
        self.db.refresh(setting)

        return setting