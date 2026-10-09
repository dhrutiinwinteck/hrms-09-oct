export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateEditPunchInOut = (
  employeeId: string | null,
  month: string | null
): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!employeeId) {
    errors.employee = 'Please select an employee';
  }

  if (!month) {
    errors.month = 'Please select a month';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};