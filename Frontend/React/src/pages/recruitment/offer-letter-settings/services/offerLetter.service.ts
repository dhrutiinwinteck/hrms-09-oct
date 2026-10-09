import axiosInstance from "@/services/axios/axiosInstance";

import type {
  OfferLetterFormData,
} from "../types/offerLetter.types";

import {
  mapOfferLetterFormToApi,
} from "../utils/offerLetter.mapper";


export interface OfferLetterApiResponse {
  id: number;

  offer_letter_title: string;

  company_logo: string | null;

  company_name: string;

  office_address: string | null;

  singapore_os_address: string | null;

  offer_date: string | null;

  candidate_name: string | null;

  candidate_address: string | null;

  candidate_contact_no: string | null;

  candidate_email: string | null;

  position: string;

  reporting_manager: string;

  reporting_manager_designation: string | null;

  joining_date: string | null;

  probation_period: number | null;

  probation_period_unit: string;

  total_ctc: string | number | null;

  job_duties: string | null;

  acceptance_text: string | null;

  hr_signatory_name: string | null;

  hr_designation: string | null;

  signature_file_name: string | null;

  signature_file_path: string | null;

  stamp_file_name: string | null;

  stamp_file_path: string | null;

  letter_body_template: string;

  show_company_logo: boolean;

  show_office_address_footer: boolean;

  show_singapore_address: boolean;

  show_candidate_acceptance: boolean;

  page_size: string;

  created_by: number | null;

  created_on: string;

  modified_by: number | null;

  modified_on: string | null;

  is_active: boolean;
}


/*
 * Keep this fallback only for generating
 * absolute upload URLs.
 *
 * Axios configuration is NOT changed.
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000";


function getAbsoluteFileUrl(
  filePath: string | null,
): string | null {
  if (!filePath) {
    return null;
  }

  if (
    filePath.startsWith("http://") ||
    filePath.startsWith("https://")
  ) {
    return filePath;
  }

  return new URL(
    filePath,
    `${API_BASE_URL}/`,
  ).toString();
}


function mapApiResponseToForm(
  response: OfferLetterApiResponse,
): OfferLetterFormData {
  return {
    offerLetterTitle:
      response.offer_letter_title,

    companyLogo:
      getAbsoluteFileUrl(
        response.company_logo,
      ),

    companyLogoFile: null,

    companyLogoRemoved: false,

    companyName:
      response.company_name,

    officeAddress:
      response.office_address ?? "",

    singaporeOsAddress:
      response.singapore_os_address ?? "",

    offerDate:
      response.offer_date ?? "",

    candidateName:
      response.candidate_name ?? "",

    candidateAddress:
      response.candidate_address ?? "",

    candidateContactNo:
      response.candidate_contact_no ?? "",

    candidateEmail:
      response.candidate_email ?? "",

    position:
      response.position,

    reportingManager:
      response.reporting_manager,

    reportingManagerDesignation:
      response.reporting_manager_designation ?? "",

    joiningDate:
      response.joining_date ?? "",

    probationPeriod:
      response.probation_period ?? 0,

    probationPeriodUnit:
      response.probation_period_unit as
        | "Days"
        | "Weeks"
        | "Months",

    totalCtc:
      response.total_ctc === null ||
      response.total_ctc === undefined
        ? ""
        : String(response.total_ctc),

    jobDuties:
      response.job_duties ?? "",

    acceptanceText:
      response.acceptance_text ?? "",

    hrSignatoryName:
      response.hr_signatory_name ?? "",

    hrDesignation:
      response.hr_designation ?? "",

    signatureFileName:
      response.signature_file_name,

    signatureFilePath:
      getAbsoluteFileUrl(
        response.signature_file_path,
      ),

    signatureFile: null,

    stampFileName:
      response.stamp_file_name,

    stampFilePath:
      getAbsoluteFileUrl(
        response.stamp_file_path,
      ),

    stampFile: null,

    letterBodyTemplate:
      response.letter_body_template,

    showCompanyLogo:
      response.show_company_logo,

    showOfficeAddressFooter:
      response.show_office_address_footer,

    showSingaporeAddress:
      response.show_singapore_address,

    showCandidateAcceptance:
      response.show_candidate_acceptance,

    pageSize:
      response.page_size as
        | "A4"
        | "A3"
        | "A5"
        | "LETTER"
        | "LEGAL",
  };
}


/*
 * Returns null when no active Offer Letter
 * exists yet.
 *
 * This prevents the first page load from
 * producing a 404 request.
 */
export async function getActiveOfferLetter(): Promise<{
  id: number | null;
  data: OfferLetterFormData | null;
}> {
  const response =
    await axiosInstance.get<
      OfferLetterApiResponse | null
    >(
      "/api/v1/offer-letters/active",
    );

  if (!response.data) {
    return {
      id: null,
      data: null,
    };
  }

  return {
    id: response.data.id,
    data: mapApiResponseToForm(
      response.data,
    ),
  };
}


export async function createOfferLetter(
  data: OfferLetterFormData,
): Promise<{
  id: number;
  data: OfferLetterFormData;
}> {
  const payload =
    mapOfferLetterFormToApi(data);

  console.log(
    "CREATE OFFER LETTER PAYLOAD:",
    payload,
  );

  const response =
    await axiosInstance.post<
      OfferLetterApiResponse
    >(
      "/api/v1/offer-letters",
      payload,
    );

  return {
    id: response.data.id,
    data: mapApiResponseToForm(
      response.data,
    ),
  };
}


export async function updateOfferLetter(
  offerLetterId: number,
  data: OfferLetterFormData,
): Promise<{
  id: number;
  data: OfferLetterFormData;
}> {
  const payload =
    mapOfferLetterFormToApi(data);

  console.log(
    "UPDATE OFFER LETTER PAYLOAD:",
    payload,
  );

  const response =
    await axiosInstance.put<
      OfferLetterApiResponse
    >(
      `/api/v1/offer-letters/${offerLetterId}`,
      payload,
    );

  return {
    id: response.data.id,
    data: mapApiResponseToForm(
      response.data,
    ),
  };
}


export async function uploadOfferLetterLogo(
  offerLetterId: number,
  file: File,
): Promise<{
  id: number;
  data: OfferLetterFormData;
}> {
  const formData = new FormData();

  formData.append(
    "file",
    file,
  );

  const response =
    await axiosInstance.post<
      OfferLetterApiResponse
    >(
      `/api/v1/offer-letters/${offerLetterId}/logo`,
      formData,
    );

  return {
    id: response.data.id,
    data: mapApiResponseToForm(
      response.data,
    ),
  };
}


export async function uploadOfferLetterSignature(
  offerLetterId: number,
  file: File,
): Promise<{
  id: number;
  data: OfferLetterFormData;
}> {
  const formData = new FormData();

  formData.append(
    "file",
    file,
  );

  const response =
    await axiosInstance.post<
      OfferLetterApiResponse
    >(
      `/api/v1/offer-letters/${offerLetterId}/signature`,
      formData,
    );

  return {
    id: response.data.id,
    data: mapApiResponseToForm(
      response.data,
    ),
  };
}


export async function uploadOfferLetterStamp(
  offerLetterId: number,
  file: File,
): Promise<{
  id: number;
  data: OfferLetterFormData;
}> {
  const formData = new FormData();

  formData.append(
    "file",
    file,
  );

  const response =
    await axiosInstance.post<
      OfferLetterApiResponse
    >(
      `/api/v1/offer-letters/${offerLetterId}/stamp`,
      formData,
    );

  return {
    id: response.data.id,
    data: mapApiResponseToForm(
      response.data,
    ),
  };
}


export async function deleteOfferLetter(
  offerLetterId: number,
): Promise<void> {
  await axiosInstance.delete(
    `/api/v1/offer-letters/${offerLetterId}`,
  );
}