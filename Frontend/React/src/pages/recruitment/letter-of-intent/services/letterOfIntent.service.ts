import axios from "axios";

import axiosInstance from "../../../../services/axios/axiosInstance";

import type {
  LetterOfIntentSettings,
  LetterOfIntentSettingsUpdate,
} from "../types/letterOfIntent.types";

const LETTER_OF_INTENT_URL =
  "/api/v1/recruitment/letter-of-intent";

const SETTINGS_URL =
  `${LETTER_OF_INTENT_URL}/settings`;

const LOGO_URL =
  `${SETTINGS_URL}/logo`;

const STAMP_URL =
  `${SETTINGS_URL}/stamp`;

const SIGNATURE_URL =
  `${SETTINGS_URL}/signature`;

class LetterOfIntentService {
  async getSettings(): Promise<LetterOfIntentSettings> {
    const response =
      await axiosInstance.get<LetterOfIntentSettings>(
        SETTINGS_URL,
      );

    return response.data;
  }

  async updateSettings(
    payload: LetterOfIntentSettingsUpdate,
  ): Promise<LetterOfIntentSettings> {
    const response =
      await axiosInstance.put<LetterOfIntentSettings>(
        SETTINGS_URL,
        payload,
      );

    return response.data;
  }

  async uploadLogo(
    file: File,
  ): Promise<LetterOfIntentSettings> {
    const formData = new FormData();

    formData.append("file", file);

    const response =
      await axiosInstance.post<LetterOfIntentSettings>(
        LOGO_URL,
        formData,
      );

    return response.data;
  }

  async uploadStamp(
    file: File,
  ): Promise<LetterOfIntentSettings> {
    const formData = new FormData();

    formData.append("file", file);

    const response =
      await axiosInstance.post<LetterOfIntentSettings>(
        STAMP_URL,
        formData,
      );

    return response.data;
  }

  async uploadSignature(
  file: File,
): Promise<LetterOfIntentSettings> {
  const formData = new FormData();

  formData.append(
    "file",
    file,
  );

  const response =
    await axiosInstance.post<LetterOfIntentSettings>(
      SIGNATURE_URL,
      formData,
    );

  return response.data;
}

  getErrorMessage(
    error: unknown,
    fallback = "Something went wrong.",
  ): string {
    if (axios.isAxiosError(error)) {
      const responseData =
        error.response?.data as
          | {
              detail?: string;
              message?: string;
            }
          | undefined;

      return (
        responseData?.detail ??
        responseData?.message ??
        fallback
      );
    }

    if (error instanceof Error) {
      return error.message;
    }

    return fallback;
  }
}

export const letterOfIntentService =
  new LetterOfIntentService();