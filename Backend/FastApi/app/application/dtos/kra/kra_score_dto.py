from datetime import datetime
from decimal import Decimal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator,
)

# ============================================================
# APPLICABLE KRA RESPONSE
# ============================================================

class ApplicableKRAResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int

    department_id: int

    designation_id: int

    focused_area: str | None = None

    weightage: int | None = None

    frommonth: int | None = None

    tomonth: int | None = None

    year: int | None = None

    status: int | str | None = None

# ============================================================
# EMPLOYEE KRA SCORE ITEM
# ============================================================

class EmployeeKRAScoreItem(BaseModel):
    master_id: int = Field(
        ...,
        gt=0,
    )

    self_score: Decimal = Field(
        ...,
        ge=0,
        le=100,
        decimal_places=2,
    )

    key_improvement_area: str | None = Field(
        default=None,
        max_length=5000,
    )

# ============================================================
# EMPLOYEE SELF SCORE REQUEST
# ============================================================

class EmployeeKRAScoreRequest(BaseModel):
    frommonth: int = Field(
        ...,
        ge=1,
        le=12,
    )

    tomonth: int = Field(
        ...,
        ge=1,
        le=12,
    )

    year: int = Field(
        ...,
        ge=2000,
        le=2100,
    )

    kra_date: datetime | None = None

    items: list[EmployeeKRAScoreItem] = Field(
        ...,
        min_length=1,
    )

    @model_validator(mode="after")
    def validate_month_range(self):
        if self.frommonth > self.tomonth:
            raise ValueError(
                "frommonth cannot be greater than tomonth."
            )

        return self

# ============================================================
# KRA PARAMETER DETAIL RESPONSE
# ============================================================

class KRAScoreParameterResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    master_id: int

    focused_area: str | None = None

    weightage: int | None = None

    self_score: Decimal | None = None

    key_improvement_area: str | None = None

# ============================================================
# KRA SCORE BASE
# ============================================================

class KRAScoreBase(BaseModel):
    emp_id: int = Field(
        ...,
        ge=1,
    )

    kra_date: datetime | None = None

    total_self_score: Decimal | None = Field(
        default=None,
        max_digits=5,
        decimal_places=2,
        ge=0,
        le=100,
    )

    total_rm_score: Decimal | None = Field(
        default=None,
        max_digits=5,
        decimal_places=2,
        ge=0,
        le=100,
    )

    total_tl_score: Decimal | None = Field(
        default=None,
        max_digits=5,
        decimal_places=2,
        ge=0,
        le=100,
    )

    total_tp_score: Decimal | None = Field(
        default=None,
        max_digits=5,
        decimal_places=2,
        ge=0,
        le=100,
    )

    rm_remark: str | None = None

    tl_remark: str | None = None

    top_management_remark: str | None = None

    frommonth: int = Field(
        ...,
        ge=1,
        le=12,
    )

    tomonth: int = Field(
        ...,
        ge=1,
        le=12,
    )

    year: int = Field(
        ...,
        ge=2000,
        le=2100,
    )

    createdby: str | None = Field(
        default=None,
        max_length=128,
    )

    @model_validator(mode="after")
    def validate_month_range(self):
        if self.frommonth > self.tomonth:
            raise ValueError(
                "frommonth cannot be greater than tomonth."
            )

        return self

# ============================================================
# ADMIN CREATE
# ============================================================

class KRAScoreCreate(KRAScoreBase):
    items: list[EmployeeKRAScoreItem] = Field(
        default_factory=list
    )

# ============================================================
# UPDATE
# ============================================================

class KRAScoreUpdate(BaseModel):
    emp_id: int | None = Field(
        default=None,
        ge=1,
    )

    kra_date: datetime | None = None

    total_self_score: Decimal | None = Field(
        default=None,
        max_digits=5,
        decimal_places=2,
        ge=0,
        le=100,
    )

    total_rm_score: Decimal | None = Field(
        default=None,
        max_digits=5,
        decimal_places=2,
        ge=0,
        le=100,
    )

    total_tl_score: Decimal | None = Field(
        default=None,
        max_digits=5,
        decimal_places=2,
        ge=0,
        le=100,
    )

    total_tp_score: Decimal | None = Field(
        default=None,
        max_digits=5,
        decimal_places=2,
        ge=0,
        le=100,
    )

    rm_remark: str | None = None

    tl_remark: str | None = None

    top_management_remark: str | None = None

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

    modifiedby: str | None = Field(
        default=None,
        max_length=128,
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

# ============================================================
# RESPONSE
# ============================================================

class KRAScoreResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    # Keep ID first in API response.
    id: int

    emp_id: int

    kra_date: datetime | None = None

    total_self_score: Decimal | None = None

    total_rm_score: Decimal | None = None

    total_tl_score: Decimal | None = None

    total_tp_score: Decimal | None = None

    rm_remark: str | None = None

    tl_remark: str | None = None

    top_management_remark: str | None = None

    frommonth: int

    tomonth: int

    year: int

    createdby: str | None = None

    createdon: datetime | None = None

    modifiedon: datetime | None = None

    modifiedby: str | None = None

    parameters: list[
        KRAScoreParameterResponse
    ] = Field(
        default_factory=list
    )
