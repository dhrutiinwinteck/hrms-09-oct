from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    username: str

class ChangePasswordRequest(BaseModel):
    email: str
    password: str  # This is the new password



class ChangePasswordRequest1(BaseModel):
    emp_code: str  # We now use the Employee Code (e.g., IWT1001)
    password: str  # This is the new password to set