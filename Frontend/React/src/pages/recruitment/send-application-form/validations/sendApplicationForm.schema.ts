import type {
  SendApplicationFormData,
  SendApplicationFormErrors,
} from "../types/sendApplicationForm.types";

import {
  SEND_APPLICATION_FORM_CONSTANTS,
} from "../constants/sendApplicationForm.constants";

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateSendApplicationForm = (
  data: SendApplicationFormData,
): SendApplicationFormErrors => {
  const errors: SendApplicationFormErrors = {};

  const email = data.email.trim();

  const subject = data.subject.trim();

  const message = data.message.trim();

  /*
   * Candidate email is the only required field.
   *
   * Subject and message are intentionally NOT required.
   * The backend owns the default email template.
   */
  if (!email) {
    errors.email =
      "Candidate email address is required.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email =
      "Please enter a valid email address.";
  }

  /*
   * Subject is optional because the backend
   * has a default subject.
   *
   * If the user edits it, validate its length.
   */
  if (
    subject &&
    subject.length > 150
  ) {
    errors.subject =
      "Subject cannot exceed 150 characters.";
  }

  /*
   * Message is optional because the backend
   * has a default message.
   *
   * If the user edits it, validate its length.
   */
  if (
    message &&
    message.length >
      SEND_APPLICATION_FORM_CONSTANTS.MAX_MESSAGE_LENGTH
  ) {
    errors.message =
      `Message cannot exceed ${SEND_APPLICATION_FORM_CONSTANTS.MAX_MESSAGE_LENGTH} characters.`;
  }

  return errors;
};

export const isSendApplicationFormValid = (
  errors: SendApplicationFormErrors,
): boolean => {
  return Object.keys(errors).length === 0;
};