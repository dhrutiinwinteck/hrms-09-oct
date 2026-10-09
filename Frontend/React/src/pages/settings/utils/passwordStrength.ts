import { PasswordStrengthLevel } from '../types/settings.types';
import { PASSWORD_REQUIREMENTS, PASSWORD_STRENGTH_META } from '../constants/settings.constants';

const hasMinimumLength = (password: string): boolean => password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH;
const hasUppercase = (password: string): boolean => /[A-Z]/.test(password);
const hasLowercase = (password: string): boolean => /[a-z]/.test(password);
const hasNumber = (password: string): boolean => /[0-9]/.test(password);
const hasSpecialCharacter = (password: string): boolean => /[!@#$%^&*()_+\-=[\]{}|;:,.<>?/~`]/.test(password);

export const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0;
  let score = 0;
  if (hasMinimumLength(password)) score++;
  if (hasUppercase(password)) score++;
  if (hasLowercase(password)) score++;
  if (hasNumber(password)) score++;
  if (hasSpecialCharacter(password)) score++;
  return score;
};

export const getPasswordStrengthLevel = (password: string): PasswordStrengthLevel => {
  const score = calculatePasswordStrength(password);
  if (score === 0) return PasswordStrengthLevel.NONE;
  if (score <= 2) return PasswordStrengthLevel.WEAK;
  if (score === 3) return PasswordStrengthLevel.MEDIUM;
  if (score === 4) return PasswordStrengthLevel.STRONG;
  return PasswordStrengthLevel.VERY_STRONG;
};

export const getPasswordStrengthMeta = (password: string) => {
  const level = getPasswordStrengthLevel(password);
  return PASSWORD_STRENGTH_META[level];
};

export const isPasswordStrongEnough = (password: string): boolean => {
  return calculatePasswordStrength(password) >= 4;
};

export default { calculatePasswordStrength, getPasswordStrengthLevel, getPasswordStrengthMeta, isPasswordStrongEnough };