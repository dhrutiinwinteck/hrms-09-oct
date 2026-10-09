/**
 * ======================================================
 * Attendance Module - Tabs Component
 * ======================================================
 * Enterprise-grade component for switching between attendance views.
 * Provides "Daily History" and "Punch Logs" tabs.
 *
 * Features:
 * - Two tabs: Daily History (active) and Punch Logs (inactive)
 * - Smooth underline transition on tab switch
 * - Keyboard accessibility (arrow keys, Enter/Space)
 * - Responsive design
 * - Memoized for performance
 *
 * @module components/AttendanceTabs
 */

import React, { useCallback, useRef, useEffect, useState } from 'react';
import './AttendanceTabs.css';

// -----------------------------------------------------------------------------
// Component Props Interface
// -----------------------------------------------------------------------------

export interface AttendanceTabsProps {
  /** Active tab ID. */
  activeTab?: 'daily' | 'punch';
  /** Callback when tab changes. */
  onTabChange?: (tab: 'daily' | 'punch') => void;
  /** Content to render inside the active tab. */
  children?: React.ReactNode;
  /** Additional CSS class names. */
  className?: string;
  /** Whether the tabs are disabled. */
  disabled?: boolean;
}

// -----------------------------------------------------------------------------
// Component Implementation
// -----------------------------------------------------------------------------

/**
 * AttendanceTabs component for switching between attendance views.
 *
 * @param props - Component props
 * @returns React component
 */
export const AttendanceTabs: React.FC<AttendanceTabsProps> = ({
  activeTab = 'daily',
  onTabChange,
  children,
  className = '',
  disabled = false,
}) => {
  // ---------------------------------------------------------------------------
  // State & Refs
  // ---------------------------------------------------------------------------

  const [active, setActive] = useState<'daily' | 'punch'>(activeTab);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [underlineStyle, setUnderlineStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  /**
   * Update underline position when active tab changes.
   */
  useEffect(() => {
    const activeElement = tabRefs.current[active];
    if (activeElement) {
      const rect = activeElement.getBoundingClientRect();
      const parentRect = activeElement.parentElement?.getBoundingClientRect();
      if (parentRect) {
        setUnderlineStyle({
          left: rect.left - parentRect.left,
          width: rect.width,
        });
      }
    }
  }, [active]);

  /**
   * Sync with prop changes.
   */
  useEffect(() => {
    if (activeTab !== active) {
      setActive(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  /**
   * Handles tab click.
   */
  const handleTabClick = useCallback(
    (tab: 'daily' | 'punch') => {
      if (disabled) return;
      setActive(tab);
      if (onTabChange) {
        onTabChange(tab);
      }
    },
    [disabled, onTabChange]
  );

  /**
   * Handles keyboard navigation.
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>, tab: 'daily' | 'punch') => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleTabClick(tab);
      }
      // Arrow keys for navigation
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextTab = tab === 'daily' ? 'punch' : 'daily';
        handleTabClick(nextTab);
        tabRefs.current[nextTab]?.focus();
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevTab = tab === 'punch' ? 'daily' : 'punch';
        handleTabClick(prevTab);
        tabRefs.current[prevTab]?.focus();
      }
    },
    [handleTabClick]
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={`attendance-tabs ${className}`}
      role="tablist"
      aria-label="Attendance views"
    >
      {/* Tab Headers */}
      <div className="attendance-tabs__header">
        {/* Daily History Tab */}
        <button
          ref={(el) => (tabRefs.current['daily'] = el)}
          role="tab"
          aria-selected={active === 'daily'}
          aria-controls="panel-daily"
          id="tab-daily"
          className={`attendance-tabs__tab ${active === 'daily' ? 'active' : ''}`}
          onClick={() => handleTabClick('daily')}
          onKeyDown={(e) => handleKeyDown(e, 'daily')}
          disabled={disabled}
          tabIndex={active === 'daily' ? 0 : -1}
        >
          Daily History
        </button>

        {/* Punch Logs Tab */}
        <button
          ref={(el) => (tabRefs.current['punch'] = el)}
          role="tab"
          aria-selected={active === 'punch'}
          aria-controls="panel-punch"
          id="tab-punch"
          className={`attendance-tabs__tab ${active === 'punch' ? 'active' : ''}`}
          onClick={() => handleTabClick('punch')}
          onKeyDown={(e) => handleKeyDown(e, 'punch')}
          disabled={disabled}
          tabIndex={active === 'punch' ? 0 : -1}
        >
          Punch Logs
        </button>

        {/* Underline Indicator */}
        <div
          className="attendance-tabs__underline"
          style={{
            left: underlineStyle.left,
            width: underlineStyle.width,
          }}
          aria-hidden="true"
        />
      </div>

      {/* Tab Panels */}
      <div className="attendance-tabs__panels">
        {/* Daily History Panel */}
        <div
          role="tabpanel"
          id="panel-daily"
          aria-labelledby="tab-daily"
          className={`attendance-tabs__panel ${active === 'daily' ? 'active' : ''}`}
          hidden={active !== 'daily'}
        >
          {active === 'daily' && children}
        </div>

        {/* Punch Logs Panel */}
        <div
          role="tabpanel"
          id="panel-punch"
          aria-labelledby="tab-punch"
          className={`attendance-tabs__panel ${active === 'punch' ? 'active' : ''}`}
          hidden={active !== 'punch'}
        >
          {active === 'punch' && (
            <div className="attendance-tabs__placeholder">
              <div className="attendance-tabs__placeholder-icon">⏰</div>
              <h4 className="attendance-tabs__placeholder-title">Punch Logs</h4>
              <p className="attendance-tabs__placeholder-text">
                Punch log details will be available soon.
                <br />
                This feature is currently under development.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Default Export
// -----------------------------------------------------------------------------

export default AttendanceTabs;