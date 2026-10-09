from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.application.dtos.recruitment.application_invitation import (
    ApplicationInvitationEmailTemplateResponse,
    ApplicationInvitationResponse,
    ApplicationInvitationValidationResponse,
    CreateApplicationInvitationRequest,
)

from app.application.services.recruitment.application_invitation_service import (
    ApplicationInvitationService,
)

from app.core.security import get_current_user_id

from app.presentation.dependencies.database import (
    get_transactional_db,
)


router = APIRouter(
    prefix="/application-invitations",
    tags=["Application Invitations"],
)


# ================================================================
# GET DEFAULT EMAIL TEMPLATE
# ================================================================

@router.get(
    "/email-template",
    response_model=ApplicationInvitationEmailTemplateResponse,
)
def get_application_invitation_email_template(
    db: Session = Depends(get_transactional_db),
    employee_id: int = Depends(get_current_user_id),
) -> ApplicationInvitationEmailTemplateResponse:

    service = ApplicationInvitationService(db)

    return service.get_email_template()


# ================================================================
# CREATE APPLICATION INVITATION
# ================================================================

@router.post(
    "",
    response_model=ApplicationInvitationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_application_invitation(
    request: CreateApplicationInvitationRequest,
    db: Session = Depends(get_transactional_db),
    employee_id: int = Depends(get_current_user_id),
) -> ApplicationInvitationResponse:
    """
    Create an application invitation and send the email.

    candidate_email:
        Supplied by frontend.

    subject:
        Optional. If omitted, backend default is used.

    message:
        Optional. If omitted, backend default is used.

    employee_id:
        NEVER supplied by frontend.
        It is obtained from the authenticated JWT.
    """

    try:
        service = ApplicationInvitationService(db)

        return await service.create_invitation(
            request=request,
            sent_by_employee_id=employee_id,
        )

    except HTTPException:
        raise

    except Exception as exc:
        db.rollback()

        print(
            "\n"
            "============================================================\n"
            "APPLICATION INVITATION ERROR\n"
            "============================================================\n"
            f"Employee ID : {employee_id}\n"
            f"Candidate   : {request.candidate_email}\n"
            f"Exception   : {type(exc).__name__}\n"
            f"Message     : {exc}\n"
            "============================================================\n"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Application invitation failed: "
                f"{type(exc).__name__}: {exc}"
            ),
        ) from exc


# ================================================================
# VALIDATE APPLICATION INVITATION
# ================================================================

@router.get(
    "/{token}",
    response_model=ApplicationInvitationValidationResponse,
)
def validate_application_invitation(
    token: str,
    db: Session = Depends(get_transactional_db),
) -> ApplicationInvitationValidationResponse:

    service = ApplicationInvitationService(db)

    response = service.validate_token(token)

    if not response.valid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or expired invitation token.",
        )

    return response