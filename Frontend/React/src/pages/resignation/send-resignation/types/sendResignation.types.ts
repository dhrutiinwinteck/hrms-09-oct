export interface ActiveEmployee {
  employee_id: number;
  employee_name: string;
  email: string;
}

export interface ResignationEmailFormData {
  employeeId: number | null;
  employeeEmail: string;
  subject: string;
  body: string;
  attachments: File[];
}

export interface ResignationEmailErrors {
  employeeEmail?: string;
  subject?: string;
  body?: string;
  attachments?: string;
}

export interface ResignationEmailResponse {
  success: boolean;
  message: string;
  recipient_email: string;
  attachment_count: number;
}

export interface SendResignationRequest {
  employeeId: number | null;
  employeeEmail: string;
  subject: string;
  body: string;
  attachments: File[];
}