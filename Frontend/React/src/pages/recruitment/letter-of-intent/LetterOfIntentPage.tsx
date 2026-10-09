import {
  CalendarDays,
  FileDown,
  FileText,
  Save,
} from "lucide-react";

import html2pdf from "html2pdf.js";

import "./LetterOfIntentPage.css";

import LetterOfIntentHeader from "./components/LetterOfIntentHeader";
import CompanyLogoUpload from "./components/CompanyLogoUpload";
import StampUpload from "./components/StampUpload";
import LetterBodyEditor from "./components/LetterBodyEditor";
import AvailableMergeFields from "./components/AvailableMergeFields";
import LetterOfIntentPreview from "./components/LetterOfIntentPreview";
import LetterOfIntentTemplateSettings from "./components/LetterOfIntentTemplateSettings";
import SignatureUpload from "./components/SignatureUpload";

import {
  useLetterOfIntent,
} from "./hooks/useLetterOfIntent";

import {
  insertMergeField,
} from "./utils/letterOfIntent.utils";

const LetterOfIntentPage = () => {
  const {
  form,
  loading,
  saving,
  uploadingLogo,
  uploadingStamp,
  uploadingSignature,
  error,
  successMessage,
  updateField,
  saveSettings,
  uploadLogo,
  uploadStamp,
  uploadSignature,
} = useLetterOfIntent();

  /*
   * ============================================================
   * INSERT MERGE FIELD
   * ============================================================
   */

  const handleInsertMergeField = (
    field: string,
  ) => {
    updateField(
      "letter_body",
      insertMergeField(
        form.letter_body,
        field,
      ),
    );
  };

  /*
   * ============================================================
   * REMOVE COMPANY LOGO
   * ============================================================
   */

  const handleRemoveLogo = () => {
    updateField(
      "company_logo",
      null,
    );
  };

  /*
   * ============================================================
   * REMOVE HR STAMP
   * ============================================================
   */

  const handleRemoveStamp = () => {
    updateField(
      "stamp_image_path",
      null,
    );
  };

  const handleRemoveSignature = () => {
  updateField(
    "signature_image_path",
    null,
  );
};

  /*
   * ============================================================
   * PREVIEW FULL LETTER / GENERATE PDF
   *
   * The current Live Preview is cloned and converted into
   * an A4 PDF.
   *
   * The PDF opens in a new browser tab.
   * The browser PDF viewer will provide the Download button.
   * ============================================================
   */

  const handlePreviewFullLetter =
    async (): Promise<void> => {
      const paper =
        document.getElementById(
          "loi-pdf-paper",
        );

      if (!paper) {
        setTimeout(() => {
          console.error(
            "Letter of Intent preview element was not found.",
          );
        }, 0);

        return;
      }

      let wrapper:
        | HTMLDivElement
        | null = null;

      try {
        /*
         * ======================================================
         * CLONE CURRENT PREVIEW
         * ======================================================
         */

        const clonedPaper =
          paper.cloneNode(
            true,
          ) as HTMLElement;

        /*
         * ======================================================
         * CREATE PDF CONTAINER
         * ======================================================
         *
         * A4 at approximately 96 DPI:
         *
         * Width  = 794px
         * Height = 1123px
         *
         * This keeps the generated document close to
         * the actual A4 proportions.
         */

        wrapper =
          document.createElement(
            "div",
          );

        wrapper.style.position =
          "fixed";

        wrapper.style.left =
          "-100000px";

        wrapper.style.top =
          "0";

        wrapper.style.width =
          "794px";

        wrapper.style.minHeight =
          "1123px";

        wrapper.style.background =
          "#ffffff";

        wrapper.style.zIndex =
          "-1";

        /*
         * ======================================================
         * PREPARE CLONED PAPER
         * ======================================================
         */

        clonedPaper.style.width =
          "794px";

        clonedPaper.style.minWidth =
          "794px";

        clonedPaper.style.maxWidth =
          "794px";

        clonedPaper.style.minHeight =
          "1123px";

        clonedPaper.style.height =
          "1123px";

        clonedPaper.style.margin =
          "0";

        clonedPaper.style.boxSizing =
          "border-box";

        clonedPaper.style.background =
          "#ffffff";

        clonedPaper.style.boxShadow =
          "none";

        clonedPaper.style.border =
          "none";

        /*
         * The original preview has a fixed footer.
         * Keep it fixed relative to the A4 page.
         */

        wrapper.appendChild(
          clonedPaper,
        );

        document.body.appendChild(
          wrapper,
        );

        /*
         * ======================================================
         * WAIT FOR IMAGES
         * ======================================================
         *
         * Important for:
         *
         * - Company logo
         * - HR stamp
         *
         * Otherwise html2canvas can create a PDF before the
         * images are completely loaded.
         */

        const images =
          Array.from(
            clonedPaper.querySelectorAll(
              "img",
            ),
          );

        await Promise.all(
          images.map(
            (
              image,
            ) =>
              new Promise<void>(
                (
                  resolve,
                ) => {
                  if (
                    image.complete
                  ) {
                    resolve();
                    return;
                  }

                  image.onload =
                    () => {
                      resolve();
                    };

                  image.onerror =
                    () => {
                      /*
                       * Do not block the entire PDF if one
                       * optional image cannot be loaded.
                       */
                      console.warn(
                        "Unable to load preview image:",
                        image.src,
                      );

                      resolve();
                    };
                },
              ),
          ),
        );

        /*
         * Small delay allows browser layout/repaint to finish
         * before html2canvas takes the screenshot.
         */

        await new Promise<void>(
          (resolve) => {
            window.requestAnimationFrame(
              () => {
                window.requestAnimationFrame(
                  () => {
                    resolve();
                  },
                );
              },
            );
          },
        );

        /*
         * ======================================================
         * PDF OPTIONS
         * ======================================================
         */

        const pdfOptions = {
  margin: 0,

  filename:
    `Letter-of-Intent-${form.company_name || "Company"}.pdf`,

  image: {
    type: "jpeg" as const,
    quality: 0.98,
  },

  html2canvas: {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    logging: false,
    imageTimeout: 15000,
  },

  jsPDF: {
    unit: "mm" as const,
    format: "a4" as const,
    orientation: "portrait" as const,
    compress: true,
  },

  pagebreak: {
    mode: [
      "css",
      "legacy",
    ] as const,
  },
};

        /*
         * ======================================================
         * GENERATE PDF BLOB
         * ======================================================
         */

        const pdfBlob =
          await html2pdf()
            .set(pdfOptions)
            .from(clonedPaper)
            .outputPdf(
              "blob",
            );

        /*
         * ======================================================
         * OPEN PDF IN NEW TAB
         * ======================================================
         *
         * This is intentionally NOT:
         *
         * pdf.save()
         *
         * because we want HR to see the PDF first.
         *
         * Chrome's PDF viewer will then provide:
         *
         * - Download
         * - Print
         * - Zoom
         * - Save
         */

        const pdfUrl =
          URL.createObjectURL(
            pdfBlob,
          );

        const pdfWindow =
          window.open(
            pdfUrl,
            "_blank",
          );

        /*
         * ======================================================
         * POPUP BLOCKER FALLBACK
         * ======================================================
         */

        if (!pdfWindow) {
          const downloadLink =
            document.createElement(
              "a",
            );

          downloadLink.href =
            pdfUrl;

          downloadLink.download =
            `Letter-of-Intent-${form.company_name || "Company"}.pdf`;

          document.body.appendChild(
            downloadLink,
          );

          downloadLink.click();

          downloadLink.remove();

          setTimeout(() => {
            URL.revokeObjectURL(
              pdfUrl,
            );
          }, 10000);

          return;
        }

        /*
         * Give the PDF viewer enough time to load the Blob.
         */

        setTimeout(() => {
          URL.revokeObjectURL(
            pdfUrl,
          );
        }, 60000);
      } catch (previewError) {
        console.error(
          "Unable to generate Letter of Intent PDF:",
          previewError,
        );
      } finally {
        /*
         * ======================================================
         * CLEANUP
         * ======================================================
         */

        if (
          wrapper &&
          wrapper.parentNode
        ) {
          wrapper.parentNode.removeChild(
            wrapper,
          );
        }
      }
    };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <main className="loi-page">

        <div className="loi-loading">

          <div className="loi-spinner" />

          <span>
            Loading Letter of Intent settings...
          </span>

        </div>

      </main>
    );
  }

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <main className="loi-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <LetterOfIntentHeader
        loading={loading}
      />

      {/* =====================================================
          ALERTS
          ===================================================== */}

      {error && (
        <div className="loi-alert loi-alert-error">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="loi-alert loi-alert-success">
          {successMessage}
        </div>
      )}

      {/* =====================================================
          MAIN GRID
          ===================================================== */}

      <div className="loi-main-grid">

        {/* ===================================================
            LEFT - LETTER CONTENT
            =================================================== */}

        <section className="loi-content-card">

          {/* =================================================
              CARD HEADER
              ================================================= */}

          <div className="loi-card-heading">

            <div className="loi-card-icon">

              <FileText
                size={19}
              />

            </div>

            <div>

              <h2>
                Letter of Intent Content
              </h2>

              <p>
                Update company details, letter content
                and template. Use merge fields to
                personalize the letter.
              </p>

            </div>

          </div>

          <div className="loi-form-divider" />

          {/* =================================================
              FORM
              ================================================= */}

          <div className="loi-form-grid">

            {/* -------------------------------------------------
                LETTER TITLE
                ------------------------------------------------- */}

            <label className="loi-field">

              <span>
                Letter Title <b>*</b>
              </span>

              <input
                value={
                  form.letter_title
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "letter_title",
                    event.target.value,
                  )
                }
              />

            </label>

            {/* -------------------------------------------------
                COMPANY LOGO
                ------------------------------------------------- */}

            <CompanyLogoUpload
              logo={
                form.company_logo
              }
              uploading={
                uploadingLogo
              }
              onUpload={
                uploadLogo
              }
              onRemove={
                handleRemoveLogo
              }
            />

            {/* -------------------------------------------------
                COMPANY NAME
                ------------------------------------------------- */}

            <label className="loi-field">

              <span>
                Company Name <b>*</b>
              </span>

              <input
                value={
                  form.company_name
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "company_name",
                    event.target.value,
                  )
                }
              />

            </label>

            {/* -------------------------------------------------
                HR STAMP
                ------------------------------------------------- */}


            <StampUpload
  stamp={form.stamp_image_path}
  uploading={uploadingStamp}
  onUpload={uploadStamp}
  onRemove={handleRemoveStamp}
/>

<SignatureUpload
  signature={form.signature_image_path}
  uploading={uploadingSignature}
  onUpload={uploadSignature}
  onRemove={handleRemoveSignature}
/>

            {/* -------------------------------------------------
                REGISTERED OFFICE ADDRESS
                ------------------------------------------------- */}

            <label className="loi-field">

              <span>
                Registered Office Address{" "}
                <b>*</b>
              </span>

              <textarea
                rows={2}
                value={
                  form.registered_office_address
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "registered_office_address",
                    event.target.value,
                  )
                }
              />

            </label>

            {/* -------------------------------------------------
                LETTER DATE
                ------------------------------------------------- */}

            <label className="loi-field">

              <span>
                Letter Date <b>*</b>
              </span>

              <div className="loi-input-icon">

                <CalendarDays
                  size={17}
                />

                <input
                  type="date"
                  value={
                    form.letter_date
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "letter_date",
                      event.target.value,
                    )
                  }
                />

              </div>

            </label>

            {/* -------------------------------------------------
                POSITION / ROLE
                ------------------------------------------------- */}

            <label className="loi-field">

              <span>
                Position / Role{" "}
                <b>*</b>
              </span>

              <input
                value={
                  form.position_role
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "position_role",
                    event.target.value,
                  )
                }
              />

            </label>

            {/* -------------------------------------------------
                JOINING DATE
                ------------------------------------------------- */}

            <label className="loi-field">

              <span>
                Joining Date <b>*</b>
              </span>

              <div className="loi-input-icon">

                <CalendarDays
                  size={17}
                />

                <input
                  type="date"
                  value={
                    form.joining_date
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "joining_date",
                      event.target.value,
                    )
                  }
                />

              </div>

            </label>

            {/* -------------------------------------------------
                SHIFT TIMING
                ------------------------------------------------- */}

            <label className="loi-field">

              <span>
                Shift Timing <b>*</b>
              </span>

              <input
                value={
                  form.shift_timing
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "shift_timing",
                    event.target.value,
                  )
                }
              />

            </label>

            {/* -------------------------------------------------
                PROBATION PERIOD
                ------------------------------------------------- */}

            <label className="loi-field">

              <span>
                Probation Period (Months){" "}
                <b>*</b>
              </span>

              <div className="loi-number-with-unit">

                <input
                  type="number"
                  min={0}
                  max={120}
                  value={
                    form.probation_period_months
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "probation_period_months",
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                />

                <span>
                  Months
                </span>

              </div>

            </label>

            {/* -------------------------------------------------
                HR SIGNATORY NAME
                OPTIONAL
                ------------------------------------------------- */}

            <label className="loi-field">

              <span>
                HR Signatory Name
              </span>

              <input
                value={
                  form.hr_signatory_name
                }
                placeholder="Optional"
                onChange={(
                  event,
                ) =>
                  updateField(
                    "hr_signatory_name",
                    event.target.value,
                  )
                }
              />

            </label>

            {/* -------------------------------------------------
                HR DESIGNATION
                ------------------------------------------------- */}

            <label className="loi-field">

              <span>
                HR Designation <b>*</b>
              </span>

              <input
                value={
                  form.hr_designation
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "hr_designation",
                    event.target.value,
                  )
                }
              />

            </label>

            {/* -------------------------------------------------
                REFERENCE CONTACT
                ------------------------------------------------- */}

            <label className="loi-field">

              <span>
                Reference Person / Contact
              </span>

              <input
                value={
                  form.reference_contact
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "reference_contact",
                    event.target.value,
                  )
                }
              />

            </label>

          </div>

          {/* =================================================
              LETTER BODY
              ================================================= */}

          <div className="loi-body-section">

            <div className="loi-body-editor-heading">

              <span>
                Letter Body / Template{" "}
                <b>*</b>
              </span>

            </div>

            <div className="loi-editor-layout">

              <div className="loi-editor-main">

                <LetterBodyEditor
                  value={
                    form.letter_body
                  }
                  onChange={(
                    value,
                  ) =>
                    updateField(
                      "letter_body",
                      value,
                    )
                  }
                />

              </div>

              <AvailableMergeFields
                onInsert={
                  handleInsertMergeField
                }
              />

            </div>

          </div>

        </section>

        {/* ===================================================
            RIGHT COLUMN
            =================================================== */}

        <div className="loi-right-column">

          <LetterOfIntentPreview
            form={form}
          />

          <LetterOfIntentTemplateSettings
            form={form}
            onChange={
              updateField
            }
          />

        </div>

      </div>

      {/* =====================================================
          BOTTOM ACTION BAR
          ===================================================== */}

      <div className="loi-page-actions">

        {/* ===================================================
            CANCEL
            =================================================== */}

        <button
          type="button"
          className="loi-cancel-button"
          onClick={() =>
            window.location.reload()
          }
          disabled={saving}
        >
          Cancel
        </button>

        {/* ===================================================
            PRIMARY ACTIONS
            =================================================== */}

        <div className="loi-primary-actions">

          {/* =================================================
              PREVIEW FULL LETTER
              ================================================= */}

          <button
            type="button"
            className="loi-preview-button"
            onClick={() => {
              void handlePreviewFullLetter();
            }}
            disabled={saving}
          >
            <FileDown
              size={17}
            />

            Preview Full Letter
          </button>

          {/* =================================================
              SAVE TEMPLATE
              ================================================= */}

          <button
            type="button"
            className="loi-save-button"
            onClick={() => {
              void saveSettings();
            }}
            disabled={saving}
          >
            <Save
              size={17}
            />

            {saving
              ? "Saving..."
              : "Save Template"}
          </button>

        </div>

      </div>

    </main>
  );
};

export default LetterOfIntentPage;