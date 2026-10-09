from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class KRALogItem(BaseModel):
    master_id: int
    score: float
    remarks: Optional[str] = None

class KRASelfSubmission(BaseModel):
    emp_id: int
    from_month: int
    to_month: int
    year: int
    scores: List[KRALogItem]

class KRAMasterCreate(BaseModel):
    department_id: int
    designation_id: int
    focused_area: str
    weightage: int
    frommonth: int
    tomonth: int
    year: int