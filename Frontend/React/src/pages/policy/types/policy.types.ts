/* ============================================================
   POLICY TYPES
============================================================ */

export type PolicyStatus =
  | 'Active'
  | 'Inactive';


/* ============================================================
   POLICY VIEWER MODE
============================================================ */

export type PolicyViewerMode =
  | 'read';


/* ============================================================
   POLICY LANGUAGE
============================================================ */

export type PolicyLanguage =
  | 'en'
  | 'hi'
  | 'bn';


/* ============================================================
   POLICY TRANSLATION
============================================================ */

export interface PolicyTranslation {
  title: string;
  content: string;
}


/* ============================================================
   POLICY TRANSLATIONS
============================================================ */

export interface PolicyTranslations {
  en?: PolicyTranslation;
  hi?: PolicyTranslation;
  bn?: PolicyTranslation;
}


/* ============================================================
   POLICY
============================================================ */

export interface Policy {
  id: number;

  title: string;

  description: string | null;

  documentUrl: string | null;

  version: number;

  status: PolicyStatus;

  createdBy: string | null;

  createdByName: string | null;

  creatorRole: string | null;

  createdAt: string | null;

  updatedAt: string | null;

  /**
   * Employee-specific acceptance state.
   */
  isAccepted?: boolean;

  /**
   * Optional translated policy content.
   */
  translations?: PolicyTranslations;
}


/* ============================================================
   POLICY CONTENT RESPONSE
============================================================ */

export interface PolicyContentResponse {
  success: boolean;

  message: string;

  policy_id: number;

  language: PolicyLanguage;

  title: string;

  version: number;

  content: string;
}


/* ============================================================
   POLICY LIST RESPONSE
============================================================ */

export interface PolicyListResponse {
  success: boolean;

  message: string;

  data: Policy[];
}


/* ============================================================
   POLICY CREATE RESPONSE
============================================================ */

export interface PolicyCreateResponse {
  success: boolean;

  message: string;

  data: Policy;
}


/* ============================================================
   POLICY DELETE RESPONSE
============================================================ */

export interface PolicyDeleteResponse {
  success: boolean;

  message: string;
}


/* ============================================================
   POLICY ACCEPTANCE REQUEST
============================================================ */

export interface PolicyAcceptanceRequest {
  policy_ids: number[];
}


/* ============================================================
   POLICY ACCEPTANCE RESPONSE
============================================================ */

export interface PolicyAcceptanceResponse {
  success: boolean;

  message: string;

  accepted_policy_ids: number[];
}


/* ============================================================
   EMPLOYEE POLICY ACCEPTANCE ITEM
============================================================ */

export interface PolicyAcceptanceItem {
  id: number;

  policyId: number;

  employeeId: number;

  version: number;

  accepted: boolean;

  acceptedOn: string;

  ipAddress: string | null;

  userAgent: string | null;
}


/* ============================================================
   EMPLOYEE ACCEPTANCE RESPONSE
============================================================ */

export interface EmployeePolicyAcceptanceResponse {
  success: boolean;

  message: string;

  data: PolicyAcceptanceItem[];
}