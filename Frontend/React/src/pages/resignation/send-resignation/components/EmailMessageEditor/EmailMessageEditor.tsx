import {
  MessageSquare,
} from "lucide-react";

import "./EmailMessageEditor.css";

interface EmailMessageEditorProps {
  value: string;
  error?: string;
  onChange: (
    value: string,
  ) => void;
}

export const EmailMessageEditor =
  ({
    value,
    error,
    onChange,
  }: EmailMessageEditorProps): JSX.Element => {
    return (
      <div className="resignation-message-field">
        <label htmlFor="resignation-message">
          Message <span>*</span>
        </label>

        <div
          className={`resignation-message-editor ${
            error
              ? "resignation-message-editor--error"
              : ""
          }`}
        >
          <div className="resignation-message-toolbar">
            <span>Message</span>
            <MessageSquare size={16} />
          </div>

          <textarea
            id="resignation-message"
            value={value}
            onChange={(event) =>
              onChange(event.target.value)
            }
            placeholder="Write your resignation message..."
            maxLength={5000}
          />
        </div>

        <div className="resignation-message-footer">
          <small>
            Write the message to be sent to the
            employee.
          </small>

          <span>
            {value.length} / 5000
          </span>
        </div>

        {error && (
          <div className="resignation-message-error">
            {error}
          </div>
        )}
      </div>
    );
  };