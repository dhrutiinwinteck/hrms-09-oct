from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Master Responses ---
class KRAMasterResponse(BaseModel):
    id: int
    department_id: int
    designation_id: int
    focused_area: str
    weightage: int
    year: int
    status: int
    class Config:
        from_attributes = True

# --- Score/Assessment Responses ---
class KRALogDetailResponse(BaseModel):
    id: int
    master_id: int
    self_score: float
    tl_score: float
    rm_score: float
    tp_score: float
    key_improvement_area: Optional[str]
    class Config:
        from_attributes = True

class KRAAssessmentResponse(BaseModel):
    id: int
    emp_id: int
    kra_date: datetime
    year: int
    total_self_score: float
    total_tl_score: float
    total_rm_score: float
    total_tp_score: float
    logs: List[KRALogDetailResponse] # Nested individual goal scores
    class Config:
        from_attributes = True