import type {
  SendApplicationFormData,
} from "../types/sendApplicationForm.types";

export const sendApplicationFormMockData: SendApplicationFormData = {
  email: "",
  subject: "",
  message: "",
};

export const sendApplicationFormSuccessMock = {
  success: true,
  message:
    "Application invitation sent successfully.",
  reference_id: 1469657991,
  application_link:
    "http://localhost:5173/application/test-token",
};