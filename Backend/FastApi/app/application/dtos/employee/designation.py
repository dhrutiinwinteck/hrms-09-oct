from pydantic import BaseModel
from typing import Optional

class DesignationCreate(BaseModel):
    name: str
    depart_id: int

class DesignationUpdate(BaseModel):
    name: Optional[str] = None
    depart_id: Optional[int] = None

class DesignationResponse(BaseModel):
    id: int
    name: str
    depart_id: int
    department_name: Optional[str] = None
    class Config:
        from_attributes = True