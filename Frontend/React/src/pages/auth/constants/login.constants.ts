/**
 * @file login.constants.ts
 * @description Constants used by the login flow.
 * @version 3.0.0
 */

export const AUTH_STORAGE_KEY = "hrms_auth";

/**
 * Real backend login is the primary authentication mechanism.
 *
 * The application will automatically fall back to static login
 * only when the backend is unavailable or returns a server-side
 * availability error.
 */
export const USE_MOCK_LOGIN = false;

/**
 * Static login credentials.
 *
 * These credentials are used only as a fallback when the
 * authentication API cannot be reached or is unavailable.
 *
 * IMPORTANT:
 * Keep these credentials only for development/fallback usage.
 * Do not use static credentials in production.
 */
export const MOCK_CREDENTIALS = {
  emp_code: "IWT01",
  password: "inwinteck123",
} as const;

/**
 * Static token used only for frontend fallback authentication.
 *
 * This token is NOT a backend JWT and therefore must not be used
 * for backend-protected API calls.
 */
export const MOCK_ACCESS_TOKEN = "mock-access-token";

/**
 * Backend authentication endpoint.
 *
 * Swagger:
 * POST /api/v1/auth/login
 */
export const LOGIN_API_ENDPOINT = "/api/v1/auth/login";