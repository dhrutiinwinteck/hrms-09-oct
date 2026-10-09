import React from 'react';
import { FormSection } from '../FormSection/FormSection';
import './WorkExperience.css';

interface WorkExperienceProps {
  data: any[];
  onChange: (index: number, field: string, value: any) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export const WorkExperience: React.FC<WorkExperienceProps> = ({
  data,
  onChange,
  onAdd,
  onRemove,
  onBack,
  onNext
}) => {
  return (
    <FormSection
      title="Work Experience"
      subtitle="Add your professional history."
      icon="💼"
      onBack={onBack}
      onNext={onNext}
    >
      <div className="dynamic-list-container">
        {data.map((exp: any, index: number) => (
          <div key={index} className="dynamic-item-wrapper">

            {data.length > 1 && (
              <button
                className="remove-item-btn"
                onClick={() => onRemove(index)}
                type="button"
              >
                ✕ Remove
              </button>
            )}

            <div className="basic-info-grid">

              {/* COMPANY NAME */}
              <div className="form-field">
                <label>
                  Company Name <span className="required">*</span>
                </label>

                <input
                  type="text"
                  value={exp.organizationName || ''}
                  onChange={(e) =>
                    onChange(
                      index,
                      'organizationName',
                      e.target.value
                    )
                  }
                  placeholder="Enter company name"
                />
              </div>

              {/* DESIGNATION */}
              <div className="form-field">
                <label>
                  Designation <span className="required">*</span>
                </label>

                <input
                  type="text"
                  value={exp.designation || ''}
                  onChange={(e) =>
                    onChange(
                      index,
                      'designation',
                      e.target.value
                    )
                  }
                  placeholder="Enter designation"
                />
              </div>

              {/* COMPANY LOCATION */}
              <div className="form-field">
                <label>Company Location</label>

                <input
                  type="text"
                  value={exp.company_location || ''}
                  onChange={(e) =>
                    onChange(
                      index,
                      'company_location',
                      e.target.value
                    )
                  }
                  placeholder="Enter company location"
                />
              </div>

              {/* COMPANY COUNTRY */}
              <div className="form-field">
                <label>Company Country</label>

                <input
                  type="text"
                  value={exp.company_country || ''}
                  onChange={(e) =>
                    onChange(
                      index,
                      'company_country',
                      e.target.value
                    )
                  }
                  placeholder="Enter company country"
                />
              </div>
              {/* COMPANY FILE */}
<div className="form-field">
  <label>Company Document</label>

  <input
    type="file"
    accept=".pdf,.jpg,.jpeg,.png"
    onChange={(e) =>
      onChange(
        index,
        'company_file',
        e.target.files?.[0] || null
      )
    }
  />
</div>

              {/* PROJECT */}
              <div className="form-field">
                <label>Project</label>

                <input
                  type="text"
                  value={exp.project || ''}
                  onChange={(e) =>
                    onChange(
                      index,
                      'project',
                      e.target.value
                    )
                  }
                  placeholder="Enter project name"
                />
              </div>

              {/* EMPLOYMENT TYPE */}
              <div className="form-field">
                <label>Employment Type</label>

                <select
  value={exp.employmentType || ''}
  onChange={(e) =>
    onChange(
      index,
      'employmentType',
      e.target.value
    )
  }
>
  <option value="">Select Employment Type</option>
  <option value="Full-time">Full-time</option>
  <option value="Part-time">Part-time</option>
  <option value="Contract">Contract</option>
  <option value="Internship">Internship</option>
  <option value="Freelance">Freelance</option>
</select>
              </div>

              {/* FROM DATE */}
              <div className="form-field">
                <label>
                  From Date <span className="required">*</span>
                </label>

                <input
                  type="date"
                  value={exp.fromDate || ''}
                  onChange={(e) =>
                    onChange(
                      index,
                      'fromDate',
                      e.target.value
                    )
                  }
                />
              </div>

              {/* TO DATE */}
              <div className="form-field">
                <label>
                  To Date <span className="required">*</span>
                </label>

                <input
                  type="date"
                  value={exp.toDate || ''}
                  onChange={(e) =>
                    onChange(
                      index,
                      'toDate',
                      e.target.value
                    )
                  }
                />
              </div>

              {/* CONTRACT PERIOD */}
              <div className="form-field">
                <label>Contract Period</label>

                <input
                  type="text"
                  value={exp.contract_period || ''}
                  onChange={(e) =>
                    onChange(
                      index,
                      'contract_period',
                      e.target.value
                    )
                  }
                  placeholder="Enter contract period"
                />
              </div>

              {/* NOTICE PERIOD */}
              <div className="form-field">
                <label>Notice Period</label>

                <input
                  type="text"
                  value={exp.notice_period || ''}
                  onChange={(e) =>
                    onChange(
                      index,
                      'notice_period',
                      e.target.value
                    )
                  }
                  placeholder="Enter notice period"
                />
              </div>

            </div>
          </div>
        ))}

        <button
          className="add-item-btn"
          onClick={onAdd}
          type="button"
        >
          + Add Another Experience
        </button>
      </div>
    </FormSection>
  );
};