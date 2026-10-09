import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  CalendarDays,
  Check,
  ChevronDown,
  Filter,
  RotateCcw,
} from 'lucide-react';

import './KraFilters.css';

export interface KraFilterValues {
  fromMonth: string;
  toMonth: string;
  year: string;
}

interface KraFiltersProps {
  onApplyFilters?: (filters: KraFilterValues) => void;
  onReset?: () => void;
}

interface MonthOption {
  value: string;
  label: string;
  monthIndex: number;
}

interface DynamicDropdownProps {
  id: string;
  value: string;
  placeholder: string;
  options: Array<{
    value: string;
    label: string;
  }>;
  icon: React.ReactNode;
  disabled?: boolean;
  onChange: (value: string) => void;
  ariaLabel: string;
}

/* =========================================================
   MONTHS
   ========================================================= */

const MONTHS: MonthOption[] = [
  {
    value: 'January',
    label: 'January',
    monthIndex: 0,
  },
  {
    value: 'February',
    label: 'February',
    monthIndex: 1,
  },
  {
    value: 'March',
    label: 'March',
    monthIndex: 2,
  },
  {
    value: 'April',
    label: 'April',
    monthIndex: 3,
  },
  {
    value: 'May',
    label: 'May',
    monthIndex: 4,
  },
  {
    value: 'June',
    label: 'June',
    monthIndex: 5,
  },
  {
    value: 'July',
    label: 'July',
    monthIndex: 6,
  },
  {
    value: 'August',
    label: 'August',
    monthIndex: 7,
  },
  {
    value: 'September',
    label: 'September',
    monthIndex: 8,
  },
  {
    value: 'October',
    label: 'October',
    monthIndex: 9,
  },
  {
    value: 'November',
    label: 'November',
    monthIndex: 10,
  },
  {
    value: 'December',
    label: 'December',
    monthIndex: 11,
  },
];

/* =========================================================
   DYNAMIC YEAR CONFIGURATION
   =========================================================

   Current year = 2026

   Start:
   2026 - 1 = 2025

   End:
   2026 + 8 = 2034

   Result:
   2025
   2026
   2027
   2028
   2029
   2030
   2031
   2032
   2033
   2034

   In 2027 it automatically becomes:
   2026 - 2035
   ========================================================= */

/* =========================================================
   YEAR CONFIGURATION

   Required range:

   2025
   2026
   2027
   2028

   2025 + 3 years
   ========================================================= */

const START_YEAR = 2025;
const FUTURE_YEARS = 3;

const END_YEAR =
  START_YEAR + FUTURE_YEARS;

const YEARS: number[] = Array.from(
  {
    length:
      END_YEAR - START_YEAR + 1,
  },
  (_, index) =>
    START_YEAR + index,
);

/* =========================================================
   INITIAL STATE
   ========================================================= */

const INITIAL_FILTERS: KraFilterValues = {
  fromMonth: '',
  toMonth: '',
  year: '',
};

/* =========================================================
   CUSTOM DROPDOWN
   ========================================================= */

const DynamicDropdown: React.FC<
  DynamicDropdownProps
> = ({
  id,
  value,
  placeholder,
  options,
  icon,
  disabled = false,
  onChange,
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] =
    useState<boolean>(false);

  const [focusedIndex, setFocusedIndex] =
    useState<number>(-1);

  const dropdownRef =
    useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find(
    (option) =>
      option.value === value,
  );

  /* =======================================================
     CLOSE WHEN CLICKING OUTSIDE
     ======================================================= */

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent,
    ): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
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

  /* =======================================================
     KEEP FOCUSED INDEX IN SYNC
     ======================================================= */

  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
      return;
    }

    const selectedIndex =
      options.findIndex(
        (option) =>
          option.value === value,
      );

    setFocusedIndex(
      selectedIndex >= 0
        ? selectedIndex
        : 0,
    );
  }, [
    isOpen,
    options,
    value,
  ]);

  /* =======================================================
     TOGGLE
     ======================================================= */

  const handleToggle = (): void => {
    if (disabled) {
      return;
    }

    setIsOpen(
      (previousState) =>
        !previousState,
    );
  };

  /* =======================================================
     SELECT OPTION
     ======================================================= */

  const handleSelect = (
    optionValue: string,
  ): void => {
    onChange(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  /* =======================================================
     KEYBOARD NAVIGATION
     ======================================================= */

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ): void => {
    if (disabled) {
      return;
    }

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();

        if (!isOpen) {
          setIsOpen(true);
          return;
        }

        if (
          focusedIndex >= 0 &&
          focusedIndex <
            options.length
        ) {
          handleSelect(
            options[focusedIndex]
              .value,
          );
        }

        break;

      case 'ArrowDown':
        event.preventDefault();

        if (!isOpen) {
          setIsOpen(true);
          return;
        }

        setFocusedIndex(
          (previousIndex) =>
            Math.min(
              previousIndex + 1,
              options.length - 1,
            ),
        );

        break;

      case 'ArrowUp':
        event.preventDefault();

        if (!isOpen) {
          setIsOpen(true);
          return;
        }

        setFocusedIndex(
          (previousIndex) =>
            Math.max(
              previousIndex - 1,
              0,
            ),
        );

        break;

      case 'Home':
        event.preventDefault();

        if (isOpen) {
          setFocusedIndex(0);
        }

        break;

      case 'End':
        event.preventDefault();

        if (isOpen) {
          setFocusedIndex(
            options.length - 1,
          );
        }

        break;

      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        break;

      case 'Tab':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;

      default:
        break;
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={[
        'kra-score-custom-dropdown',
        isOpen
          ? 'kra-score-custom-dropdown--open'
          : '',
        disabled
          ? 'kra-score-custom-dropdown--disabled'
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* =================================================
          TRIGGER
          ================================================= */}

      <button
        id={id}
        type="button"
        className="kra-score-custom-dropdown-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
      >
        <span
          className="kra-score-custom-dropdown-icon"
          aria-hidden="true"
        >
          {icon}
        </span>

        <span
          className={[
            'kra-score-custom-dropdown-value',
            !selectedOption
              ? 'kra-score-custom-dropdown-value--placeholder'
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {selectedOption
            ? selectedOption.label
            : placeholder}
        </span>

        <ChevronDown
          className="kra-score-custom-dropdown-chevron"
          size={15}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>

      {/* =================================================
          OPTIONS
          ================================================= */}

      {isOpen && !disabled && (
        <div
          className="kra-score-custom-dropdown-menu"
          role="listbox"
          aria-label={ariaLabel}
        >
          {options.length === 0 ? (
            <div className="kra-score-custom-dropdown-empty">
              No options available
            </div>
          ) : (
            options.map(
              (option, index) => {
                const isSelected =
                  option.value === value;

                const isFocused =
                  index === focusedIndex;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={
                      isSelected
                    }
                    className={[
                      'kra-score-custom-dropdown-option',
                      isSelected
                        ? 'kra-score-custom-dropdown-option--selected'
                        : '',
                      isFocused
                        ? 'kra-score-custom-dropdown-option--focused'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onMouseEnter={() =>
                      setFocusedIndex(
                        index,
                      )
                    }
                    onClick={() =>
                      handleSelect(
                        option.value,
                      )
                    }
                  >
                    <span>
                      {option.label}
                    </span>

                    {isSelected && (
                      <Check
                        size={15}
                        strokeWidth={2.2}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              },
            )
          )}
        </div>
      )}
    </div>
  );
};

/* =========================================================
   KRA FILTERS
   ========================================================= */

const KraFilters: React.FC<
  KraFiltersProps
> = ({
  onApplyFilters,
  onReset,
}) => {
  const [filters, setFilters] =
    useState<KraFilterValues>(
      INITIAL_FILTERS,
    );

  /* =======================================================
     MONTH OPTIONS
     ======================================================= */

  const availableMonths =
    useMemo<MonthOption[]>(
      () => MONTHS,
      [],
    );

  /* =======================================================
     TO MONTH OPTIONS

     Example:

     From = June

     To Month:
     June
     July
     August
     September
     October
     November
     December
     ======================================================= */

  const availableToMonths =
    useMemo<MonthOption[]>(() => {
      if (!filters.fromMonth) {
        return availableMonths;
      }

      const selectedFromMonth =
        MONTHS.find(
          (month) =>
            month.value ===
            filters.fromMonth,
        );

      if (!selectedFromMonth) {
        return availableMonths;
      }

      return availableMonths.filter(
        (month) =>
          month.monthIndex >=
          selectedFromMonth.monthIndex,
      );
    }, [
      availableMonths,
      filters.fromMonth,
    ]);

  /* =======================================================
     MONTH SELECT OPTIONS
     ======================================================= */

  const fromMonthOptions =
    useMemo(
      () =>
        availableMonths.map(
          (month) => ({
            value: month.value,
            label: month.label,
          }),
        ),
      [availableMonths],
    );

  const toMonthOptions =
    useMemo(
      () =>
        availableToMonths.map(
          (month) => ({
            value: month.value,
            label: month.label,
          }),
        ),
      [availableToMonths],
    );

  /* =======================================================
     YEAR SELECT OPTIONS
     ======================================================= */

  const yearOptions =
    useMemo(
      () =>
        YEARS.map((year) => ({
          value: year.toString(),
          label: year.toString(),
        })),
      [],
    );

  /* =======================================================
     HANDLE CHANGE
     ======================================================= */

  const handleChange = (
    field: keyof KraFilterValues,
    value: string,
  ): void => {
    setFilters(
      (
        previousFilters,
      ) => {
        const updatedFilters: KraFilterValues =
          {
            ...previousFilters,
            [field]: value,
          };

        /* -----------------------------------------------
           YEAR CHANGE

           Reset months because the selected period
           belongs to the newly selected year.
           ----------------------------------------------- */

        if (field === 'year') {
          updatedFilters.fromMonth = '';
          updatedFilters.toMonth = '';
        }

        /* -----------------------------------------------
           FROM MONTH CHANGE

           Prevent invalid range:

           June -> May

           If existing To Month becomes invalid,
           clear it.
           ----------------------------------------------- */

        if (
          field === 'fromMonth'
        ) {
          if (!value) {
            updatedFilters.toMonth =
              '';
          } else {
            const fromMonth =
              MONTHS.find(
                (month) =>
                  month.value ===
                  value,
              );

            const currentToMonth =
              MONTHS.find(
                (month) =>
                  month.value ===
                  previousFilters.toMonth,
              );

            if (
              fromMonth &&
              currentToMonth &&
              currentToMonth.monthIndex <
                fromMonth.monthIndex
            ) {
              updatedFilters.toMonth =
                '';
            }
          }
        }

        return updatedFilters;
      },
    );
  };

  /* =======================================================
     RESET
     ======================================================= */

  const handleReset = (): void => {
    setFilters(
      INITIAL_FILTERS,
    );

    onReset?.();
  };

  /* =======================================================
     APPLY
     ======================================================= */

  const handleApplyFilters =
    (): void => {
      onApplyFilters?.(
        filters,
      );
    };

  return (
    <section
      className="kra-score-filters"
      aria-label="KRA score filters"
    >
      {/* =================================================
          FILTER FIELDS
          ================================================= */}

      <div className="kra-score-filters-fields">

        {/* ===============================================
            FROM MONTH
            =============================================== */}

        <div className="kra-score-filter-group">
          <label
            htmlFor="kra-from-month"
            className="kra-score-filter-label"
          >
            From Month
          </label>

          <div className="kra-score-select-wrapper">
            <DynamicDropdown
              id="kra-from-month"
              value={
                filters.fromMonth
              }
              placeholder="Select Month"
              options={
                fromMonthOptions
              }
              ariaLabel="Select From Month"
              icon={
                <CalendarDays
                  size={16}
                  strokeWidth={1.7}
                />
              }
              onChange={(value) =>
                handleChange(
                  'fromMonth',
                  value,
                )
              }
            />
          </div>
        </div>

        {/* ===============================================
            TO MONTH
            =============================================== */}

        <div className="kra-score-filter-group">
          <label
            htmlFor="kra-to-month"
            className="kra-score-filter-label"
          >
            To Month
          </label>

          <div className="kra-score-select-wrapper">
            <DynamicDropdown
  id="kra-to-month"
  value={filters.toMonth}
  placeholder="Select Month"
  options={toMonthOptions}
  ariaLabel="Select To Month"
  icon={
    <CalendarDays
      size={16}
      strokeWidth={1.7}
    />
  }
  onChange={(value) =>
    handleChange(
      'toMonth',
      value,
    )
  }
/>
          </div>
        </div>

        {/* ===============================================
            YEAR
            =============================================== */}

        <div className="kra-score-filter-group">
          <label
            htmlFor="kra-year"
            className="kra-score-filter-label"
          >
            Year
          </label>

          <div className="kra-score-select-wrapper">
            <DynamicDropdown
              id="kra-year"
              value={filters.year}
              placeholder="Select Year"
              options={
                yearOptions
              }
              ariaLabel="Select Year"
              icon={
                <CalendarDays
                  size={16}
                  strokeWidth={1.7}
                />
              }
              onChange={(value) =>
                handleChange(
                  'year',
                  value,
                )
              }
            />
          </div>
        </div>
      </div>

      {/* =================================================
          ACTIONS
          ================================================= */}

      <div className="kra-score-filter-actions">

        {/* RESET */}

        <button
          type="button"
          className="kra-score-filter-btn kra-score-filter-reset"
          onClick={
            handleReset
          }
        >
          <RotateCcw
            size={15}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <span>
            Reset
          </span>
        </button>

        {/* APPLY */}

        <button
          type="button"
          className="kra-score-filter-btn kra-score-filter-apply"
          onClick={
            handleApplyFilters
          }
        >
          <Filter
            size={15}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <span>
            Apply Filters
          </span>
        </button>
      </div>
    </section>
  );
};

export default KraFilters;