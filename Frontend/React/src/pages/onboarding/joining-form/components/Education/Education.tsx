import React from 'react';
import { FormSection } from '../FormSection/FormSection';

export const Education: React.FC<any> = ({ data, onChange, onAdd, onRemove, onBack, onNext }) => {
  return (
    <FormSection title="Education" subtitle="Add your academic background." icon="🎓" onBack={onBack} onNext={onNext}>
      <div className="dynamic-list-container">
        {data.map((edu: any, index: number) => (
          <div key={index} className="dynamic-item-wrapper">
            {index > 0 && <button className="remove-item-btn" onClick={() => onRemove(index)}>✕ Remove</button>}
            <div className="basic-info-grid">
              <div className="form-field">
                <label>Highest Qualification <span className="required">*</span></label>
                <input type="text" value={edu.qualification} onChange={(e) => onChange(index, 'qualification', e.target.value)} />
              </div>
              <div className="form-field">
                <label>Specialization <span className="required">*</span></label>
                <input type="text" value={edu.specialization} onChange={(e) => onChange(index, 'specialization', e.target.value)} />
              </div>
              <div className="form-field">
                <label>Institute <span className="required">*</span></label>
                <input type="text" value={edu.institute} onChange={(e) => onChange(index, 'institute', e.target.value)} />
              </div>
              <div className="form-field">
                <label>Board / University <span className="required">*</span></label>
                <input type="text" value={edu.board} onChange={(e) => onChange(index, 'board', e.target.value)} />
              </div>
              <div className="form-field">
               <label>
  Passing Year{" "}
  <span className="required">*</span>
</label>

<input
  type="text"
  value={edu.passingYear || ""}
  onChange={(e) =>
    onChange(
      index,
      "passingYear",
      e.target.value
    )
  }
/>
              </div>
              <div className="form-field">
                <label>Percentage / CGPA <span className="required">*</span></label>
                <input type="text" value={edu.percentage} onChange={(e) => onChange(index, 'percentage', e.target.value)} />
              </div>
            </div>
          </div>
        ))}
        <button className="add-item-btn" onClick={onAdd}>+ Add Another Education</button>
      </div>
    </FormSection>
  );
};