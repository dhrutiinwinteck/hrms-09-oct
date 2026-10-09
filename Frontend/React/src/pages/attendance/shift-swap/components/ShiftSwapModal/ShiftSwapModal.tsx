import {
  CalendarDays,
  ChevronDown,
  Send,
  UserRound,
  X,
} from 'lucide-react';

import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

import type {
  CreateShiftSwapRequest,
  Employee,
} from '../../types/shiftSwap.types';

import './ShiftSwapModal.css';

interface ShiftSwapModalProps {
  isOpen: boolean;

  employees: Employee[];

  submitting: boolean;

  employeeLoading: boolean;

  onLoadEligibleEmployees: (
    swapDate: string,
  ) => Promise<void>;

  onClose: () => void;

  onSubmit: (
    payload: CreateShiftSwapRequest,
  ) => Promise<void>;
}

const ShiftSwapModal = ({
  isOpen,
  employees,
  submitting,
  employeeLoading,
  onLoadEligibleEmployees,
  onClose,
  onSubmit,
}: ShiftSwapModalProps) => {
  const [requestType, setRequestType] =
    useState<CreateShiftSwapRequest['requestType']>(
      'Specific Day',
    );

  const [swapDate, setSwapDate] =
    useState<string>('');

  const [requestedToId, setRequestedToId] =
    useState<string>('');

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setRequestType('Specific Day');

      setSwapDate('');

      setRequestedToId('');

      setError(null);

      return;
    }

    setRequestType('Specific Day');

    setSwapDate('');

    setRequestedToId('');

    setError(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === 'Escape' &&
        !submitting
      ) {
        onClose();
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
  }, [
    isOpen,
    onClose,
    submitting,
  ]);

  if (!isOpen) {
    return null;
  }

  const handleDateChange = async (
    value: string,
  ) => {
    setSwapDate(value);

    setRequestedToId('');

    setError(null);

    if (!value) {
      return;
    }

    try {
      await onLoadEligibleEmployees(
        value,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load eligible employees.',
      );
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!swapDate) {
      setError(
        'Please select a swap date.',
      );

      return;
    }

    if (!requestedToId) {
      setError(
        'Please select an employee to swap with.',
      );

      return;
    }

    try {
      setError(null);

      await onSubmit({
        requestType: 'Specific Day',

        swapDate,

        requestedToId,
      });

      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit the request. Please try again.',
      );
    }
  };

  return (
    <div
      className="shift-swap-modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !submitting
        ) {
          onClose();
        }
      }}
    >
      <div
        className="shift-swap-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shift-swap-modal-title"
      >
        <div className="shift-swap-modal__header">
          <div>
            <h2 id="shift-swap-modal-title">
              New Shift Swap Request
            </h2>

            <p className="shift-swap-modal__subtitle">
              Create a new employee shift swap request.
            </p>
          </div>

          <button
            type="button"
            className="shift-swap-modal__close"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="shift-swap-modal__illustration">
          <div className="shift-swap-modal__calendar">
            <div className="shift-swap-modal__calendar-top" />

            <CalendarDays size={35} />
          </div>

          <div className="shift-swap-modal__clock">
            <div className="shift-swap-modal__clock-hand" />
          </div>

          <span className="shift-swap-modal__leaf shift-swap-modal__leaf--left">
            ❯
          </span>

          <span className="shift-swap-modal__leaf shift-swap-modal__leaf--right">
            ❮
          </span>
        </div>

        <form
          className="shift-swap-modal__form"
          onSubmit={handleSubmit}
        >
          <div className="shift-swap-modal__field">
            <label htmlFor="request-type">
              Request Type
            </label>

            <div className="shift-swap-modal__select-wrapper">
              <UserRound size={15} />

              <select
                id="request-type"
                value={requestType}
                onChange={(event) =>
                  setRequestType(
                    event.target.value as CreateShiftSwapRequest['requestType'],
                  )
                }
                disabled={submitting}
              >
                <option value="Specific Day">
                  Specific Day
                </option>
              </select>

              <ChevronDown
                className="shift-swap-modal__select-icon"
                size={15}
              />
            </div>
          </div>

          <div className="shift-swap-modal__field">
            <label htmlFor="swap-date">
              Select Date
            </label>

            <div className="shift-swap-modal__date-wrapper">
              <CalendarDays size={15} />

              <input
                id="swap-date"
                type="date"
                value={swapDate}
                onChange={(event) =>
                  void handleDateChange(
                    event.target.value,
                  )
                }
                disabled={submitting}
              />
            </div>
          </div>

          <div className="shift-swap-modal__field">
            <label htmlFor="requested-to">
              Select Employee to Swap With
            </label>

            <div className="shift-swap-modal__select-wrapper">
              <UserRound size={15} />

              <select
                id="requested-to"
                value={requestedToId}
                onChange={(event) =>
                  setRequestedToId(
                    event.target.value,
                  )
                }
                disabled={
                  submitting ||
                  !swapDate ||
                  employeeLoading
                }
              >
                <option value="">
                  {!swapDate
                    ? '-- Select Date First --'
                    : employeeLoading
                      ? 'Loading eligible employees...'
                      : employees.length === 0
                        ? '-- No Eligible Employees --'
                        : '-- Select Employee --'}
                </option>

                {employees.map(
                  (employee) => (
                    <option
                      key={employee.id}
                      value={employee.id}
                    >
                      {employee.name}
                      {employee.employeeCode
                        ? ` — ${employee.employeeCode}`
                        : ''}
                    </option>
                  ),
                )}
              </select>

              <ChevronDown
                className="shift-swap-modal__select-icon"
                size={15}
              />
            </div>
          </div>

          <div className="shift-swap-modal__notice">
            <span className="shift-swap-modal__notice-icon">
              i
            </span>

            <p>
              A notification email will be sent to the selected employee once you submit the request.
            </p>
          </div>

          {error && (
            <p className="shift-swap-modal__error">
              {error}
            </p>
          )}

          <div className="shift-swap-modal__actions">
            <button
              type="submit"
              className="shift-swap-modal__submit"
              disabled={
                submitting ||
                employeeLoading
              }
            >
              <Send size={14} />

              <span>
                {submitting
                  ? 'Submitting...'
                  : 'Submit Request'}
              </span>
            </button>

            <button
              type="button"
              className="shift-swap-modal__cancel"
              onClick={onClose}
              disabled={submitting}
            >
              <X size={14} />

              <span>Cancel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShiftSwapModal;