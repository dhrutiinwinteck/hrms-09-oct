import type { LetterOfIntentFormData } from "../types/letterOfIntent.types";

export type LetterOfIntentValidationErrors =
  Partial<Record<keyof LetterOfIntentFormData, string>>;

export const validateLetterOfIntent = (
  form: LetterOfIntentFormData,
): LetterOfIntentValidationErrors => {
  const errors: LetterOfIntentValidationErrors = {};

  if (!form.letter_title.trim()) {
    errors.letter_title =
      "Letter title is required.";
  }

  if (!form.company_name.trim()) {
    errors.company_name =
      "Company name is required.";
  }

  if (
    !form.registered_office_address.trim()
  ) {
    errors.registered_office_address =
      "Registered office address is required.";
  }

  if (!form.letter_date) {
    errors.letter_date =
      "Letter date is required.";
  }

  if (!form.position_role.trim()) {
    errors.position_role =
      "Position / Role is required.";
  }

  if (!form.joining_date) {
    errors.joining_date =
      "Joining date is required.";
  }

  if (!form.shift_timing.trim()) {
    errors.shift_timing =
      "Shift timing is required.";
  }

  if (
    !Number.isInteger(
      form.probation_period_months,
    ) ||
    form.probation_period_months < 0
  ) {
    errors.probation_period_months =
      "Probation period must be a valid number.";
  }

//   if (!form.hr_signatory_name.trim()) {
//     errors.hr_signatory_name =
//       "HR signatory name is required.";
//   }

  if (!form.hr_designation.trim()) {
    errors.hr_designation =
      "HR designation is required.";
  }

  if (!form.letter_body.trim()) {
    errors.letter_body =
      "Letter body is required.";
  }

  return errors;
};