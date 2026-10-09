import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout/DashboardLayout";
import LoginPage from "./pages/auth/LoginPage";
import Dashboard from "./pages/dashboard/Dashboard";
import SettingsPage from "./pages/settings/SettingsPage";
import AttendancePage from "./pages/attendance/AttendancePage";
import ResignationPage from "./pages/resignation/ResignationDashboard";
import RecruitmentApplication from "./pages/recruitment/pages/JobApplication/ApplicationForm";
import RosterDashboard from "./pages/attendance/roster/RosterDashboard";
import DepartmentPage from "./pages/department/DepartmentPage";
import DesignationPage from "./pages/designation/DesignationPage";
import Kra from "./pages/kra/Kra";
import KraManagement from "./pages/kra/KraManagement";
import KraMaster from "./pages/kra/KraMaster";
import PolicyDetail from "./pages/policy/PolicyDetail";
import AdminPolicy from "./pages/policy/AdminPolicy";
import ApplyLeave from "./pages/leave/ApplyLeave";
import LeaveEmployees from "./pages/leave/LeaveEmployees";
import LeaveManagement from "./pages/leave/AddViewLeave";
import LeaveSettings from "./pages/leave/LeaveSettings";
import ApplicationForm from "./pages/recruitment/pages/JobApplication/ApplicationForm";
import JoiningFormPage from "./pages/onboarding/joining-form/JoiningFormPage";
import AllEmployeesPage from "./pages/employees/AllEmployeesPage";
import { HolidayCalendarPage } from "./pages/holidays/HolidayCalendarPage";
import { AdminHolidayCalendarPage } from "./pages/admin/holidays";
import { PayslipAdminPage } from "./pages/payroll/payslip-admin";
import { EditPunchInOutPage } from "./pages/attendance/edit-punch-in-out/EditPunchInOutPage";
import { AttendanceHistoryPage } from "./pages/attendance/attendance-history/AttendanceHistoryPage";
import ShiftPatternsPage from "./pages/shifts/shift-patterns/ShiftPatternsPage";
import ShiftAssignmentPage from "./pages/shifts/shift-assignment/ShiftAssignmentPage";
import { JoiningApprovalsPage } from "./pages/recruitment/joining-approvals/JoiningApprovalsPage";
import ShiftSwap from "./pages/attendance/shift-swap/ShiftSwap";
import Profile from "./pages/profile/Profile";
import SendApplicationFormPage from "./pages/recruitment/send-application-form/SendApplicationFormPage";
import { MonthlyAttendancePage } from "./pages/payroll/monthly-attendance";
import { ExpensesPage } from "./pages/payroll/expenses";
import CategoryPage from "./pages/payroll/category";
import { SubCategoryPage } from "./pages/payroll/sub-category";
import AddViewLeave from "./pages/leave/AddViewLeave";
import { PayrollSettingsPage } from "./pages/payroll/payroll-settings";
import { EmployeePayslipPage } from "./pages/payroll/payslip-employee";
import { OfferLetterSettingsPage } from "./pages/recruitment/offer-letter-settings";
import { LetterOfIntentPage } from "./pages/recruitment/letter-of-intent";
import SendResignationPage from "./pages/resignation/send-resignation/SendResignationPage";
import { CompOffPage } from "./pages/leave/comp-off";
import PermissionManagement from "./pages/settings/components/PermissionManagement/PermissionManagement";

// ============================================================
// 1. PUBLIC ROUTES (no authentication)
// ============================================================
const publicRoutes = [
  {
    path: "/",
    element: <ApplicationForm />,
  },

  {
    path: "/login",
    element: <LoginPage />,
  },

  /*
   * Candidate Job Application
   *
   * This is the URL used by the Application Invitation email.
   */
  {
    path: "/application/:token",
    element: <ApplicationForm />,
  },

  /*
   * Candidate Joining / Onboarding Form
   *
   * Keep this separate from the Job Application.
   */
  {
    path: "/onboarding/joining-form/:token",
    element: <JoiningFormPage />,
  },
];

// ============================================================
// 2. PROTECTED ROUTES (with DashboardLayout)
// ============================================================
const protectedRoutes = [
  // ----- Dashboard & its sub‑pages -----
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard/home" replace /> },
      { path: "home", element: <Dashboard /> },
      { path: "all-employees", element: <AllEmployeesPage /> },
      { path: "department", element: <DepartmentPage /> },
      { path: "designation", element: <DesignationPage /> },
      { path: "resignation", element: <ResignationPage /> },
      { path: "profile", element: <Profile /> },
      {
      path: "send",
      element: <SendResignationPage />,
    },
    ],
  },

  // ----- Attendance -----
  {
    path: "/attendance",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to="/attendance/dashboard" replace /> },
      { path: "dashboard", element: <AttendancePage /> },
      { path: "roster", element: <RosterDashboard /> },
      { path: "edit-punch-in-out", element: <EditPunchInOutPage /> },
      { path: "history", element: <AttendanceHistoryPage /> },
      { path: "patterns", element: <ShiftPatternsPage /> },
      { path: "assign-shift", element: <ShiftAssignmentPage /> },
      { path: "shift-swap", element: <ShiftSwap /> },
    ],
  },

  // ----- Leave -----
  {
    path: "/leave",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to="/leave/apply" replace /> },
      { path: "apply", element: <ApplyLeave /> },
      { path: "employees", element: <LeaveEmployees /> }, // matches sidebar
      { path: "manage", element: <LeaveManagement /> },
      { path: "settings", element: <LeaveSettings /> },
      { path: "add-view", element: <AddViewLeave /> },
      {
        path: "add-comp-off",
        element: <CompOffPage />,
      },
    ],
  },

  // ----- Holidays -----
  {
    path: "/holidays",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to="/holidays/calendar" replace /> },
      {
        path: "/holidays/calendar",
        element: <HolidayCalendarPage />,
      },
      {
        path: "admin-calendar",
        element: <AdminHolidayCalendarPage />,
      },
      {
        path: "restricted",
        element: <div>Restricted Holidays (Coming Soon)</div>,
      },
      { path: "upcoming", element: <div>Upcoming Holidays (Coming Soon)</div> },
    ],
  },

  // ----- Payroll -----
  {
    path: "/payroll",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to="/payroll/salary-slips" replace /> },
      { path: "salary-slips", element: <EmployeePayslipPage /> },
      {
        path: "admin-payslip",
        element: <PayslipAdminPage />,
      },
      {
        path: "monthly-attendance",
        element: <MonthlyAttendancePage />,
      },
      { path: "settings", element: <PayrollSettingsPage /> },
      { path: "expenses", element: <ExpensesPage /> },
      {
        path: "category",
        element: <CategoryPage />,
      },
      { path: "sub-category", element: <SubCategoryPage /> },
      { path: "tax", element: <div>Tax Documents (Coming Soon)</div> },
      {
        path: "reimbursements",
        element: <div>Reimbursements (Coming Soon)</div>,
      },
      {
        path: "investment",
        element: <div>Investment Declaration (Coming Soon)</div>,
      },
    ],
  },

  // ----- Policies -----
  {
    path: "/policies",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to="/policies/details" replace /> },
      { path: "details", element: <PolicyDetail /> },
      { path: "admin", element: <AdminPolicy /> }, // matches sidebar "Policy Details (Admin)"
      // optionally keep 'add' as an alias
      { path: "add", element: <AdminPolicy /> },
    ],
  },

  // ----- KRA -----
  {
    path: "/kra",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to="/kra/my" replace /> },
      { path: "manager", element: <KraManagement /> },
      { path: "my", element: <Kra /> },
      { path: "master", element: <KraMaster /> },
    ],
  },

  // ----- Settings -----
  {
    path: "/settings",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/settings/change-password" replace />,
      },
      { path: "change-password", element: <SettingsPage /> },
      { path: "permissions", element: <SettingsPage /> },
       {
        path: "permissions",
        element: <PermissionManagement />,
      },
    ],
  },

  // ----- Resignation (standalone, but also accessible from dashboard) -----
  // Already included under /dashboard/resignation, but keep a separate entry if needed.
  // If you want a top-level /resignation, uncomment:
  {
    path: "/resignation",
    element: <DashboardLayout />,
    children: [{ index: true, element: <ResignationPage /> }],
  },

  // ----- Recruitment (Job Application) -----
  {
    path: "/recruitment",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to="/recruitment/apply" replace /> },
      { path: "apply", element: <RecruitmentApplication /> },
      { path: "apply", element: <ApplicationForm /> },
      { path: "joining-approval", element: <JoiningApprovalsPage /> },
      { path: "send-application-form", element: <SendApplicationFormPage /> },
      {
        path: "offer-letter-settings",
        element: <OfferLetterSettingsPage />,
      },
      {
  path: "letter-of-intent",
  element: <LetterOfIntentPage />,
},
    ],
  },

  {
    path: "/onboarding/joining-form",
    element: <JoiningFormPage />,
  },
];

// ============================================================
// 3. COMBINE & CREATE ROUTER
// ============================================================
const router = createBrowserRouter([
  ...publicRoutes,
  ...protectedRoutes,
  // Fallback: redirect unknown paths to dashboard home
  { path: "*", element: <Navigate to="/dashboard/home" replace /> },
]);

export default router;
