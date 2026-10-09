export const PAYSLIP_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export const DEFAULT_PAYSLIP_PAGE_SIZE = 10;

export const PAYSLIP_STATUS = {
  GENERATED: 'Generated',
  PENDING: 'Pending',
  NOT_GENERATED: 'Not Generated',
} as const;

export const PAYSLIP_EMPTY_STATE_TITLE = 'No data available';

export const PAYSLIP_EMPTY_STATE_DESCRIPTION =
  'Add salary to generate payslips for employees.';

export const PAYSLIP_FEATURES = [
  {
    title: 'Accurate Records',
    description: 'Secure & reliable',
    icon: 'users',
  },
  {
    title: 'Time Saving',
    description: 'Generate in seconds',
    icon: 'clock',
  },
  {
    title: 'Employee Friendly',
    description: 'Easy access to payslips',
    icon: 'shield',
  },
] as const;