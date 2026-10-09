import {
  Tag,
} from "lucide-react";

import "./EmailSubjectInput.css";

interface EmailSubjectInputProps {
  value: string;
  error?: string;
  onChange: (
    value: string,
  ) => void;
}

export const EmailSubjectInput =
  ({
    value,
    error,
    onChange,
  }: EmailSubjectInputProps): JSX.Element => {
    return (
      <div className="resignation-subject-field">
        <label htmlFor="resignation-subject">
          Subject <span>*</span>
        </label>

        <div
          className={`resignation-subject-control ${
            error
              ? "resignation-subject-control--error"
              : ""
          }`}
        >
          <Tag size={18} />

          <input
            id="resignation-subject"
            type="text"
            value={value}
            onChange={(event) =>
              onChange(event.target.value)
            }
            placeholder="Enter email subject"
            maxLength={200}
          />
        </div>

        <small>
          Give a clear subject for the email
        </small>

        {error && (
          <div className="resignation-subject-error">
            {error}
          </div>
        )}
      </div>
    );
  };