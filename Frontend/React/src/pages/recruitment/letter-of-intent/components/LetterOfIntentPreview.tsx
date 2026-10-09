// import { Eye } from "lucide-react";

// import "./LetterOfIntentPreview.css";

// import type {
//   LetterOfIntentFormData,
// } from "../types/letterOfIntent.types";

// import {
//   bodyToPreviewHtml,
//   formatDisplayDate,
// } from "../utils/letterOfIntent.utils";

// import { getFileUrl } from "../../utils/fileUrl";

// interface LetterOfIntentPreviewProps {
//   form: LetterOfIntentFormData;
// }

// const LetterOfIntentPreview = ({
//   form,
// }: LetterOfIntentPreviewProps) => {
//   const bodyHtml =
//     bodyToPreviewHtml(
//       form.letter_body,
//       form,
//     );

//   const logoUrl =
//     getFileUrl(
//       form.company_logo,
//     );

//   const stampUrl =
//     getFileUrl(
//       form.stamp_image_path,
//     );

//   return (
//     <section className="loi-preview-card">

//       <div className="loi-card-heading">

//         <div className="loi-card-icon">
//           <Eye size={19} />
//         </div>

//         <div>
//           <h2>
//             Live Preview
//           </h2>

//           <p>
//             This is how the Letter of Intent will
//             look for the employee.
//           </p>
//         </div>

//       </div>

//       <div className="loi-preview-container">

//         <article
//           id="loi-pdf-paper"
//           className={`loi-paper ${
//             form.page_size === "LETTER"
//               ? "loi-paper-letter"
//               : ""
//           }`}
//         >

//           {/* =================================================
//               COMPANY LOGO
//               ================================================= */}

//           {form.show_company_logo &&
//             form.company_logo && (
//               <div className="loi-paper-logo">

//                 <img
//                   src={logoUrl}
//                   alt={
//                     form.company_name ||
//                     "Company Logo"
//                   }
//                   crossOrigin="anonymous"
//                   onError={() => {
//                     console.error(
//                       "Failed to load LOI preview logo:",
//                       logoUrl,
//                     );
//                   }}
//                 />

//               </div>
//             )}

//           {/* =================================================
//               TITLE
//               ================================================= */}

//           <div className="loi-paper-title">

//             <h2>
//               {form.letter_title ||
//                 "LETTER OF INTENT TO HIRE"}
//             </h2>

//           </div>

//           {/* =================================================
//               DATE
//               ================================================= */}

//           <div className="loi-paper-date">

//             Date:{" "}
//             {formatDisplayDate(
//               form.letter_date,
//             )}

//           </div>

//           {/* =================================================
//               CANDIDATE
//               ================================================= */}

//           <div className="loi-paper-candidate">

//             <strong>
//               Mr. John Doe
//             </strong>

//             <span>
//               123, Sample Address
//             </span>

//             <span>
//               Thane, Maharashtra
//             </span>

//             <span>
//               Contact no: 9876543210
//             </span>

//           </div>

//           {/* =================================================
//               BODY
//               ================================================= */}

//           <div
//             className="loi-paper-body"
//             dangerouslySetInnerHTML={{
//               __html: bodyHtml,
//             }}
//           />

//           {/* =================================================
//               HR SIGNATURE
//               ================================================= */}

//           {form.show_hr_signature_section && (
//             <div className="loi-signature">

//               <div className="loi-signature-greeting">
//                 Sincerely,
//               </div>

//               {form.stamp_image_path && (
//                 <div className="loi-signature-stamp">

//                   <img
//                     src={stampUrl}
//                     alt="HR stamp"
//                     crossOrigin="anonymous"
//                     onError={() => {
//                       console.error(
//                         "Failed to load HR stamp:",
//                         stampUrl,
//                       );
//                     }}
//                   />

//                 </div>
//               )}

//               <strong>
//                 {form.hr_signatory_name.trim() ||
//                   "Authorized Signatory"}
//               </strong>

//               <span>
//                 Human Resource Management
//               </span>

//             </div>
//           )}

//           {/* =================================================
//               FOOTER
//               ================================================= */}

//           {form.show_registered_office_footer && (
//             <footer className="loi-paper-footer">
//               {form.registered_office_address}
//             </footer>
//           )}

//         </article>

//       </div>

//       <div className="loi-preview-navigation">

//         <button
//           type="button"
//           disabled
//         >
//           ‹ Previous
//         </button>

//         <strong>
//           Page 1 of 1
//         </strong>

//         <button
//           type="button"
//           disabled
//         >
//           Next ›
//         </button>

//       </div>

//     </section>
//   );
// };

// export default LetterOfIntentPreview;




import { Eye } from "lucide-react";

import "./LetterOfIntentPreview.css";

import type {
  LetterOfIntentFormData,
} from "../types/letterOfIntent.types";

import {
  bodyToPreviewHtml,
  formatDisplayDate,
} from "../utils/letterOfIntent.utils";

import { getFileUrl } from "../../utils/fileUrl";

interface LetterOfIntentPreviewProps {
  form: LetterOfIntentFormData;
}

const LetterOfIntentPreview = ({
  form,
}: LetterOfIntentPreviewProps) => {
  const bodyHtml =
    bodyToPreviewHtml(
      form.letter_body,
      form,
    );

  const logoUrl =
    getFileUrl(
      form.company_logo,
    );

  const signatureUrl =
    getFileUrl(
      form.signature_image_path,
    );

  const stampUrl =
    getFileUrl(
      form.stamp_image_path,
    );

  return (
    <section className="loi-preview-card">
      <div className="loi-card-heading">
        <div className="loi-card-icon">
          <Eye size={19} />
        </div>

        <div>
          <h2>
            Live Preview
          </h2>

          <p>
            This is how the Letter of Intent will
            look for the employee.
          </p>
        </div>
      </div>

      <div className="loi-preview-container">
        <article
          id="loi-pdf-paper"
          className={`loi-paper ${
            form.page_size === "LETTER"
              ? "loi-paper-letter"
              : ""
          }`}
        >
          {/* =================================================
              COMPANY LOGO
              ================================================= */}

          {/* {form.show_company_logo &&
            form.company_logo && (
              <div className="loi-paper-logo">
                <img
                  src={logoUrl}
                  alt={
                    form.company_name ||
                    "Company Logo"
                  }
                  crossOrigin="anonymous"
                  onError={(event) => {
                    console.error(
                      "Failed to load LOI preview logo:",
                      logoUrl,
                    );

                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              </div>
            )} */}

            {/* =================================================
                COMPANY LOGO
                ================================================= */}

            {form.show_company_logo &&
              form.company_logo && (
                <div className="loi-paper-logo">
                  <img
                    src={logoUrl}
                    alt={
                      form.company_name ||
                      "Company Logo"
                    }
                    onLoad={() => {
                      console.log(
                        "LOI company logo loaded:",
                        logoUrl,
                      );
                    }}
                    onError={(event) => {
                      console.error(
                        "Failed to load LOI preview logo:",
                        logoUrl,
                      );

                      /*
                      * Do not silently hide the image.
                      *
                      * This makes the actual problem visible
                      * during development.
                      */
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                </div>
              )}

          {/* =================================================
              TITLE
              ================================================= */}

          <div className="loi-paper-title">
            <h2>
              {form.letter_title ||
                "LETTER OF INTENT TO HIRE"}
            </h2>
          </div>

          {/* =================================================
              DATE
              ================================================= */}

          <div className="loi-paper-date">
            Date:{" "}
            {formatDisplayDate(
              form.letter_date,
            )}
          </div>

          {/* =================================================
              CANDIDATE
              ================================================= */}

          <div className="loi-paper-candidate">
            <strong>
              Mr. John Doe
            </strong>

            <span>
              123, Sample Address
            </span>

            <span>
              Thane, Maharashtra
            </span>

            <span>
              Contact no: 9876543210
            </span>
          </div>

          {/* =================================================
              BODY
              ================================================= */}

          <div
            className="loi-paper-body"
            dangerouslySetInnerHTML={{
              __html: bodyHtml,
            }}
          />

          {/* =================================================
              HR SIGNATURE
              ================================================= */}

          {form.show_hr_signature_section && (
            <div className="loi-signature">
              <div className="loi-signature-greeting">
                Sincerely,
              </div>

              <div className="loi-signature-images">
                {/* SIGNATURE FIRST */}

                {form.signature_image_path && (
                  <div className="loi-signature-image">
                    <img
                      src={signatureUrl}
                      alt="HR signature"
                      crossOrigin="anonymous"
                      onError={(event) => {
                        console.error(
                          "Failed to load HR signature:",
                          signatureUrl,
                        );

                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  </div>
                )}

                {/* STAMP SECOND */}

                {form.stamp_image_path && (
                  <div className="loi-signature-stamp">
                    <img
                      src={stampUrl}
                      alt="HR stamp"
                      crossOrigin="anonymous"
                      onError={(event) => {
                        console.error(
                          "Failed to load HR stamp:",
                          stampUrl,
                        );

                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <strong>
                {form.hr_signatory_name.trim() ||
                  "Authorized Signatory"}
              </strong>

              <span>
                {form.hr_designation.trim() ||
                  "Human Resource Management"}
              </span>
            </div>
          )}

          {/* =================================================
              FOOTER
              ================================================= */}

          {form.show_registered_office_footer && (
            <footer className="loi-paper-footer">
              {form.registered_office_address}
            </footer>
          )}
        </article>
      </div>

      <div className="loi-preview-navigation">
        <button
          type="button"
          disabled
        >
          ‹ Previous
        </button>

        <strong>
          Page 1 of 1
        </strong>

        <button
          type="button"
          disabled
        >
          Next ›
        </button>
      </div>
    </section>
  );
};

export default LetterOfIntentPreview;