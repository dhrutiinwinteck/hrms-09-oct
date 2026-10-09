import {
  useState,
} from "react";

import {
  Outlet,
} from "react-router-dom";

import Sidebar from "../../pages/dashboard/components/Sidebar/Sidebar";

import TopNavbar from "../../pages/dashboard/components/TopNavbar/TopNavbar";



import "./DashboardLayout.css";
import PermissionProvider from "@/pages/auth/Permission/PermissionProvider";

// ============================================================
// DASHBOARD LAYOUT
// ============================================================

const DashboardLayout = (): JSX.Element => {

  const [
    isSidebarExpanded,
    setIsSidebarExpanded,
  ] =
    useState<boolean>(
      true,
    );

  // ----------------------------------------------------------
  // Sidebar dimensions
  // ----------------------------------------------------------

  const iconRailWidth = 60;

  const navPanelWidth =
    isSidebarExpanded
      ? 220
      : 0;

  const contentMarginLeft =
    iconRailWidth +
    navPanelWidth;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <PermissionProvider>

      <div className="dashboard-layout">

        {/* ====================================================
            SIDEBAR
        ==================================================== */}

        <Sidebar
          isExpanded={
            isSidebarExpanded
          }
          setIsExpanded={
            setIsSidebarExpanded
          }
        />

        {/* ====================================================
            MAIN CONTENT
        ==================================================== */}

        <main
          className="dashboard-layout-content"
          style={{
            marginLeft:
              `${contentMarginLeft}px`,
          }}
        >

          {/* ==================================================
              TOP NAVBAR
          ================================================== */}

          <TopNavbar />

          {/* ==================================================
              PAGE CONTENT
          ================================================== */}

          <div className="dashboard-page-content">

            <Outlet />

          </div>

        </main>

      </div>

    </PermissionProvider>
  );
};

export default DashboardLayout;