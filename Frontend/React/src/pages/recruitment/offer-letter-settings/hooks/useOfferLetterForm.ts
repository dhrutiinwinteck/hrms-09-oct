import {
  useCallback,
  useState,
} from "react";

import {
  DEFAULT_OFFER_LETTER,
} from "../constants/offerLetter.constants";

import type {
  OfferLetterFormData,
} from "../types/offerLetter.types";

export function useOfferLetterForm() {
  const [
    formData,
    setFormData,
  ] = useState<OfferLetterFormData>(
    DEFAULT_OFFER_LETTER,
  );

  const updateField = useCallback(
    <K extends keyof OfferLetterFormData>(
      field: K,
      value: OfferLetterFormData[K],
    ) => {
      setFormData(
        (previous) => ({
          ...previous,
          [field]: value,
        }),
      );
    },
    [],
  );

  const resetForm = useCallback(() => {
    setFormData({
      ...DEFAULT_OFFER_LETTER,
      companyLogoFile: null,
    });
  }, []);

  return {
    formData,
    setFormData,
    updateField,
    resetForm,
  };
}