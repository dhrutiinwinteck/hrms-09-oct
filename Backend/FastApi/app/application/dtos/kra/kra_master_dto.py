from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

class KRAMasterCreateRequest(BaseModel):
    department_id: int = Field(
        ...,
        gt=0,
    )

    designation_id: int = Field(
        ...,
        gt=0,
    )

    focused_area: str | None = Field(
        default=None,
        max_length=500,
    )

    weightage: int | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    frommonth: int | None = Field(
        default=None,
        ge=1,
        le=12,
    )

    tomonth: int | None = Field(
        default=None,
        ge=1,
        le=12,
    )

    year: int | None = Field(
        default=None,
        ge=2000,
        le=2100,
    )

    status: int | None = None

    createdby: str | None = Field(
        default=None,
        max_length=50,
    )

    @model_validator(mode="after")
    def validate_month_range(self):
        if (
            self.frommonth is not None
            and self.tomonth is not None
            and self.frommonth > self.tomonth
        ):
            raise ValueError(
                "frommonth cannot be greater than tomonth."
            )

        return self

class KRAMasterUpdateRequest(BaseModel):
    department_id: int = Field(
        ...,
        gt=0,
    )

    designation_id: int = Field(
        ...,
        gt=0,
    )

    focused_area: str | None = Field(
        default=None,
        max_length=500,
    )

    weightage: int | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    frommonth: int | None = Field(
        default=None,
        ge=1,
        le=12,
    )

    tomonth: int | None = Field(
        default=None,
        ge=1,
        le=12,
    )

    year: int | None = Field(
        default=None,
        ge=2000,
        le=2100,
    )

    status: int | None = None

    modifiedby: str | None = Field(
        default=None,
        max_length=50,
    )

    @model_validator(mode="after")
    def validate_month_range(self):
        if (
            self.frommonth is not None
            and self.tomonth is not None
            and self.frommonth > self.tomonth
        ):
            raise ValueError(
                "frommonth cannot be greater than tomonth."
            )

        return self

class KRAMasterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    department_id: int
    designation_id: int
    focused_area: str | None
    weightage: int | None
    frommonth: int | None
    tomonth: int | None
    year: int | None
    status: int | None
    createdby: str | None
    createdon: datetime | None
    modifiedby: str | None
    modifiedon: datetime | None

