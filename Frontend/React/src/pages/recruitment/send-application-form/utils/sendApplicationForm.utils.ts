import type {
  SendApplicationFormData,
} from "../types/sendApplicationForm.types";

export const getInitialSendApplicationFormData =
  (): SendApplicationFormData => ({
    email: "",
    subject: "",
    message: "",
  });

export const normalizeSendApplicationFormData = (
  data: SendApplicationFormData,
): SendApplicationFormData => {
  return {
    email: data.email.trim(),
    subject: data.subject.trim(),
    message: data.message.trim(),
  };
};

export const getMessageCharacterCount = (
  message: string,
): number => {
  return message.length;
};

export const isEmptySendApplicationForm = (
  data: SendApplicationFormData,
): boolean => {
  return !data.email.trim();
};