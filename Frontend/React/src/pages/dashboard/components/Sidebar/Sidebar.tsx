import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearAuth } from '@/pages/auth/utils/authStorage';
import IconRail from './IconRail';
import NavigationPanel from './NavigationPanel';
import './Sidebar.css';

export interface SidebarProps {
  isExpanded?: boolean;
  setIsExpanded?: (value: boolean) => void;
}

/**
 * Determines which sidebar icon should be active
 * based on the current URL.
 *
 * IMPORTANT:
 * Holiday pages are intentionally mapped to "leave"
 * because Holiday navigation is merged into the Leave module.
 */
const getActiveIconFromPath = (pathname: string): string => {
  const path = pathname.toLowerCase();

  /* ==========================================================
     DASHBOARD
  ========================================================== */

  if (
    path === '/dashboard' ||
    path.startsWith('/dashboard/')
  ) {
    return 'dashboard';
  }

  /* ==========================================================
     RECRUITMENT
  ========================================================== */

  if (
    path === '/recruitment' ||
    path.startsWith('/recruitment/')
  ) {
    return 'recruitment';
  }

  /* ==========================================================
     ATTENDANCE
  ========================================================== */

  if (
    path === '/attendance' ||
    path.startsWith('/attendance/')
  ) {
    return 'attendance';
  }

  /* ==========================================================
     LEAVE
  ========================================================== */

  if (
    path === '/leave' ||
    path.startsWith('/leave/')
  ) {
    return 'leave';
  }

  /* ==========================================================
     HOLIDAYS
     
     IMPORTANT:
     Holiday is merged into the Leave module.
     
     Therefore ALL holiday routes must return "leave".
     
     This includes:
       /holidays
       /holidays/calendar
       /holidays/admin-calendar
       /holidays/restricted
       /holidays/upcoming
  ========================================================== */

  if (
    path === '/holidays' ||
    path.startsWith('/holidays/')
  ) {
    return 'leave';
  }

  /* ==========================================================
     PAYROLL
  ========================================================== */

  if (
    path === '/payroll' ||
    path.startsWith('/payroll/')
  ) {
    return 'payroll';
  }

  /* ==========================================================
     POLICIES
  ========================================================== */

  if (
    path === '/policies' ||
    path.startsWith('/policies/')
  ) {
    return 'policies';
  }

  /* ==========================================================
     KRA
  ========================================================== */

  if (
    path === '/kra' ||
    path.startsWith('/kra/')
  ) {
    return 'kra';
  }

  /* ==========================================================
     SETTINGS
  ========================================================== */

  if (
    path === '/settings' ||
    path.startsWith('/settings/')
  ) {
    return 'settings';
  }

  /* ==========================================================
     FALLBACK
  ========================================================== */

  return 'dashboard';
};

const Sidebar = ({
  isExpanded: externalIsExpanded,
  setIsExpanded: externalSetIsExpanded,
}: SidebarProps): JSX.Element => {

  const navigate = useNavigate();
  const location = useLocation();

  /* ==========================================================
     INTERNAL EXPANSION STATE
  ========================================================== */

  const [
    internalIsExpanded,
    setInternalIsExpanded,
  ] = useState<boolean>(true);

  /* ==========================================================
     ACTIVE ICON STATE
  ========================================================== */

  const [
    internalActiveIconId,
    setInternalActiveIconId,
  ] = useState<string>(
    getActiveIconFromPath(location.pathname)
  );

  /* ==========================================================
     EXTERNAL / INTERNAL STATE
  ========================================================== */

  const isExpanded =
    externalIsExpanded !== undefined
      ? externalIsExpanded
      : internalIsExpanded;

  const setIsExpanded =
    externalSetIsExpanded ||
    setInternalIsExpanded;

  /* ==========================================================
     SYNC ACTIVE ICON WITH CURRENT ROUTE
  ========================================================== */

  useEffect(() => {

    const newActiveIcon =
      getActiveIconFromPath(
        location.pathname
      );

    setInternalActiveIconId(
      newActiveIcon
    );

  }, [location.pathname]);

  /* ==========================================================
     SELECT ICON
  ========================================================== */

  const selectIcon = useCallback(
    (id: string) => {

      /* ------------------------------------------------------
         LOGOUT
      ------------------------------------------------------ */

      if (id === 'logout') {

        clearAuth();

        navigate('/login');

        return;
      }

      /* ------------------------------------------------------
         UPDATE ACTIVE ICON
      ------------------------------------------------------ */

      setInternalActiveIconId(id);

      /* ------------------------------------------------------
         EXPAND SIDEBAR IF COLLAPSED
      ------------------------------------------------------ */

      if (!isExpanded) {
        setIsExpanded(true);
      }

    },
    [
      isExpanded,
      setIsExpanded,
      navigate,
    ]
  );

  /* ==========================================================
     TOGGLE PANEL
  ========================================================== */

  const togglePanel = useCallback(() => {

    setIsExpanded(
      !isExpanded
    );

  }, [
    isExpanded,
    setIsExpanded,
  ]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="sidebar-container">

      {/* ------------------------------------------------------
          LEFT ICON RAIL
      ------------------------------------------------------ */}

      <IconRail
        activeIconId={
          internalActiveIconId
        }
        selectIcon={
          selectIcon
        }
      />

      {/* ------------------------------------------------------
          RIGHT NAVIGATION PANEL
      ------------------------------------------------------ */}

      <div
        className={
          `sidebar-panel-wrapper ${
            isExpanded
              ? 'expanded'
              : 'collapsed'
          }`
        }
      >

        <NavigationPanel
          activeIconId={
            internalActiveIconId
          }
          togglePanel={
            togglePanel
          }
        />

      </div>

    </div>
  );
};

export default Sidebar;