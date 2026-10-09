import React, { useState } from 'react';
import { FormSection } from '../FormSection/FormSection';
import { JoiningFormData } from '../../types/joiningForm.types';
import './ReviewInformation.css';

interface ReviewInformationProps {
  formData: JoiningFormData;
  onBack: () => void;
  onSubmit: () => void;
  onEditStep: (stepIndex: number) => void;
  isSubmitting: boolean;
}

export const ReviewInformation: React.FC<ReviewInformationProps> = ({ 
  formData, 
  onBack, 
  onSubmit, 
  onEditStep,
  isSubmitting 
}) => {
  const [confirmed, setConfirmed] = useState(false);
  const [showError, setShowError] = useState(false);

  // Helper to create a summary string safely
  const getSummary = (data: any, fields: string[]) => {
    return fields.map(f => data[f]).filter(Boolean).join(' • ');
  };

  // 🔥 FIX: Calculate the number of uploaded files safely from the Record (Object)
  const uploadedDocumentsCount = Object.keys(formData.documents).filter(
    key => formData.documents[key] instanceof File
  ).length;

  // ✅ SAFE ACCESSOR: Reads strictly without violating TypeScript's interface
  const getSafeExperienceLabel = (exp: any) => {
    // Prefer organizationName, fallback to company safely
    return exp.organizationName || exp.company || '';
  };

  const handleSubmitClick = () => {
    if (!confirmed) {
      setShowError(true);
      return;
    }
    setShowError(false);
    onSubmit();
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmed(e.target.checked);
    if (e.target.checked) setShowError(false);
  };

  return (
    <FormSection 
      title="Review Your Information" 
      subtitle="Please review all the details before submission." 
      icon="📋" 
      onBack={onBack} 
      onNext={handleSubmitClick} 
      isLastStep={true} 
      isSubmitting={isSubmitting}
    >
      <div className="review-section-container">
        
        {/* Basic Information */}
        <div className="review-item-row">
          <div className="review-item-content">
            <h4>Basic Information</h4>
            <p className="review-item-sub">
              {getSummary(formData.basicInformation, ['fullName', 'email', 'phone'])}
            </p>
          </div>
          <button type="button" className="edit-link" onClick={() => onEditStep(0)}>Edit</button>
        </div>

        {/* Personal Details */}
        <div className="review-item-row">
          <div className="review-item-content">
            <h4>Personal Details</h4>
            <p className="review-item-sub">
              {getSummary(formData.personalDetails, ['nationality', 'religion'])}
            </p>
          </div>
          <button type="button" className="edit-link" onClick={() => onEditStep(1)}>Edit</button>
        </div>

        {/* Work Experience */}
        <div className="review-item-row">
          <div className="review-item-content">
            <h4>Work Experience ({formData.workExperience.length})</h4>
            {formData.workExperience.length > 0 && (
              <p className="review-item-sub">
                {/* ✅ FIX: Uses safe accessor instead of direct property access */}
                {getSafeExperienceLabel(formData.workExperience[0])}
                {formData.workExperience.length > 1 && ` +${formData.workExperience.length - 1} more`}
              </p>
            )}
          </div>
          <button type="button" className="edit-link" onClick={() => onEditStep(2)}>Edit</button>
        </div>

        {/* Education */}
        <div className="review-item-row">
          <div className="review-item-content">
            <h4>Education ({formData.education.length})</h4>
            {formData.education.length > 0 && (
              <p className="review-item-sub">
                {formData.education[0].qualification}
                {formData.education.length > 1 && ` +${formData.education.length - 1} more`}
              </p>
            )}
          </div>
          <button type="button" className="edit-link" onClick={() => onEditStep(3)}>Edit</button>
        </div>

        {/* Documents */}
        <div className="review-item-row">
          <div className="review-item-content">
            <h4>Documents ({uploadedDocumentsCount} / 8 uploaded)</h4>
          </div>
          <button type="button" className="edit-link" onClick={() => onEditStep(4)}>Edit</button>
        </div>

        {/* References */}
        <div className="review-item-row">
          <div className="review-item-content">
            <h4>References ({formData.references.length})</h4>
          </div>
          <button type="button" className="edit-link" onClick={() => onEditStep(5)}>Edit</button>
        </div>

        {/* Inline Validation Message */}
        {showError && (
          <div className="review-validation-error">
            ⚠️ Please confirm that all information provided by you is true and correct.
          </div>
        )}

        {/* Confirmation Checkbox */}
        <div className={`confirmation-checkbox-area ${showError ? 'has-error' : ''}`}>
          <input 
            type="checkbox" 
            id="confirmCheck" 
            checked={confirmed} 
            onChange={handleCheckboxChange}
          />
          <label htmlFor="confirmCheck">
            I confirm that all information provided by me is true and correct.
          </label>
        </div>

      </div>
    </FormSection>
  );
};