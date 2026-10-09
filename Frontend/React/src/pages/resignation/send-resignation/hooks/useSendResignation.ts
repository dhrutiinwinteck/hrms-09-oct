import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  SEND_RESIGNATION_CONSTANTS,
} from "../constants/sendResignation.constants";

import {
  getActiveEmployees,
  sendResignationEmail,
} from "../services/sendResignation.service";

import type {
  ActiveEmployee,
  ResignationEmailErrors,
  ResignationEmailFormData,
  ResignationEmailResponse,
} from "../types/sendResignation.types";

import {
  isSendResignationFormValid,
  validateSendResignationForm,
} from "../validations/sendResignation.schema";

import {
  isAttachmentSizeValid,
  isAllowedAttachment,
} from "../utils/sendResignation.utils";

interface UseSendResignationReturn {
  employees: ActiveEmployee[];

  formData: ResignationEmailFormData;

  errors: ResignationEmailErrors;

  isLoadingEmployees: boolean;

  isSubmitting: boolean;

  isSuccess: boolean;

  submitError: string | null;

  response: ResignationEmailResponse | null;

  updateEmployee: (
    employeeId: number | null,
    email: string,
  ) => void;

  updateField: (
    field:
      | "subject"
      | "body"
      | "employeeEmail",
    value: string,
  ) => void;

  addAttachments: (
    files: File[],
  ) => void;

  removeAttachment: (
    index: number,
  ) => void;

  clearAttachments: () => void;

  validate: () => boolean;

  submit: () => Promise<boolean>;

  reset: () => void;
}

const createInitialFormData =
  (): ResignationEmailFormData => ({
    employeeId: null,
    employeeEmail: "",
    subject:
      SEND_RESIGNATION_CONSTANTS.FORM
        .DEFAULT_SUBJECT,
    body:
      SEND_RESIGNATION_CONSTANTS.FORM
        .DEFAULT_MESSAGE,
    attachments: [],
  });

export const useSendResignation =
  (): UseSendResignationReturn => {
    const [employees, setEmployees] =
      useState<ActiveEmployee[]>([]);

    const [formData, setFormData] =
      useState<ResignationEmailFormData>(
        createInitialFormData(),
      );

    const [errors, setErrors] =
      useState<ResignationEmailErrors>({});

    const [
      isLoadingEmployees,
      setIsLoadingEmployees,
    ] = useState(false);

    const [isSubmitting, setIsSubmitting] =
      useState(false);

    const [isSuccess, setIsSuccess] =
      useState(false);

    const [submitError, setSubmitError] =
      useState<string | null>(null);

    const [response, setResponse] =
      useState<ResignationEmailResponse | null>(
        null,
      );

    const loadEmployees =
      useCallback(async (): Promise<void> => {
        setIsLoadingEmployees(true);
        setSubmitError(null);

        try {
          const result =
            await getActiveEmployees();

          setEmployees(result);
        } catch (error: unknown) {
          setSubmitError(
            error instanceof Error
              ? error.message
              : SEND_RESIGNATION_CONSTANTS
                  .MESSAGES
                  .ACTIVE_EMPLOYEES_ERROR,
          );
        } finally {
          setIsLoadingEmployees(false);
        }
      }, []);

    useEffect(() => {
      void loadEmployees();
    }, [loadEmployees]);

    const updateEmployee = useCallback(
      (
        employeeId: number | null,
        email: string,
      ): void => {
        setFormData((previous) => ({
          ...previous,
          employeeId,
          employeeEmail: email,
        }));

        setErrors((previous) => ({
          ...previous,
          employeeEmail: undefined,
        }));

        setIsSuccess(false);
        setSubmitError(null);
      },
      [],
    );

    const updateField = useCallback(
      (
        field:
          | "subject"
          | "body"
          | "employeeEmail",
        value: string,
      ): void => {
        setFormData((previous) => ({
          ...previous,
          [field]: value,
          ...(field === "employeeEmail"
            ? {
                employeeId:
                  employees.find(
                    (employee) =>
                      employee.email
                        .toLowerCase() ===
                      value
                        .trim()
                        .toLowerCase(),
                  )?.employee_id ?? null,
              }
            : {}),
        }));

        setErrors((previous) => ({
          ...previous,
          [field]: undefined,
        }));

        setIsSuccess(false);
        setSubmitError(null);
      },
      [employees],
    );

    const addAttachments = useCallback(
      (files: File[]): void => {
        const invalidFile =
          files.find(
            (file) =>
              !isAllowedAttachment(file) ||
              !isAttachmentSizeValid(file),
          );

        if (invalidFile) {
          if (!isAllowedAttachment(invalidFile)) {
            setErrors((previous) => ({
              ...previous,
              attachments:
                `${invalidFile.name}: ${SEND_RESIGNATION_CONSTANTS.MESSAGES.INVALID_FILE}`,
            }));
          } else {
            setErrors((previous) => ({
              ...previous,
              attachments:
                `${invalidFile.name}: ${SEND_RESIGNATION_CONSTANTS.MESSAGES.FILE_TOO_LARGE}`,
            }));
          }

          return;
        }

        setFormData((previous) => ({
          ...previous,
          attachments: [
            ...previous.attachments,
            ...files,
          ],
        }));

        setErrors((previous) => ({
          ...previous,
          attachments: undefined,
        }));
      },
      [],
    );

    const removeAttachment =
      useCallback((index: number): void => {
        setFormData((previous) => ({
          ...previous,
          attachments:
            previous.attachments.filter(
              (_, fileIndex) =>
                fileIndex !== index,
            ),
        }));

        setErrors((previous) => ({
          ...previous,
          attachments: undefined,
        }));
      }, []);

    const clearAttachments =
      useCallback((): void => {
        setFormData((previous) => ({
          ...previous,
          attachments: [],
        }));

        setErrors((previous) => ({
          ...previous,
          attachments: undefined,
        }));
      }, []);

    const validate =
      useCallback((): boolean => {
        const validationErrors =
          validateSendResignationForm(
            formData,
          );

        setErrors(validationErrors);

        return isSendResignationFormValid(
          validationErrors,
        );
      }, [formData]);

    const submit =
      useCallback(async (): Promise<boolean> => {
        setSubmitError(null);
        setIsSuccess(false);
        setResponse(null);

        const validationErrors =
          validateSendResignationForm(
            formData,
          );

        setErrors(validationErrors);

        if (
          !isSendResignationFormValid(
            validationErrors,
          )
        ) {
          return false;
        }

        setIsSubmitting(true);

        try {
          const result =
            await sendResignationEmail({
              employeeId:
                formData.employeeId,
              employeeEmail:
                formData.employeeEmail,
              subject: formData.subject,
              body: formData.body,
              attachments:
                formData.attachments,
            });

          setResponse(result);
          setIsSuccess(true);

          return true;
        } catch (error: unknown) {
          setSubmitError(
            error instanceof Error
              ? error.message
              : SEND_RESIGNATION_CONSTANTS
                  .MESSAGES.SEND_ERROR,
          );

          return false;
        } finally {
          setIsSubmitting(false);
        }
      }, [formData]);

    const reset = useCallback((): void => {
      setFormData(createInitialFormData());
      setErrors({});
      setIsSubmitting(false);
      setIsSuccess(false);
      setSubmitError(null);
      setResponse(null);
    }, []);

    return useMemo(
      () => ({
        employees,
        formData,
        errors,
        isLoadingEmployees,
        isSubmitting,
        isSuccess,
        submitError,
        response,
        updateEmployee,
        updateField,
        addAttachments,
        removeAttachment,
        clearAttachments,
        validate,
        submit,
        reset,
      }),
      [
        employees,
        formData,
        errors,
        isLoadingEmployees,
        isSubmitting,
        isSuccess,
        submitError,
        response,
        updateEmployee,
        updateField,
        addAttachments,
        removeAttachment,
        clearAttachments,
        validate,
        submit,
        reset,
      ],
    );
  };