from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

# ============================================================
# CREATE REQUEST
# ============================================================

class KRAManagerCreateRequest(BaseModel):
    id: int = Field(
        ...,
        gt=0,
        description="Primary key of the KRA score log record.",
    )

    master_id: int = Field(
        ...,
        gt=0,
        description="KRA master identifier.",
    )

    kra_score_id: int = Field(
        ...,
        gt=0,
        description="KRA score identifier.",
    )

    isedited: bool = False

    self_score: Decimal | None = Field(
        default=None,
        ge=0,
        le=999.99,
    )

    key_improvement_area: str | None = Field(
        default=None,
        max_length=500,
    )

    # Client value is accepted for backward compatibility,
    # but service NEVER trusts it.
    reporting_manager: int = Field(
        default=0,
        ge=0,
    )

    rm_score: Decimal | None = Field(
        default=None,
        ge=0,
        le=999.99,
    )

    rm_remark: str | None = Field(
        default=None,
        max_length=500,
    )

    tl_score: Decimal | None = Field(
        default=None,
        ge=0,
        le=999.99,
    )

    tl_remark: str | None = Field(
        default=None,
        max_length=500,
    )

    tp_score: Decimal | None = Field(
        default=None,
        ge=0,
        le=999.99,
    )

    tp_remark: str | None = Field(
        default=None,
        max_length=500,
    )

    createdon: datetime | None = None

    createdby: str | None = Field(
        default=None,
        max_length=100,
    )

    modifiedon: datetime | None = None

    modifiedby: str | None = Field(
        default=None,
        max_length=100,
    )

# ============================================================
# UPDATE REQUEST
# ============================================================

class KRAManagerUpdateRequest(BaseModel):
    master_id: int | None = Field(
        default=None,
        gt=0,
    )

    kra_score_id: int | None = Field(
        default=None,
        gt=0,
    )

    isedited: bool | None = None

    self_score: Decimal | None = Field(
        default=None,
        ge=0,
        le=999.99,
    )

    key_improvement_area: str | None = Field(
        default=None,
        max_length=500,
    )

    # Accepted for compatibility.
    # Service removes it and calculates the real value.
    reporting_manager: int | None = Field(
        default=None,
        ge=0,
    )

    rm_score: Decimal | None = Field(
        default=None,
        ge=0,
        le=999.99,
    )

    rm_remark: str | None = Field(
        default=None,
        max_length=500,
    )

    tl_score: Decimal | None = Field(
        default=None,
        ge=0,
        le=999.99,
    )

    tl_remark: str | None = Field(
        default=None,
        max_length=500,
    )

    tp_score: Decimal | None = Field(
        default=None,
        ge=0,
        le=999.99,
    )

    tp_remark: str | None = Field(
        default=None,
        max_length=500,
    )

    modifiedon: datetime | None = None

    modifiedby: str | None = Field(
        default=None,
        max_length=100,
    )

# ============================================================
# RESPONSE
# ============================================================

class KRAManagerResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    # ========================================================
    # KRA MANAGER
    # ========================================================

    id: int

    master_id: int

    kra_score_id: int

    isedited: bool

    self_score: Decimal | None = None

    key_improvement_area: str | None = None

    reporting_manager: int = 0

    rm_score: Decimal | None = None

    rm_remark: str | None = None

    tl_score: Decimal | None = None

    tl_remark: str | None = None

    tp_score: Decimal | None = None

    tp_remark: str | None = None

    createdon: datetime | None = None

    createdby: str | None = None

    modifiedon: datetime | None = None

    modifiedby: str | None = None

    # ========================================================
    # EMPLOYEE
    # ========================================================

    employee_id: int | None = None

    employee_code: str | None = None

    employee_name: str | None = None

    # ========================================================
    # DESIGNATION
    # ========================================================

    designation_id: int | None = None

    designation_name: str | None = None

    # ========================================================
    # KRA DISPLAY
    # ========================================================

    kra_date: datetime | None = None

    frommonth: int | None = None

    tomonth: int | None = None

    year: int | None = None

    focused_area: str | None = None

    weightage: Decimal | None = None

    total_weightage: Decimal | None = None

    # ========================================================
    # DIRECT MANAGER
    # ========================================================

    reporting_manager_name: str | None = None

    direct_manager_id: int | None = None

    direct_manager_name: str | None = None

    # ========================================================
    # TOP MANAGER
    # ========================================================
    team_leader_id: int | None = None
    team_leader_name: str | None = None
    team_leader_emp_code: str | None = None
    team_leader_designation_name: str | None = None

    top_manager_id: int | None = None

    top_manager_name: str | None = None

    # ========================================================
    # CURRENT USER PERMISSIONS
    # ========================================================

    can_edit_tl: bool = False

    can_edit_rm: bool = False

    can_edit_tm: bool = False

    

# ============================================================
# LIST RESPONSE
# ============================================================

class KRAManagerListResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int

    master_id: int

    kra_score_id: int

    employee_id: int

    employee_code: str | None = None

    employee_name: str | None = None

    designation_id: int | None = None

    designation_name: str | None = None

    kra_date: datetime | None = None

    frommonth: int | None = None

    tomonth: int | None = None

    year: int | None = None

    focused_area: str | None = None

    total_weightage: Decimal | None = None

    self_score: Decimal | None = None

    rm_score: Decimal | None = None

    tl_score: Decimal | None = None

    tp_score: Decimal | None = None

    key_improvement_area: str | None = None

    reporting_manager: int = 0

    reporting_manager_name: str | None = None

    rm_remark: str | None = None

    tl_remark: str | None = None

    tp_remark: str | None = None

    isedited: bool = False

    createdon: datetime | None = None

    createdby: str | None = None

    modifiedon: datetime | None = None

    modifiedby: str | None = None

    # ========================================================
    # HIERARCHY
    # ========================================================

    direct_manager_id: int | None = None

    direct_manager_name: str | None = None

    top_manager_id: int | None = None

    top_manager_name: str | None = None
    team_leader_id: int | None = None
    team_leader_name: str | None = None
    team_leader_emp_code: str | None = None
    team_leader_designation_name: str | None = None

    # ========================================================
    # PERMISSIONS   
    # ========================================================

    can_edit_tl: bool = False

    can_edit_rm: bool = False

    can_edit_tm: bool = False

