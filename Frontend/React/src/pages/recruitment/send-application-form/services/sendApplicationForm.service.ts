import type {
  ApplicationInvitationEmailTemplateResponse,
  SendApplicationFormData,
  SendApplicationInvitationResponse,
} from "../types/sendApplicationForm.types";

import {
  SEND_APPLICATION_FORM_CONSTANTS,
} from "../constants/sendApplicationForm.constants";

/* ============================================================
   API BASE URL
   ============================================================ */

const getApiBaseUrl = (): string => {
  const configuredBaseUrl =
    import.meta.env.VITE_API_BASE_URL;

  if (
    !configuredBaseUrl ||
    !configuredBaseUrl.trim()
  ) {
    throw new Error(
      "VITE_API_BASE_URL is not configured.",
    );
  }

  return configuredBaseUrl
    .trim()
    .replace(/\/+$/, "");
};

/* ============================================================
   AUTH TOKEN
   ============================================================ */

const getAuthToken = (): string | null => {
  const tokenKeys = [
    "token",
    "access_token",
    "accessToken",
    "jwtToken",
    "authToken",
    "Authorization",
  ];

  for (const key of tokenKeys) {
    const storedValue =
      localStorage.getItem(key);

    if (
      !storedValue ||
      !storedValue.trim()
    ) {
      continue;
    }

    let token = storedValue.trim();

    /*
     * Handle values stored using JSON.stringify().
     *
     * Example:
     * "\"eyJhbGciOi...\""
     */
    try {
      const parsed: unknown =
        JSON.parse(token);

      if (typeof parsed === "string") {
        token = parsed.trim();
      }
    } catch {
      /*
       * Value is already a normal string.
       */
    }

    /*
     * Remove accidental Bearer prefix.
     */
    if (
      token
        .toLowerCase()
        .startsWith("bearer ")
    ) {
      token = token.substring(7).trim();
    }

    if (token) {
      return token;
    }
  }

  return null;
};

/* ============================================================
   HEADERS
   ============================================================ */

const buildHeaders = (): HeadersInit => {
  const token = getAuthToken();

  if (!token) {
    throw new Error(
      "Authentication token is missing. Please login again.",
    );
  }

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/* ============================================================
   RESPONSE PARSER
   ============================================================ */

const parseResponse = async (
  response: Response,
): Promise<Record<string, unknown>> => {
  const contentType =
    response.headers.get("content-type") ?? "";

  if (
    !contentType
      .toLowerCase()
      .includes("application/json")
  ) {
    return {};
  }

  try {
    const body: unknown =
      await response.json();

    if (
      body &&
      typeof body === "object" &&
      !Array.isArray(body)
    ) {
      return body as Record<string, unknown>;
    }

    return {};
  } catch {
    return {};
  }
};

/* ============================================================
   ERROR MESSAGE
   ============================================================ */

const getErrorMessage = (
  body: Record<string, unknown>,
): string => {
  if (
    typeof body.detail === "string" &&
    body.detail.trim()
  ) {
    return body.detail;
  }

  if (
    typeof body.message === "string" &&
    body.message.trim()
  ) {
    return body.message;
  }

  return (
    SEND_APPLICATION_FORM_CONSTANTS
      .MESSAGES.GENERIC_ERROR
  );
};

/* ============================================================
   GET EMAIL TEMPLATE
   ============================================================ */

export const getApplicationInvitationEmailTemplate =
  async (): Promise<ApplicationInvitationEmailTemplateResponse> => {
    const baseUrl =
      getApiBaseUrl();

    const url =
      `${baseUrl}${SEND_APPLICATION_FORM_CONSTANTS.TEMPLATE_ENDPOINT}`;

    let response: Response;

    try {
      response = await fetch(url, {
        method: "GET",
        headers: buildHeaders(),
      });
    } catch {
      throw new Error(
        "Unable to connect to the backend server.",
      );
    }

    const body =
      await parseResponse(response);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Your login session has expired. Please login again.",
        );
      }

      throw new Error(
        getErrorMessage(body),
      );
    }

    const subject =
      typeof body.subject === "string"
        ? body.subject
        : "";

    const message =
      typeof body.message === "string"
        ? body.message
        : "";

    if (
      !subject.trim() ||
      !message.trim()
    ) {
      throw new Error(
        SEND_APPLICATION_FORM_CONSTANTS
          .MESSAGES.TEMPLATE_ERROR,
      );
    }

    return {
      subject,
      message,
    };
  };

/* ============================================================
   SEND APPLICATION INVITATION
   ============================================================ */

export const sendApplicationForm =
  async (
    data: SendApplicationFormData,
  ): Promise<SendApplicationInvitationResponse> => {
    const baseUrl =
      getApiBaseUrl();

    const url =
      `${baseUrl}${SEND_APPLICATION_FORM_CONSTANTS.API_ENDPOINT}`;

    /*
     * Backend currently accepts candidate_email
     * and owns the default email template.
     *
     * Subject and message are still kept in the
     * frontend model so the existing UI remains unchanged.
     */
    const payload = {
      candidate_email:
        data.email.trim(),

      subject:
        data.subject.trim(),

      message:
        data.message.trim(),
    };

    let response: Response;

    try {
      response = await fetch(url, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error(
        "Unable to connect to the backend server.",
      );
    }

    const body =
      await parseResponse(response);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Your login session has expired. Please login again.",
        );
      }

      throw new Error(
        `HTTP ${response.status}: ${getErrorMessage(body)}`,
      );
    }

    return {
      success:
        typeof body.success === "boolean"
          ? body.success
          : true,

      message:
        typeof body.message === "string"
          ? body.message
          : SEND_APPLICATION_FORM_CONSTANTS
              .MESSAGES.SUCCESS,

      reference_id:
        typeof body.reference_id === "number"
          ? body.reference_id
          : undefined,

      application_link:
        typeof body.application_link === "string"
          ? body.application_link
          : undefined,
    };
  };