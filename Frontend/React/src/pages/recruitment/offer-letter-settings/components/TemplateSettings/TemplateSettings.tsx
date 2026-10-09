import type {
  OfferLetterFormData,
  PageSize,
} from "../../types/offerLetter.types";

import "./TemplateSettings.css";

interface TemplateSettingsProps {
  data: OfferLetterFormData;
  updateField: <K extends keyof OfferLetterFormData>(
    field: K,
    value: OfferLetterFormData[K],
  ) => void;
}

function SettingSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="ol-setting-row">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`ol-switch ${checked ? "is-on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>

      <span>{label}</span>
    </label>
  );
}

export default function TemplateSettings({
  data,
  updateField,
}: TemplateSettingsProps) {
  return (
    <section className="ol-template-card">
      <div className="ol-template-heading">
        <div className="ol-template-icon">⚙</div>

        <div>
          <h2>Template Settings</h2>
          <p>Configure additional settings for the offer letter.</p>
        </div>
      </div>

      <div className="ol-template-body">
        <div className="ol-template-switches">
          <SettingSwitch
            label="Show Company Logo"
            checked={data.showCompanyLogo}
            onChange={(value) =>
              updateField("showCompanyLogo", value)
            }
          />

          <SettingSwitch
            label="Show Office Address in Footer"
            checked={data.showOfficeAddressFooter}
            onChange={(value) =>
              updateField(
                "showOfficeAddressFooter",
                value,
              )
            }
          />

          <SettingSwitch
            label="Show Singapore Address"
            checked={data.showSingaporeAddress}
            onChange={(value) =>
              updateField(
                "showSingaporeAddress",
                value,
              )
            }
          />
        </div>

        <div className="ol-template-right">
          <SettingSwitch
            label="Show Candidate Acceptance Section"
            checked={data.showCandidateAcceptance}
            onChange={(value) =>
              updateField(
                "showCandidateAcceptance",
                value,
              )
            }
          />

          <div className="ol-page-size">
            <label>Page Size</label>

            <select
              value={data.pageSize}
              onChange={(event) =>
                updateField(
                  "pageSize",
                  event.target.value as PageSize,
                )
              }
            >
              <option value="A4">A4</option>
              <option value="A3">A3</option>
              <option value="A5">A5</option>
              <option value="LETTER">Letter</option>
              <option value="LEGAL">Legal</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}