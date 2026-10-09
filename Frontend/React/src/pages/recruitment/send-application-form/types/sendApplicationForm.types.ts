export interface SendApplicationFormData {
  email: string;
  subject: string;
  message: string;
}

export interface SendApplicationFormErrors {
  email?: string;
  subject?: string;
  message?: string;
}

export interface ApplicationInvitationEmailTemplateResponse {
  subject: string;
  message: string;
}

export interface SendApplicationInvitationResponse {
  success: boolean;
  message: string;
  reference_id?: number;
  application_link?: string;
}

export interface SendApplicationFormServiceError {
  message: string;
  status?: number;
}