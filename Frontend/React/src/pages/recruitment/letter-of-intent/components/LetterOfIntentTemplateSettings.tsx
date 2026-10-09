import type {
  LetterOfIntentFormData,
} from "../types/letterOfIntent.types";

import "./LetterOfIntentTemplateSettings.css";

interface LetterOfIntentTemplateSettingsProps {
  form: LetterOfIntentFormData;

  onChange: <
    K extends keyof LetterOfIntentFormData,
  >(
    field: K,
    value: LetterOfIntentFormData[K],
  ) => void;
}

interface ToggleProps {
  checked: boolean;
  label: string;
  onChange: (
    value: boolean,
  ) => void;
}

const Toggle = ({
  checked,
  label,
  onChange,
}: ToggleProps) => (
  <label className="loi-toggle-row">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) =>
        onChange(
          event.target.checked,
        )
      }
    />

    <span className="loi-toggle">
      <span />
    </span>

    <span>{label}</span>
  </label>
);

const LetterOfIntentTemplateSettings = ({
  form,
  onChange,
}: LetterOfIntentTemplateSettingsProps) => {
  return (
    <section className="loi-template-settings">
      <div className="loi-card-heading">
        <div className="loi-card-icon loi-card-icon-settings">
          ⚙
        </div>

        <div>
          <h2>Template Settings</h2>

          <p>
            Configure additional settings for the
            letter of intent.
          </p>
        </div>
      </div>

      <div className="loi-template-settings-grid">
        <div className="loi-template-toggles">
          <Toggle
            checked={
              form.show_company_logo
            }
            label="Show Company Logo"
            onChange={(value) =>
              onChange(
                "show_company_logo",
                value,
              )
            }
          />

          <Toggle
            checked={
              form.show_registered_office_footer
            }
            label="Show Registered Office Address in Footer"
            onChange={(value) =>
              onChange(
                "show_registered_office_footer",
                value,
              )
            }
          />

          <Toggle
            checked={
              form.show_acceptance_instruction
            }
            label="Show Acceptance Instruction"
            onChange={(value) =>
              onChange(
                "show_acceptance_instruction",
                value,
              )
            }
          />

          <Toggle
            checked={
              form.show_hr_signature_section
            }
            label="Show HR Signature Section"
            onChange={(value) =>
              onChange(
                "show_hr_signature_section",
                value,
              )
            }
          />
        </div>

        <div className="loi-template-selects">
          <label>
            <span>Page Size</span>

            <select
              value={form.page_size}
              onChange={(event) =>
                onChange(
                  "page_size",
                  event.target.value as
                    | "A4"
                    | "LETTER",
                )
              }
            >
              <option value="A4">
                A4
              </option>

              <option value="LETTER">
                Letter
              </option>
            </select>
          </label>

          <label>
            <span>Template Status</span>

            <select
              value={
                form.template_status
              }
              onChange={(event) =>
                onChange(
                  "template_status",
                  event.target.value as
                    | "Active"
                    | "Inactive",
                )
              }
            >
              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>
          </label>
        </div>
      </div>
    </section>
  );
};

export default LetterOfIntentTemplateSettings;