import type { OfferLetterFormData } from "../../types/offerLetter.types";

import CompanyInformation from "../CompanyInformation/CompanyInformation";
import LetterBodyEditor from "../LetterBodyEditor/LetterBodyEditor";
import MergeFields from "../MergeFields/MergeFields";
import OfferLetterFields from "../OfferLetterFields/OfferLetterFields";

import "./OfferLetterContent.css";

interface OfferLetterContentProps {
  data: OfferLetterFormData;
  updateField: <K extends keyof OfferLetterFormData>(
    field: K,
    value: OfferLetterFormData[K],
  ) => void;
}

export default function OfferLetterContent({
  data,
  updateField,
}: OfferLetterContentProps) {
  const insertMergeField = (token: string) => {
    const current = data.letterBodyTemplate;

    updateField(
      "letterBodyTemplate",
      `${current}${current.endsWith(" ") ? "" : " "}${token}`,
    );
  };

  return (
    <section className="ol-content-card">
      <div className="ol-card-heading">
        <div className="ol-card-heading-icon">▣</div>

        <div>
          <h2>Offer Letter Content</h2>
          <p>
            Update company details, letter content and template.
            Use merge fields to personalize the letter.
          </p>
        </div>
      </div>

      <div className="ol-card-divider" />

      <CompanyInformation
        data={data}
        updateField={updateField}
      />

      <OfferLetterFields
        data={data}
        updateField={updateField}
      />

      <div className="ol-body-editor-section">
        <div className="ol-body-editor-title">
          <span>Letter Body / Template</span>
          <span className="ol-required">*</span>
        </div>

        <div className="ol-editor-layout">
          <div className="ol-editor-main">
            <LetterBodyEditor
              value={data.letterBodyTemplate}
              onChange={(value) =>
                updateField("letterBodyTemplate", value)
              }
              onInsertMergeField={insertMergeField}
            />
          </div>

          <MergeFields onInsert={insertMergeField} />
        </div>
      </div>
    </section>
  );
}