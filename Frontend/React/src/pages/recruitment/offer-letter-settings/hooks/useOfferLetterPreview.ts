import { useMemo } from "react";

import type { OfferLetterFormData } from "../types/offerLetter.types";

export function useOfferLetterPreview(data: OfferLetterFormData) {
  return useMemo(() => {
    return {
      companyName: data.companyName,
      officeAddress: data.officeAddress,
      singaporeOsAddress: data.singaporeOsAddress,
      offerDate: data.offerDate,
      candidateName: data.candidateName,
      candidateAddress: data.candidateAddress,
      candidateContactNo: data.candidateContactNo,
      candidateEmail: data.candidateEmail,
      position: data.position,
      reportingManager: data.reportingManager,
      joiningDate: data.joiningDate,
      probationPeriod: `${data.probationPeriod} ${data.probationPeriodUnit}`,
      ctc: data.totalCtc,
      body: data.letterBodyTemplate,
    };
  }, [data]);
}