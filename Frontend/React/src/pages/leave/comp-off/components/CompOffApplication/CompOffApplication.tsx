import {
  CalendarDays,
  CheckCircle2,
  CloudUpload,
  FileText,
  X,
} from 'lucide-react';

import {
  useRef,
  useState,
} from 'react';

import type {
  CompOffDayType,
  CreateCompOffRequest,
} from '../../types/compOff.types';

import {
  COMP_OFF_ALLOWED_FILE_EXTENSIONS,
  COMP_OFF_MAX_FILE_SIZE,
  COMP_OFF_REASON_MAX_LENGTH,
} from '../../constants/compOff.constants';

import {
  validateCompOffRequest,
} from '../../validations/compOff.schema';

interface CompOffApplicationProps {
  submitting: boolean;
  onSubmitted: () => void;
  onSubmit: (
    values: CreateCompOffRequest,
  ) => Promise<void>;
}

const CompOffApplication = ({
  submitting,
  onSubmitted,
  onSubmit,
}: CompOffApplicationProps) => {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [workedDate, setWorkedDate] =
    useState('');

  const [dayType, setDayType] =
    useState<CompOffDayType>(
      'PUBLIC_HOLIDAY',
    );

  const [reason, setReason] =
    useState('');

  const [attachment, setAttachment] =
    useState<File | null>(null);

  const [errors, setErrors] =
    useState<
      Record<string, string>
    >({});

  const [successMessage, setSuccessMessage] =
    useState('');

  const handleFileChange = (
    file?: File,
  ) => {
    if (!file) {
      return;
    }

    if (file.size > COMP_OFF_MAX_FILE_SIZE) {
      setErrors({
        attachment:
          'File size cannot exceed 5 MB.',
      });
      return;
    }

    setAttachment(file);

    setErrors((previous) => {
      const next = {
        ...previous,
      };

      delete next.attachment;

      return next;
    });
  };

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setSuccessMessage('');

    const payload: CreateCompOffRequest = {
      workedDate,
      dayType,
      reason,
      attachment,
    };

    const validationErrors =
      validateCompOffRequest(payload);

    if (
      Object.keys(validationErrors)
        .length > 0
    ) {
      setErrors(
        validationErrors as Record<
          string,
          string
        >,
      );

      return;
    }

    setErrors({});

    try {
      await onSubmit(payload);

      setWorkedDate('');
      setDayType('PUBLIC_HOLIDAY');
      setReason('');
      setAttachment(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setSuccessMessage(
        'Comp Off request submitted successfully.',
      );

      onSubmitted();
    } catch {
      setErrors({
        form:
          'Unable to submit the request. Please try again.',
      });
    }
  };

  const characterCount = reason.length;

  return (
    <div
      id="comp-off-application"
      className="comp-off-application-card"
    >
      <div className="comp-off-application-header">
        <div className="application-header-icon">
          <CalendarDays size={20} />
        </div>

        <h2>Apply for Comp Off</h2>
      </div>

      <form
        className="comp-off-application-form"
        onSubmit={handleSubmit}
      >
        {errors.form && (
          <div className="comp-off-form-error">
            {errors.form}
          </div>
        )}

        {successMessage && (
          <div className="comp-off-form-success">
            <CheckCircle2 size={16} />
            {successMessage}
          </div>
        )}

        <div className="application-row">
          <div className="application-field">
            <label>
              Worked Date
              <span>*</span>
            </label>

            <div className="application-date-field">
              <input
                type="date"
                value={workedDate}
                onChange={(event) =>
                  setWorkedDate(
                    event.target.value,
                  )
                }
              />

              <CalendarDays size={16} />
            </div>

            {errors.workedDate && (
              <small>
                {errors.workedDate}
              </small>
            )}
          </div>

          <div className="application-field">
            <label>
              Day Type
              <span>*</span>
            </label>

            <div className="day-type-options">
              <label className="radio-option">
                <input
                  type="radio"
                  name="dayType"
                  value="PUBLIC_HOLIDAY"
                  checked={
                    dayType ===
                    'PUBLIC_HOLIDAY'
                  }
                  onChange={() =>
                    setDayType(
                      'PUBLIC_HOLIDAY',
                    )
                  }
                />

                <span className="custom-radio" />

                Public Holiday
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="dayType"
                  value="WEEK_OFF"
                  checked={
                    dayType === 'WEEK_OFF'
                  }
                  onChange={() =>
                    setDayType('WEEK_OFF')
                  }
                />

                <span className="custom-radio" />

                Week Off
              </label>
            </div>
          </div>
        </div>

        <div className="application-field">
          <label>
            Reason
            <span>*</span>
          </label>

          <textarea
            value={reason}
            maxLength={
              COMP_OFF_REASON_MAX_LENGTH
            }
            placeholder="Enter reason for working on holiday/week off..."
            onChange={(event) =>
              setReason(
                event.target.value,
              )
            }
          />

          <div className="reason-counter">
            {characterCount}/
            {COMP_OFF_REASON_MAX_LENGTH}
          </div>

          {errors.reason && (
            <small>
              {errors.reason}
            </small>
          )}
        </div>

        <div className="application-field">
          <label>
            Attach Supporting Proof
            <span className="optional">
              (Optional)
            </span>
          </label>

          <div
            className="comp-off-upload"
            onClick={() =>
              fileInputRef.current?.click()
            }
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDrop={(event) => {
              event.preventDefault();
              handleFileChange(
                event.dataTransfer.files?.[0],
              );
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept={COMP_OFF_ALLOWED_FILE_EXTENSIONS.join(
                ',',
              )}
              onChange={(event) =>
                handleFileChange(
                  event.target.files?.[0],
                )
              }
            />

            <CloudUpload size={36} />

            <strong>
              Drag & drop files here or
            </strong>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Choose Files
            </button>

            <span>
              PDF, JPG, PNG (Max 5 MB)
            </span>
          </div>

          {attachment && (
            <div className="selected-file">
              <div>
                <FileText size={16} />

                <span>
                  {attachment.name}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAttachment(null);

                  if (
                    fileInputRef.current
                  ) {
                    fileInputRef.current.value =
                      '';
                  }
                }}
              >
                <X size={15} />
              </button>
            </div>
          )}

          {errors.attachment && (
            <small>
              {errors.attachment}
            </small>
          )}
        </div>

        <div className="application-actions">
          <button
            type="button"
            className="application-cancel-button"
            disabled={submitting}
            onClick={() => {
              setWorkedDate('');
              setDayType(
                'PUBLIC_HOLIDAY',
              );
              setReason('');
              setAttachment(null);
              setErrors({});
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="application-submit-button"
            disabled={submitting}
          >
            {submitting
              ? 'Submitting...'
              : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompOffApplication;