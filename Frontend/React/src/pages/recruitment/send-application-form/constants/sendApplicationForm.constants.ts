export const SEND_APPLICATION_FORM_CONSTANTS = {
  MAX_MESSAGE_LENGTH: 5000,

  DEFAULT_SUBJECT:
    "Invitation to Complete Application Form – Inwinteck Private Limited",

  API_ENDPOINT:
    "/api/v1/api/v1/application-invitations",

  TEMPLATE_ENDPOINT:
    "/api/v1/api/v1/application-invitations/email-template",

  ROUTES: {
    DASHBOARD:
      "/dashboard/home",

    RECRUITMENT:
      "/recruitment",

    SEND_APPLICATION_FORM:
      "/recruitment/send-application-form",

    JOINING_APPROVALS:
      "/recruitment/joining-approval",
  },

  MESSAGES: {
    SUCCESS:
      "Application invitation sent successfully.",

    GENERIC_ERROR:
      "Unable to send the application invitation. Please try again.",

    TEMPLATE_ERROR:
      "Unable to load the email template. Please try again.",
  },
} as const;