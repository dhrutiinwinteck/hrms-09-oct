import { CalendarDays } from "lucide-react";

import type { OfferLetterFormData } from "../../types/offerLetter.types";
import LogoUploader from "../LogoUploader/LogoUploader";

import "./CompanyInformation.css";

interface CompanyInformationProps {
  data: OfferLetterFormData;
  updateField: <K extends keyof OfferLetterFormData>(
    field: K,
    value: OfferLetterFormData[K],
  ) => void;
}

function FieldLabel({
  children,
  required = false,
  mergeField = false,
}: {
  children: React.ReactNode;
  required?: boolean;
  mergeField?: boolean;
}) {
  return (
    <label className="ol-field-label">
      <span>{children}</span>

      {required && <span className="ol-required">*</span>}

      {mergeField && (
        <span className="ol-merge-label">Merge Field</span>
      )}
    </label>
  );
}

export default function CompanyInformation({
  data,
  updateField,
}: CompanyInformationProps) {
  return (
    <div className="ol-company-section">
      <div className="ol-form-row ol-top-row">
        <div className="ol-form-group">
          <FieldLabel required>Offer Letter Title</FieldLabel>

          <input
            className="ol-input"
            value={data.offerLetterTitle}
            onChange={(event) =>
              updateField("offerLetterTitle", event.target.value)
            }
          />
        </div>

        <LogoUploader
  data={data}
  updateField={updateField}
/>

        <div className="ol-form-group ol-logo-space" />
      </div>

      <div className="ol-form-grid ol-grid-3">
        <div className="ol-form-group">
          <FieldLabel required>Company Name</FieldLabel>

          <input
            className="ol-input"
            value={data.companyName}
            onChange={(event) =>
              updateField("companyName", event.target.value)
            }
          />
        </div>

        <div className="ol-form-group">
          <FieldLabel required>Office Address</FieldLabel>

          <textarea
            className="ol-textarea ol-address-input"
            value={data.officeAddress}
            onChange={(event) =>
              updateField("officeAddress", event.target.value)
            }
          />
        </div>

        <div className="ol-form-group">
          <FieldLabel>Singapore / O/S Address</FieldLabel>

          <textarea
            className="ol-textarea ol-address-input"
            value={data.singaporeOsAddress}
            onChange={(event) =>
              updateField("singaporeOsAddress", event.target.value)
            }
          />
        </div>
      </div>

      <div className="ol-form-grid ol-grid-3">
        <div className="ol-form-group">
          <FieldLabel required>Offer Date</FieldLabel>

          <div className="ol-input-with-icon">
            <CalendarDays size={15} />

            <input
              type="date"
              value={data.offerDate}
              onChange={(event) =>
                updateField("offerDate", event.target.value)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}