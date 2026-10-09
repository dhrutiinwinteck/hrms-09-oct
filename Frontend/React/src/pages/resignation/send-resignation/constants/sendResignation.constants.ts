export const SEND_RESIGNATION_CONSTANTS = {
  API: {
    BASE_ROUTE: "/resignation/resignations",
    ACTIVE_EMPLOYEES: "/active-employees",
    SEND_EMAIL: "/send-email",
  },

  FILES: {
    MAX_SIZE_BYTES: 10 * 1024 * 1024,
    MAX_SIZE_MB: 10,

    ALLOWED_EXTENSIONS: [
      ".pdf",
      ".doc",
      ".docx",
      ".jpg",
      ".jpeg",
      ".png",
    ],

    ACCEPT:
      ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  },

  FORM: {
    DEFAULT_SUBJECT:
      "Resignation – Important Information",

    DEFAULT_MESSAGE: `Dear Team,

This is to inform you about the resignation process. Please find the attached documents for your reference.

For any queries, please feel free to reach out.

Regards,
HR Team`,
  },

  MESSAGES: {
    ACTIVE_EMPLOYEES_ERROR:
      "Unable to load active employees. Please try again.",

    SEND_SUCCESS:
      "Resignation email sent successfully.",

    SEND_ERROR:
      "Unable to send resignation email. Please try again.",

    EMPLOYEE_REQUIRED:
      "Please select an active employee or enter an employee email address.",

    SUBJECT_REQUIRED:
      "Email subject is required.",

    BODY_REQUIRED:
      "Email message is required.",

    INVALID_EMAIL:
      "Please enter a valid email address.",

    INVALID_FILE:
      "This file type is not supported.",

    FILE_TOO_LARGE:
      "Each attachment must be 10 MB or smaller.",
  },
} as const;