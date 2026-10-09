from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PunchLocationRequest(BaseModel):
    """
    GPS information sent by browser/device.

    Backend calculates:
    - distance from office
    - inside/outside office
    - reverse-geocoded address
    """

    latitude: float = Field(
        ...,
        ge=-90,
        le=90,
        description="Device GPS latitude"
    )

    longitude: float = Field(
        ...,
        ge=-180,
        le=180,
        description="Device GPS longitude"
    )

    accuracy: float = Field(
        ...,
        gt=0,
        description="GPS accuracy in meters"
    )

    captured_at: Optional[datetime] = Field(
        default=None,
        description="Time when browser captured GPS"
    )