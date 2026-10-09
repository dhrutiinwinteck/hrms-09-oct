import {
  COMP_OFF_ALLOWED_FILE_TYPES,
  COMP_OFF_MAX_FILE_SIZE,
  COMP_OFF_REASON_MAX_LENGTH,
} from '../constants/compOff.constants';

import type { CreateCompOffRequest } from '../types/compOff.types';

export interface CompOffValidationErrors {
  workedDate?: string;
  dayType?: string;
  reason?: string;
  attachment?: string;
}

export const validateCompOffRequest = (
  values: CreateCompOffRequest,
): CompOffValidationErrors => {
  const errors: CompOffValidationErrors = {};

  if (!values.workedDate) {
    errors.workedDate =
      'Worked date is required.';
  }

  if (!values.dayType) {
    errors.dayType =
      'Day type is required.';
  }

  const reason = values.reason.trim();

  if (!reason) {
    errors.reason =
      'Reason is required.';
  } else if (
    reason.length >
    COMP_OFF_REASON_MAX_LENGTH
  ) {
    errors.reason =
      `Reason cannot exceed ${COMP_OFF_REASON_MAX_LENGTH} characters.`;
  }

  if (values.attachment) {
    if (
      !COMP_OFF_ALLOWED_FILE_TYPES.includes(
        values.attachment.type,
      )
    ) {
      errors.attachment =
        'Only PDF, JPG and PNG files are allowed.';
    } else if (
      values.attachment.size >
      COMP_OFF_MAX_FILE_SIZE
    ) {
      errors.attachment =
        'File size cannot exceed 5 MB.';
    }
  }

  return errors;
};