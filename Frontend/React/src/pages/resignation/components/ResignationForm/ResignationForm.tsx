import React, { useEffect, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createResignationSchema,
  CreateResignationInput,
} from "../../validations/resignation.schema";
import { MAX_REASON_LENGTH } from "../../constants/resignation.constants";
import { Send, X, Info, Paperclip, FileText } from "lucide-react";
import "./ResignationForm.css";
import formIllustration from "../../../../assets/images/resignation/resignation_form.jpg";
export interface ResignationFormProps {
  defaultValues?: Partial<CreateResignationInput>;
  onSubmit: (data: CreateResignationInput) => void;
  onCancel: () => void;
  loading?: boolean;
}
const ResignationForm: React.FC<ResignationFormProps> = React.memo(
  ({ defaultValues, onSubmit, onCancel, loading = false }) => {
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const {
      register,
      watch,
      setValue,
      getValues,
      formState: { errors, isValid },
    } = useForm<CreateResignationInput>({
      resolver: zodResolver(createResignationSchema),
      mode: "onChange",
      defaultValues: {
        reason: "",
        reasonType: "Yes, I want to resign",
        fromDate: "",
        noticePeriod: 60,
        lastWorkingDate: "",
        reportingManager: "Alice Johnson",
        comments: "",
        ...defaultValues,
      },
    });
    const watchedFromDate = watch("fromDate");
    const watchedNoticePeriod = watch("noticePeriod");
    useEffect(() => {
      if (
        watchedFromDate &&
        watchedNoticePeriod !== undefined &&
        watchedNoticePeriod >= 0
      ) {
        const startDate = new Date(watchedFromDate);
        if (!Number.isNaN(startDate.getTime())) {
          startDate.setDate(startDate.getDate() + Number(watchedNoticePeriod));
          const calculatedDate = startDate.toISOString().split("T")[0];
          setValue("lastWorkingDate", calculatedDate, { shouldValidate: true });
        }
      }
    }, [watchedFromDate, watchedNoticePeriod, setValue]);
    const handleSubmitClick = useCallback(() => {
      if (!isValid) {
        const errorFields = Object.keys(errors);
        const fieldLabels: Record<string, string> = {
          reason: "Reason",
          reasonType: "Resignation Type",
          fromDate: "From Date",
          noticePeriod: "Notice Period",
          lastWorkingDate: "Last Working Date",
          reportingManager: "Reporting Manager",
          comments: "Comments",
        };
        const missingFieldNames = errorFields
          .map((field) => fieldLabels[field] || field)
          .join(", ");
        setAlertMessage(
          `Please fill in the following fields: ${missingFieldNames}.`,
        );
        return;
      }
      const formValues = getValues();
      onSubmit(formValues as CreateResignationInput);
    }, [isValid, errors, getValues, onSubmit]);
    return (
      <div className="resignation-form-container">
        {" "}
        {alertMessage && (
          <div className="form-alert-banner">
            {" "}
            <span>{alertMessage}</span>{" "}
            <button
              className="form-alert-close"
              onClick={() => setAlertMessage(null)}
            >
              {" "}
              ×{" "}
            </button>{" "}
          </div>
        )}{" "}
        <div className="resignation-form-header">
          {" "}
          <div className="form-header-left">
            {" "}
            <div className="form-header-icon-circle">
              {" "}
              <FileText size={24} strokeWidth={1.5} />{" "}
            </div>{" "}
            <div className="form-header-text">
              {" "}
              <h2>Apply for Resignation</h2>{" "}
              <p>
                {" "}
                Please fill in the details below to submit your resignation
                request.{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <img
            src={formIllustration}
            alt="Resignation"
            className="form-header-image"
          />{" "}
        </div>{" "}
        <form
          className="resignation-form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmitClick();
          }}
        >
          {" "}
          <div className="form-group">
            {" "}
            <label className="form-label">
              {" "}
              Resignation <span className="required-asterisk"> * </span>{" "}
            </label>{" "}
            <select
              className="form-select"
              {...register("reasonType")}
              disabled={loading}
            >
              {" "}
              <option value="Yes, I want to resign">
                {" "}
                Yes, I want to resign{" "}
              </option>{" "}
              <option value="No"> No </option>{" "}
            </select>{" "}
            {errors.reasonType && (
              <span className="form-error-text">
                {" "}
                {errors.reasonType.message}{" "}
              </span>
            )}{" "}
          </div>{" "}
          <div className="form-group">
            {" "}
            <label className="form-label">
              {" "}
              From Date <span className="required-asterisk"> * </span>{" "}
            </label>{" "}
            <div className="form-input-wrapper">
              {" "}
              <input
                type="date"
                className="form-input"
                {...register("fromDate")}
                disabled={loading}
              />{" "}
            </div>{" "}
            {errors.fromDate && (
              <span className="form-error-text">
                {" "}
                {errors.fromDate.message}{" "}
              </span>
            )}{" "}
          </div>{" "}
          <div className="form-group">
            {" "}
            <label className="form-label">
              {" "}
              Notice Period <span className="required-asterisk"> * </span>{" "}
            </label>{" "}
            <div className="form-input form-input-static">
              {" "}
              <span> 60 Days </span>{" "}
              <Info size={16} className="form-input-icon" />{" "}
            </div>{" "}
            <input
              type="hidden"
              {...register("noticePeriod", { valueAsNumber: true })}
            />{" "}
          </div>{" "}
          <div className="form-group">
            {" "}
            <label className="form-label">
              {" "}
              Last Working Date (if approved){" "}
              <span className="required-asterisk"> * </span>{" "}
            </label>{" "}
            <div className="form-input-wrapper">
              {" "}
              <input
                type="date"
                className="form-input form-input-readonly"
                {...register("lastWorkingDate")}
                readOnly
                disabled={loading}
              />{" "}
            </div>{" "}
            {errors.lastWorkingDate && (
              <span className="form-error-text">
                {" "}
                {errors.lastWorkingDate.message}{" "}
              </span>
            )}{" "}
          </div>{" "}
          <div className="form-group full-width">
            {" "}
            <label className="form-label">
              {" "}
              Reason for Resignation{" "}
              <span className="required-asterisk"> * </span>{" "}
            </label>{" "}
            <div className="form-textarea-wrapper">
              {" "}
              <textarea
                className="form-textarea"
                placeholder="I am resigning because..."
                {...register("reason")}
                disabled={loading}
              />{" "}
              <span className="form-char-count">
                {" "}
                {watch("reason")?.length || 0} / {MAX_REASON_LENGTH}{" "}
              </span>{" "}
            </div>{" "}
            {errors.reason && (
              <span className="form-error-text"> {errors.reason.message} </span>
            )}{" "}
          </div>{" "}
          <div className="form-upload-box full-width">
            {" "}
            <div className="upload-left">
              {" "}
              <div className="upload-icon-wrapper">
                {" "}
                <Paperclip size={20} />{" "}
              </div>{" "}
              <div className="upload-text">
                {" "}
                <h4> Add Attachment (Optional) </h4>{" "}
                <p>
                  {" "}
                  Upload supporting documents if any (Offer letter, Resignation
                  letter, etc.){" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            <button type="button" className="upload-btn" disabled={loading}>
              {" "}
              Choose File{" "}
            </button>{" "}
          </div>{" "}
        </form>{" "}
        <div className="form-footer-alert">
          {" "}
          <div className="alert-left">
            {" "}
            <div className="alert-icon-wrapper">
              {" "}
              <Info size={20} />{" "}
            </div>{" "}
            <div className="alert-text">
              {" "}
              <h4> Please Note </h4>{" "}
              <p>
                {" "}
                Your request will be reviewed by your reporting manager and HR
                team.{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <div className="alert-actions">
            {" "}
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onCancel}
              disabled={loading}
            >
              {" "}
              <X size={18} strokeWidth={2} /> Cancel{" "}
            </button>{" "}
            <button
              type="button"
              className="btn-modal-submit"
              onClick={handleSubmitClick}
              disabled={loading}
            >
              {" "}
              <Send size={18} strokeWidth={2} />{" "}
              {loading ? "Submitting..." : "Submit Request"}{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </div>
    );
  },
);
ResignationForm.displayName = "ResignationForm";
export default ResignationForm;
