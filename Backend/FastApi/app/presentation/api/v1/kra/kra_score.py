from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Response,
    status,
)

from sqlalchemy.orm import Session

from app.application.dtos.kra.kra_score_dto import (
    ApplicableKRAResponse,
    EmployeeKRAScoreRequest,
    KRAScoreCreate,
    KRAScoreResponse,
    KRAScoreUpdate,
)

from app.application.services.kra.kra_score_service import (
    KRAScoreService,
)

from app.core.security import (
    get_current_user_id,
)

from app.infrastructure.database.connection import (
    get_db_session,
)


router = APIRouter()


# ============================================================
# EMPLOYEE KRA SCORES - LOGGED-IN EMPLOYEE
# ============================================================

@router.get(
    "/employee/me",
    response_model=list[KRAScoreResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Logged-in Employee KRA Scores",
)
def get_my_kra_scores(
    skip: int = Query(
        default=0,
        ge=0,
        description="Number of records to skip.",
    ),
    limit: int = Query(
        default=100,
        ge=1,
        le=500,
        description="Maximum number of records to return.",
    ),
    employee_id: int = Depends(
        get_current_user_id
    ),
    db: Session = Depends(
        get_db_session
    ),
):
    """
    Get KRA scores for the currently authenticated employee.

    The employee ID is resolved from the JWT.

    Example:

        JWT sub = IWT90
             ↓
        employee_detail.emp_code = IWT90
             ↓
        employee_detail.id = 2088
             ↓
        employee_id = 2088
    """

    service = KRAScoreService(db)

    return service.get_by_employee(
        employee_id=employee_id,
        skip=skip,
        limit=limit,
    )


# ============================================================
# APPLICABLE KRA - LOGGED-IN EMPLOYEE
# ============================================================

@router.get(
    "/employee/me/applicable",
    response_model=list[ApplicableKRAResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Applicable KRA For Logged-in Employee",
)
def get_my_applicable_kra(
    year: int = Query(
        ...,
        ge=2000,
        le=2100,
        description="KRA year.",
    ),
    frommonth: int = Query(
        ...,
        ge=1,
        le=12,
        description="KRA starting month.",
    ),
    tomonth: int = Query(
        ...,
        ge=1,
        le=12,
        description="KRA ending month.",
    ),
    employee_id: int = Depends(
        get_current_user_id
    ),
    db: Session = Depends(
        get_db_session
    ),
):
    """
    Get applicable KRA parameters for the currently
    authenticated employee.

    Employee ID is resolved from the JWT and is never
    accepted from the client.

    Example:

        Login:
            IWT90

        JWT:
            sub = IWT90

        Database:
            employee_detail.id = 2088

        Service receives:
            employee_id = 2088
    """

    # --------------------------------------------------------
    # Validate month range
    # --------------------------------------------------------

    if frommonth > tomonth:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="frommonth cannot be greater than tomonth.",
        )

    # --------------------------------------------------------
    # Execute service
    # --------------------------------------------------------

    service = KRAScoreService(db)

    return service.get_applicable_kras(
        employee_id=employee_id,
        year=year,
        frommonth=frommonth,
        tomonth=tomonth,
    )


# ============================================================
# EMPLOYEE SELF SCORE SUBMIT
# ============================================================

@router.post(
    "/employee/me",
    response_model=KRAScoreResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit Logged-in Employee KRA Self Score",
)
def submit_my_self_score(
    request: EmployeeKRAScoreRequest,
    employee_id: int = Depends(
        get_current_user_id
    ),
    db: Session = Depends(
        get_db_session
    ),
):
    """
    Submit KRA self score for the currently authenticated
    employee.

    Employee ID is resolved from the JWT.

    The request body must NOT contain employee_id.

    Example:

        JWT:
            sub = IWT90

        employee_detail:
            id = 2088

        Service receives:
            employee_id = 2088
    """

    # --------------------------------------------------------
    # Validate month range
    # --------------------------------------------------------

    if request.frommonth > request.tomonth:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="frommonth cannot be greater than tomonth.",
        )

    # --------------------------------------------------------
    # Execute service
    # --------------------------------------------------------

    service = KRAScoreService(db)

    return service.submit_employee_self_score(
        employee_id=employee_id,
        request=request,
    )


# ============================================================
# ADMIN CREATE KRA SCORE
# ============================================================

@router.post(
    "",
    response_model=KRAScoreResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create KRA Score",
)
def create_kra_score(
    request: KRAScoreCreate,
    db: Session = Depends(
        get_db_session
    ),
):
    """
    Create a KRA score.

    This endpoint is intended for administrative/backend
    operations where emp_id is explicitly supplied in the
    request.
    """

    service = KRAScoreService(db)

    return service.create(
        request
    )


# ============================================================
# GET ALL KRA SCORES
# ============================================================

@router.get(
    "",
    response_model=list[KRAScoreResponse],
    status_code=status.HTTP_200_OK,
    summary="List KRA Scores",
)
def list_kra_scores(
    skip: int = Query(
        default=0,
        ge=0,
        description="Number of records to skip.",
    ),
    limit: int = Query(
        default=100,
        ge=1,
        le=500,
        description="Maximum number of records to return.",
    ),
    db: Session = Depends(
        get_db_session
    ),
):
    """
    Get all KRA scores.

    Intended for administrative use.
    """

    service = KRAScoreService(db)

    return service.get_all(
        skip=skip,
        limit=limit,
    )


# ============================================================
# GET KRA SCORE BY ID
# ============================================================

@router.get(
    "/{score_id}",
    response_model=KRAScoreResponse,
    status_code=status.HTTP_200_OK,
    summary="Get KRA Score",
)
def get_kra_score(
    score_id: int,
    db: Session = Depends(
        get_db_session
    ),
):
    """
    Get a single KRA score by its primary key.
    """

    service = KRAScoreService(db)

    return service.get_by_id(
        score_id
    )


# ============================================================
# UPDATE KRA SCORE
# ============================================================

@router.put(
    "/{score_id}",
    response_model=KRAScoreResponse,
    status_code=status.HTTP_200_OK,
    summary="Update KRA Score",
)
def update_kra_score(
    score_id: int,
    request: KRAScoreUpdate,
    db: Session = Depends(
        get_db_session
    ),
):
    """
    Update an existing KRA score.
    """

    # --------------------------------------------------------
    # Validate month range if both values are supplied
    # --------------------------------------------------------

    if (
        request.frommonth is not None
        and request.tomonth is not None
        and request.frommonth > request.tomonth
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="frommonth cannot be greater than tomonth.",
        )

    service = KRAScoreService(db)

    return service.update(
        score_id,
        request,
    )


# ============================================================
# DELETE KRA SCORE
# ============================================================

@router.delete(
    "/{score_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete KRA Score",
)
def delete_kra_score(
    score_id: int,
    db: Session = Depends(
        get_db_session
    ),
):
    """
    Delete an existing KRA score.
    """

    service = KRAScoreService(db)

    service.delete(
        score_id
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )