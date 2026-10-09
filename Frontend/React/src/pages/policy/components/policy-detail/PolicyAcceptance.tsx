import { Check, Mail } from 'lucide-react';
import './PolicyAcceptance.css';

interface PolicyAcceptanceProps {
  isConfirmed: boolean;
  isSubmitting?: boolean;
  isAccepted?: boolean;
  onConfirmationChange: (checked: boolean) => void;
  onAccept: () => void;
}

const PolicyAcceptance = ({
  isConfirmed,
  isSubmitting = false,
  isAccepted = false,
  onConfirmationChange,
  onAccept,
}: PolicyAcceptanceProps): JSX.Element => {
  const isButtonDisabled =
    !isConfirmed || isSubmitting || isAccepted;

  return (
    <section
      className="policy-acceptance-card"
      aria-labelledby="policy-acceptance-title"
    >
      <div className="policy-acceptance-main">
        <label className="policy-acceptance-checkbox-wrapper">
          <input
            type="checkbox"
            className="policy-acceptance-checkbox"
            checked={isConfirmed}
            disabled={isSubmitting || isAccepted}
            onChange={(event) =>
              onConfirmationChange(event.target.checked)
            }
          />

          <span className="policy-acceptance-content">
            <span
              id="policy-acceptance-title"
              className="policy-acceptance-title"
            >
              I have read and understood all the above policies.
            </span>

            <span className="policy-acceptance-description">
              By accepting, you agree to follow and comply with the company
              policies.
            </span>
          </span>
        </label>

        <button
          type="button"
          className="policy-acceptance-button"
          disabled={isButtonDisabled}
          onClick={onAccept}
        >
          <Check size={17} strokeWidth={2} />

          <span>
            {isSubmitting
              ? 'Accepting...'
              : isAccepted
                ? 'Policies Accepted'
                : 'Accept Policies'}
          </span>
        </button>
      </div>

      <div className="policy-acceptance-notification">
        <Mail
          className="policy-acceptance-mail-icon"
          size={17}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        <span>
          {isAccepted
            ? 'Your policy acceptance has been recorded successfully.'
            : 'An email will be sent to you once you accept the policies.'}
        </span>
      </div>
    </section>
  );
};

export default PolicyAcceptance;