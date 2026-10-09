import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import axios from "axios";

import type {
  OfferLetterFormData,
} from "../types/offerLetter.types";

import {
  createOfferLetter,
  getActiveOfferLetter,
  updateOfferLetter,
  uploadOfferLetterLogo,
  uploadOfferLetterSignature,
  uploadOfferLetterStamp,
} from "../services/offerLetter.service";


export function useOfferLetterSettings(
  setFormData: Dispatch<
    SetStateAction<OfferLetterFormData>
  >,
) {
  const [
    offerLetterId,
    setOfferLetterId,
  ] = useState<number | null>(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState<boolean>(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState<boolean>(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);


  const loadTemplate = useCallback(
    async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result =
          await getActiveOfferLetter();

        /*
         * No Offer Letter exists yet.
         *
         * This is the normal first-time state.
         * Keep offerLetterId as null so the
         * next Save performs CREATE.
         */
        if (
          !result.data ||
          result.id === null
        ) {
          setOfferLetterId(null);
          return;
        }

        /*
         * Existing Offer Letter found.
         */
        setOfferLetterId(result.id);
        setFormData(result.data);

      } catch (error) {
        console.error(
          "Failed to load Offer Letter template:",
          error,
        );

        if (
          axios.isAxiosError(error)
        ) {
          console.error(
            "Load status:",
            error.response?.status,
          );

          console.error(
            "Load response:",
            error.response?.data,
          );
        }

        setError(
          "Failed to load Offer Letter settings.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [setFormData],
  );


  const saveTemplate = useCallback(
    async (
      data: OfferLetterFormData,
    ) => {
      setIsSaving(true);
      setError(null);

      try {
        let result: {
          id: number;
          data: OfferLetterFormData;
        };

        /*
         * CREATE
         *
         * No existing Offer Letter ID means
         * this is the first save.
         */
        if (
          offerLetterId === null
        ) {
          result =
            await createOfferLetter(
              data,
            );

          /*
           * Store the newly created DB ID.
           * All future saves will use UPDATE.
           */
          setOfferLetterId(
            result.id,
          );
        }

        /*
         * UPDATE
         *
         * Existing Offer Letter already
         * exists in the database.
         */
        else {
          result =
            await updateOfferLetter(
              offerLetterId,
              data,
            );
        }

        /*
         * LOGO UPLOAD
         *
         * Upload only after the Offer Letter
         * database record has been created.
         */
        if (
          data.companyLogoFile
        ) {
          result =
            await uploadOfferLetterLogo(
              result.id,
              data.companyLogoFile,
            );
        }

        if (data.signatureFile) {
  result = await uploadOfferLetterSignature(
    result.id,
    data.signatureFile,
  );
}

if (data.stampFile) {
  result = await uploadOfferLetterStamp(
    result.id,
    data.stampFile,
  );
}

        /*
         * Replace frontend state with the
         * actual data returned by backend.
         */
        setFormData(
          result.data,
        );

        /*
         * Clear the local file after a
         * successful save/upload.
         */
        setFormData(
  (previous) => ({
    ...previous,
    companyLogoFile: null,
    companyLogoRemoved: false,
    signatureFile: null,
    stampFile: null,
  }),
);

        return result;

      } catch (error) {
        console.error(
          "Offer Letter save error:",
          error,
        );

        if (
          axios.isAxiosError(error)
        ) {
          console.error(
            "Save status:",
            error.response?.status,
          );

          console.error(
            "Save response:",
            error.response?.data,
          );

          console.error(
            "Save request:",
            error.config?.url,
          );
        }

        setError(
          "Failed to save Offer Letter settings.",
        );

        throw error;

      } finally {
        setIsSaving(false);
      }
    },
    [
      offerLetterId,
      setFormData,
    ],
  );


  return {
    offerLetterId,
    isLoading,
    isSaving,
    error,
    loadTemplate,
    saveTemplate,
  };
}