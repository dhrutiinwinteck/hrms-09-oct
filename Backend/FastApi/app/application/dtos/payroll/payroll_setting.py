from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PayrollSettingBase(BaseModel):
    company_name: str | None = None
    company_address: str | None = None
    company_contact: str | None = None


class PayrollSettingCreate(PayrollSettingBase):
    created_by: str | None = None


class PayrollSettingUpdate(PayrollSettingBase):
    modified_by: str | None = None


class PayrollSettingResponse(PayrollSettingBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_logo: str | None = None

    created_by: str | None = None
    created_on: datetime | None = None

    modified_by: str | None = None
    modified_on: datetime | None = None