import {
  useCallback,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  SendResignationHeader,
} from "./components/SendResignationHeader/SendResignationHeader";

import {
  ResignationEmailCard,
} from "./components/ResignationEmailCard/ResignationEmailCard";

import {
  useSendResignation,
} from "./hooks/useSendResignation";

import "./SendResignationPage.css";

export const SendResignationPage =
  (): JSX.Element => {
    const navigate =
      useNavigate();

    const {
      employees,
      formData,
      errors,
      isLoadingEmployees,
      isSubmitting,
      isSuccess,
      submitError,
      updateEmployee,
      updateField,
      addAttachments,
      removeAttachment,
      clearAttachments,
      submit,
      reset,
    } = useSendResignation();

    const handleCancel =
      useCallback((): void => {
        reset();
        navigate("/dashboard/home");
      }, [navigate, reset]);

    const handleSend =
      useCallback(async (): Promise<void> => {
        await submit();
      }, [submit]);

    return (
      <div className="send-resignation-page">
        <SendResignationHeader />

        <ResignationEmailCard
          employees={employees}
          formData={formData}
          errors={errors}
          isLoadingEmployees={
            isLoadingEmployees
          }
          isSubmitting={isSubmitting}
          isSuccess={isSuccess}
          submitError={submitError}
          onEmployeeChange={
            updateEmployee
          }
          onFieldChange={
            updateField
          }
          onFilesSelected={
            addAttachments
          }
          onRemoveFile={
            removeAttachment
          }
          onClearFiles={
            clearAttachments
          }
          onCancel={handleCancel}
          onSend={handleSend}
        />
      </div>
    );
  };

export default SendResignationPage;