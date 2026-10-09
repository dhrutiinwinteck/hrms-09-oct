import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  SendApplicationFormData,
  SendApplicationFormErrors,
  SendApplicationInvitationResponse,
} from "../types/sendApplicationForm.types";

import {
  getApplicationInvitationEmailTemplate,
  sendApplicationForm,
} from "../services/sendApplicationForm.service";

import {
  isSendApplicationFormValid,
  validateSendApplicationForm,
} from "../validations/sendApplicationForm.schema";

import {
  SEND_APPLICATION_FORM_CONSTANTS,
} from "../constants/sendApplicationForm.constants";

interface UseSendApplicationFormReturn {
  formData: SendApplicationFormData;

  errors: SendApplicationFormErrors;

  isLoadingTemplate: boolean;

  isSubmitting: boolean;

  isSuccess: boolean;

  submitError: string | null;

  response: SendApplicationInvitationResponse | null;

  /**
   * True when the candidate has entered a valid email.
   *
   * Used by the UI to decide whether Subject and Message
   * should be displayed.
   */
  isEmailEntered: boolean;

  updateField: (
    field: keyof SendApplicationFormData,
    value: string,
  ) => void;

  validate: () => boolean;

  submit: (
    data?: SendApplicationFormData,
  ) => Promise<boolean>;

  reset: () => void;

  clearSubmitState: () => void;
}

const EMPTY_FORM_DATA: SendApplicationFormData = {
  email: "",
  subject: "",
  message: "",
};

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useSendApplicationForm =
  (): UseSendApplicationFormReturn => {
    const [formData, setFormData] =
      useState<SendApplicationFormData>(
        EMPTY_FORM_DATA,
      );

    const [errors, setErrors] =
      useState<SendApplicationFormErrors>({});

    /**
     * IMPORTANT:
     *
     * Initially this must be false.
     *
     * We do not want the email field disabled while
     * waiting for the email template.
     */
    const [isLoadingTemplate, setIsLoadingTemplate] =
      useState<boolean>(false);

    const [isSubmitting, setIsSubmitting] =
      useState<boolean>(false);

    const [isSuccess, setIsSuccess] =
      useState<boolean>(false);

    const [submitError, setSubmitError] =
      useState<string | null>(null);

    const [response, setResponse] =
      useState<SendApplicationInvitationResponse | null>(
        null,
      );

    /**
     * Prevents the template API from being called
     * repeatedly while the user is typing.
     */
    const templateLoadedRef =
      useRef<boolean>(false);

    /**
     * ==========================================================
     * EMAIL STATE
     * ==========================================================
     */
    const isEmailEntered =
      EMAIL_PATTERN.test(
        formData.email.trim(),
      );

    /**
     * ==========================================================
     * LOAD BACKEND EMAIL TEMPLATE
     * ==========================================================
     *
     * The template is NOT loaded when the page opens.
     *
     * It is loaded only after a valid email address
     * has been entered.
     */
    useEffect(() => {
      let cancelled = false;

      /**
       * Email is empty or invalid.
       *
       * Hide Subject and Message by clearing their values.
       */
      if (!isEmailEntered) {
        templateLoadedRef.current = false;

        setIsLoadingTemplate(false);

        setFormData((previous) => {
          if (
            !previous.subject &&
            !previous.message
          ) {
            return previous;
          }

          return {
            ...previous,
            subject: "",
            message: "",
          };
        });

        return () => {
          cancelled = true;
        };
      }

      /**
       * Template has already been loaded for this
       * current form interaction.
       */
      if (templateLoadedRef.current) {
        return () => {
          cancelled = true;
        };
      }

      /**
       * Mark immediately so React re-renders cannot
       * trigger duplicate template requests.
       */
      templateLoadedRef.current = true;

      const loadTemplate =
        async (): Promise<void> => {
          setIsLoadingTemplate(true);
          setSubmitError(null);

          try {
            const template =
              await getApplicationInvitationEmailTemplate();

            if (cancelled) {
              return;
            }

            setFormData((previous) => ({
              ...previous,
              subject: template.subject,
              message: template.message,
            }));
          } catch (error: unknown) {
            if (cancelled) {
              return;
            }

            /**
             * Allow another valid-email interaction
             * to try loading the template again.
             */
            templateLoadedRef.current = false;

            const errorMessage =
              error instanceof Error
                ? error.message
                : SEND_APPLICATION_FORM_CONSTANTS
                    .MESSAGES.TEMPLATE_ERROR;

            setSubmitError(errorMessage);

            setFormData((previous) => ({
              ...previous,
              subject: "",
              message: "",
            }));
          } finally {
            if (!cancelled) {
              setIsLoadingTemplate(false);
            }
          }
        };

      void loadTemplate();

      return () => {
        cancelled = true;
      };
    }, [isEmailEntered]);

    /**
     * ==========================================================
     * UPDATE FIELD
     * ==========================================================
     */
    const updateField = useCallback(
      (
        field: keyof SendApplicationFormData,
        value: string,
      ): void => {
        /**
         * Prevent message from exceeding backend/UI
         * configured maximum.
         */
        if (
          field === "message" &&
          value.length >
            SEND_APPLICATION_FORM_CONSTANTS
              .MAX_MESSAGE_LENGTH
        ) {
          return;
        }

        setFormData((previous) => ({
          ...previous,
          [field]: value,
        }));

        setErrors((previous) => {
          if (!previous[field]) {
            return previous;
          }

          const updated = {
            ...previous,
          };

          delete updated[field];

          return updated;
        });

        setSubmitError(null);
        setIsSuccess(false);
        setResponse(null);
      },
      [],
    );

    /**
     * ==========================================================
     * VALIDATE
     * ==========================================================
     */
    const validate = useCallback((): boolean => {
      const validationErrors =
        validateSendApplicationForm(
          formData,
        );

      setErrors(validationErrors);

      return isSendApplicationFormValid(
        validationErrors,
      );
    }, [formData]);

    /**
     * ==========================================================
     * SUBMIT
     * ==========================================================
     */
    const submit = useCallback(
      async (
        data?: SendApplicationFormData,
      ): Promise<boolean> => {
        if (isSubmitting) {
          return false;
        }

        const source =
          data ?? formData;

        const normalizedData: SendApplicationFormData = {
          email: source.email.trim(),
          subject: source.subject.trim(),
          message: source.message.trim(),
        };

        /**
         * Candidate email remains the required field.
         *
         * Subject/message can remain optional because
         * the backend owns the default template.
         */
        const validationErrors =
          validateSendApplicationForm(
            normalizedData,
          );

        setErrors(validationErrors);

        if (
          !isSendApplicationFormValid(
            validationErrors,
          )
        ) {
          return false;
        }

        setIsSubmitting(true);
        setIsSuccess(false);
        setSubmitError(null);
        setResponse(null);

        try {
          const apiResponse =
            await sendApplicationForm(
              normalizedData,
            );

          if (!apiResponse.success) {
            throw new Error(
              apiResponse.message ||
                SEND_APPLICATION_FORM_CONSTANTS
                  .MESSAGES.GENERIC_ERROR,
            );
          }

          /**
           * Keep the successful response so the existing
           * success message can be displayed.
           */
          setResponse(apiResponse);
          setIsSuccess(true);

          /**
           * ====================================================
           * CLEAR FORM AFTER SUCCESS
           * ====================================================
           *
           * This replaces window.location.reload().
           *
           * The React page remains mounted, but the form is
           * completely reset.
           *
           * Because email becomes empty:
           *
           * isEmailEntered = false
           *
           * therefore Subject and Message disappear.
           */
          setFormData(EMPTY_FORM_DATA);
          setErrors({});

          /**
           * Reset template state so the next candidate
           * email will load the backend template again.
           */
          templateLoadedRef.current = false;

          return true;
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : SEND_APPLICATION_FORM_CONSTANTS
                  .MESSAGES.GENERIC_ERROR;

          setSubmitError(errorMessage);

          return false;
        } finally {
          setIsSubmitting(false);
        }
      },
      [
        formData,
        isSubmitting,
      ],
    );

    /**
     * ==========================================================
     * RESET
     * ==========================================================
     */
    const reset = useCallback((): void => {
      setFormData(EMPTY_FORM_DATA);
      setErrors({});
      setIsLoadingTemplate(false);
      setIsSubmitting(false);
      setIsSuccess(false);
      setSubmitError(null);
      setResponse(null);

      templateLoadedRef.current = false;
    }, []);

    /**
     * ==========================================================
     * CLEAR SUBMIT STATE
     * ==========================================================
     */
    const clearSubmitState =
      useCallback((): void => {
        setIsSuccess(false);
        setSubmitError(null);
        setResponse(null);
      }, []);

    return {
      formData,
      errors,
      isLoadingTemplate,
      isSubmitting,
      isSuccess,
      submitError,
      response,
      isEmailEntered,
      updateField,
      validate,
      submit,
      reset,
      clearSubmitState,
    };
  };