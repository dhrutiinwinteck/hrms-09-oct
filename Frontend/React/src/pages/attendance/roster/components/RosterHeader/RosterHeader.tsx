import React, { useRef } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";

import rosterIllustration from "../../../../../assets/images/attendance/roaster.png";

import "./RosterHeader.css";

export interface RosterHeaderProps {
  weekLabel?: string;

  onWeekChange?: (
    selectedDate: Date,
  ) => void;

  onExport?: () => void;

  onPreviousWeek?: () => void;

  onNextWeek?: () => void;

  exportLoading?: boolean;

  disabled?: boolean;
}

const RosterHeader: React.FC<
  RosterHeaderProps
> = ({
  weekLabel = "Week: 27 Jul 2026 - 02 Aug 2026",
  onWeekChange,
  onExport,
  onPreviousWeek,
  onNextWeek,
  exportLoading = false,
  disabled = false,
}) => {
  const dateInputRef =
    useRef<HTMLInputElement | null>(null);

  const handleWeekSelectorClick = (): void => {
    if (disabled) {
      return;
    }

    const input =
      dateInputRef.current;

    if (!input) {
      return;
    }

    /*
     * Native browser date picker.
     * showPicker is supported by modern Chromium-based
     * browsers. Fallback to click keeps it usable elsewhere.
     */
    try {
      if (
        typeof input.showPicker === "function"
      ) {
        input.showPicker();
        return;
      }
    } catch {
      // Fallback below.
    }

    input.click();
  };

  const handleDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const value =
      event.target.value;

    if (!value) {
      return;
    }

    const [year, month, day] =
      value
        .split("-")
        .map(Number);

    if (
      !year ||
      !month ||
      !day
    ) {
      return;
    }

    const selectedDate =
      new Date(
        year,
        month - 1,
        day,
      );

    onWeekChange?.(
      selectedDate,
    );

    /*
     * Allows selecting the same date again.
     */
    event.target.value = "";
  };

  return (
    <section
      className="roster-header"
      aria-label="Roster header"
    >
      <div className="roster-header__inner">
        {/* ==================================================
            LEFT CONTENT
        ================================================== */}

        <div className="roster-header__left">
          <h1 className="roster-header__title">
            Roster for the Week
          </h1>

          <button
            type="button"
            className="roster-header__week-selector"
            onClick={
              handleWeekSelectorClick
            }
            disabled={disabled}
            aria-label={`Select ${weekLabel}`}
          >
            <CalendarDays
              className="roster-header__week-icon"
              size={14}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <span className="roster-header__week-text">
              {weekLabel}
            </span>

            <ChevronDown
              className="roster-header__week-chevron"
              size={13}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>

          <input
            ref={dateInputRef}
            type="date"
            className="roster-header__date-input"
            onChange={handleDateChange}
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        {/* ==================================================
            CENTER IMAGE
        ================================================== */}

        <div
          className="roster-header__visual"
          aria-hidden="true"
        >
          <img
            src={rosterIllustration}
            alt=""
            className="roster-header__illustration"
          />
        </div>

        {/* ==================================================
            RIGHT ACTIONS
        ================================================== */}

        <div className="roster-header__actions">
          <button
            type="button"
            className="roster-header__button roster-header__button--export"
            onClick={onExport}
            disabled={
              disabled ||
              exportLoading
            }
          >
            <Download
              className="roster-header__button-icon"
              size={14}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <span>
              {exportLoading
                ? "Exporting..."
                : "Export to Excel"}
            </span>
          </button>

          <button
            type="button"
            className="roster-header__button roster-header__button--navigation"
            onClick={
              onPreviousWeek
            }
            disabled={disabled}
            aria-label="Previous week"
          >
            <ChevronLeft
              className="roster-header__button-icon"
              size={14}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <span>
              Previous Week
            </span>
          </button>

          <button
            type="button"
            className="roster-header__button roster-header__button--navigation"
            onClick={onNextWeek}
            disabled={disabled}
            aria-label="Next week"
          >
            <span>
              Next Week
            </span>

            <ChevronRight
              className="roster-header__button-icon"
              size={14}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </section>
  );
};

export default RosterHeader;