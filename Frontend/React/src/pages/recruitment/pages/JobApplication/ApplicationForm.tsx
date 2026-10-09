import React, {
  useEffect,
  useState,
} from 'react';

import {
  FormProvider,
} from 'react-hook-form';

import {
  useParams,
} from 'react-router-dom';

import './ApplicationForm.css';

import {
  useStepper,
} from '../../hooks/useStepper';

import {
  useApplicationForm,
} from '../../hooks/useApplicationForm';

import Button from '../../../../components/ui/Button/Button';

import GlobalAlert from '../../../../components/ui/GlobalAlert/GlobalAlert';

import BasicInformation from '../BasicInformation/BasicInformation';

import PersonalDetails from '../PersonalDetails/PersonalDetails';

import EmergencyContacts from '../EmergencyContacts/EmergencyContacts';

import WorkExperience from '../WorkExperience/WorkExperience';

import Education from '../Education/Education';

import References from '../References/References';

import ThankYou from '../../components/ThankYou.tsx';

import logoImage from '../../../../assets/images/Inwinteck_logo.png';

import backgroundImage from '../../../../assets/images/job_application_bg.jpg';


/* ============================================================
   STEP COMPONENTS
============================================================ */

const STEP_COMPONENTS:
  Record<number, React.FC> = {

  1: BasicInformation,

  2: PersonalDetails,

  3: EmergencyContacts,

  4: WorkExperience,

  5: Education,

  6: References,
};


/* ============================================================
   CONSTANTS
============================================================ */

const WORK_EXPERIENCE_STEP = 4;

const EDUCATION_STEP = 5;

const REFERENCES_STEP = 6;

const MIN_EDUCATION_ENTRIES = 1;

const MAX_EDUCATION_ENTRIES = 6;


/* ============================================================
   COMPONENT
============================================================ */

const ApplicationForm:
  React.FC =
  (): React.ReactElement => {

  /* ==========================================================
     APPLICATION TOKEN

     The token can be:
     1. Existing invitation token
     2. Employee referral token
  ========================================================== */

  const {
    token,
  } = useParams<{
    token?: string;
  }>();


  /* ==========================================================
     STEPPER
  ========================================================== */

  const {
    state,
    nextStep,
    previousStep,
    totalSteps,
  } = useStepper(1);


  /* ==========================================================
     APPLICATION FORM
  ========================================================== */

  const {
    methods,
    isLoading,
    error: hookError,

    invitationLoading,
    invitationValid,
    

    referralValid,

    submitApplication,
    validateStep,
  } = useApplicationForm(token);


  /* ==========================================================
     APPLICATION LINK VALIDITY

     IMPORTANT:

     Normal application:
       token does not exist
       => valid

     Existing invitation:
       invitationValid = true
       => valid

     Employee referral:
       referralValid = true
       => valid

     Invalid token:
       both are false
       => invalid
  ========================================================== */

  const hasValidApplicationLink =
    !token ||
    invitationValid ||
    referralValid;


  /* ==========================================================
     ALERT STATES
  ========================================================== */

  const [
    submitError,
    setSubmitError,
  ] =
    useState<string | null>(
      null
    );


  const [
    validationError,
    setValidationError,
  ] =
    useState<string | null>(
      null
    );


  /* ==========================================================
     THANK YOU
  ========================================================== */

  const [
    showThankYou,
    setShowThankYou,
  ] =
    useState<boolean>(
      false
    );


  /* ==========================================================
     AUTO DISMISS ALERTS
  ========================================================== */

  useEffect(() => {

    if (
      validationError === null &&
      submitError === null &&
      hookError === null
    ) {

      return undefined;
    }


    const timer =
      window.setTimeout(
        () => {

          setValidationError(
            null
          );

          setSubmitError(
            null
          );

        },
        5000
      );


    return () => {

      window.clearTimeout(
        timer
      );
    };

  }, [
    validationError,
    submitError,
    hookError,
  ]);


  /* ==========================================================
     CLEAR ALERTS
  ========================================================== */

  const clearAlerts =
    (): void => {

      setValidationError(
        null
      );

      setSubmitError(
        null
      );
    };


  /* ==========================================================
     SHOW VALIDATION ERROR
  ========================================================== */

  const showValidationError =
    (
      message: string
    ): void => {

      setSubmitError(
        null
      );

      setValidationError(
        message
      );
    };


  /* ==========================================================
     STEP 4 - WORK EXPERIENCE
  ========================================================== */

  const validateWorkExperience =
    async (): Promise<boolean> => {

      const workExperience =
        methods.getValues(
          'workExperiences'
        );


      const isFresher =
        workExperience?.isFresher === true;


      const experiences =
        workExperience?.experiences ??
        [];


      /* --------------------------------------------------------
         FRESHER
      -------------------------------------------------------- */

      if (
        isFresher
      ) {

        return true;
      }


      /* --------------------------------------------------------
         NO EXPERIENCE
      -------------------------------------------------------- */

      if (
        experiences.length === 0
      ) {

        methods.setError(
          'workExperiences.experiences',
          {
            type: 'manual',

            message:
              'Please add at least one work experience or select the fresher option.',
          }
        );


        showValidationError(
          'Please select the fresher option or add at least one work experience before proceeding.'
        );


        return false;
      }


      /* --------------------------------------------------------
         VALIDATE EXPERIENCE
      -------------------------------------------------------- */

      const isValid =
        await methods.trigger(
          'workExperiences',
          {
            shouldFocus: false,
          }
        );


      if (!isValid) {

        showValidationError(
          'Please complete all required work experience fields before proceeding.'
        );


        return false;
      }


      return true;
    };


  /* ==========================================================
     STEP 5 - EDUCATION
  ========================================================== */

  const validateEducation =
    async (): Promise<boolean> => {

      const educationRecords =
        methods.getValues(
          'educations.educations'
        ) ?? [];


      /* --------------------------------------------------------
         MINIMUM
      -------------------------------------------------------- */

      if (
        educationRecords.length <
        MIN_EDUCATION_ENTRIES
      ) {

        methods.setError(
          'educations.educations',
          {
            type: 'manual',

            message:
              'Please add at least 1 education records before proceeding.',
          }
        );


        showValidationError(
          `Please add at least ${MIN_EDUCATION_ENTRIES} education records before proceeding.`
        );


        return false;
      }


      /* --------------------------------------------------------
         MAXIMUM
      -------------------------------------------------------- */

      if (
        educationRecords.length >
        MAX_EDUCATION_ENTRIES
      ) {

        methods.setError(
          'educations.educations',
          {
            type: 'manual',

            message:
              'Maximum 6 education records are allowed.',
          }
        );


        showValidationError(
          `Maximum ${MAX_EDUCATION_ENTRIES} education records are allowed.`
        );


        return false;
      }


      /* --------------------------------------------------------
         VALIDATE
      -------------------------------------------------------- */

      const isValid =
        await methods.trigger(
          'educations',
          {
            shouldFocus: false,
          }
        );


      if (!isValid) {

        showValidationError(
          'Please complete all required education details before proceeding.'
        );


        return false;
      }


      return true;
    };


    
/* ==========================================================
   STEP 6 - REFERENCES
   ========================================================== */

const validateReferences =
  async (): Promise<boolean> => {

    /* --------------------------------------------------------
       REFERENCES ARE OPTIONAL

       If the user does not provide any reference,
       allow the application to be submitted.
    -------------------------------------------------------- */

    const references =
      methods.getValues('references');

    const reference1 =
      references?.reference1;

    const reference2 =
      references?.reference2;

    /* --------------------------------------------------------
       CHECK WHETHER REFERENCE 1 HAS ANY DATA
    -------------------------------------------------------- */

    const hasReference1Data =
      reference1 &&
      Object.values(reference1).some(
        (value) =>
          typeof value === 'string' &&
          value.trim().length > 0
      );

    /* --------------------------------------------------------
       CHECK WHETHER REFERENCE 2 HAS ANY DATA
    -------------------------------------------------------- */

    const hasReference2Data =
      reference2 &&
      Object.values(reference2).some(
        (value) =>
          typeof value === 'string' &&
          value.trim().length > 0
      );

    /* --------------------------------------------------------
       NO REFERENCES PROVIDED

       This is completely valid because References
       are optional.
    -------------------------------------------------------- */

    if (
      !hasReference1Data &&
      !hasReference2Data
    ) {
      return true;
    }

    /* --------------------------------------------------------
       USER PROVIDED REFERENCE DATA

       Only now run the configured validation.
    -------------------------------------------------------- */

    const isValid =
      await methods.trigger(
        'references',
        {
          shouldFocus: false,
        }
      );

    /* --------------------------------------------------------
       INVALID REFERENCE DATA
    -------------------------------------------------------- */

    if (!isValid) {

      showValidationError(
        'Please check the reference details and correct the highlighted fields.'
      );

      return false;
    }

    /* --------------------------------------------------------
       VALID REFERENCE DATA
    -------------------------------------------------------- */

    return true;
  };



  /* ==========================================================
     FINAL SUBMISSION
  ========================================================== */

  const handleSubmitApplication =
    async (): Promise<void> => {

      clearAlerts();


      /* --------------------------------------------------------
         APPLICATION LINK CHECK

         IMPORTANT:

         Previously this checked only invitationValid.

         Now:
         invitationValid OR referralValid
      -------------------------------------------------------- */

      if (
        token &&
        !hasValidApplicationLink
      ) {

        setSubmitError(
          'This application link is invalid or expired.'
        );


        return;
      }


      /* --------------------------------------------------------
         COMPLETE FORM DATA
      -------------------------------------------------------- */

      const data =
        methods.getValues();


      console.log(
        'Submitting Job Application'
      );


      /* --------------------------------------------------------
         CALL BACKEND
      -------------------------------------------------------- */

      const result =
        await submitApplication(
          data
        );


      /* --------------------------------------------------------
         API FAILED
      -------------------------------------------------------- */

      if (
        !result
      ) {

        setSubmitError(
          'Failed to submit your application. Please check the highlighted information and try again.'
        );


        return;
      }


      /* --------------------------------------------------------
         SUCCESS
      -------------------------------------------------------- */

      methods.reset();


      setShowThankYou(
        true
      );
    };


  /* ==========================================================
     NEXT STEP
  ========================================================== */

  const handleNextStep =
    async (): Promise<void> => {

      clearAlerts();


      /* --------------------------------------------------------
         APPLICATION LINK LOADING
      -------------------------------------------------------- */

      if (
        invitationLoading
      ) {

        return;
      }


      /* --------------------------------------------------------
         APPLICATION LINK CHECK

         IMPORTANT:

         Previously this checked only invitationValid.

         Now:
         invitationValid OR referralValid
      -------------------------------------------------------- */

      if (
        token &&
        !hasValidApplicationLink
      ) {

        setSubmitError(
          'This application link is invalid or expired.'
        );


        return;
      }


      /* --------------------------------------------------------
         STEP 4
      -------------------------------------------------------- */

      if (
        state.currentStep ===
        WORK_EXPERIENCE_STEP
      ) {

        const isValid =
          await validateWorkExperience();


        if (!isValid) {

          return;
        }


        nextStep();

        return;
      }


      /* --------------------------------------------------------
         STEP 5
      -------------------------------------------------------- */

      if (
        state.currentStep ===
        EDUCATION_STEP
      ) {

        const isValid =
          await validateEducation();


        if (!isValid) {

          return;
        }


        nextStep();

        return;
      }


      /* --------------------------------------------------------
         STEP 6
      -------------------------------------------------------- */

      if (
        state.currentStep ===
        REFERENCES_STEP
      ) {

        const isValid =
          await validateReferences();


        if (!isValid) {

          return;
        }


        await handleSubmitApplication();

        return;
      }


      /* --------------------------------------------------------
         NORMAL STEPS
      -------------------------------------------------------- */

      const isValid =
        await validateStep(
          state.currentStep
        );


      if (!isValid) {

        showValidationError(
          'Please fill in all required fields before proceeding.'
        );


        return;
      }


      /* --------------------------------------------------------
         NEXT
      -------------------------------------------------------- */

      if (
        state.currentStep <
        totalSteps
      ) {

        nextStep();
      }
    };


  /* ==========================================================
     PREVIOUS
  ========================================================== */

  const handlePreviousStep =
    (): void => {

      clearAlerts();


      if (
        state.currentStep > 1
      ) {

        previousStep();
      }
    };


  /* ==========================================================
     CANCEL
  ========================================================== */

  const handleCancel =
    (): void => {

      const confirmed =
        window.confirm(
          'Are you sure you want to cancel? Your progress will be lost.'
        );


      if (!confirmed) {

        return;
      }


      methods.reset();


      clearAlerts();


      window.location.href =
        '/';
    };


  /* ==========================================================
     THANK YOU
  ========================================================== */

  if (
    showThankYou
  ) {

    return <ThankYou />;
  }


  /* ==========================================================
     INVALID APPLICATION LINK SCREEN

     IMPORTANT:

     Previously:
       !invitationValid

     Now:
       !invitationValid && !referralValid

     Therefore a valid referral token will NOT
     show this screen.
  ========================================================== */

  if (
    token &&
    !invitationLoading &&
    !hasValidApplicationLink
  ) {

    return (
      <div className="application-form-page">

        <div className="application-form-wrapper">

          <div className="application-form-container">

            <div className="form-content">

              <div className="form-header">

                <div className="header-top">

                  <div className="logo-section">

                    <img
                      src={logoImage}
                      alt="Inwinteck"
                      className="company-logo"
                    />


                    <div className="logo-text">

                      <h1 className="company-name">
                        INWINTECK
                      </h1>


                      <p className="company-tagline">
                        Innovative, Accountable, Decent.
                      </p>

                    </div>

                  </div>

                </div>


                <div className="header-bottom">

                  <h2 className="form-title">
                    Job Application Form
                  </h2>

                </div>

              </div>


              <main className="form-card">

                <div className="form-card-content">

                  <GlobalAlert
                    severity="error"
                    title="Application Link Invalid"
                    message={
                      hookError ||
                      'This application link is invalid or expired.'
                    }
                  />

                </div>

              </main>

            </div>

          </div>

        </div>

      </div>
    );
  }


  /* ==========================================================
     CURRENT STEP
  ========================================================== */

  const CurrentStepComponent =
    STEP_COMPONENTS[
      state.currentStep
    ];


  /* ==========================================================
     BACKGROUND
  ========================================================== */

  const containerStyle:
    React.CSSProperties = {

    backgroundImage:
      `url(${backgroundImage})`,

    backgroundSize:
      'cover',

    backgroundPosition:
      'center',

    backgroundRepeat:
      'no-repeat',

    backgroundColor:
      '#f5f0eb',
  };


  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="application-form-page">

      <div className="application-form-wrapper">

        <div
          className="application-form-container"
          style={containerStyle}
        >

          <div className="form-container-overlay" />

          <div className="form-content">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="form-header">

              <div className="header-top">

                <div className="logo-section">

                  <img
                    src={logoImage}
                    alt="Inwinteck"
                    className="company-logo"
                  />


                  <div className="logo-text">

                    <h1 className="company-name">
                      INWINTECK
                    </h1>


                    <p className="company-tagline">
                      Innovative, Accountable, Decent.
                    </p>

                  </div>

                </div>

              </div>


              <div className="header-bottom">

                <h2 className="form-title">
                  Job Application Form
                </h2>


                <p className="form-subtitle">
                  Please fill in the details below to
                  apply for the position.
                </p>

              </div>

            </div>


            {/* ==================================================
                STEPPER
            ================================================== */}

            <nav
              className="stepper-container"
              aria-label="Application progress"
            >

              <ol className="stepper-track">

                {state.steps.map(
                  (step, index) => (

                    <React.Fragment
                      key={step.id}
                    >

                      {index > 0 && (
                        <li
                          className="step-connector"
                          aria-hidden="true"
                        />
                      )}


                      <li className="step-item">

                        <div
                          className={`step-circle ${
                            step.status === 'current'
                              ? 'step-active'
                              : ''
                          }`}
                        >

                          <span className="step-number">

                            {step.status ===
                            'completed'
                              ? '✓'
                              : step.id}

                          </span>

                        </div>


                        <span
                          className={`step-label ${
                            step.status === 'current'
                              ? 'step-label-active'
                              : ''
                          }`}
                        >

                          {step.label}

                        </span>

                      </li>

                    </React.Fragment>
                  )
                )}

              </ol>

            </nav>


            {/* ==================================================
                FORM
            ================================================== */}

            <main className="form-card">

              {/* APPLICATION LINK LOADING */}

              {invitationLoading && (
                <div
                  style={{
                    marginBottom:
                      '24px',
                  }}
                >

                  <GlobalAlert
                    severity="info"
                    title="Checking Application Link"
                    message="Please wait while we verify your application link."
                  />

                </div>
              )}


              {/* VALIDATION ERROR */}

              {validationError && (
                <div
                  style={{
                    marginBottom:
                      '24px',

                    marginTop:
                      '4px',
                  }}
                >

                  <GlobalAlert
                    severity="warning"
                    title="Validation Error"
                    message={
                      validationError
                    }
                  />

                </div>
              )}


              {/* SUBMIT ERROR */}

              {(submitError ||
                hookError) && (
                <div
                  style={{
                    marginBottom:
                      '24px',

                    marginTop:
                      '4px',
                  }}
                >

                  <GlobalAlert
                    severity="error"
                    title="Submission Failed"
                    message={
                      submitError ||
                      hookError ||
                      'Unable to submit application.'
                    }
                  />

                </div>
              )}


              {/* ==================================================
                  FORM PROVIDER
              ================================================== */}

              <FormProvider
                {...methods}
              >

                <form
                  className="form-card-content"
                  onSubmit={
                    (event) => {
                      event.preventDefault();
                    }
                  }
                >

                  <CurrentStepComponent />


                  {/* ==================================================
                      NAVIGATION
                  ================================================== */}

                  <div className="form-navigation">

                    <div className="form-navigation-left">

                      {state.currentStep > 1 && (
                        <Button
                          variant="secondary"
                          onClick={
                            handlePreviousStep
                          }
                          type="button"
                        >
                          ← Back
                        </Button>
                      )}


                      <Button
                        variant="secondary"
                        onClick={
                          handleCancel
                        }
                        type="button"
                      >
                        Cancel
                      </Button>

                    </div>


                    <Button
                      variant="primary"
                      onClick={
                        handleNextStep
                      }
                      isLoading={
                        isLoading ||
                        invitationLoading
                      }
                      type="button"
                    >

                      {state.currentStep ===
                      totalSteps
                        ? 'Submit Application'
                        : 'Save & Continue'}

                    </Button>

                  </div>

                </form>

              </FormProvider>

            </main>


            {/* ==================================================
                FOOTER
            ================================================== */}

            <footer className="application-form-footer">

              <p className="footer-security">
                Your information is secure and will not
                be shared with third parties.
              </p>


              <div className="footer-bottom">

                <p className="footer-copyright">
                  © {new Date().getFullYear()}
                  {' '}
                  Inwinteck.
                  {' '}
                  All rights reserved.
                </p>


                <nav className="footer-links">

                  <a
                    href="#"
                    className="footer-link"
                  >
                    Privacy Policy
                  </a>


                  <span className="footer-divider">
                    |
                  </span>


                  <a
                    href="#"
                    className="footer-link"
                  >
                    Terms of Service
                  </a>


                  <span className="footer-divider">
                    |
                  </span>


                  <a
                    href="#"
                    className="footer-link"
                  >
                    Support
                  </a>

                </nav>

              </div>

            </footer>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ApplicationForm;