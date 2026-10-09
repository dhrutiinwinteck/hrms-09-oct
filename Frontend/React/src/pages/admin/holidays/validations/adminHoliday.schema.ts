import {
  AdminHolidayFormData,
} from '../types/adminHoliday.types';


/* ============================================================
   HOLIDAY FORM VALIDATION
============================================================ */

export const validateHolidayForm = (
  data: AdminHolidayFormData,
): {
  isValid: boolean;

  errors: Partial<
    Record<
      keyof AdminHolidayFormData,
      string
    >
  >;
} => {

  const errors: Partial<
    Record<
      keyof AdminHolidayFormData,
      string
    >
  > = {};


  /* ==========================================================
     HOLIDAY NAME
  ========================================================== */

  const title =
    data.title?.trim() ?? '';

  if (!title) {

    errors.title =
      'Holiday name is required';

  } else if (
    title.length < 2
  ) {

    errors.title =
      'Holiday name must be at least 2 characters';

  } else if (
    title.length > 255
  ) {

    errors.title =
      'Holiday name cannot exceed 255 characters';
  }


  /* ==========================================================
     HOLIDAY DATE
  ========================================================== */

  if (!data.holidayDate) {

    errors.holidayDate =
      'Holiday date is required';

  } else if (
    Number.isNaN(
      data.holidayDate.getTime(),
    )
  ) {

    errors.holidayDate =
      'Please select a valid holiday date';
  }


  /* ==========================================================
     RESULT
  ========================================================== */

  return {
    isValid:
      Object.keys(errors).length === 0,

    errors,
  };
};