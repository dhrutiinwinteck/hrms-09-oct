import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  LEAVE_TYPE_OPTIONS,
  calculateLeaveDays,
} from "../../constants/leave.constants";
import type { LeaveType as BackendLeaveType } from "../../types/leave.types";
import "./LeaveApplyForm.css";
/* ========================================================= TYPES ========================================================= */ export type LeaveType =
  BackendLeaveType | "";
export interface LeaveApplicationFormValues {
  fromDate: string;
  toDate: string;
  halfDay: boolean;
  leaveType: LeaveType;
  numberOfDays: number;
  reason: string;
}
interface LeaveApplyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (values: LeaveApplicationFormValues) => void | Promise<void>;
}
/* ========================================================= CONSTANTS ========================================================= */ const INITIAL_FORM_VALUES: LeaveApplicationFormValues =
  {
    fromDate: "",
    toDate: "",
    halfDay: false,
    leaveType: "",
    numberOfDays: 0,
    reason: "",
  };
/* ========================================================= COMPONENT ========================================================= */ const LeaveApplyForm: React.FC<
  LeaveApplyFormProps
> = ({ isOpen, onClose, onSubmit }) => {
  const [formValues, setFormValues] =
    useState<LeaveApplicationFormValues>(INITIAL_FORM_VALUES);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  /* ======================================================= NUMBER OF DAYS ======================================================= */ const calculatedDays =
    useMemo(() => {
      if (!formValues.fromDate || !formValues.toDate) {
        return 0;
      }
      return calculateLeaveDays(
        formValues.fromDate,
        formValues.toDate,
        formValues.halfDay,
      );
    }, [formValues.fromDate, formValues.toDate, formValues.halfDay]);
  /* ======================================================= SYNC CALCULATED DAYS ======================================================= */ useEffect(() => {
    setFormValues((current) => {
      if (current.numberOfDays === calculatedDays) {
        return current;
      }
      return { ...current, numberOfDays: calculatedDays };
    });
  }, [calculatedDays]);
  /* ======================================================= RESET WHEN MODAL OPENS ======================================================= */ useEffect(() => {
    if (!isOpen) {
      return;
    }
    setFormValues(INITIAL_FORM_VALUES);
    setErrorMessage("");
    setSubmitting(false);
  }, [isOpen]);
  /* ======================================================= ESC CLOSE ======================================================= */ useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, submitting]);
  /* ======================================================= LOCK BODY SCROLL ======================================================= */ useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);
  /* ======================================================= INPUT CHANGE ======================================================= */ const handleInputChange =
    (
      event:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLSelectElement>
        | React.ChangeEvent<HTMLTextAreaElement>,
    ): void => {
      const { name, value } = event.target;
      setErrorMessage("");
      /* ===================================================== HALF DAY ===================================================== */ if (
        name === "halfDay"
      ) {
        const isHalfDay = value === "yes";
        setFormValues((current) => ({
          ...current,
          halfDay: isHalfDay,
          numberOfDays: isHalfDay ? 0.5 : calculatedDays,
        }));
        return;
      }
      /* ===================================================== LEAVE TYPE ===================================================== */ if (
        name === "leaveType"
      ) {
        setFormValues((current) => ({
          ...current,
          leaveType: value as BackendLeaveType,
        }));
        return;
      }
      /* ===================================================== OTHER INPUTS ===================================================== */ setFormValues(
        (current) => ({ ...current, [name]: value }),
      );
    };
  /* ======================================================= VALIDATION ======================================================= */ const validateForm =
    (): boolean => {
      if (!formValues.fromDate) {
        setErrorMessage("Please select the From date.");
        return false;
      }
      if (!formValues.toDate) {
        setErrorMessage("Please select the To date.");
        return false;
      }
      const fromDate = new Date(`${formValues.fromDate}T00:00:00`);
      const toDate = new Date(`${formValues.toDate}T00:00:00`);
      if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
        setErrorMessage("Please select valid leave dates.");
        return false;
      }
      if (toDate < fromDate) {
        setErrorMessage("To date cannot be earlier than From date.");
        return false;
      }
      if (!formValues.leaveType) {
        setErrorMessage("Please select a Leave Type.");
        return false;
      }
      if (
        !LEAVE_TYPE_OPTIONS.includes(formValues.leaveType as BackendLeaveType)
      ) {
        setErrorMessage("Please select a valid Leave Type.");
        return false;
      }
      if (!formValues.reason.trim()) {
        setErrorMessage("Please enter the Leave Reason.");
        return false;
      }
      if (calculatedDays <= 0) {
        setErrorMessage("Number of days must be greater than zero.");
        return false;
      }
      return true;
    };
  /* ======================================================= SUBMIT ======================================================= */ const handleSubmit =
    async (event: FormEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault();
      if (submitting) {
        return;
      }
      if (!validateForm()) {
        return;
      }
      const values: LeaveApplicationFormValues = {
        ...formValues,
        reason: formValues.reason.trim(),
        numberOfDays: calculatedDays,
      };
      try {
        setSubmitting(true);
        setErrorMessage("");
        await onSubmit?.(values);
        setFormValues(INITIAL_FORM_VALUES);
        setErrorMessage("");
        onClose();
      } catch (error) {
        console.error("Failed to submit leave:", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to submit leave request. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
    };
  /* ======================================================= CANCEL ======================================================= */ const handleCancel =
    (): void => {
      if (submitting) {
        return;
      }
      setFormValues(INITIAL_FORM_VALUES);
      setErrorMessage("");
      onClose();
    };
  /* ======================================================= BACKDROP ======================================================= */ const handleBackdropClick =
    (event: React.MouseEvent<HTMLDivElement>): void => {
      if (event.target === event.currentTarget) {
        handleCancel();
      }
    };
  /* ======================================================= CLOSED ======================================================= */ if (
    !isOpen
  ) {
    return null;
  }
  /* ======================================================= RENDER ======================================================= */ return (
    <div
      className="leave-apply-modal-backdrop"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      {" "}
      <section
        className="leave-apply-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-apply-modal-title"
      >
        {" "}
        {/* ================================================= HEADER ================================================= */}{" "}
        <header className="leave-apply-modal__header">
          {" "}
          <h2 id="leave-apply-modal-title"> Add Leave </h2>{" "}
          <button
            type="button"
            className="leave-apply-modal__close"
            onClick={handleCancel}
            aria-label="Close add leave form"
            disabled={submitting}
          >
            {" "}
            <X size={20} strokeWidth={2} aria-hidden="true" />{" "}
          </button>{" "}
        </header>{" "}
        {/* ================================================= FORM ================================================= */}{" "}
        <form className="leave-apply-form" onSubmit={handleSubmit} noValidate>
          {" "}
          <div className="leave-apply-form__grid">
            {" "}
            {/* ============================================= FROM DATE ============================================= */}{" "}
            <div className="leave-apply-form__field">
              {" "}
              <label htmlFor="leave-from-date">
                {" "}
                From <span aria-hidden="true"> * </span>{" "}
              </label>{" "}
              <input
                id="leave-from-date"
                name="fromDate"
                type="date"
                value={formValues.fromDate}
                onChange={handleInputChange}
                required
                disabled={submitting}
              />{" "}
            </div>{" "}
            {/* ============================================= EMPTY GRID SPACE ============================================= */}{" "}
            <div
              className="leave-apply-form__field leave-apply-form__field--empty"
              aria-hidden="true"
            />{" "}
            {/* ============================================= TO DATE ============================================= */}{" "}
            <div className="leave-apply-form__field">
              {" "}
              <label htmlFor="leave-to-date">
                {" "}
                To <span aria-hidden="true"> * </span>{" "}
              </label>{" "}
              <input
                id="leave-to-date"
                name="toDate"
                type="date"
                min={formValues.fromDate || undefined}
                value={formValues.toDate}
                onChange={handleInputChange}
                required
                disabled={submitting}
              />{" "}
            </div>{" "}
            {/* ============================================= HALF DAY ============================================= */}{" "}
            <div className="leave-apply-form__field">
              {" "}
              <label htmlFor="leave-half-day"> Half Day </label>{" "}
              <select
                id="leave-half-day"
                name="halfDay"
                value={formValues.halfDay ? "yes" : "no"}
                onChange={handleInputChange}
                disabled={submitting}
              >
                {" "}
                <option value="no"> No </option>{" "}
                <option value="yes"> Yes </option>{" "}
              </select>{" "}
            </div>{" "}
            {/* ============================================= LEAVE TYPE ============================================= */}{" "}
            <div className="leave-apply-form__field">
              {" "}
              <label htmlFor="leave-type">
                {" "}
                Leave Type <span aria-hidden="true"> * </span>{" "}
              </label>{" "}
              <select
                id="leave-type"
                name="leaveType"
                value={formValues.leaveType}
                onChange={handleInputChange}
                required
                disabled={submitting}
              >
                {" "}
                <option value=""> Select Leave Type </option>{" "}
                {LEAVE_TYPE_OPTIONS.map((leaveType) => (
                  <option key={leaveType} value={leaveType}>
                    {" "}
                    {leaveType}{" "}
                  </option>
                ))}{" "}
              </select>{" "}
            </div>{" "}
            {/* ============================================= NUMBER OF DAYS ============================================= */}{" "}
            <div className="leave-apply-form__field">
              {" "}
              <label htmlFor="leave-number-days"> Number of Days </label>{" "}
              <input
                id="leave-number-days"
                type="text"
                value={
                  formValues.numberOfDays > 0
                    ? String(formValues.numberOfDays)
                    : ""
                }
                readOnly
                tabIndex={-1}
                aria-readonly="true"
                className="leave-apply-form__readonly"
              />{" "}
            </div>{" "}
            {/* ============================================= REASON ============================================= */}{" "}
            <div className="leave-apply-form__field leave-apply-form__field--full">
              {" "}
              <label htmlFor="leave-reason">
                {" "}
                Leave Reason <span aria-hidden="true"> * </span>{" "}
              </label>{" "}
              <textarea
                id="leave-reason"
                name="reason"
                value={formValues.reason}
                onChange={handleInputChange}
                rows={4}
                maxLength={500}
                required
                disabled={submitting}
              />{" "}
            </div>{" "}
          </div>{" "}
          {/* ================================================= ERROR ================================================= */}{" "}
          {errorMessage && (
            <div className="leave-apply-form__error" role="alert">
              {" "}
              {errorMessage}{" "}
            </div>
          )}{" "}
          {/* ================================================= ACTIONS ================================================= */}{" "}
          <div className="leave-apply-form__actions">
            {" "}
            <button
              type="button"
              className="leave-apply-form__cancel"
              onClick={handleCancel}
              disabled={submitting}
            >
              {" "}
              Cancel{" "}
            </button>{" "}
            <button
              type="submit"
              className="leave-apply-form__submit"
              disabled={submitting}
            >
              {" "}
              {submitting ? "Submitting..." : "Submit"}{" "}
            </button>{" "}
          </div>{" "}
        </form>{" "}
      </section>{" "}
    </div>
  );
};
export default LeaveApplyForm;
