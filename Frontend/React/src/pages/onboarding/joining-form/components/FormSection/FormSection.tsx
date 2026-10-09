import React from 'react';
import './FormSection.css';

interface FormSectionProps {
  title: string;
  subtitle: string;
  icon?: string; // Allows different icons for different steps
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  isLastStep?: boolean;
  isSubmitting?: boolean;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  subtitle,
  icon = '👤', // Default user icon
  children,
  onBack,
  onNext,
  isLastStep = false,
  isSubmitting = false,
}) => {
  return (
    <div className="form-section-wrapper">
      <div className="form-section-card">
        
        {/* 1. Reusable Header with Icon */}
        <div className="form-section-header">
          <div className="form-section-icon-box">
            <span>{icon}</span>
          </div>
          <div className="form-section-text">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </div>

        {/* 2. The actual children (Input fields passed in) */}
        <div className="form-section-content">
          {children}
        </div>

        {/* 3. Standardized Footer/Buttons */}
        <div className="form-actions">
          {onBack && (
  <button
    type="button"
    className="btn btn-secondary"
    onClick={onBack}
  >
    ← Back
  </button>
)}
          {!onBack && <div />} {/* Keeps layout balanced if there's no back button */}
          
          {isLastStep ? (
            <button className="btn btn-primary" onClick={onNext} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={onNext}>
              Save & Continue →
            </button>
          )}
        </div>

      </div>
    </div>
  );
};