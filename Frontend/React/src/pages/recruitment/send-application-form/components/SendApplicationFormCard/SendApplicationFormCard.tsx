import React, {
  ChangeEvent,
  FormEvent,
  useMemo,
} from "react";

import {
  Mail,
  MessageSquare,
  Send,
  Tag,
  X,
} from "lucide-react";

import type {
  SendApplicationFormData,
  SendApplicationFormErrors,
  SendApplicationInvitationResponse,
} from "../../types/sendApplicationForm.types";

import "./SendApplicationFormCard.css";

interface SendApplicationFormCardProps {
  formData: SendApplicationFormData;

  errors: SendApplicationFormErrors;

  isLoadingTemplate: boolean;

  isSubmitting: boolean;

  isSuccess: boolean;

  submitError: string | null;

  response: SendApplicationInvitationResponse | null;

  isEmailEntered: boolean;

  updateField: (
    field: keyof SendApplicationFormData,
    value: string,
  ) => void;

  onSubmit: (
    data: SendApplicationFormData,
  ) => Promise<void>;

  onCancel: () => void;
}

const DEFAULT_MAX_MESSAGE_LENGTH = 5000;

const SendApplicationFormCard: React.FC<
  SendApplicationFormCardProps
> = ({
  formData,
  errors,
  isLoadingTemplate,
  isSubmitting,
  isSuccess,
  submitError,
  response,
  isEmailEntered,
  updateField,
  onSubmit,
  onCancel,
}) => {
  const maxMessageLength =
    DEFAULT_MAX_MESSAGE_LENGTH;

  const messageCharacterCount = useMemo(
    () => formData.message.length,
    [formData.message.length],
  );

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ): void => {
    const { name, value } = event.target;

    const field =
      name as keyof SendApplicationFormData;

    if (
      field === "message" &&
      value.length > maxMessageLength
    ) {
      return;
    }

    updateField(field, value);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (
      isSubmitting ||
      isLoadingTemplate
    ) {
      return;
    }

    await onSubmit(formData);
  };

  const handleCancel = (): void => {
    if (isSubmitting) {
      return;
    }

    onCancel();
  };

  return (
    <section className="send-application-form-card">
      <form
        className="send-application-form-card__form"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* =====================================================
            INVITATION BANNER
            ===================================================== */}

        <div className="send-application-form-card__invitation">
          <div
            className="send-application-form-card__illustration"
            aria-hidden="true"
          >
            <div className="send-application-form-card__envelope">
              <Mail
                size={34}
                strokeWidth={1.8}
              />
            </div>

            <div className="send-application-form-card__send-icon">
              <Send
                size={25}
                strokeWidth={2.2}
              />
            </div>
          </div>

          <div className="send-application-form-card__invitation-content">
            <h2>
              Send invitation to the selected candidate
            </h2>

            <p>
              The candidate will receive an email with the join form
              link to complete their onboarding process.
            </p>
          </div>
        </div>

        {/* =====================================================
            SUCCESS / ERROR
            ===================================================== */}

        {isSuccess && response ? (
          <div
            role="status"
            style={{
              margin: "0 0 16px",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#065f46",
            }}
          >
            {response.message}

            {response.reference_id ? (
              <div
                style={{
                  marginTop: "4px",
                  fontSize: "13px",
                }}
              >
                Reference ID: {response.reference_id}
              </div>
            ) : null}
          </div>
        ) : null}

        {submitError ? (
          <div
            role="alert"
            style={{
              margin: "0 0 16px",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
            }}
          >
            {submitError}
          </div>
        ) : null}

        {/* =====================================================
            FORM FIELDS
            ===================================================== */}

        <div className="send-application-form-card__fields">

          {/* =====================================================
              EMAIL
              ===================================================== */}

          <div className="send-application-form-card__field">
            <label htmlFor="send-application-form-email">
              To (Email Address)
              <span aria-hidden="true">*</span>
            </label>

            <div
              className={`send-application-form-card__input-wrapper ${
                errors.email
                  ? "send-application-form-card__input-wrapper--error"
                  : ""
              }`}
            >
              <Mail
                className="send-application-form-card__input-icon"
                size={17}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <input
                id="send-application-form-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                autoComplete="email"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email
                    ? "send-application-form-email-error"
                    : "send-application-form-email-help"
                }
              />
            </div>

            {errors.email ? (
              <p
                id="send-application-form-email-error"
                className="send-application-form-card__error"
              >
                {errors.email}
              </p>
            ) : (
              <p
                id="send-application-form-email-help"
                className="send-application-form-card__help"
              >
                Enter the email address of the candidate
              </p>
            )}
          </div>

          {/* =====================================================
              SUBJECT + MESSAGE
              
              IMPORTANT:
              These fields are displayed ONLY after the
              candidate email has been entered.
              ===================================================== */}

          {isEmailEntered && (
            <>
              {/* =================================================
                  SUBJECT
                  ================================================= */}

              <div className="send-application-form-card__field">
                <label htmlFor="send-application-form-subject">
                  Subject
                  <span aria-hidden="true">*</span>
                </label>

                <div
                  className={`send-application-form-card__input-wrapper ${
                    errors.subject
                      ? "send-application-form-card__input-wrapper--error"
                      : ""
                  }`}
                >
                  <Tag
                    className="send-application-form-card__input-icon"
                    size={17}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                  <input
                    id="send-application-form-subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder={
                      isLoadingTemplate
                        ? "Loading subject..."
                        : "Enter subject"
                    }
                    maxLength={150}
                    disabled={
                      isSubmitting ||
                      isLoadingTemplate
                    }
                    aria-invalid={Boolean(
                      errors.subject,
                    )}
                    aria-describedby={
                      errors.subject
                        ? "send-application-form-subject-error"
                        : "send-application-form-subject-help"
                    }
                  />
                </div>

                {errors.subject ? (
                  <p
                    id="send-application-form-subject-error"
                    className="send-application-form-card__error"
                  >
                    {errors.subject}
                  </p>
                ) : (
                  <p
                    id="send-application-form-subject-help"
                    className="send-application-form-card__help"
                  >
                    Give a clear subject for the email
                  </p>
                )}
              </div>

              {/* =================================================
                  MESSAGE
                  ================================================= */}

              <div className="send-application-form-card__message-field">
                <label htmlFor="send-application-form-message">
                  Message
                  <span aria-hidden="true">*</span>
                </label>

                <div
                  className={`send-application-form-card__textarea-wrapper ${
                    errors.message
                      ? "send-application-form-card__textarea-wrapper--error"
                      : ""
                  }`}
                >
                  <MessageSquare
                    className="send-application-form-card__textarea-icon"
                    size={17}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                  <textarea
                    id="send-application-form-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={
                      isLoadingTemplate
                        ? "Loading message..."
                        : "Enter your message here..."
                    }
                    maxLength={maxMessageLength}
                    disabled={
                      isSubmitting ||
                      isLoadingTemplate
                    }
                    aria-invalid={Boolean(
                      errors.message,
                    )}
                    aria-describedby="send-application-form-message-help"
                  />

                  <span className="send-application-form-card__counter">
                    {messageCharacterCount} /{" "}
                    {maxMessageLength}
                  </span>
                </div>

                {errors.message ? (
                  <p className="send-application-form-card__error">
                    {errors.message}
                  </p>
                ) : (
                  <p
                    id="send-application-form-message-help"
                    className="send-application-form-card__help"
                  >
                    Add a personal message (optional)
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* =====================================================
            INFORMATION BANNER
            ===================================================== */}

        <div className="send-application-form-card__information">
          <div
            className="send-application-form-card__information-illustration"
            aria-hidden="true"
          >
            <div className="send-application-form-card__information-envelope">
              <Mail
                size={35}
                strokeWidth={1.7}
              />
            </div>

            <div className="send-application-form-card__information-send">
              <Send
                size={24}
                strokeWidth={2.2}
              />
            </div>
          </div>

          <div className="send-application-form-card__information-content">
            <h3>
              Join Form will be sent to the candidate
            </h3>

            <p>
              The candidate will receive an email with the join form link
              <br className="send-application-form-card__desktop-break" />
              to complete their onboarding process.
            </p>
          </div>
        </div>

        {/* =====================================================
            ACTIONS
            ===================================================== */}

        <div className="send-application-form-card__actions">
          <button
            type="button"
            className="send-application-form-card__cancel"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <X
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <span>Cancel</span>
          </button>

          <button
            type="submit"
            className="send-application-form-card__submit"
            disabled={
              isSubmitting ||
              isLoadingTemplate ||
              !isEmailEntered
            }
          >
            <Send
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />

            <span>
              {isLoadingTemplate
                ? "Loading..."
                : isSubmitting
                  ? "Sending..."
                  : "Send Join Form"}
            </span>
          </button>
        </div>
      </form>
    </section>
  );
};

export default SendApplicationFormCard;