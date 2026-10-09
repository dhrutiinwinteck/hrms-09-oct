from typing import Any

from app.application.dtos.recruitment.letter_of_intent import (
    LetterOfIntentSettingsUpdate,
)
from app.infrastructure.models.recruitment.letter_of_intent import (
    LetterOfIntentSettingsModel,
)
from app.infrastructure.repositories.recruitment.letter_of_intent_repository import (
    LetterOfIntentSettingsRepository,
)


DEFAULT_LETTER_BODY = """Dear {{CandidateName}},

This letter represents confirmation of the intent to employ {{CandidateName}} as an {{Position}} made by {{HRName}}, {{HRDesignation}}, of {{CompanyName}} and to confirm the broad terms of our discussions.

Terms & Conditions:
• The candidate's work shall be considered full-time.
• It is the intention of the Company to begin employment no later than {{JoiningDate}}.
• Shift: {{ShiftTiming}} (Company can change the shift timing as required with Rotation Off).
• Your employment will be confirmed after the successful completion of the probation period of {{ProbationPeriod}} Months.

In case the above terms and conditions of service are acceptable to you, please acknowledge and return the copy of the offer in token of your acceptance of the same.

For any clarification, please contact the {{ReferenceContact}}.
"""


class LetterOfIntentSettingsService:

    def __init__(
        self,
        repository: LetterOfIntentSettingsRepository,
    ) -> None:
        self.repository = repository

    def get_settings(
        self,
    ) -> LetterOfIntentSettingsModel:

        settings = self.repository.get_default()

        if settings is None:
            settings = self.repository.create(
                LetterOfIntentSettingsModel(
                    setting_key="default",
                    letter_title="Letter of Intent to Hire",
                    company_name="Inwinteck Pvt Ltd",
                    registered_office_address="",
                    letter_body=DEFAULT_LETTER_BODY,
                    probation_period_months=3,
                    page_size="A4",
                    template_status="Active",
                )
            )

        return settings

    def update_settings(
        self,
        payload: LetterOfIntentSettingsUpdate,
        username: str,
    ) -> LetterOfIntentSettingsModel:

        model = self.get_settings()

        changes: dict[str, Any] = (
            payload.model_dump(
                exclude_unset=True,
            )
        )

        for field_name, value in changes.items():
            setattr(
                model,
                field_name,
                value,
            )

        model.updated_by = username

        return self.repository.update(model)