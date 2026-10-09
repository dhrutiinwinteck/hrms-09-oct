// src/pages/dashboard/constants/sidebarMenu.ts
/**
 * Sidebar Menu Configuration
 *
 * This file defines the navigation structure for the application's
 * sidebar, including the left rail icons and the right navigation
 * panels. The configuration is used by the Sidebar component to
 * render the main navigation.
 *
 * Following enterprise best practices, all menu data is centralized
 * here for easy maintenance and updates.
 *
 * @module constants/sidebarMenu
 */

import {
  LayoutDashboard,
  Clock3,
  CalendarDays,
  WalletCards,
  FileText,
  Target,
  Settings,
  LogOut,
  UserPlus,
} from 'lucide-react';

// ============================================================
// 1. TYPE DEFINITIONS
// ============================================================

/**
 * Represents a single navigation item in the sidebar.
 */
export interface NavigationItem {
  /** Display label for the navigation item */
  label: string;
  /** Route path to navigate to when clicked */
  path: string;
}

/**
 * Represents a section of navigation items in the sidebar.
 */
export interface NavigationSection {
  /** Display title for the section */
  title: string;
  /** Array of navigation items in this section */
  items: NavigationItem[];
}

/**
 * Configuration for a left rail icon.
 */
export interface RailIconConfig {
  /** Unique identifier for the icon */
  id: string;
  /** Display label for the icon (tooltip) */
  label: string;
  /** Lucide icon component */
  icon: React.ElementType;
}

// ============================================================
// 2. LEFT RAIL ICON CONFIGURATION
// ============================================================

/**
 * Array of icons displayed on the left rail of the sidebar.
 * Each icon represents a top-level navigation category.
 */
export const railIcons: RailIconConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'recruitment', label: 'Recruitment', icon: UserPlus },
  { id: 'attendance', label: 'Attendance', icon: Clock3 },
  { id: 'leave', label: 'Leave', icon: CalendarDays },
  // holidays removed from rail – now merged into leave
  { id: 'payroll', label: 'Payroll', icon: WalletCards },
  { id: 'policies', label: 'Policies', icon: FileText },
  { id: 'kra', label: 'KRA', icon: Target },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// ============================================================
// 3. RIGHT NAVIGATION MENU CONFIGURATION
// ============================================================

/**
 * Navigation menus for each left rail icon.
 * The key matches the 'id' in railIcons.
 * Each menu contains sections with navigation items.
 */
export const navigationMenus: Record<string, NavigationSection[]> = {
  // ============================================================
  // DASHBOARD
  // ============================================================
  dashboard: [
    {
      title: 'DASHBOARD',
      items: [
        { label: 'My Dashboard', path: '/dashboard' },
        { label: 'All Employees', path: '/dashboard/all-employees' },
        { label: 'Department', path: '/dashboard/department' },
        { label: 'Designation', path: '/dashboard/designation' },
      ],
    },
    {
      title: 'RESIGNATION ',
      items: [
        { label: 'Apply for Resignation', path: '/dashboard/resignation' },
         {
      label: 'Send Resignation',
      path: '/dashboard/send',
    },
      ],
    },
  ],

  // ============================================================
  // RECRUITMENT
  // ============================================================
  recruitment: [
    {
      title: 'SEND APPLICATION FORM',
      items: [{ label: 'Send Application Form', path: '/recruitment/send-application-form' }],
    },
    {
      title: 'INTERVIEW PROCESS',
      items: [{ label: 'Joining Schedule', path: '/recruitment/joining-approval' }],
    },
    {
    title: 'OFFER LETTER',
    items: [
      {
        label: 'Offer Letter Settings',
        path: '/recruitment/offer-letter-settings',
      },
    ],
  },

  {
  title: 'LETTER OF INTENT',
  items: [
    {
      label: 'Letter of Intent Settings',
      path: '/recruitment/letter-of-intent',
    },
  ],
},
  ],

  // ============================================================
  // ATTENDANCE
  // ============================================================
  attendance: [
    {
      title: 'ATTENDANCE',
      items: [
        { label: 'Attendance History (All Employees)', path: '/attendance/history' },
        { label: 'Edit Punch In/Out', path: '/attendance/edit-punch-in-out' },
        { label: 'Attendance History', path: '/attendance/dashboard' },
      ],
    },
    {
      title: 'SHIFT',
      items: [
        { label: 'Shift Patterns', path: '/attendance/patterns' },
        { label: 'Assign Shift', path: '/attendance/assign-shift' },
        { label: 'Shift Swap', path: '/attendance/shift-swap' },
        { label: 'Roster', path: '/attendance/roster' },
      ],
    },
  ],

  // ============================================================
  // LEAVE (merged with HOLIDAYS)
  // ============================================================
  leave: [
    {
      title: 'LEAVE',
      items: [
        { label: 'Apply for Leave', path: '/leave/apply' },
        { label: 'Employee Leave', path: '/leave/employees' },
        { label: 'Leave Settings', path: '/leave/settings' },
        { label: 'Add/view Leave', path: '/leave/add-view'},
        { label: 'Add Comp-off', path: '/leave/add-comp-off'},
      ],
    },
    {
      title: 'HOLIDAY',
      items: [
        { label: 'Holiday Calendar (Admin)', path: '/holidays/admin-calendar' },
        { label: 'Holiday Calendar (User)', path: '/holidays/calendar' },
      ],
    },
  ],

  // ============================================================
  // PAYROLL
  // ============================================================
  payroll: [
    {
      title: 'PAYROLL',
      items: [
        { label: 'Payslip (Admin)', path: '/payroll/admin-payslip' },
        { label: 'Monthly Attendance', path: '/payroll/monthly-attendance' },
        { label: 'Payroll Settings', path: '/payroll/settings' },
        { label: 'Expenses', path: '/payroll/expenses' },
        { label: 'Category', path: '/payroll/category' },
        { label: 'Sub Category', path: '/payroll/sub-category' },
      ],
    },
  ],

  // ============================================================
  // POLICIES
  // ============================================================
  policies: [
    {
      title: 'POLICIES',
      items: [
        { label: 'Policy Details', path: '/policies/details' },
        { label: 'Policy Details (Admin)', path: '/policies/admin' },
      ],
    },
  ],

  // ============================================================
  // KRA (Key Result Areas)
  // ============================================================
  kra: [
    {
      title: 'KRA',
      items: [
        { label: 'KRA (Manager)', path: '/kra/manager' },
        { label: 'KRA', path: '/kra/my' },
        { label: 'KRA Master', path: '/kra/master' },
      ],
    },
  ],

  // ============================================================
  // SETTINGS
  // ============================================================
  settings: [
    {
      title: 'SETTINGS',
      items: [
        { label: 'Change Password', path: '/settings/change-password' },
        { label: 'Permissions', path: '/settings/permissions' },
      ],
    },
  ],
};

// ============================================================
// 4. LOGOUT CONFIGURATION
// ============================================================

/**
 * Logout button configuration.
 * Separate from the main navigation for structural clarity.
 */
export const logoutConfig = {
  id: 'logout',
  label: 'Logout',
  icon: LogOut,
};

// ============================================================
// 5. DEFAULT EXPORT
// ============================================================

export default {
  railIcons,
  navigationMenus,
  logoutConfig,
};