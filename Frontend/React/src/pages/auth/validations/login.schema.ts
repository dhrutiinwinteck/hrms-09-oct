/**
 * @file login.schema.ts
 * @description Validation schema for login form (synchronous).
 * @version 1.0.0
 */

import { LoginCredentials } from '../types/login.types';

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof LoginCredentials, string>>;
}

/**
 * Validates login credentials synchronously.
 * Returns an object with validity and error messages.
 */
export const validateLogin = (data: LoginCredentials): ValidationResult => {
  const errors: Partial<Record<keyof LoginCredentials, string>> = {};

  if (!data.emp_code || data.emp_code.trim() === '') {
  errors.emp_code = 'Employee Code is required';
}

  if (!data.password || data.password.trim() === '') {
    errors.password = 'Password is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};