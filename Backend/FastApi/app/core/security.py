import base64
import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Union

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.infrastructure.database.connection import get_db_session
from app.infrastructure.models.employee.employee import EmployeeModel
from app.infrastructure.models.user.user import UserModel


# ============================================================
# HTTP BEARER AUTHENTICATION
# ============================================================

bearer_scheme = HTTPBearer(
    auto_error=True
)


# ============================================================
# INTERNAL AUTHENTICATION EXCEPTION HELPERS
# ============================================================

def _unauthorized(
    detail: str,
) -> HTTPException:
    """
    Create a standardized HTTP 401 authentication exception.
    """
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={
            "WWW-Authenticate": "Bearer"
        },
    )


def _forbidden(
    detail: str,
) -> HTTPException:
    """
    Create a standardized HTTP 403 authorization exception.
    """
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=detail,
    )


# ============================================================
# PASSWORD HASHING
# ============================================================

def get_password_hash(
    password: str,
) -> str:
    """
    Generate a bcrypt password hash.

    This is the preferred password hashing mechanism for
    newly created or updated passwords.
    """

    if not password or not password.strip():
        raise ValueError(
            "Password cannot be empty."
        )

    salt = bcrypt.gensalt()

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        salt,
    )

    return hashed_password.decode("utf-8")


# ============================================================
# PASSWORD VERIFICATION
# ============================================================

def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a password against either:

    1. bcrypt hashes
    2. Legacy ASP.NET Identity V2 hashes

    Supporting both formats allows existing HRMS users
    migrated from the previous .NET application to continue
    logging in without forcing an immediate password reset.
    """

    if not plain_password or not hashed_password:
        return False

    hashed_password = hashed_password.strip()

    if not hashed_password:
        return False

    # --------------------------------------------------------
    # BCRYPT
    # --------------------------------------------------------

    if hashed_password.startswith(
        (
            "$2a$",
            "$2b$",
            "$2y$",
        )
    ):
        try:
            return bcrypt.checkpw(
                plain_password.encode("utf-8"),
                hashed_password.encode("utf-8"),
            )

        except (
            ValueError,
            TypeError,
        ):
            return False

    # --------------------------------------------------------
    # LEGACY ASP.NET HASH
    # --------------------------------------------------------

    return verify_aspnet_hash(
        plain_password,
        hashed_password,
    )


# ============================================================
# ASP.NET IDENTITY PASSWORD VERIFICATION
# ============================================================

def verify_aspnet_hash(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a legacy ASP.NET Identity V2 password hash.

    ASP.NET Identity V2 format:

        0x00
        16-byte salt
        32-byte subkey

    PBKDF2:
        SHA1
        1000 iterations
        32-byte derived key
    """

    if not plain_password or not hashed_password:
        return False

    try:
        hash_bytes = base64.b64decode(
            hashed_password.strip(),
            validate=True,
        )

        # ----------------------------------------------------
        # ASP.NET Identity V2 hash must be exactly 49 bytes.
        # ----------------------------------------------------

        if len(hash_bytes) != 49:
            return False

        # ----------------------------------------------------
        # Version marker.
        # ----------------------------------------------------

        if hash_bytes[0] != 0x00:
            return False

        # ----------------------------------------------------
        # Extract salt and expected subkey.
        # ----------------------------------------------------

        salt = hash_bytes[1:17]

        expected_sub_key = hash_bytes[17:49]

        # ----------------------------------------------------
        # Recalculate PBKDF2 SHA1 subkey.
        # ----------------------------------------------------

        actual_sub_key = hashlib.pbkdf2_hmac(
            "sha1",
            plain_password.encode("utf-8"),
            salt,
            1000,
            32,
        )

        # ----------------------------------------------------
        # Constant-time comparison.
        # ----------------------------------------------------

        return hmac.compare_digest(
            actual_sub_key,
            expected_sub_key,
        )

    except (
        ValueError,
        TypeError,
        IndexError,
    ):
        return False


# ============================================================
# CREATE ACCESS TOKEN
# ============================================================

def create_access_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Create a JWT access token.

    IMPORTANT:
        The JWT subject is the employee code.

    Example:
        sub = "IWT90"

    Policy services can use the authenticated employee code
    through get_current_username().
    """

    if subject is None:
        raise ValueError(
            "JWT subject cannot be empty."
        )

    subject_value = str(subject).strip()

    if not subject_value:
        raise ValueError(
            "JWT subject cannot be empty."
        )

    # --------------------------------------------------------
    # Determine expiration.
    # --------------------------------------------------------

    if expires_delta is None:
        expires_delta = timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    expire = (
        datetime.now(timezone.utc)
        + expires_delta
    )

    # --------------------------------------------------------
    # JWT payload.
    # --------------------------------------------------------

    payload: dict[str, Any] = {
        "sub": subject_value,
        "exp": expire,
    }

    # --------------------------------------------------------
    # Encode JWT.
    # --------------------------------------------------------

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


# ============================================================
# DECODE ACCESS TOKEN
# ============================================================

def decode_access_token(
    token: str,
) -> dict[str, Any]:
    """
    Decode and validate a JWT access token.
    """

    if not token or not token.strip():
        raise _unauthorized(
            "Not authenticated."
        )

    try:
        payload = jwt.decode(
            token.strip(),
            settings.SECRET_KEY,
            algorithms=[
                settings.ALGORITHM
            ],
        )

        return payload

    except JWTError as exc:
        raise _unauthorized(
            "Could not validate credentials."
        ) from exc


# ============================================================
# EXTRACT EMPLOYEE CODE FROM JWT
# ============================================================

def _get_employee_code_from_token(
    credentials: HTTPAuthorizationCredentials,
) -> str:
    """
    Extract and validate employee code from the JWT subject.

    JWT contract:

        {
            "sub": "IWT90",
            "exp": "..."
        }
    """

    # --------------------------------------------------------
    # Validate credentials object.
    # --------------------------------------------------------

    if credentials is None:
        raise _unauthorized(
            "Not authenticated."
        )

    # --------------------------------------------------------
    # Validate authentication scheme.
    # --------------------------------------------------------

    if credentials.scheme.lower() != "bearer":
        raise _unauthorized(
            "Invalid authentication scheme."
        )

    # --------------------------------------------------------
    # Decode JWT.
    # --------------------------------------------------------

    payload = decode_access_token(
        credentials.credentials
    )

    # --------------------------------------------------------
    # Extract JWT subject.
    # --------------------------------------------------------

    subject = payload.get("sub")

    if subject is None:
        raise _unauthorized(
            "Invalid authentication token."
        )

    # --------------------------------------------------------
    # Normalize employee code.
    # --------------------------------------------------------

    employee_code = str(
        subject
    ).strip()

    if not employee_code:
        raise _unauthorized(
            "Invalid authentication token."
        )

    return employee_code


# ============================================================
# GET CURRENT USER / EMPLOYEE ID
# ============================================================

def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
    db: Session = Depends(
        get_db_session
    ),
) -> int:
    """
    Resolve the authenticated employee ID.

    Authentication flow:

        JWT
          ↓
        employee_code
          ↓
        UserModel
          ↓
        active UserModel
          ↓
        EmployeeModel
          ↓
        active EmployeeModel
          ↓
        EmployeeModel.id
    """

    # --------------------------------------------------------
    # 1. Extract employee code from JWT.
    # --------------------------------------------------------

    employee_code = _get_employee_code_from_token(
        credentials
    )

    # --------------------------------------------------------
    # 2. Find application user.
    # --------------------------------------------------------

    user = (
        db.query(UserModel)
        .filter(
            UserModel.username == employee_code
        )
        .first()
    )

    if user is None:
        raise _unauthorized(
            "Authenticated user was not found."
        )

    # --------------------------------------------------------
    # 3. Validate user status.
    # --------------------------------------------------------

    if getattr(
        user,
        "status",
        1,
    ) != 1:
        raise _forbidden(
            "User account is inactive."
        )

    # --------------------------------------------------------
    # 4. Find active employee.
    #
    # is_remove = 0 means the employee is not removed.
    # --------------------------------------------------------

    employee = (
        db.query(EmployeeModel)
        .filter(
            EmployeeModel.emp_code == employee_code,
            EmployeeModel.is_remove == 0,
        )
        .first()
    )

    if employee is None:
        raise _forbidden(
            "Employee record was not found or is inactive."
        )

    # --------------------------------------------------------
    # 5. Return EmployeeModel primary key.
    # --------------------------------------------------------

    return int(
        employee.id
    )


# ============================================================
# GET CURRENT USERNAME / EMPLOYEE CODE
# ============================================================

def get_current_username(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
) -> str:
    """
    Return the authenticated employee code.

    JWT contract:

        sub = employee code

    Example:

        sub = "IWT90"

    This function is particularly important for the Policy
    module because policy creation can use the authenticated
    employee code as the createdby value.

    Example:

        createdby = get_current_username()
    """

    return _get_employee_code_from_token(
        credentials
    )


# ============================================================
# GET CURRENT USER
# ============================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
    db: Session = Depends(
        get_db_session
    ),
) -> UserModel:
    """
    Return the authenticated UserModel.

    The user must:

        1. Have a valid JWT.
        2. Have a valid employee code.
        3. Exist in UserModel.
        4. Have status = 1.
        5. Have an active employee record.

    The additional employee validation keeps this dependency
    consistent with get_current_user_id().
    """

    # --------------------------------------------------------
    # 1. Extract employee code.
    # --------------------------------------------------------

    employee_code = _get_employee_code_from_token(
        credentials
    )

    # --------------------------------------------------------
    # 2. Find user.
    # --------------------------------------------------------

    user = (
        db.query(UserModel)
        .filter(
            UserModel.username == employee_code
        )
        .first()
    )

    if user is None:
        raise _unauthorized(
            "Authenticated user was not found."
        )

    # --------------------------------------------------------
    # 3. Validate application user.
    # --------------------------------------------------------

    if getattr(
        user,
        "status",
        1,
    ) != 1:
        raise _forbidden(
            "User account is inactive."
        )

    # --------------------------------------------------------
    # 4. Validate employee record.
    #
    # This prevents a deleted/removed employee from being
    # treated as an authenticated active HRMS user.
    # --------------------------------------------------------

    employee = (
        db.query(EmployeeModel)
        .filter(
            EmployeeModel.emp_code == employee_code,
            EmployeeModel.is_remove == 0,
        )
        .first()
    )

    if employee is None:
        raise _forbidden(
            "Employee record was not found or is inactive."
        )

    # --------------------------------------------------------
    # 5. Return authenticated user.
    # --------------------------------------------------------

    return user