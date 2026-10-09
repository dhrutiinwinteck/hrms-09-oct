from pydantic import BaseModel


class JoiningApprovalActionResponse(BaseModel):

    success: bool = True

    message: str

    application_id: int

    status: str