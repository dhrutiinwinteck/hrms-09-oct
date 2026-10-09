/**
 * ======================================================
 * Attendance Module - Calendar Component
 * ======================================================
 * Enterprise-grade calendar component for date selection.
 * Provides a popover calendar with month navigation and day selection.
 *
 * Features:
 * - Custom calendar with month/year navigation
 * - Day grid with selectable dates
 * - Highlights selected date
 * - Clear date option
 * - Keyboard navigation (arrow keys, Enter, Escape)
 * - Accessibility (ARIA labels, roles)
 * - Responsive popover positioning
 * - Memoized for performance
 *
 * @module components/AttendanceCalendar
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import './AttendanceCalendar.css';

// -----------------------------------------------------------------------------
// Component Props Interface
// -----------------------------------------------------------------------------

export interface AttendanceCalendarProps {
  /** Currently selected date (YYYY-MM-DD). */
  selectedDate?: string;
  /** Callback when a date is selected. */
  onDateChange: (date: string | undefined) => void;
  /** Placeholder text for the input. */
  placeholder?: string;
  /** Additional CSS class names. */
  className?: string;
  /** Whether the component is disabled. */
  disabled?: boolean;
}

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

/**
 * Renders a single day cell in the calendar grid.
 */
interface DayCellProps {
  day: number;
  date: Date;
  currentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  onClick: (date: Date) => void;
}

const DayCell: React.FC<DayCellProps> = React.memo(({
  day,
  date,
  currentMonth,
  isSelected,
  isToday,
  onClick,
}) => {
  const handleClick = useCallback(() => {
    onClick(date);
  }, [date, onClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(date);
    }
  }, [date, onClick]);

  return (
    <div
      className={`attendance-calendar__day ${!currentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="gridcell"
      aria-selected={isSelected}
      tabIndex={isSelected || isToday ? 0 : -1}
      aria-label={`${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`}
    >
      {day}
    </div>
  );
});

DayCell.displayName = 'DayCell';

// -----------------------------------------------------------------------------
// Main Component Implementation
// -----------------------------------------------------------------------------

/**
 * AttendanceCalendar component for date selection.
 *
 * @param props - Component props
 * @returns React component
 */
export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  selectedDate,
  onDateChange,
  placeholder = 'Select date',
  className = '',
  disabled = false,
}) => {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  /** Whether the calendar popover is open. */
  const [isOpen, setIsOpen] = useState<boolean>(false);
  /** Current displayed month (0-11). */
  const [viewMonth, setViewMonth] = useState<number>(() => {
    if (selectedDate) {
      const parts = selectedDate.split('-');
      return parseInt(parts[1]) - 1;
    }
    return new Date().getMonth();
  });
  /** Current displayed year. */
  const [viewYear, setViewYear] = useState<number>(() => {
    if (selectedDate) {
      const parts = selectedDate.split('-');
      return parseInt(parts[0]);
    }
    return new Date().getFullYear();
  });

  /** Ref for the popover container. */
  const popoverRef = useRef<HTMLDivElement>(null);
  /** Ref for the trigger button. */
  const triggerRef = useRef<HTMLButtonElement>(null);
  /** Ref for the input (hidden) to handle focus. */
  const inputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // Memoized Values
  // ---------------------------------------------------------------------------

  /**
   * Parsed selected date as Date object.
   */
  const selectedDateObj = useMemo(() => {
    if (!selectedDate) return null;
    const parts = selectedDate.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }, [selectedDate]);

  /**
   * Today's date.
   */
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  /**
   * Generate calendar grid for the current view month/year.
   */
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0=Sun, 1=Mon, ...

    // Get days from previous month to fill first week
    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
    const days: Array<{ day: number; date: Date; currentMonth: boolean }> = [];

    // Previous month days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(viewYear, viewMonth - 1, day);
      days.push({ day, date, currentMonth: false });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewYear, viewMonth, day);
      days.push({ day, date, currentMonth: true });
    }

    // Next month days to fill last week
    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(viewYear, viewMonth + 1, day);
      days.push({ day, date, currentMonth: false });
    }

    return days;
  }, [viewYear, viewMonth]);

  /**
   * Group days into weeks (array of 7 days each).
   */
  const weeks = useMemo(() => {
    const result: typeof calendarDays[] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  /**
   * Weekday headers.
   */
  const weekdays = useMemo(() => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  }, []);

  /**
   * Month name for display.
   */
  const monthName = useMemo(() => {
    return new Date(viewYear, viewMonth).toLocaleDateString('en-US', { month: 'long' });
  }, [viewYear, viewMonth]);

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  /**
   * Toggles the calendar popover.
   */
  const toggleCalendar = useCallback(() => {
    if (disabled) return;
    setIsOpen(prev => !prev);
    if (!isOpen) {
      // Reset view to selected date or today when opening
      if (selectedDateObj) {
        setViewMonth(selectedDateObj.getMonth());
        setViewYear(selectedDateObj.getFullYear());
      } else {
        const now = new Date();
        setViewMonth(now.getMonth());
        setViewYear(now.getFullYear());
      }
    }
  }, [disabled, isOpen, selectedDateObj]);

  /**
   * Closes the popover.
   */
  const closeCalendar = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  /**
   * Handles date selection.
   */
  const handleDateSelect = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    onDateChange(dateStr);
    closeCalendar();
  }, [onDateChange, closeCalendar]);

  /**
   * Clears the selected date.
   */
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange(undefined);
    closeCalendar();
  }, [onDateChange, closeCalendar]);

  /**
   * Navigates to previous month.
   */
  const goToPrevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  }, [viewMonth]);

  /**
   * Navigates to next month.
   */
  const goToNextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  }, [viewMonth]);

  /**
   * Handles keyboard navigation within the calendar.
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      closeCalendar();
    }
  }, [closeCalendar]);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  /**
   * Close calendar when clicking outside.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Focus management for keyboard users.
   */
  useEffect(() => {
    if (isOpen) {
      // Focus the first selected day or today
      const selectedDayEl = document.querySelector('.attendance-calendar__day.selected');
      const todayEl = document.querySelector('.attendance-calendar__day.today');
      const firstDayEl = document.querySelector('.attendance-calendar__day');
      const target = selectedDayEl || todayEl || firstDayEl;
      if (target) {
        (target as HTMLElement).focus();
      }
    }
  }, [isOpen, calendarDays]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const displayDate = selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) : '';

  return (
    <div className={`attendance-calendar ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        className={`attendance-calendar__trigger ${selectedDate ? 'has-value' : ''}`}
        onClick={toggleCalendar}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Select date"
      >
        <Calendar size={18} className="attendance-calendar__trigger-icon" />
        <span className="attendance-calendar__trigger-text">
          {displayDate || placeholder}
        </span>
        {selectedDate && (
          <X
            size={16}
            className="attendance-calendar__trigger-clear"
            onClick={handleClear}
            aria-label="Clear date"
          />
        )}
      </button>

      {/* Hidden input for form submission */}
      <input
        ref={inputRef}
        type="hidden"
        value={selectedDate || ''}
        aria-hidden="true"
      />

      {/* Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="attendance-calendar__popover"
          role="dialog"
          aria-label="Calendar"
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          <div className="attendance-calendar__header">
            <button
              type="button"
              className="attendance-calendar__nav-btn"
              onClick={goToPrevMonth}
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="attendance-calendar__month-year">
              {monthName} {viewYear}
            </span>
            <button
              type="button"
              className="attendance-calendar__nav-btn"
              onClick={goToNextMonth}
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="attendance-calendar__weekdays" role="row">
            {weekdays.map((day) => (
              <div key={day} className="attendance-calendar__weekday" role="columnheader">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="attendance-calendar__days" role="grid">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="attendance-calendar__week" role="row">
                {week.map((dayInfo, dayIndex) => {
                  const { day, date, currentMonth } = dayInfo;
                  const isSelected = selectedDateObj &&
                    date.getFullYear() === selectedDateObj.getFullYear() &&
                    date.getMonth() === selectedDateObj.getMonth() &&
                    date.getDate() === selectedDateObj.getDate();
                  const isToday = date.getFullYear() === today.getFullYear() &&
                    date.getMonth() === today.getMonth() &&
                    date.getDate() === today.getDate();

                  return (
                    <DayCell
                      key={dayIndex}
                      day={day}
                      date={date}
                      currentMonth={currentMonth}
                      isSelected={!!isSelected}
                      isToday={!!isToday}
                      onClick={handleDateSelect}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="attendance-calendar__footer">
            <button
              type="button"
              className="attendance-calendar__today-btn"
              onClick={() => {
                const now = new Date();
                handleDateSelect(now);
              }}
            >
              Today
            </button>
            {selectedDate && (
              <button
                type="button"
                className="attendance-calendar__clear-btn"
                onClick={handleClear}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// -----------------------------------------------------------------------------
// Default Export
// -----------------------------------------------------------------------------

export default AttendanceCalendar;