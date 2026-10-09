import axios from "axios";

import {
  SEND_RESIGNATION_CONSTANTS,
} from "../constants/sendResignation.constants";

export const isValidEmail = (
  email: string,
): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email.trim(),
  );
};

export const getFileExtension = (
  filename: string,
): string => {
  const lastDotIndex =
    filename.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return "";
  }

  return filename
    .substring(lastDotIndex)
    .toLowerCase();
};

export const isAllowedAttachment = (
  file: File,
): boolean => {
  const extension =
    getFileExtension(file.name);

  return SEND_RESIGNATION_CONSTANTS.FILES.ALLOWED_EXTENSIONS.includes(
    extension as
      | ".pdf"
      | ".doc"
      | ".docx"
      | ".jpg"
      | ".jpeg"
      | ".png",
  );
};

export const isAttachmentSizeValid = (
  file: File,
): boolean => {
  return (
    file.size <=
    SEND_RESIGNATION_CONSTANTS.FILES
      .MAX_SIZE_BYTES
  );
};

export const formatFileSize = (
  bytes: number,
): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
};

export const getFileType = (
  file: File,
): "pdf" | "word" | "image" | "file" => {
  const extension =
    getFileExtension(file.name);

  if (extension === ".pdf") {
    return "pdf";
  }

  if (
    extension === ".doc" ||
    extension === ".docx"
  ) {
    return "word";
  }

  if (
    extension === ".jpg" ||
    extension === ".jpeg" ||
    extension === ".png"
  ) {
    return "image";
  }

  return "file";
};

export const extractApiErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          detail?: string;
          message?: string;
          error?: string;
        }
      | undefined;

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (typeof data?.message === "string") {
      return data.message;
    }

    if (typeof data?.error === "string") {
      return data.error;
    }

    const status =
      error.response?.status;

    if (status === 401) {
      return "Authentication failed. Please login again.";
    }

    if (status === 403) {
      return "You are not authorized to send resignation emails.";
    }

    if (status === 404) {
      return "The requested employee or resignation API was not found.";
    }

    if (status === 413) {
      return "One of the attachments is too large.";
    }

    if (status !== undefined && status >= 500) {
      return "The server could not send the email. Please check the backend email configuration.";
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};