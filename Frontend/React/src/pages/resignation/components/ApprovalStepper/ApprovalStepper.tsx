import React from 'react';
import { Check, Minus, X, User } from 'lucide-react';
import './ApprovalStepper.css';

// ============================================================
// PROPS
// ============================================================

export interface ApprovalStepperProps {
  /**
   * Approval workflow step labels.
   *
   * Example:
   * ['Employee', 'Manager', 'HR']
   */
  steps: string[];

  /**
   * Zero-based index of the current workflow step.
   *
   * Example:
   * 0 = Employee
   * 1 = Manager
   * 2 = HR
   */
  currentStep: number;

  /**
   * Overall resignation status.
   */
  status?:
    | 'Pending'
    | 'Pending RM Approval'
    | 'Pending HR Approval'
    | 'Approved'
    | 'Rejected'
    | 'Withdrawn';
}

// ============================================================
// STEP STATE
// ============================================================

type StepState =
  | 'completed'
  | 'current'
  | 'rejected'
  | 'pending';

/**
 * Determines the visual state of an individual approval step.
 */
const getStepStateClass = (
  index: number,
  currentStep: number,
  overallStatus?: ApprovalStepperProps['status']
): StepState => {
  // ----------------------------------------------------------
  // REJECTED
  // ----------------------------------------------------------

  if (overallStatus === 'Rejected') {
    return index === currentStep ? 'rejected' : 'pending';
  }

  // ----------------------------------------------------------
  // APPROVED / WITHDRAWN
  // ----------------------------------------------------------

  if (
    overallStatus === 'Approved' ||
    overallStatus === 'Withdrawn'
  ) {
    return index <= currentStep
      ? 'completed'
      : 'pending';
  }

  // ----------------------------------------------------------
  // NORMAL WORKFLOW
  // ----------------------------------------------------------

  if (index < currentStep) {
    return 'completed';
  }

  if (index === currentStep) {
    return 'current';
  }

  return 'pending';
};

// ============================================================
// STEP ICON
// ============================================================

const StepIcon: React.FC<{
  state: StepState;
}> = ({ state }) => {
  switch (state) {
    case 'completed':
      return (
        <Check
          size={15}
          strokeWidth={2.5}
          aria-hidden="true"
        />
      );

    case 'rejected':
      return (
        <X
          size={15}
          strokeWidth={2.5}
          aria-hidden="true"
        />
      );

    case 'current':
      return (
        <User
          size={14}
          strokeWidth={2}
          aria-hidden="true"
        />
      );

    case 'pending':
    default:
      return (
        <Minus
          size={15}
          strokeWidth={2}
          aria-hidden="true"
        />
      );
  }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const ApprovalStepper: React.FC<ApprovalStepperProps> = React.memo(
  ({
    steps,
    currentStep,
    status,
  }) => {
    // ----------------------------------------------------------
    // Safety
    // ----------------------------------------------------------

    if (!steps || steps.length === 0) {
      return null;
    }

    return (
      <div
        className="resignation-approval-stepper"
        role="list"
        aria-label="Approval workflow"
      >
        {steps.map((label, index) => {
          const state = getStepStateClass(
            index,
            currentStep,
            status
          );

          const isLastStep =
            index === steps.length - 1;

          return (
            <React.Fragment key={`${label}-${index}`}>
              {/* ==================================================
                  STEP CIRCLE
                  ================================================== */}

              <div
                className={`resignation-approval-step resignation-approval-step--${state}`}
                role="listitem"
                aria-label={`${label}: ${state}`}
              >
                <div
                  className="resignation-approval-circle"
                  title={`${label}: ${state}`}
                >
                  <StepIcon state={state} />
                </div>
              </div>

              {/* ==================================================
                  CONNECTOR
                  ================================================== */}

              {!isLastStep && (
                <div
                  className={`resignation-approval-connector ${
                    state === 'completed'
                      ? 'resignation-approval-connector--completed'
                      : ''
                  }`}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
);

ApprovalStepper.displayName = 'ApprovalStepper';

export default ApprovalStepper;