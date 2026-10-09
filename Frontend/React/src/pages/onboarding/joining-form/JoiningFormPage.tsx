import React from "react";
import { useSearchParams } from "react-router-dom";

import {
  useJoiningForm,
} from "./hooks/useJoiningForm";

import {
  JoiningFormHeader,
} from "./components/JoiningFormHeader/JoiningFormHeader";

import {
  EmergencyContacts,
} from "./components/EmergencyContacts/EmergencyContacts";
import {
  JoiningFormStepper,
} from "./components/JoiningFormStepper/JoiningFormStepper";

import {
  BasicInformation,
} from "./components/BasicInformation/BasicInformation";

import {
  PersonalDetails,
} from "./components/PersonalDetails/PersonalDetails";

import {
  WorkExperience,
} from "./components/WorkExperience/WorkExperience";

import {
  Education,
} from "./components/Education/Education";

import DocumentUpload from "./components/DocumentUpload/DocumentUpload";

import {
  References,
} from "./components/References/References";

import {
  ReviewInformation,
} from "./components/ReviewInformation/ReviewInformation";

import {
  SubmissionSuccess,
} from "./components/SubmissionSuccess/SubmissionSuccess";

import "./JoiningFormPage.css";

const JoiningFormPage: React.FC =
  () => {

    const [searchParams] =
      useSearchParams();

    const applicationId =
      searchParams.get("application_id");

    const {
      currentStep,
      formData,

      goToStep,
      goToNextStep,
      goToPreviousStep,

      updateFormData,
      updateDocuments,

      addExperience,
      updateExperience,
      removeExperience,

      addEducation,
      updateEducation,
      removeEducation,

      addReference,
      updateReference,
      removeReference,
       addEmergencyContact,
updateEmergencyContact,
removeEmergencyContact,
      submitForm,

      isSubmitting,
      isSuccess,
      isLoading,
      loadError,
   } = useJoiningForm(
  applicationId ?? undefined
);

    /* ========================================================
       LOADING
       ======================================================== */

    if (isLoading) {
      return (
        <div className="joining-form-page">
          <div className="joining-form-loading">
            Loading joining form...
          </div>
        </div>
      );
    }

    /* ========================================================
       ERROR
       ======================================================== */

    if (loadError) {
      return (
        <div className="joining-form-page">
          <div className="joining-form-error">
            <h2>
              Unable to load joining form
            </h2>

            <p>
              {loadError}
            </p>
          </div>
        </div>
      );
    }

    /* ========================================================
       SUCCESS
       ======================================================== */

    if (isSuccess) {
      return (
        <div className="joining-form-page">
          <div className="joining-form-container">
            <SubmissionSuccess />
          </div>
        </div>
      );
    }

    /* ========================================================
       EDIT STEP FROM REVIEW
       ======================================================== */

    const handleEditStep =
      (step: number) => {
        goToStep(step);
      };

    /* ========================================================
       STEP CONTENT
       ======================================================== */

    const renderCurrentStep =
      () => {
        switch (currentStep) {
          case 0:
            return (
              <BasicInformation
                data={
                  formData.basicInformation
                }
                onChange={
                  updateFormData(
                    "basicInformation"
                  )
                }
                onNext={
                  goToNextStep
                }
              />
            );

          case 1:
            return (
              <PersonalDetails
                data={
                  formData.personalDetails
                }
                onChange={
                  updateFormData(
                    "personalDetails"
                  )
                }
                onBack={
                  goToPreviousStep
                }
                onNext={
                  goToNextStep
                }
              />
            );

          case 2:
            return (
              <WorkExperience
                data={
                  formData.workExperience
                }
                onChange={
                  updateExperience
                }
                onAdd={
                  addExperience
                }
                onRemove={
                  removeExperience
                }
                onBack={
                  goToPreviousStep
                }
                onNext={
                  goToNextStep
                }
              />
            );

          case 3:
            return (
              <Education
                data={
                  formData.education
                }
                onChange={
                  updateEducation
                }
                onAdd={
                  addEducation
                }
                onRemove={
                  removeEducation
                }
                onBack={
                  goToPreviousStep
                }
                onNext={
                  goToNextStep
                }
              />
            );

          case 4:
            return (
              <DocumentUpload
                data={
                  formData.documents
                }
                onUpload={
                  updateDocuments
                }
                onBack={
                  goToPreviousStep
                }
                onNext={
                  goToNextStep
                }
              />
            );

            case 5:
  return (
    <EmergencyContacts
      data={formData.emergencyContacts}
      onChange={updateEmergencyContact}
      onAdd={addEmergencyContact}
      onRemove={removeEmergencyContact}
      onBack={goToPreviousStep}
      onNext={goToNextStep}
    />
  );

          case 6:
            return (
              <References
                data={
                  formData.references
                }
                onChange={
                  updateReference
                }
                onAdd={
                  addReference
                }
                onRemove={
                  removeReference
                }
                onBack={
                  goToPreviousStep
                }
                onNext={
                  goToNextStep
                }
              />
            );

          case 7:
            return (
              <ReviewInformation
                formData={
                  formData
                }
                onBack={
                  goToPreviousStep
                }
                onSubmit={
                  submitForm
                }
                onEditStep={
                  handleEditStep
                }
                isSubmitting={
                  isSubmitting
                }
              />
            );

          default:
            return null;
        }
      };

    /* ========================================================
       PAGE
       ======================================================== */

    return (
      <div className="joining-form-page">
        <div className="joining-form-container">

          <JoiningFormHeader />

          <JoiningFormStepper
            currentStep={
              currentStep
            }
labels={[
  "Basic Information",
  "Personal Details",
  "Work Experience",
  "Education",
  "Documents",
  "Emergency Contacts",
  "References",
  "Review",
]}
          />

          <main className="joining-form-step-content">
            {renderCurrentStep()}
          </main>

        </div>
      </div>
    );
  };

export default JoiningFormPage;