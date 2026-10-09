import type {
  OfferLetterFormData,
} from "../types/offerLetter.types";


export interface OfferLetterApiPayload {
  offer_letter_title: string;

  company_logo?: string | null;

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

  probation_period_unit:
    | "Days"
    | "Weeks"
    | "Months";

  total_ctc: number | null;

  job_duties: string | null;

  acceptance_text: string | null;

  hr_signatory_name: string | null;

  hr_designation: string | null;

  letter_body_template: string;

  show_company_logo: boolean;

  show_office_address_footer: boolean;

  show_singapore_address: boolean;

  show_candidate_acceptance: boolean;

  page_size:
    | "A4"
    | "A3"
    | "A5"
    | "LETTER"
    | "LEGAL";
}


function cleanString(
  value: string | null | undefined,
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed === ""
    ? null
    : trimmed;
}


function isMergeToken(
  value: string,
): boolean {
  const trimmed = value.trim();

  return (
    trimmed.startsWith("{{") &&
    trimmed.endsWith("}}")
  );
}


/**
 * Converts frontend date values into
 * PostgreSQL/Pydantic compatible YYYY-MM-DD.
 *
 * Examples:
 *
 * 17-04-2026       -> 2026-04-17
 * 2026-04-17       -> 2026-04-17
 * {{JoiningDate}}  -> null
 * ""               -> null
 */
function normalizeDateValue(
  value: string | null | undefined,
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed === "") {
    return null;
  }

  if (isMergeToken(trimmed)) {
    return null;
  }

  /*
   * DD-MM-YYYY
   */
  const ddMmYyyyMatch =
    trimmed.match(
      /^(\d{2})-(\d{2})-(\d{4})$/,
    );

  if (ddMmYyyyMatch) {
    const [, day, month, year] =
      ddMmYyyyMatch;

    return `${year}-${month}-${day}`;
  }

  /*
   * YYYY-MM-DD
   */
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      trimmed,
    )
  ) {
    return trimmed;
  }

  /*
   * Invalid date value.
   */
  return null;
}


function normalizeLogoPath(
  value: string | null,
): string | null {
  if (!value) {
    return null;
  }

  /*
   * Browser preview URLs must never
   * be stored in database.
   */
  if (value.startsWith("blob:")) {
    return null;
  }

  /*
   * Convert backend absolute URL into
   * relative /uploads path.
   */
  try {
    const url = new URL(value);

    if (
      url.pathname.startsWith(
        "/uploads/",
      )
    ) {
      return url.pathname;
    }

    return value;
  } catch {
    return value;
  }
}


function normalizeTotalCtc(
  value: string,
): number | null {
  const trimmed = value.trim();

  if (trimmed === "") {
    return null;
  }

  /*
   * Merge fields such as:
   * {{CTC}}
   * {{TOTAL_CTC}}
   *
   * cannot be stored in Numeric column.
   */
  if (isMergeToken(trimmed)) {
    return null;
  }

  const numericValue =
    Number(trimmed);

  if (
    !Number.isFinite(
      numericValue,
    )
  ) {
    return null;
  }

  return numericValue;
}


export function mapOfferLetterFormToApi(
  data: OfferLetterFormData,
): OfferLetterApiPayload {

  const payload: OfferLetterApiPayload = {
    offer_letter_title:
      data.offerLetterTitle.trim(),

    company_name:
      data.companyName.trim(),

    office_address:
      cleanString(
        data.officeAddress,
      ),

    singapore_os_address:
      cleanString(
        data.singaporeOsAddress,
      ),

    /*
     * IMPORTANT:
     * Convert 17-04-2026 to 2026-04-17.
     */
    offer_date:
      normalizeDateValue(
        data.offerDate,
      ),

    candidate_name:
      cleanString(
        data.candidateName,
      ),

    candidate_address:
      cleanString(
        data.candidateAddress,
      ),

    candidate_contact_no:
      cleanString(
        data.candidateContactNo,
      ),

    candidate_email:
      cleanString(
        data.candidateEmail,
      ),

    position:
      data.position.trim(),

    reporting_manager:
      data.reportingManager.trim(),

    reporting_manager_designation:
      cleanString(
        data.reportingManagerDesignation,
      ),

    /*
     * {{JoiningDate}} is a merge field,
     * therefore send null to the DB.
     */
    joining_date:
      normalizeDateValue(
        data.joiningDate,
      ),

    probation_period:
      Number.isFinite(
        data.probationPeriod,
      )
        ? data.probationPeriod
        : null,

    probation_period_unit:
      data.probationPeriodUnit,

    total_ctc:
      normalizeTotalCtc(
        data.totalCtc,
      ),

    job_duties:
      cleanString(
        data.jobDuties,
      ),

    acceptance_text:
      cleanString(
        data.acceptanceText,
      ),

    hr_signatory_name:
      cleanString(
        data.hrSignatoryName,
      ),

    hr_designation:
      cleanString(
        data.hrDesignation,
      ),

    letter_body_template:
      data.letterBodyTemplate,

    show_company_logo:
      data.showCompanyLogo,

    show_office_address_footer:
      data.showOfficeAddressFooter,

    show_singapore_address:
      data.showSingaporeAddress,

    show_candidate_acceptance:
      data.showCandidateAcceptance,

    page_size:
      data.pageSize,
  };


  /*
   * Existing persisted logo.
   *
   * New logo files are uploaded separately
   * through multipart endpoint.
   */
  if (
    !data.companyLogoFile &&
    !data.companyLogoRemoved
  ) {
    payload.company_logo =
      normalizeLogoPath(
        data.companyLogo,
      );
  }


  /*
   * User explicitly removed logo.
   */
  if (
    data.companyLogoRemoved
  ) {
    payload.company_logo = null;
  }


  return payload;
}


export function isValidLogoFile(
  file: File,
): boolean {
  const validTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  const maxSize =
    2 * 1024 * 1024;

  return (
    validTypes.includes(
      file.type,
    ) &&
    file.size <= maxSize
  );
}