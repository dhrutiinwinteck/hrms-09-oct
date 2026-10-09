import { PasswordStrengthLevel, PasswordStrengthMeta, PermissionColumn, PermissionAction } from '../types/settings.types';

// ---- Existing password constants ----
export const PASSWORD_STRENGTH_META: Record<PasswordStrengthLevel, PasswordStrengthMeta> = {
  [PasswordStrengthLevel.NONE]: {
    label: '',
    colorClass: 'strength-none',
    colorHex: '#D1D5DB',
    minScore: 0,
  },
  [PasswordStrengthLevel.WEAK]: {
    label: 'Weak',
    colorClass: 'strength-weak',
    colorHex: '#EF4444',
    minScore: 1,
  },
  [PasswordStrengthLevel.MEDIUM]: {
    label: 'Medium',
    colorClass: 'strength-medium',
    colorHex: '#F59E0B',
    minScore: 2,
  },
  [PasswordStrengthLevel.STRONG]: {
    label: 'Strong',
    colorClass: 'strength-strong',
    colorHex: '#84CC16',
    minScore: 3,
  },
  [PasswordStrengthLevel.VERY_STRONG]: {
    label: 'Very Strong',
    colorClass: 'strength-very-strong',
    colorHex: '#0F766E',
    minScore: 4,
  },
};

export const STRENGTH_LEVELS_ORDERED = [
  PasswordStrengthLevel.NONE,
  PasswordStrengthLevel.WEAK,
  PasswordStrengthLevel.MEDIUM,
  PasswordStrengthLevel.STRONG,
  PasswordStrengthLevel.VERY_STRONG,
];

export const PASSWORD_STRENGTH_DOT_COUNT = 4;

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRES_UPPERCASE: true,
  REQUIRES_LOWERCASE: true,
  REQUIRES_NUMBER: true,
  REQUIRES_SPECIAL: true,
} as const;

export const VALIDATION_MESSAGES = {
  EMAIL: {
    REQUIRED: 'Email address is required',
    INVALID: 'Please enter a valid email address',
  },
  PASSWORD: {
    REQUIRED: 'Password is required',
    MIN_LENGTH: `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`,
    UPPERCASE: 'Password must contain at least one uppercase letter',
    LOWERCASE: 'Password must contain at least one lowercase letter',
    NUMBER: 'Password must contain at least one number',
    SPECIAL: 'Password must contain at least one special character',
  },
  CONFIRM_PASSWORD: {
    REQUIRED: 'Please confirm your password',
    MISMATCH: 'Passwords do not match',
  },
} as const;

export const SETTINGS_NAVIGATION = [
  {
    title: 'General',
    items: [
      { id: 'change-password', label: 'Change Password', path: '/settings/change-password' },
    ],
  },
  {
    title: 'Security',
    items: [
      { id: 'permissions', label: 'Permissions', path: '/settings/permissions' },
    ],
  },
] as const;

export type SettingsNavItemId = (typeof SETTINGS_NAVIGATION)[number]['items'][number]['id'];

export const UI_TEXT = {
  LEFT_PANEL: {
    HEADING_PREFIX: 'Change',
    HEADING_HIGHLIGHT: 'Password',
    DESCRIPTION:
      'Update your password to keep your account secure and protect your data.',
  },
  RIGHT_PANEL: {
    EMAIL: {
      LABEL: 'Email ID',
      PLACEHOLDER: 'Enter your email ID',
    },
    PASSWORD: {
      LABEL: 'Change Password',
      PLACEHOLDER: 'Enter new password',
    },
    CONFIRM_PASSWORD: {
      LABEL: 'Confirm Password',
      PLACEHOLDER: 'Confirm new password',
    },
    DESCRIPTION: 'Update your password to keep your account secure and protect your data.',
    TIP: 'Use a strong password with a mix of letters, numbers and special characters.',
    FOOTER_LINE1: 'Your account security is our priority.',
    FOOTER_LINE2: 'Need help? Contact HR Support',
  },
  BUTTON: {
    SUBMIT: 'Update Password',
    SUBMITTING: 'Updating...',
  },
  PERMISSION: {
    TITLE: 'Permission Management',
    COMING_SOON: 'Coming Soon',
    DESCRIPTION: 'This feature is currently under development.',
  },
  MESSAGES: {
    SUCCESS: 'Your password has been updated successfully!',
    ERROR: 'Failed to update password. Please try again.',
  },
} as const;

export const COLORS = {
  PRIMARY: '#0F766E',
  PRIMARY_HOVER: '#0D6B64',
  PRIMARY_GRADIENT_START: '#2C6A63',
  PRIMARY_GRADIENT_END: '#19534F',
  BORDER: '#E5E7EB',
  BORDER_HOVER: '#D0D5DD',
  TIP_BG: '#ECFDF5',
  TEXT_SECONDARY: '#6B7280',
  TEXT_PRIMARY: '#111827',
  WHITE: '#FFFFFF',
  SHADOW: 'rgba(0, 0, 0, 0.08)',
} as const;

// ---- New Permission Constants ----
export const PERMISSION_COLUMNS: PermissionColumn[] = [
  { id: 'view', label: 'View', description: 'Can view items' },
  { id: 'add', label: 'Add', description: 'Can add new items' },
  { id: 'edit', label: 'Edit', description: 'Can edit existing items' },
  { id: 'delete', label: 'Delete', description: 'Can delete items' },
  { id: 'export', label: 'Export', description: 'Can export data' },
  { id: 'import', label: 'Import', description: 'Can import data' },
  { id: 'settings', label: 'Settings', description: 'Can manage settings' },
];

export const PERMISSION_ACTIONS: PermissionAction[] = PERMISSION_COLUMNS.map((col) => ({
  id: col.id,
  label: col.label,
}));

export const DEFAULT_MODULES: string[] = [
  'Dashboard',
  'Employee Management',
  'Attendance',
  'Leave',
  'Payroll',
  'Performance',
  'Recruitment',
  'Training',
  'Reports',
  'Settings',
  'Policies',
  'Projects',
  'Assets',
  'Documents',
  'Notifications',
  'Profile',
  'Analytics',     
  'Compliance',  
];

// 12 roles
export const DEFAULT_ROLES = [
  { id: 'role-admin', name: 'Admin', description: 'Full system access' },
  { id: 'role-hr-manager', name: 'HR Manager', description: 'Manages HR operations' },
  { id: 'role-hr-executive', name: 'HR Executive', description: 'Assists HR Manager' },
  { id: 'role-finance', name: 'Finance', description: 'Manages financial modules' },
  { id: 'role-recruiter', name: 'Recruiter', description: 'Handles recruitment' },
  { id: 'role-employee', name: 'Employee', description: 'Standard employee access' },
  { id: 'role-ceo', name: 'CEO', description: 'Executive access' },
  { id: 'role-it-support', name: 'IT Support', description: 'Technical support' },
  { id: 'role-operations', name: 'Operations', description: 'Operations management' },
  { id: 'role-manager', name: 'Manager', description: 'Team manager' },
  { id: 'role-supervisor', name: 'Supervisor', description: 'Supervises teams' },
  { id: 'role-intern', name: 'Intern', description: 'Temporary access' },
];

export const QUICK_ACTIONS = {
  SELECT_ALL: 'Select All',
  CLEAR_ALL: 'Clear All',
  RESET_MODULE: 'Reset Module',
};

// ============================================================
// CHANGE PASSWORD API ENDPOINTS
// ============================================================

export const SETTINGS_API_ENDPOINTS = {
  CHANGE_PASSWORD: '/api/v1/auth/change-password',

  CHANGE_PASSWORD_BY_EMPLOYEE_CODE:
    '/api/v1/auth/change-password1',
} as const;