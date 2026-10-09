from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class ActiveEmployeeResponse(BaseModel):
    employee_id: int = Field(
        ...,
        description="Employee primary key.",
    )

    employee_name: str = Field(
        ...,
        description="Employee full name.",
    )

    email: EmailStr = Field(
        ...,
        description="Employee official email address.",
    )


class ResignationEmailResponse(BaseModel):
    success: bool

    message: str

    recipient_email: EmailStr

    attachment_count: int = Field(
        ...,
        ge=0,
    )