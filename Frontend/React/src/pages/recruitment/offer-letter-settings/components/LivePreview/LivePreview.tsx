import { Eye } from "lucide-react";
import { useEffect, useState } from "react";

import type { OfferLetterFormData } from "../../types/offerLetter.types";

import "./LivePreview.css";

interface LivePreviewProps {
  data: OfferLetterFormData;
}

export default function LivePreview({
  data,
}: LivePreviewProps) {
  const [signaturePreview, setSignaturePreview] =
    useState<string | null>(
      data.signatureFilePath,
    );

  const [stampPreview, setStampPreview] =
    useState<string | null>(
      data.stampFilePath,
    );

  /*
   * ============================================================
   * SIGNATURE PREVIEW
   * ============================================================
   */

  useEffect(() => {
    if (!data.signatureFile) {
      setSignaturePreview(data.signatureFilePath);
      return;
    }

    const objectUrl = URL.createObjectURL(
      data.signatureFile,
    );

    setSignaturePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [
    data.signatureFile,
    data.signatureFilePath,
  ]);

  /*
   * ============================================================
   * STAMP PREVIEW
   * ============================================================
   */

  useEffect(() => {
    if (!data.stampFile) {
      setStampPreview(data.stampFilePath);
      return;
    }

    const objectUrl = URL.createObjectURL(
      data.stampFile,
    );

    setStampPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [
    data.stampFile,
    data.stampFilePath,
  ]);

  return (
    <section className="ol-preview-card">
      {/* ======================================================
          PREVIEW HEADER
          ====================================================== */}

      <div className="ol-preview-heading">
        <div className="ol-preview-heading-icon">
          <Eye size={18} />
        </div>

        <div>
          <h2>Live Preview</h2>

          <p>
            This is how the offer letter will look
            for the employee.
          </p>
        </div>
      </div>

      {/* ======================================================
          DOCUMENT AREA
          ====================================================== */}

      <div className="ol-document-frame">
        <div className="ol-document-pages">

          {/* ==================================================
              PAGE 1
              ================================================== */}

          <article className="ol-document ol-document-page">
            <div className="ol-page-content">

              {/* COMPANY LOGO */}

              <div className="ol-document-logo-wrap">
                {data.showCompanyLogo &&
                data.companyLogo ? (
                  <img
                    src={data.companyLogo}
                    alt={data.companyName}
                    className="ol-document-logo"
                  />
                ) : (
                  <div className="ol-document-logo-text">
                    <span>inwin</span>
                    <strong>teck</strong>
                  </div>
                )}
              </div>

              {/* TITLE */}

              <div className="ol-document-title">
                {data.offerLetterTitle}
              </div>

              {/* DATE */}

              <div className="ol-document-date">
                {formatDate(data.offerDate)}
              </div>

              {/* CANDIDATE DETAILS */}

              <div className="ol-document-candidate">
                <div>
                  <strong>Mr.,</strong>
                </div>

                <div>
                  <strong>Address:</strong>{" "}
                  <span>
                    {data.candidateAddress}
                  </span>
                </div>

                <div>
                  <strong>Contact No.:</strong>{" "}
                  <span>
                    {data.candidateContactNo}
                  </span>
                </div>

                <div className="ol-candidate-email">
                  <strong>
                    Personal Email ID:
                  </strong>{" "}
                  <span>
                    {data.candidateEmail}
                  </span>
                </div>
              </div>

              {/* LETTER BODY */}

              <div className="ol-document-body">
                {renderParagraphs(
                  data.letterBodyTemplate,
                )}
              </div>
            </div>

            {/* PAGE 1 FOOTER */}

            <DocumentFooter
              data={data}
              pageNumber="Page 1 of 2"
            />
          </article>

          {/* ==================================================
              PAGE 2
              ================================================== */}

          <article className="ol-document ol-document-page">
            <div className="ol-page-content">

              {/* COMPANY LOGO */}

              <div className="ol-document-logo-wrap">
                {data.showCompanyLogo &&
                data.companyLogo ? (
                  <img
                    src={data.companyLogo}
                    alt={data.companyName}
                    className="ol-document-logo"
                  />
                ) : (
                  <div className="ol-document-logo-text">
                    <span>inwin</span>
                    <strong>teck</strong>
                  </div>
                )}
              </div>

              {/* PAGE 2 CONTENT */}

              <div className="ol-page-two-content">

                {/* CLOSING MESSAGE */}

                <p className="ol-closing-message">
                  We are excited to have you join our
                  team! If you have any questions,
                  please feel free to reach out at any
                  time.
                </p>

                {/* TWO COLUMN SIGNATURE / ACCEPTANCE */}

                <div className="ol-page-two-grid">

                  {/* LEFT SIDE */}

                  <div className="ol-page-two-left">
                    <div className="ol-document-signature">
                      <p>Sincerely,</p>

                      <div className="ol-signatory-assets">
                        {signaturePreview && (
                          <img
                            src={signaturePreview}
                            alt="HR Signature"
                            className="ol-hr-signature"
                          />
                        )}

                        {stampPreview && (
                          <img
                            src={stampPreview}
                            alt="Company Stamp"
                            className="ol-company-stamp"
                          />
                        )}
                      </div>

                      <strong>
                        {data.hrSignatoryName}
                      </strong>

                      <span>
                        {data.hrDesignation}
                      </span>
                    </div>

                    {/* HR DATE */}

                    <div className="ol-hr-date">
                      <span>Date:</span>
                      <div className="ol-sign-line" />
                    </div>
                  </div>

                  {/* RIGHT SIDE */}

                  {data.showCandidateAcceptance && (
                    <div className="ol-page-two-right">
                      <div className="ol-acceptance">

                        <strong>
                          ({data.acceptanceText})
                        </strong>

                        <div className="ol-acceptance-field">
                          <span>
                            Signature:
                          </span>

                          <div className="ol-acceptance-line" />
                        </div>

                        <div className="ol-acceptance-field">
                          <span>
                            Name:
                          </span>

                          <div className="ol-acceptance-line" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PAGE 2 FOOTER */}

            <DocumentFooter
              data={data}
              pageNumber="Page 2 of 2"
            />
          </article>
        </div>
      </div>
    </section>
  );
}

/*
 * ============================================================
 * DOCUMENT FOOTER
 * ============================================================
 */

function DocumentFooter({
  data,
  pageNumber,
}: {
  data: OfferLetterFormData;
  pageNumber: string;
}) {
  if (!data.showOfficeAddressFooter) {
    return (
      <div className="ol-page-number-only">
        {pageNumber}
      </div>
    );
  }

  return (
    <div className="ol-document-footer">
      <div className="ol-footer-address">
        {data.officeAddress
          .split("\n")
          .filter(Boolean)
          .map((line, index) => (
            <div
              key={`office-${index}`}
            >
              {line}
            </div>
          ))}

        {data.showSingaporeAddress &&
          data.singaporeOsAddress && (
            <>
              {data.singaporeOsAddress
                .split("\n")
                .filter(Boolean)
                .map((line, index) => (
                  <div
                    key={`singapore-${index}`}
                  >
                    {line}
                  </div>
                ))}

              <span className="ol-footer-os">
                (O/S)
              </span>
            </>
          )}
      </div>

      <div className="ol-page-number">
        {pageNumber}
      </div>
    </div>
  );
}

/*
 * ============================================================
 * DATE
 * ============================================================
 */

function formatDate(value: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(
    `${value}T00:00:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const month = date.toLocaleDateString(
    "en-US",
    {
      month: "long",
    },
  );

  const day = date.getDate();

  const year = date.getFullYear();

  return `${month} ${getOrdinal(day)}, ${year}`;
}

function getOrdinal(day: number): string {
  if (day >= 11 && day <= 13) {
    return `${day}th`;
  }

  switch (day % 10) {
    case 1:
      return `${day}st`;

    case 2:
      return `${day}nd`;

    case 3:
      return `${day}rd`;

    default:
      return `${day}th`;
  }
}

/*
 * ============================================================
 * LETTER PARAGRAPHS
 * ============================================================
 */

function renderParagraphs(
  value: string,
) {
  return value
    .split(/\n\n+/)
    .filter(Boolean)
    .map(
      (paragraph, index) => (
        <p
          key={`${paragraph}-${index}`}
        >
          {replaceMergeFields(
            paragraph,
          )}
        </p>
      ),
    );
}

/*
 * ============================================================
 * MERGE FIELD HIGHLIGHT
 * ============================================================
 */

// function replaceMergeFields(
//   value: string,
// ) {
//   const mergeFieldRegex =
//     /(\{\{CandidateName\}\}|\{\{CandidateAddress\}\}|\{\{CandidateContactNo\}\}|\{\{CandidateEmail\}\}|\{\{Position\}\}|\{\{ManagerName\}\}|\{\{JoiningDate\}\}|\{\{InterviewDate\}\}|\{\{ProbationPeriod\}\}|\{\{CTC\}\})/g;

//   return value
//     .split(mergeFieldRegex)
//     .map(
//       (part, index) =>
//         mergeFieldRegex.test(part) ? (
//           <mark
//             key={`${part}-${index}`}
//           >
//             {part}
//           </mark>
//         ) : (
//           <span
//             key={`${part}-${index}`}
//           >
//             {part}
//           </span>
//         ),
//     );
// }

function replaceMergeFields(
  value: string,
) {
  const mergeFieldRegex =
    /(\{\{CandidateName\}\}|\{\{CandidateAddress\}\}|\{\{CandidateContactNo\}\}|\{\{CandidateEmail\}\}|\{\{Position\}\}|\{\{ManagerName\}\}|\{\{JoiningDate\}\}|\{\{InterviewDate\}\}|\{\{ProbationPeriod\}\}|\{\{CTC\}\})/g;

  const mergeFieldCheck =
    /^(\{\{CandidateName\}\}|\{\{CandidateAddress\}\}|\{\{CandidateContactNo\}\}|\{\{CandidateEmail\}\}|\{\{Position\}\}|\{\{ManagerName\}\}|\{\{JoiningDate\}\}|\{\{InterviewDate\}\}|\{\{ProbationPeriod\}\}|\{\{CTC\}\})$/;

  return value
    .split(mergeFieldRegex)
    .map(
      (part, index) =>
        mergeFieldCheck.test(part) ? (
          <mark
            key={`${part}-${index}`}
          >
            {part}
          </mark>
        ) : (
          <span
            key={`${part}-${index}`}
          >
            {part}
          </span>
        ),
    );
}