from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class EmployeeEducationInfoCreate(BaseModel):

    emp_id: Optional[int] = None

    name_school_university: Optional[str] = None

    location_school_uni: Optional[str] = None

    degree_subject: Optional[str] = None

    year_of_passing: Optional[datetime] = None

    marks_obtained: Optional[str] = None

    certificates: Optional[str] = None


class EmployeeEducationInfoUpdate(BaseModel):

    name_school_university: Optional[str] = None

    location_school_uni: Optional[str] = None

    degree_subject: Optional[str] = None

    year_of_passing: Optional[datetime] = None

    marks_obtained: Optional[str] = None

    certificates: Optional[str] = None


class EmployeeEducationInfoResponse(BaseModel):

    id: int

    emp_id: Optional[int] = None

    name_school_university: Optional[str] = None

    location_school_uni: Optional[str] = None

    degree_subject: Optional[str] = None

    year_of_passing: Optional[datetime] = None

    marks_obtained: Optional[str] = None

    certificates: Optional[str] = None

    createdby: Optional[str] = None

    createdon: Optional[datetime] = None

    modifiedby: Optional[str] = None

    modifiedon: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class EmployeeEducationInfoDeleteResponse(BaseModel):

    success: bool
    message: str