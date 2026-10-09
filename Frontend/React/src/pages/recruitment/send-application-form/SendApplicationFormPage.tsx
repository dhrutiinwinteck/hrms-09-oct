import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import SendApplicationFormHeader from "./components/SendApplicationFormHeader/SendApplicationFormHeader";
import SendApplicationFormCard from "./components/SendApplicationFormCard/SendApplicationFormCard";

import { useSendApplicationForm } from "./hooks/useSendApplicationForm";

import type {
  SendApplicationFormData,
} from "./types/sendApplicationForm.types";

import "./SendApplicationFormPage.css";

const SendApplicationFormPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    formData,
    errors,
    isLoadingTemplate,
    isSubmitting,
    isSuccess,
    submitError,
    response,
    isEmailEntered,
    updateField,
    submit,
    reset,
  } = useSendApplicationForm();

  const handleSubmit = useCallback(
    async (
      data: SendApplicationFormData,
    ): Promise<void> => {
      if (isSubmitting) {
        return;
      }

      await submit(data);
    },
    [isSubmitting, submit],
  );

  const handleCancel = useCallback((): void => {
    if (isSubmitting) {
      return;
    }

    reset();

    navigate("/recruitment/joining-approval");
  }, [
    isSubmitting,
    navigate,
    reset,
  ]);

  return (
    <main className="send-application-form-page">
      <SendApplicationFormHeader />

      <SendApplicationFormCard
        formData={formData}
        errors={errors}
        isLoadingTemplate={isLoadingTemplate}
        isSubmitting={isSubmitting}
        isSuccess={isSuccess}
        submitError={submitError}
        response={response}
        isEmailEntered={isEmailEntered}
        updateField={updateField}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </main>
  );
};

export default SendApplicationFormPage;