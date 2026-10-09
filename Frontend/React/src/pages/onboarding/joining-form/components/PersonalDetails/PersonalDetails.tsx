import React, { useState } from 'react';
import { FormSection } from '../FormSection/FormSection';
import { PersonalDetailsData } from '../../types/joiningForm.types';
import './PersonalDetails.css';

interface PersonalDetailsProps {
  data: PersonalDetailsData;
  onChange: (field: string, value: any) => void;
  onBack: () => void;
  onNext: () => void;
}

export const PersonalDetails: React.FC<PersonalDetailsProps> = ({
  data,
  onChange,
  onBack,
  onNext,
}) => {
  const [sameAsPermanent, setSameAsPermanent] = useState(
    data.sameAsPermanent || false
  );

  // Broadened type to accept Input, Select, and TextArea
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    let finalValue: any = value;
    
    // Handle checkboxes safely
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    }
    
    onChange(name, finalValue);
  };

  const handleSameAsPermanentChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    setSameAsPermanent(checked);
    onChange('sameAsPermanent', checked);
    if (checked) {
      // Copy permanent address to current address
      onChange('currentAddress', data.permanentAddress || '');
    }
  };

  const handlePermanentAddressChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    onChange(name, value);
    if (sameAsPermanent) {
      onChange('currentAddress', value);
    }
  };

  return (
    /* 🟢 UPDATED: Now uses the master border wrapper, auto-handles buttons, and accepts an icon */
    <FormSection
      title="Personal Details"
      subtitle="Please provide your personal information."
      icon="👤" 
      onBack={onBack}
      onNext={onNext}
    >
      <div className="personal-details-grid">
        {/* Father's Name */}
        <div className="form-field">
          <label htmlFor="fatherName">
            Father's Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="fatherName"
            name="fatherName"
            placeholder="Enter father's name"
            value={data.fatherName || ''}
            onChange={handleChange}
          />
        </div>

        {/* Mother's Name */}
        <div className="form-field">
          <label htmlFor="motherName">
            Mother's Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="motherName"
            name="motherName"
            placeholder="Enter mother's name"
            value={data.motherName || ''}
            onChange={handleChange}
          />
        </div>

        {/* Nationality */}
        <div className="form-field">
          <label htmlFor="nationality">
            Nationality <span className="required">*</span>
          </label>
          <input
            type="text"
            id="nationality"
            name="nationality"
            placeholder="Enter nationality"
            value={data.nationality || ''}
            onChange={handleChange}
          />
        </div>

        {/* Religion */}
        <div className="form-field">
          <label htmlFor="religion">
            Religion <span className="required">*</span>
          </label>
          <input
            type="text"
            id="religion"
            name="religion"
            placeholder="Enter religion"
            value={data.religion || ''}
            onChange={handleChange}
          />
        </div>

        {/* Aadhaar Number */}
        <div className="form-field">
          <label htmlFor="aadhaarNumber">
            Aadhaar Number <span className="required">*</span>
          </label>
          <input
            type="text"
            id="aadhaarNumber"
            name="aadhaarNumber"
            placeholder="Enter 12 digit Aadhaar number"
            value={data.aadhaarNumber || ''}
            onChange={handleChange}
            maxLength={12}
          />
        </div>

        {/* PAN Number */}
        <div className="form-field">
          <label htmlFor="panNumber">
            PAN Number <span className="required">*</span>
          </label>
          <input
            type="text"
            id="panNumber"
            name="panNumber"
            placeholder="Enter PAN number"
            value={data.panNumber || ''}
            onChange={handleChange}
            maxLength={10}
          />
        </div>

        {/* UAN Number */}
        <div className="form-field">
          <label htmlFor="uanNumber">UAN Number</label>
          <input
            type="text"
            id="uanNumber"
            name="uanNumber"
            placeholder="Enter UAN number (if any)"
            value={data.uanNumber || ''}
            onChange={handleChange}
          />
        </div>

        {/* Passport Number */}
        <div className="form-field">
          <label htmlFor="passportNumber">Passport Number (if any)</label>
          <input
            type="text"
            id="passportNumber"
            name="passportNumber"
            placeholder="Enter passport number"
            value={data.passportNumber || ''}
            onChange={handleChange}
          />
        </div>

        {/* Permanent Address */}
        <div className="form-field full-width">
          <label htmlFor="permanentAddress">
            Permanent Address <span className="required">*</span>
          </label>
          <textarea
            id="permanentAddress"
            name="permanentAddress"
            placeholder="Enter permanent address"
            value={data.permanentAddress || ''}
            onChange={handlePermanentAddressChange}
            rows={3}
          />
        </div>

        {/* Current Address with checkbox */}
        <div className="form-field full-width">
          <div className="current-address-header">
            <label htmlFor="currentAddress">
              Current Address <span className="required">*</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={sameAsPermanent}
                onChange={handleSameAsPermanentChange}
              />
              Same as permanent address
            </label>
          </div>
          <textarea
            id="currentAddress"
            name="currentAddress"
            placeholder="Enter current address"
            value={data.currentAddress || ''}
            onChange={handleChange} 
            rows={3}
            disabled={sameAsPermanent}
          />
        </div>
      </div>
    </FormSection>
  );
};