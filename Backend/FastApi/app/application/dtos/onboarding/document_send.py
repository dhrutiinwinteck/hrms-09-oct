from __future__ import annotations

from typing import List

from pydantic import BaseModel, EmailStr, Field


class DocumentSendRequest(BaseModel):
    recipient_email: EmailStr

    document_types: List[str] = Field(
        min_length=1,
        description="Documents that should be included in the email.",
    )