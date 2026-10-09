import {
  CheckCircle2,
  MailPlus,
  AlertCircle,
} from "lucide-react";

import type {
  ActiveEmployee,
  ResignationEmailErrors,
  ResignationEmailFormData,
} from "../../types/sendResignation.types";

import { EmployeeEmailSelect } from "../EmployeeEmailSelect/EmployeeEmailSelect";
import { EmailSubjectInput } from "../EmailSubjectInput/EmailSubjectInput";
import { EmailMessageEditor } from "../EmailMessageEditor/EmailMessageEditor";
import { AttachmentUploader } from "../AttachmentUploader/AttachmentUploader";
import { AttachedFilesList } from "../AttachedFilesList/AttachedFilesList";
import { SendResignationActions } from "../SendResignationActions/SendResignationActions";

import "./ResignationEmailCard.css";

interface ResignationEmailCardProps {
  employees: ActiveEmployee[];
  formData: ResignationEmailFormData;
  errors: ResignationEmailErrors;
  isLoadingEmployees: boolean;
  isSubmitting: boolean;
  isSuccess: boolean;
  submitError: string | null;
  onEmployeeChange: (
    employeeId: number | null,
    email: string,
  ) => void;
  onFieldChange: (
    field:
      | "employeeEmail"
      | "subject"
      | "body",
    value: string,
  ) => void;
  onFilesSelected: (
    files: File[],
  ) => void;
  onRemoveFile: (
    index: number,
  ) => void;
  onClearFiles: () => void;
  onCancel: () => void;
  onSend: () => void;
}

export const ResignationEmailCard =
  ({
    employees,
    formData,
    errors,
    isLoadingEmployees,
    isSubmitting,
    isSuccess,
    submitError,
    onEmployeeChange,
    onFieldChange,
    onFilesSelected,
    onRemoveFile,
    onClearFiles,
    onCancel,
    onSend,
  }: ResignationEmailCardProps): JSX.Element => {
    return (
      <section className="resignation-email-card">
        <div className="resignation-info-banner">
          <div className="resignation-info-icon">
            <MailPlus size={30} />
          </div>

          <div>
            <strong>
              Send resignation email to employee
            </strong>

            <p>
              Enter the employee's email, add
              subject, message and attach
              documents if required. The email
              will be sent directly to the
              employee.
            </p>
          </div>
        </div>

        {submitError && (
          <div className="resignation-alert resignation-alert--error">
            <AlertCircle size={18} />
            <span>{submitError}</span>
          </div>
        )}

        {isSuccess && (
          <div className="resignation-alert resignation-alert--success">
            <CheckCircle2 size={18} />
            <span>
              Resignation email sent successfully
              to {formData.employeeEmail}.
            </span>
          </div>
        )}

        <div className="resignation-email-grid">
          <EmployeeEmailSelect
            employees={employees}
            value={formData.employeeEmail}
            error={errors.employeeEmail}
            loading={isLoadingEmployees}
            onChange={
              onEmployeeChange
            }
          />

          <EmailSubjectInput
            value={formData.subject}
            error={errors.subject}
            onChange={(value) =>
              onFieldChange(
                "subject",
                value,
              )
            }
          />
        </div>

        <EmailMessageEditor
          value={formData.body}
          error={errors.body}
          onChange={(value) =>
            onFieldChange(
              "body",
              value,
            )
          }
        />

        <div className="resignation-attachments-section">
          <div className="resignation-attachments-heading">
            <div>
              <h3>
                Attach Documents
                <span>
                  Optional
                </span>
              </h3>

              <p>
                You can attach multiple
                PDF, DOC, DOCX or image
                files.
              </p>
            </div>
          </div>

          <div className="resignation-attachments-grid">
            <AttachmentUploader
              onFilesSelected={
                onFilesSelected
              }
            />

            <AttachedFilesList
              files={
                formData.attachments
              }
              error={
                errors.attachments
              }
              onRemove={
                onRemoveFile
              }
              onClear={
                onClearFiles
              }
            />
          </div>
        </div>

        <SendResignationActions
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          onSend={onSend}
        />
      </section>
    );
  };