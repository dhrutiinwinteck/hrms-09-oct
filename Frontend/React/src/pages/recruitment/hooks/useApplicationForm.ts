import {
  useState,
  useCallback,
  useEffect,
} from 'react';

import {
  useForm,
} from 'react-hook-form';

import {
  zodResolver,
} from '@hookform/resolvers/zod';

import {
  z,
} from 'zod';

import {
  basicInformationSchema,
} from '../validations/basicInformationSchema';

import {
  personalDetailsSchema,
} from '../validations/personalDetailsSchema';

import {
  emergencyContactsSchema,
} from '../validations/emergencyContactSchema';

import recruitmentService, {
  ApplicationFormValues,
} from '../services/recruitmentService';

import {
  validateReferralToken,
} from '../../dashboard/services/referral.service';
import {
  educationsSchema,
} from '../validations/educationSchema';

/* ============================================================
   COMBINED APPLICATION SCHEMA
============================================================ */

const applicationSchema =
  z.object({

    basicInformation:
      basicInformationSchema,

    personalDetails:
      personalDetailsSchema,

    emergencyContacts:
      emergencyContactsSchema,

    workExperiences:
      z.any().optional(),

   educations:
  educationsSchema,

    references:
      z.any().optional(),
  });

type ApplicationFormInput =
  z.input<typeof applicationSchema>;

type ApplicationFormData =
  z.output<typeof applicationSchema>;

/* ============================================================
   HOOK
============================================================ */

export const useApplicationForm = (
  invitationToken?: string
) => {

  const [
    isLoading,
    setIsLoading,
  ] = useState<boolean>(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    isSubmitted,
    setIsSubmitted,
  ] = useState<boolean>(false);

  /*
   * This loading state now represents validation of the
   * application URL token.
   *
   * The token can be either:
   * 1. Invitation token
   * 2. Employee referral token
   */
  const [
    invitationLoading,
    setInvitationLoading,
  ] = useState<boolean>(
    Boolean(invitationToken)
  );

  /*
   * Existing invitation state.
   *
   * This is intentionally preserved so the existing
   * invitation flow continues to work.
   */
  const [
    invitationValid,
    setInvitationValid,
  ] = useState<boolean>(
    !invitationToken
  );

  /*
   * Referral token state.
   */
  const [
    referralValid,
    setReferralValid,
  ] = useState<boolean>(false);

  /*
   * Useful if ApplicationForm wants to know whether
   * the current URL is a referral URL.
   */
  const [
    isReferralToken,
    setIsReferralToken,
  ] = useState<boolean>(false);

  /*
   * Existing invitation email state.
   */
  const [
    invitationEmail,
    setInvitationEmail,
  ] = useState<string | null>(
    null
  );

  /* ==========================================================
     FORM
  ========================================================== */

  const methods =
    useForm<
      ApplicationFormInput,
      any,
      ApplicationFormData
    >({

      resolver:
        zodResolver(
          applicationSchema
        ),

      defaultValues: {

        basicInformation: {
          fullName: '',
          email: '',
          phoneNumber: '',
          alternativePhone: '',
          positionApplied: '',
          dateOfApplication: '',
          resume: null,
        },

        personalDetails: {

          dateOfBirth: '',

          maritalStatus: '',

          gender: '',

          nationality: '',

          aadharNumber: '',

          panNumber: '',

          currentAddress: '',

          permanentAddress: '',
        },

        emergencyContacts: {

          contact1: {

            fullName: '',

            relationship: '',

            phoneNumber: '',

            emailAddress: '',

            address: '',
          },

          contact2: null,
        },

        workExperiences: {

          isFresher: false,

          experiences: [],
        },

        educations: {

          educations: [],
        },

        references: {

          reference1: {

            fullName: '',

            designation: '',

            companyOrganization: '',

            emailAddress: '',

            phoneNumber: '',

            relationship: '',
          },

          reference2: null,
        },
      },
    });

  /* ==========================================================
     VALIDATE APPLICATION TOKEN

     Supports BOTH:

     1. Existing invitation token
     2. Employee referral token
  ========================================================== */

  const validateApplicationToken =
    useCallback(
      async (
        token: string
      ): Promise<void> => {

        setInvitationLoading(true);

        setInvitationValid(false);

        setReferralValid(false);

        setIsReferralToken(false);

        setInvitationEmail(null);

        setError(null);

        /*
         * ======================================================
         * STEP 1
         * TRY EXISTING INVITATION TOKEN
         * ======================================================
         */

        try {

          const response =
            await recruitmentService
              .validateInvitationToken(
                token
              );

          /*
           * Existing invitation token is valid.
           *
           * IMPORTANT:
           * Keep the old invitation behavior.
           */

          if (
            response.success &&
            response.data?.valid
          ) {

            setInvitationValid(true);

            setReferralValid(false);

            setIsReferralToken(false);

            const candidateEmail =
              response.data
                ?.candidate_email;

            /*
             * Existing candidate email
             * auto-fill behavior.
             */
            if (
              candidateEmail
            ) {

              setInvitationEmail(
                candidateEmail
              );

              methods.setValue(
                'basicInformation.email',
                candidateEmail,
                {
                  shouldValidate: true,
                  shouldDirty: false,
                }
              );
            }

            /*
             * Invitation validation succeeded.
             *
             * Do not try referral validation.
             */
            return;
          }

        } catch {
          /*
           * IMPORTANT:
           *
           * Do NOT show an invitation error here.
           *
           * The URL may be a referral token.
           *
           * Example:
           *
           * /application/TM2E5QYQNE
           *
           * This will normally fail invitation
           * validation and then continue to referral
           * validation below.
           */
        }

        /*
         * ======================================================
         * STEP 2
         * TRY REFERRAL TOKEN
         * ======================================================
         */

        try {

          const referralResponse =
            await validateReferralToken(
              token
            );

          /*
           * Referral token is valid.
           */
          if (
            referralResponse.valid
          ) {

            setInvitationValid(false);

            setReferralValid(true);

            setIsReferralToken(true);

            /*
             * Clear any invitation error.
             */
            setError(null);

            return;
          }

          /*
           * Neither invitation nor referral
           * token is valid.
           */

          setInvitationValid(false);

          setReferralValid(false);

          setIsReferralToken(false);

          setError(
            'This application link is invalid or expired.'
          );

        } catch (
          referralError
        ) {

          console.error(
            'Referral token validation error:',
            referralError
          );

          setInvitationValid(false);

          setReferralValid(false);

          setIsReferralToken(false);

          setError(
            'This application link is invalid or expired.'
          );

        } finally {

          setInvitationLoading(false);
        }
      },
      [
        methods,
      ]
    );

  /* ==========================================================
     LOAD APPLICATION TOKEN
  ========================================================== */

  useEffect(() => {

    /*
     * No token:
     *
     * Normal public application form.
     *
     * Existing behavior is preserved.
     */
    if (!invitationToken) {

      setInvitationLoading(false);

      setInvitationValid(true);

      setReferralValid(false);

      setIsReferralToken(false);

      setError(null);

      return;
    }

    /*
     * Token exists.
     *
     * It can be either invitation or referral.
     */
    void validateApplicationToken(
      invitationToken
    );

  }, [
    invitationToken,
    validateApplicationToken,
  ]);

  /* ==========================================================
     SAVE STEP DATA

     IMPORTANT:
     Backend currently implements one complete
     application submission, not six separate
     draft endpoints.

     Therefore Save & Continue only moves
     between frontend steps.
  ========================================================== */

  const saveStepData =
    useCallback(
      async (
        _step: number,
        _data: any
      ) => {

        return null;
      },
      []
    );

  /* ==========================================================
     FINAL SUBMISSION
  ========================================================== */

  const submitApplication =
    useCallback(
      async (
       data: ApplicationFormInput
      ) => {

        setIsLoading(
          true
        );

        setError(
          null
        );

        try {

          /*
           * ====================================================
           * APPLICATION LINK VALIDATION
           * ====================================================
           *
           * No token:
           *     Normal application is allowed.
           *
           * Invitation token:
           *     invitationValid = true
           *
           * Referral token:
           *     referralValid = true
           */

          const hasValidApplicationLink =
            !invitationToken ||
            invitationValid ||
            referralValid;

          if (
            !hasValidApplicationLink
          ) {

            const message =
              'This application link is invalid or expired.';

            setError(
              message
            );

            return null;
          }

          /*
           * ====================================================
           * SUBMIT EXISTING APPLICATION
           * ====================================================
           *
           * IMPORTANT:
           *
           * We are NOT creating a new application API.
           *
           * We continue using your existing
           * createApplication() method.
           *
           * For referral:
           *     send invitationToken as referralToken
           *
           * For invitation:
           *     send undefined
           *
           * For normal application:
           *     send undefined
           */

          const response =
            await recruitmentService
              .createApplication(
                data as ApplicationFormValues,
                referralValid
                  ? invitationToken
                  : undefined
              );

          /*
           * Existing success behavior.
           */
          if (
            response.success
          ) {

            setIsSubmitted(
              true
            );

            return response.data;
          }

          /*
           * Existing API error behavior.
           */
          setError(
            response.message ||
            'Failed to submit application.'
          );

          return null;

        } catch (
          submitError
        ) {

          console.error(
            'Application submission error:',
            submitError
          );

          setError(
            'An error occurred while submitting the application.'
          );

          return null;

        } finally {

          setIsLoading(
            false
          );
        }
      },
      [
        invitationToken,
        invitationValid,
        referralValid,
      ]
    );

  /* ==========================================================
     VALIDATE STEP
  ========================================================== */

  const validateStep =
    useCallback(
      async (
        step: number
      ): Promise<boolean> => {

        try {

          switch (step) {

            case 1:

              return await methods.trigger(
                'basicInformation'
              );

            case 2:

              return await methods.trigger(
                'personalDetails'
              );

            case 3:

              return await methods.trigger(
                'emergencyContacts'
              );

            default:

              return true;
          }

        } catch (
          validationError
        ) {

          console.error(
            'Validation error:',
            validationError
          );

          return false;
        }
      },
      [
        methods,
      ]
    );

  /* ==========================================================
     STEP ERRORS
  ========================================================== */

  const getStepErrors =
    useCallback(
      (
        step: number
      ) => {

        const errors =
          methods.formState.errors;

        switch (step) {

          case 1:

            return (
              errors.basicInformation ||
              {}
            );

          case 2:

            return (
              errors.personalDetails ||
              {}
            );

          case 3:

            return (
              errors.emergencyContacts ||
              {}
            );

          default:

            return {};
        }
      },
      [
        methods.formState.errors,
      ]
    );

  /* ==========================================================
     RETURN
  ========================================================== */

  return {

    methods,

    isLoading,

    error,

    isSubmitted,

    /*
     * Existing invitation properties.
     */
    invitationLoading,

    invitationValid,

    invitationEmail,

    /*
     * New referral properties.
     */
    referralValid,

    isReferralToken,

    saveStepData,

    submitApplication,

    validateStep,

    getStepErrors,

    reset:
      methods.reset,
  };
};

export default useApplicationForm;