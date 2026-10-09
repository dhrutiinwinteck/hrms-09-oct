import {
  SEND_RESIGNATION_CONSTANTS,
} from "../constants/sendResignation.constants";

import type {
  ResignationEmailErrors,
  ResignationEmailFormData,
} from "../types/sendResignation.types";

import {
  isAttachmentSizeValid,
  isAllowedAttachment,
  isValidEmail,
} from "../utils/sendResignation.utils";

export const validateSendResignationForm = (
  data: ResignationEmailFormData,
): ResignationEmailErrors => {
  const errors: ResignationEmailErrors = {};

  if (!data.employeeEmail.trim()) {
    errors.employeeEmail =
      SEND_RESIGNATION_CONSTANTS.MESSAGES
        .EMPLOYEE_REQUIRED;
  } else if (
    !isValidEmail(data.employeeEmail)
  ) {
    errors.employeeEmail =
      SEND_RESIGNATION_CONSTANTS.MESSAGES
        .INVALID_EMAIL;
  }

  if (!data.subject.trim()) {
    errors.subject =
      SEND_RESIGNATION_CONSTANTS.MESSAGES
        .SUBJECT_REQUIRED;
  }

  if (!data.body.trim()) {
    errors.body =
      SEND_RESIGNATION_CONSTANTS.MESSAGES
        .BODY_REQUIRED;
  }

  for (const file of data.attachments) {
    if (!isAllowedAttachment(file)) {
      errors.attachments =
        `${file.name}: ${SEND_RESIGNATION_CONSTANTS.MESSAGES.INVALID_FILE}`;

      break;
    }

    if (!isAttachmentSizeValid(file)) {
      errors.attachments =
        `${file.name}: ${SEND_RESIGNATION_CONSTANTS.MESSAGES.FILE_TOO_LARGE}`;

      break;
    }
  }

  return errors;
};

export const isSendResignationFormValid = (
  errors: ResignationEmailErrors,
): boolean => {
  return Object.keys(errors).length === 0;
};