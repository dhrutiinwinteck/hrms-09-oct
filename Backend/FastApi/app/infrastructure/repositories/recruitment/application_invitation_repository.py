from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.infrastructure.models.recruitment.application_invitation import (
    ApplicationInvitation,
    ApplicationInvitationStatus,
)


class ApplicationInvitationRepository:
    """
    Repository for application invitation database operations.
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    # ==========================================================
    # CREATE
    # ==========================================================

    def create(
        self,
        invitation: ApplicationInvitation,
    ) -> ApplicationInvitation:
        """
        Add a new application invitation to the session.
        """
        self.db.add(invitation)
        self.db.flush()
        return invitation

    # ==========================================================
    # FIND BY TOKEN HASH
    # ==========================================================

    def get_by_token_hash(
        self,
        token_hash: str,
    ) -> Optional[ApplicationInvitation]:
        """
        Find an invitation using the SHA-256 token hash.
        """
        return (
            self.db.query(ApplicationInvitation)
            .filter(
                ApplicationInvitation.token_hash == token_hash
            )
            .first()
        )
