import {
  navigationMenus,
  NavigationSection,
} from "../../constants/sidebarMenu";

import SidebarHeader from "./SidebarHeader";
import NavigationItem from "./NavigationItem";


import "./NavigationPanel.css";
import { useEmployeePermissions } from "@/pages/auth/Permission/PermissionProvider";

// ============================================================
// PROPS
// ============================================================

export interface NavigationPanelProps {
  activeIconId: string;
  togglePanel: () => void;
}

// ============================================================
// PATH → PERMISSION
// ============================================================

const getPermissionId = (
  path: string,
): string | null => {
  const permissionMap: Record<
    string,
    string
  > = {
    // --------------------------------------------------------
    // DASHBOARD
    // --------------------------------------------------------

    "/dashboard":
      "dashboard_my",

    "/dashboard/home":
      "dashboard_my",

    "/dashboard/all-employees":
      "dashboard_all_employees",

    "/dashboard/department":
      "dashboard_department",

    "/dashboard/designation":
      "dashboard_designation",

    "/dashboard/resignation":
      "dashboard_apply_resignation",

    "/dashboard/termination":
      "dashboard_termination_status",

    // --------------------------------------------------------
    // RECRUITMENT
    // --------------------------------------------------------

    "/recruitment/send-application-form":
      "send_application_form",

    "/recruitment/joining-approval":
      "interview_joining_schedule",

    // --------------------------------------------------------
    // ATTENDANCE
    // --------------------------------------------------------

    "/attendance/history":
      "attendance_history_all",

    "/attendance/edit-punch-in-out":
      "attendance_edit_punch",

    "/attendance/dashboard":
      "attendance_history",

    // --------------------------------------------------------
    // SHIFT
    // --------------------------------------------------------

    "/attendance/patterns":
      "shift_patterns",

    "/attendance/assign-shift":
      "shift_assign",

    "/attendance/shift-swap":
      "shift_swap",

    "/attendance/roster":
      "shift_roaster",

    // --------------------------------------------------------
    // LEAVE
    // --------------------------------------------------------

    "/leave/apply":
      "leave_apply",

    "/leave/employees":
      "leave_employee_leave",

    "/leave/settings":
      "leave_settings",

    // --------------------------------------------------------
    // HOLIDAY
    // --------------------------------------------------------

    "/holidays/admin-calendar":
      "holiday_calendar_admin",

    "/holidays/calendar":
      "holiday_calendar",

    // --------------------------------------------------------
    // PAYROLL
    // --------------------------------------------------------

    "/payroll/admin-payslip":
      "payroll_payslip_admin",

    "/payroll/monthly-attendance":
      "payroll_monthly_attendance",

    "/payroll/settings":
      "payroll_settings",

    "/payroll/expenses":
      "payroll_expenses",

    "/payroll/category":
      "payroll_category",

    "/payroll/sub-category":
      "payroll_sub_category",

    // --------------------------------------------------------
    // POLICIES
    // --------------------------------------------------------

    "/policies/details":
      "policies_detail",

    "/policies/admin":
      "policies_detail_admin",

    // --------------------------------------------------------
    // KRA
    // --------------------------------------------------------

    "/kra/manager":
      "kra_manager",

    "/kra/my":
      "kra_kra",

    "/kra/master":
      "kra_master",

    // --------------------------------------------------------
    // SETTINGS
    // --------------------------------------------------------

    "/settings/change-password":
      "settings_change_password",

    "/settings/permissions":
      "settings_permission",
  };

  return (
    permissionMap[path] ??
    null
  );
};

// ============================================================
// COMPONENT
// ============================================================

const NavigationPanel = ({
  activeIconId,
  togglePanel,
}: NavigationPanelProps): JSX.Element => {
  const {
    canView,
    loading,
  } =
    useEmployeePermissions();

  // ----------------------------------------------------------
  // Existing sidebar configuration
  // ----------------------------------------------------------

  const menuSections =
    navigationMenus[
      activeIconId
    ] || [];

  // ----------------------------------------------------------
  // Filter sections
  // ----------------------------------------------------------

  const visibleSections =
    menuSections
      .map(
        (
          section,
        ): NavigationSection => ({
          ...section,

          items:
            section.items.filter(
              (item) => {
                const permissionId =
                  getPermissionId(
                    item.path,
                  );

                /*
                 * IMPORTANT:
                 *
                 * If a navigation item does not
                 * have a permission ID, it is not
                 * automatically displayed.
                 *
                 * This prevents accidentally exposing
                 * an unconfigured page.
                 */
                if (
                  !permissionId
                ) {
                  return false;
                }

                return canView(
                  permissionId,
                );
              },
            ),
        }),
      )
      .filter(
        (section) =>
          section.items.length >
          0,
      );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <aside className="navigation-panel">

      <SidebarHeader
        togglePanel={
          togglePanel
        }
      />

      <nav
        className="navigation-panel-nav"
        aria-label="Sidebar Navigation Menu"
      >

        {loading ? (
          <div className="navigation-empty-state">
            <p className="navigation-empty-text">
              Loading permissions...
            </p>
          </div>
        ) : visibleSections.length >
          0 ? (

          <ul className="navigation-menu-list">

            {visibleSections.map(
              (
                section,
                index,
              ) => (

                <li
                  key={`${section.title}-${index}`}
                  className="navigation-section"
                >

                  <h3 className="navigation-section-title">
                    {section.title}
                  </h3>

                  <ul className="navigation-section-list">

                    {section.items.map(
                      (
                        item,
                        itemIndex,
                      ) => (

                        <NavigationItem
                          key={`${item.label}-${itemIndex}`}
                          label={
                            item.label
                          }
                          path={
                            item.path
                          }
                        />

                      ),
                    )}

                  </ul>

                </li>

              ),
            )}

          </ul>

        ) : (

          <div className="navigation-empty-state">
            <p className="navigation-empty-text">
              No permitted menu items.
            </p>
          </div>

        )}

      </nav>

    </aside>
  );
};

export default NavigationPanel;