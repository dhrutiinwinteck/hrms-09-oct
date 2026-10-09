import {
  Loader2,
  Send,
  X,
} from "lucide-react";

import "./SendResignationActions.css";

interface SendResignationActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onSend: () => void;
}

export const SendResignationActions =
  ({
    isSubmitting,
    onCancel,
    onSend,
  }: SendResignationActionsProps): JSX.Element => {
    return (
      <div className="send-resignation-actions">
        <button
          type="button"
          className="send-resignation-cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X size={17} />
          Cancel
        </button>

        <button
          type="button"
          className="send-resignation-submit"
          onClick={onSend}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2
                size={17}
                className="send-resignation-spinner"
              />
              Sending...
            </>
          ) : (
            <>
              <Send size={17} />
              Send Resignation
            </>
          )}
        </button>
      </div>
    );
  };