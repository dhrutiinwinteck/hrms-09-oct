import React from "react";
import { FormSection } from "../FormSection/FormSection";

export const References: React.FC<any> = ({
  data,
  onChange,
  onAdd,
  onRemove,
  onBack,
  onNext,
}) => {
  return (
    <FormSection
      title="References"
      subtitle="Provide professional references."
      icon="📞"
      onBack={onBack}
      onNext={onNext}
    >
      <div className="dynamic-list-container">
        {data.map((ref: any, index: number) => (
          <div key={index} className="dynamic-item-wrapper">
            {index > 0 && (
              <button
                type="button"
                className="remove-item-btn"
                onClick={() => onRemove(index)}
              >
                ✕ Remove
              </button>
            )}
            <div className="basic-info-grid">
              <div className="form-field full-width">
                <label>
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={ref.fullName || ""}
                  onChange={(e) => onChange(index, "fullName", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>
                  Designation <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={ref.designation}
                  onChange={(e) =>
                    onChange(index, "designation", e.target.value)
                  }
                />
              </div>
              <div className="form-field">
                <label>
                  Company <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={ref.company}
                  onChange={(e) => onChange(index, "company", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  value={ref.email}
                  onChange={(e) => onChange(index, "email", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  value={ref.phone}
                  onChange={(e) => onChange(index, "phone", e.target.value)}
                />
              </div>
              <div className="form-field full-width">
                <label>
                  Relationship <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={ref.relationship}
                  onChange={(e) =>
                    onChange(index, "relationship", e.target.value)
                  }
                />
              </div>
              <div className="references-checkbox-field">
                <label className="references-checkbox-label">
                  <input
                    type="checkbox"
                    checked={Boolean(ref.mayContact)}
                    onChange={(e) =>
                      onChange(index, "mayContact", e.target.checked)
                    }
                  />

                  <span>May we contact this reference?</span>
                </label>
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="add-item-btn" onClick={onAdd}>
          + Add Another Reference
        </button>
      </div>
    </FormSection>
  );
};
