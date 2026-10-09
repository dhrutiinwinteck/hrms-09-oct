// // src/pages/attendance/attendance-history/components/AttendanceHistoryHeader/AttendanceHistoryHeader.tsx

// import React from 'react';
// import { CalendarDays, FileSpreadsheet, ChevronDown, Clock3 } from 'lucide-react';
// import { MonthOption, AVAILABLE_MONTHS } from '../../constants/attendanceHistory.constants';
// import './AttendanceHistoryHeader.css';

// interface AttendanceHistoryHeaderProps {
//   selectedMonth: MonthOption;
//   onMonthChange: (month: MonthOption) => void;
//   onCalculateLateMarks: () => void;
//   onExport: () => void;
//   loading?: boolean;
// }

// export const AttendanceHistoryHeader: React.FC<AttendanceHistoryHeaderProps> = ({
//   selectedMonth,
//   onMonthChange,
//   onCalculateLateMarks,
//   onExport,
//   loading = false
// }) => {
//   return (
//     <header className="attendance-history-header">
//       <div className="attendance-history-header-left">
//         <div className="attendance-history-header-title-group">
//           <h1 className="attendance-history-header-title">Attendance History</h1>
//           <span className="attendance-history-header-subtitle">All Employees</span>
//         </div>
//         <nav className="attendance-history-breadcrumb">
//           <span className="breadcrumb-item">Dashboard</span>
//           <span className="breadcrumb-separator">&gt;</span>
//           <span className="breadcrumb-item">Attendance</span>
//           <span className="breadcrumb-separator">&gt;</span>
//           <span className="breadcrumb-item active">Attendance History</span>
//         </nav>
//       </div>
      
//       <div className="attendance-history-header-right">
//         <div className="attendance-history-month-selector">
//           <CalendarDays size={18} className="month-icon" />
//           <select 
//             value={selectedMonth.value}
//             onChange={(e) => {
//               const selected = AVAILABLE_MONTHS.find(m => m.value === e.target.value);
//               if (selected) onMonthChange(selected);
//             }}
//             className="month-select"
//           >
//             {AVAILABLE_MONTHS.map(month => (
//               <option key={month.value} value={month.value}>
//                 {month.label}
//               </option>
//             ))}
//           </select>
//           <ChevronDown size={16} className="chevron-icon" />
//         </div>
        
//         <button 
//           className="attendance-history-btn-calculate"
//           onClick={onCalculateLateMarks}
//           disabled={loading}
//         >
//           <Clock3 size={18} />
//           Calculate Late Marks!!
//         </button>
        
//         <button 
//           className="attendance-history-btn-export"
//           onClick={onExport}
//           disabled={loading}
//         >
//           <FileSpreadsheet size={18} />
//           Export to Excel
//         </button>
//       </div>
//     </header>
//   );
// };

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  CalendarDays,
  FileSpreadsheet,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
} from 'lucide-react';

import type { MonthOption } from '../../types/attendanceHistory.types';

import {
  MONTH_NAMES,
  MONTH_SHORT_NAMES,
  createMonthOptions,
} from '../../constants/attendanceHistory.constants';

import './AttendanceHistoryHeader.css';

interface AttendanceHistoryHeaderProps {
  selectedMonth: MonthOption;
  onMonthChange: (month: MonthOption) => void;
  onCalculateLateMarks: () => void;
  onExport: () => void;
  loading?: boolean;
}

export const AttendanceHistoryHeader: React.FC<
  AttendanceHistoryHeaderProps
> = ({
  selectedMonth,
  onMonthChange,
  onCalculateLateMarks,
  onExport,
  loading = false,
}) => {
  const [isMonthPickerOpen, setIsMonthPickerOpen] =
    useState<boolean>(false);

  const [displayYear, setDisplayYear] = useState<number>(
    selectedMonth.year,
  );

  const monthPickerRef = useRef<HTMLDivElement | null>(null);

  /**
   * Keep calendar year synchronized with the selected month.
   */
  useEffect(() => {
    setDisplayYear(selectedMonth.year);
  }, [selectedMonth.year]);

  /**
   * Close month picker when user clicks outside.
   */
  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent,
    ): void => {
      if (
        monthPickerRef.current &&
        !monthPickerRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsMonthPickerOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick,
      );
    };
  }, []);

  /**
   * Close calendar with Escape.
   */
  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent,
    ): void => {
      if (event.key === 'Escape') {
        setIsMonthPickerOpen(false);
      }
    };

    document.addEventListener(
      'keydown',
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape,
      );
    };
  }, []);

  /**
   * Create all 12 months for the currently visible year.
   */
  const monthOptions = useMemo(
    () => createMonthOptions(displayYear),
    [displayYear],
  );

  /**
   * Select a month.
   */
  const handleMonthSelect = (
    month: MonthOption,
  ): void => {
    onMonthChange(month);
    setIsMonthPickerOpen(false);
  };

  /**
   * Go to previous year.
   */
  const handlePreviousYear = (): void => {
    setDisplayYear((previousYear) => previousYear - 1);
  };

  /**
   * Go to next year.
   */
  const handleNextYear = (): void => {
    setDisplayYear((previousYear) => previousYear + 1);
  };

  /**
   * Select current month/year.
   */
  const handleThisMonth = (): void => {
    const now = new Date();

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const currentMonthOption: MonthOption = {
      label: `${MONTH_NAMES[currentMonth - 1]} ${currentYear}`,
      value: `${currentYear}-${String(
        currentMonth,
      ).padStart(2, '0')}`,
      year: currentYear,
      month: currentMonth,
    };

    onMonthChange(currentMonthOption);

    setDisplayYear(currentYear);
    setIsMonthPickerOpen(false);
  };

  /**
   * Clear selection.
   *
   * Since Attendance History requires a month to load
   * the attendance grid, clearing resets to the current
   * month instead of sending an invalid API filter.
   */
  const handleClear = (): void => {
    handleThisMonth();
  };

  return (
    <header className="attendance-history-header">
      {/* =====================================================
          LEFT SIDE
          ===================================================== */}

      <div className="attendance-history-header-left">
        <div className="attendance-history-header-title-group">
          <h1 className="attendance-history-header-title">
            Attendance History
          </h1>

          <span className="attendance-history-header-subtitle">
            All Employees
          </span>
        </div>

        <nav
          className="attendance-history-breadcrumb"
          aria-label="Breadcrumb"
        >
          <span className="breadcrumb-item">
            Dashboard
          </span>

          <span className="breadcrumb-separator">
            &gt;
          </span>

          <span className="breadcrumb-item">
            Attendance
          </span>

          <span className="breadcrumb-separator">
            &gt;
          </span>

          <span className="breadcrumb-item active">
            Attendance History
          </span>
        </nav>
      </div>

      {/* =====================================================
          RIGHT SIDE
          ===================================================== */}

      <div className="attendance-history-header-right">
        {/* ===================================================
            MONTH SELECTOR
            =================================================== */}

        <div
          className="attendance-history-month-picker"
          ref={monthPickerRef}
        >
          <button
            type="button"
            className={`attendance-history-month-selector ${
              isMonthPickerOpen
                ? 'is-open'
                : ''
            }`}
            onClick={() =>
              setIsMonthPickerOpen(
                (previous) => !previous,
              )
            }
            aria-haspopup="dialog"
            aria-expanded={isMonthPickerOpen}
            disabled={loading}
          >
            <CalendarDays
              size={18}
              className="month-icon"
            />

            <span className="month-selector-value">
              {selectedMonth.label}
            </span>

            <ChevronDown
              size={16}
              className={`chevron-icon ${
                isMonthPickerOpen
                  ? 'rotated'
                  : ''
              }`}
            />
          </button>

          {isMonthPickerOpen && (
            <div
              className="attendance-month-calendar"
              role="dialog"
              aria-label="Select attendance month"
            >
              {/* =============================================
                  YEAR HEADER
                  ============================================= */}

              <div className="attendance-month-calendar-header">
                <button
                  type="button"
                  className="attendance-year-navigation"
                  onClick={handlePreviousYear}
                  aria-label="Previous year"
                >
                  <ChevronLeft size={17} />
                </button>

                <span className="attendance-calendar-year">
                  {displayYear}
                </span>

                <button
                  type="button"
                  className="attendance-year-navigation"
                  onClick={handleNextYear}
                  aria-label="Next year"
                >
                  <ChevronRight size={17} />
                </button>
              </div>

              {/* =============================================
                  MONTH GRID
                  ============================================= */}

              <div className="attendance-month-grid">
                {monthOptions.map(
                  (month, index) => {
                    const isSelected =
                      selectedMonth.year ===
                        month.year &&
                      selectedMonth.month ===
                        month.month;

                    return (
                      <button
                        key={month.value}
                        type="button"
                        className={`attendance-month-option ${
                          isSelected
                            ? 'selected'
                            : ''
                        }`}
                        onClick={() =>
                          handleMonthSelect(
                            month,
                          )
                        }
                        aria-pressed={isSelected}
                      >
                        {
                          MONTH_SHORT_NAMES[
                            index
                          ]
                        }
                      </button>
                    );
                  },
                )}
              </div>

              {/* =============================================
                  FOOTER
                  ============================================= */}

              <div className="attendance-month-calendar-footer">
                <button
                  type="button"
                  className="attendance-calendar-footer-button clear"
                  onClick={handleClear}
                >
                  Clear
                </button>

                <button
                  type="button"
                  className="attendance-calendar-footer-button current"
                  onClick={handleThisMonth}
                >
                  This month
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ===================================================
            CALCULATE LATE MARKS
            =================================================== */}

        <button
          type="button"
          className="attendance-history-btn-calculate"
          onClick={onCalculateLateMarks}
          disabled={loading}
        >
          <Clock3 size={18} />
          Calculate Late Marks
        </button>

        {/* ===================================================
            EXPORT
            =================================================== */}

        <button
          type="button"
          className="attendance-history-btn-export"
          onClick={onExport}
          disabled={loading}
        >
          <FileSpreadsheet size={18} />
          Export to Excel
        </button>
      </div>
    </header>
  );
};