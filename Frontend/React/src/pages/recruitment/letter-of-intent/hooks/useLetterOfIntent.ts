import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  DEFAULT_LETTER_OF_INTENT_FORM,
} from "../constants/letterOfIntent.constants";

import {
  letterOfIntentService,
} from "../services/letterOfIntent.service";

import type {
  LetterOfIntentFormData,
} from "../types/letterOfIntent.types";

import {
  createSettingsPayload,
  mapSettingsToForm,
} from "../utils/letterOfIntent.utils";

import {
  validateLetterOfIntent,
} from "../validations/letterOfIntent.validation";


/* ============================================================
   HOOK RESULT
   ============================================================ */

export interface UseLetterOfIntentResult {
  form: LetterOfIntentFormData;

  loading: boolean;
  saving: boolean;

  uploadingLogo: boolean;
  uploadingStamp: boolean;
  uploadingSignature: boolean;

  error: string | null;
  successMessage: string | null;

  updateField: <
    K extends keyof LetterOfIntentFormData,
  >(
    field: K,
    value: LetterOfIntentFormData[K],
  ) => void;

  saveSettings: () => Promise<boolean>;

  uploadLogo: (
    file: File,
  ) => Promise<boolean>;

  uploadStamp: (
    file: File,
  ) => Promise<boolean>;

  uploadSignature: (
    file: File,
  ) => Promise<boolean>;

  reload: () => Promise<void>;

  clearMessages: () => void;
}


/* ============================================================
   HOOK
   ============================================================ */

export const useLetterOfIntent =
  (): UseLetterOfIntentResult => {

    /* ========================================================
       FORM
       ======================================================== */

    const [form, setForm] =
      useState<LetterOfIntentFormData>(
        DEFAULT_LETTER_OF_INTENT_FORM,
      );


    /* ========================================================
       LOADING STATES
       ======================================================== */

    const [loading, setLoading] =
      useState(true);

    const [saving, setSaving] =
      useState(false);

    const [uploadingLogo, setUploadingLogo] =
      useState(false);

    const [uploadingStamp, setUploadingStamp] =
      useState(false);

    const [
      uploadingSignature,
      setUploadingSignature,
    ] = useState(false);


    /* ========================================================
       MESSAGES
       ======================================================== */

    const [error, setError] =
      useState<string | null>(null);

    const [
      successMessage,
      setSuccessMessage,
    ] = useState<string | null>(null);


    /* ========================================================
       LOAD SETTINGS
       ======================================================== */

    const loadSettings =
      useCallback(
        async (): Promise<void> => {
          setLoading(true);
          setError(null);

          try {
            const settings =
              await letterOfIntentService.getSettings();

            setForm(
              mapSettingsToForm(
                settings,
              ),
            );
          } catch (requestError) {
            setError(
              letterOfIntentService.getErrorMessage(
                requestError,
                "Unable to load Letter of Intent settings.",
              ),
            );
          } finally {
            setLoading(false);
          }
        },
        [],
      );


    /* ========================================================
       INITIAL LOAD
       ======================================================== */

    useEffect(() => {
      void loadSettings();
    }, [loadSettings]);


    /* ========================================================
       UPDATE FIELD
       ======================================================== */

    const updateField = useCallback(
      <
        K extends keyof LetterOfIntentFormData,
      >(
        field: K,
        value: LetterOfIntentFormData[K],
      ): void => {
        setForm((previous) => ({
          ...previous,
          [field]: value,
        }));

        setSuccessMessage(null);
      },
      [],
    );


    /* ========================================================
       SAVE SETTINGS
       ======================================================== */

    const saveSettings =
      useCallback(
        async (): Promise<boolean> => {
          setError(null);
          setSuccessMessage(null);

          const validationErrors =
            validateLetterOfIntent(form);

          if (
            Object.keys(
              validationErrors,
            ).length > 0
          ) {
            const firstError =
              Object.values(
                validationErrors,
              )[0];

            setError(
              firstError ??
                "Please correct the highlighted fields.",
            );

            return false;
          }

          setSaving(true);

          try {
            const saved =
              await letterOfIntentService.updateSettings(
                createSettingsPayload(
                  form,
                ),
              );

            setForm(
              mapSettingsToForm(
                saved,
              ),
            );

            setSuccessMessage(
              "Letter of Intent settings saved successfully.",
            );

            return true;
          } catch (requestError) {
            setError(
              letterOfIntentService.getErrorMessage(
                requestError,
                "Unable to save Letter of Intent settings.",
              ),
            );

            return false;
          } finally {
            setSaving(false);
          }
        },
        [form],
      );


    /* ========================================================
       UPLOAD COMPANY LOGO
       ======================================================== */

    const uploadLogo =
      useCallback(
        async (
          file: File,
        ): Promise<boolean> => {
          setError(null);
          setSuccessMessage(null);
          setUploadingLogo(true);

          try {
            const saved =
              await letterOfIntentService.uploadLogo(
                file,
              );

            setForm(
              mapSettingsToForm(
                saved,
              ),
            );

            setSuccessMessage(
              "Company logo uploaded successfully.",
            );

            return true;
          } catch (requestError) {
            setError(
              letterOfIntentService.getErrorMessage(
                requestError,
                "Unable to upload company logo.",
              ),
            );

            return false;
          } finally {
            setUploadingLogo(false);
          }
        },
        [],
      );


    /* ========================================================
       UPLOAD HR STAMP
       ======================================================== */

    const uploadStamp =
      useCallback(
        async (
          file: File,
        ): Promise<boolean> => {
          setError(null);
          setSuccessMessage(null);
          setUploadingStamp(true);

          try {
            const saved =
              await letterOfIntentService.uploadStamp(
                file,
              );

            setForm(
              mapSettingsToForm(
                saved,
              ),
            );

            setSuccessMessage(
              "HR stamp uploaded successfully.",
            );

            return true;
          } catch (requestError) {
            setError(
              letterOfIntentService.getErrorMessage(
                requestError,
                "Unable to upload HR stamp.",
              ),
            );

            return false;
          } finally {
            setUploadingStamp(false);
          }
        },
        [],
      );


    /* ========================================================
       UPLOAD HR SIGNATURE
       ======================================================== */

    const uploadSignature =
      useCallback(
        async (
          file: File,
        ): Promise<boolean> => {
          setError(null);
          setSuccessMessage(null);
          setUploadingSignature(true);

          try {
            const saved =
              await letterOfIntentService.uploadSignature(
                file,
              );

            setForm(
              mapSettingsToForm(
                saved,
              ),
            );

            setSuccessMessage(
              "HR signature uploaded successfully.",
            );

            return true;
          } catch (requestError) {
            setError(
              letterOfIntentService.getErrorMessage(
                requestError,
                "Unable to upload HR signature.",
              ),
            );

            return false;
          } finally {
            setUploadingSignature(false);
          }
        },
        [],
      );


    /* ========================================================
       RELOAD
       ======================================================== */

    const reload =
      useCallback(
        async (): Promise<void> => {
          setSuccessMessage(null);

          await loadSettings();
        },
        [loadSettings],
      );


    /* ========================================================
       CLEAR MESSAGES
       ======================================================== */

    const clearMessages =
      useCallback(
        (): void => {
          setError(null);
          setSuccessMessage(null);
        },
        [],
      );


    /* ========================================================
       RETURN
       ======================================================== */

    return {
      form,

      loading,
      saving,

      uploadingLogo,
      uploadingStamp,
      uploadingSignature,

      error,
      successMessage,

      updateField,

      saveSettings,

      uploadLogo,
      uploadStamp,
      uploadSignature,

      reload,
      clearMessages,
    };
  };