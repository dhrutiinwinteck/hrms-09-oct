from pydantic import BaseModel
from typing import Optional

class DepartmentCreate(BaseModel):
    name: str

class DepartmentUpdate(BaseModel):
    name: str

class DepartmentResponse(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True