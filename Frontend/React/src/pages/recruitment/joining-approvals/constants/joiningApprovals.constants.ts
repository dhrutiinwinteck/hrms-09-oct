import {
  JoiningApprovalStatus,
} from '../types/joiningApprovals.types';


export const STATUSES:
  JoiningApprovalStatus[] = [
    'Pending',
    'Approved',
    'Rejected',
    'On Hold',
];


export const DEPARTMENTS: string[] = [
  'IT',
  'HR',
  'Finance',
  'Operations',
  'Marketing',
  'Sales',
];


export const DESIGNATIONS: string[] = [
  'Software Engineer',
  'HR Executive',
  'Accountant',
  'Operations Analyst',
  'DevOps Engineer',
  'Marketing Manager',
];


export const LOCATIONS: string[] = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Thane',
];


export const DEFAULT_PAGE_SIZE = 10;


export const STATUS_COLORS:
  Record<
    JoiningApprovalStatus,
    string
  > = {
    Pending: '#1890ff',
    Approved: '#52c41a',
    Rejected: '#ff4d4f',
    'On Hold': '#faad14',
  };