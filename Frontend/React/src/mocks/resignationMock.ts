// ============================================================
// RESIGNATION MOCK DATA
// Realistic enterprise data to visualize the Resignation Dashboard.
// ============================================================

import { Resignation, ResignationStatistics } from '../pages/resignation/types/resignation.types';

export const mockResignations: Resignation[] = [
  {
    id: 'res-001',
    employee: {
      id: 'emp-001',
      fullName: 'Sarah Chen',
      designation: 'UI/UX Designer',
      department: 'Design',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
    resignationDate: '2024-05-15',
    lastWorkingDate: '2024-05-31',
    reason: 'Career Growth',
    details: 'Seeking new opportunities in the tech industry.',
    status: 'Pending RM Approval',
    approvals: [
      { approverId: 'mgr-1', approverName: 'Michael Brown', status: 'Pending', timestamp: '2024-05-16T10:00:00Z' },
      { approverId: 'hr-1', approverName: 'HR Team', status: 'Pending', timestamp: '2024-05-16T10:00:00Z' },
    ],
    createdAt: '2024-05-15T09:00:00Z',
    updatedAt: '2024-05-16T10:00:00Z',
  },
  {
    id: 'res-002',
    employee: {
      id: 'emp-002',
      fullName: 'Ankit Patel',
      designation: 'Software Engineer',
      department: 'Engineering',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ankit',
    },
    resignationDate: '2024-05-20',
    lastWorkingDate: '2024-06-05',
    reason: 'Better Opportunity',
    details: 'Moving to a product-based company.',
    status: 'Pending HR Approval',
    approvals: [
      { approverId: 'mgr-2', approverName: 'Jane Smith', status: 'Approved', timestamp: '2024-05-21T11:00:00Z' },
      { approverId: 'hr-2', approverName: 'HR Team', status: 'Pending', timestamp: '2024-05-21T11:00:00Z' },
    ],
    createdAt: '2024-05-20T14:00:00Z',
    updatedAt: '2024-05-21T11:00:00Z',
  },
  {
    id: 'res-003',
    employee: {
      id: 'emp-003',
      fullName: 'Neha Singh',
      designation: 'Marketing Executive',
      department: 'Marketing',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neha',
    },
    resignationDate: '2024-05-25',
    lastWorkingDate: '2024-06-10',
    reason: 'Personal Reasons',
    details: 'Relocating to another city.',
    status: 'Approved',
    approvals: [
      { approverId: 'mgr-3', approverName: 'Alice Johnson', status: 'Approved', timestamp: '2024-05-26T09:30:00Z' },
      { approverId: 'hr-1', approverName: 'HR Team', status: 'Approved', timestamp: '2024-05-27T14:00:00Z' },
      { approverId: 'ceo-1', approverName: 'CEO', status: 'Approved', timestamp: '2024-05-28T10:00:00Z' },
    ],
    createdAt: '2024-05-25T08:00:00Z',
    updatedAt: '2024-05-28T10:00:00Z',
  },
  {
    id: 'res-004',
    employee: {
      id: 'emp-004',
      fullName: 'David Kim',
      designation: 'Product Manager',
      department: 'Product',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    },
    resignationDate: '2024-05-28',
    lastWorkingDate: '2024-06-12',
    reason: 'Higher Studies',
    details: 'Pursuing MBA from a top university.',
    status: 'Rejected',
    approvals: [
      { approverId: 'mgr-4', approverName: 'Tom Wilson', status: 'Rejected', timestamp: '2024-05-29T16:00:00Z' },
    ],
    createdAt: '2024-05-28T10:00:00Z',
    updatedAt: '2024-05-29T16:00:00Z',
  },
  {
    id: 'res-005',
    employee: {
      id: 'emp-005',
      fullName: 'Riya Joshi',
      designation: 'HR Executive',
      department: 'HR',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Riya',
    },
    resignationDate: '2024-05-31',
    lastWorkingDate: '2024-06-15',
    reason: 'Relocation',
    details: 'Moving to different state.',
    status: 'Withdrawn',
    approvals: [
      { approverId: 'mgr-5', approverName: 'HR Manager', status: 'Approved', timestamp: '2024-06-01T09:00:00Z' },
    ],
    createdAt: '2024-05-31T11:00:00Z',
    updatedAt: '2024-06-01T09:00:00Z',
  },
];

export const mockStatistics: ResignationStatistics = {
  totalRequests: 18,
  pending: 7,
  approved: 8,
  rejected: 2,
};