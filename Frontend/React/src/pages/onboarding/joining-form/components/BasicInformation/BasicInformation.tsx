import React from 'react';

import { FormSection } from '../FormSection/FormSection';
import { BasicInformationData } from '../../types/joiningForm.types';

import {
  GENDER_OPTIONS,
  BLOOD_GROUP_OPTIONS,
  MARITAL_STATUS_OPTIONS,
} from '../../constants/joiningForm.constants';

import './BasicInformation.css';

interface BasicInformationProps {
  data: BasicInformationData;
  onChange: (field: string, value: string | boolean) => void;
  onBack?: () => void;
  onNext: () => void;
}

export const BasicInformation: React.FC<
  BasicInformationProps
> = ({
  data,
  onChange,
  onBack,
  onNext,
}) => {
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ): void => {
    const {
      name,
      value,
      type,
    } = e.target;

    const nextValue =
      type === 'checkbox'
        ? (
            e.target as HTMLInputElement
          ).checked
        : value;

    onChange(
      name,
      nextValue
    );
  };

  return (
    <FormSection
      title="Basic Information"
      subtitle="Please provide your basic details."
      icon="👤"
      onBack={onBack}
      onNext={onNext}
      isLastStep={false}
    >
      <div className="basic-info-grid">

        {/* First Name */}
<div className="form-field">
  <label htmlFor="first_name">
    First Name{' '}
    <span className="required">
      *
    </span>
  </label>

  <div className="input-wrapper">
    <input
      type="text"
      id="first_name"
      name="first_name"
      placeholder="Enter first name"
      value={data.first_name || ''}
      onChange={handleChange}
    />
  </div>
</div>

{/* Last Name */}
<div className="form-field">
  <label htmlFor="last_name">
    Last Name{' '}
    <span className="required">
      *
    </span>
  </label>

  <div className="input-wrapper">
    <input
      type="text"
      id="last_name"
      name="last_name"
      placeholder="Enter last name"
      value={data.last_name || ''}
      onChange={handleChange}
    />
  </div>
</div>

        {/* Email */}
        <div className="form-field">
          <label htmlFor="email">
            Email Address{' '}
            <span className="required">
              *
            </span>
          </label>

          <div className="input-wrapper">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter email address"
              value={data.email || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Phone */}
        <div className="form-field">
          <label htmlFor="phone">
            Phone Number{' '}
            <span className="required">
              *
            </span>
          </label>

          <div className="input-wrapper">
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Enter phone number"
              value={data.phone || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Alternate Phone */}
        <div className="form-field">
          <label htmlFor="alternatePhone">
            Alternate Phone Number
          </label>

          <div className="input-wrapper">
            <input
              type="tel"
              id="alternatePhone"
              name="alternatePhone"
              placeholder="Enter alternate number"
              value={
                data.alternatePhone || ''
              }
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Date of Birth */}
        <div className="form-field">
          <label htmlFor="dateOfBirth">
            Date of Birth{' '}
            <span className="required">
              *
            </span>
          </label>

          <div
            className="input-wrapper"
            data-icon="date"
          >
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={
                data.dateOfBirth || ''
              }
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Gender */}
        <div className="form-field">
          <label htmlFor="gender">
            Gender{' '}
            <span className="required">
              *
            </span>
          </label>

          <div
            className="input-wrapper"
            data-icon="select"
          >
            <select
              id="gender"
              name="gender"
              value={data.gender || ''}
              onChange={handleChange}
            >
              <option value="">
                Select gender
              </option>

              {GENDER_OPTIONS.map(
                (opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                  >
                    {opt.label}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* Blood Group */}
        <div className="form-field">
          <label htmlFor="bloodGroup">
            Blood Group{' '}
            <span className="required">
              *
            </span>
          </label>

          <div
            className="input-wrapper"
            data-icon="select"
          >
            <select
              id="bloodGroup"
              name="bloodGroup"
              value={
                data.bloodGroup || ''
              }
              onChange={handleChange}
            >
              <option value="">
                Select blood group
              </option>

              {BLOOD_GROUP_OPTIONS.map(
                (opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                  >
                    {opt.label}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* Marital Status */}
        <div className="form-field">
          <label htmlFor="maritalStatus">
            Marital Status{' '}
            <span className="required">
              *
            </span>
          </label>

          <div
            className="input-wrapper"
            data-icon="select"
          >
            <select
              id="maritalStatus"
              name="maritalStatus"
              value={
                data.maritalStatus || ''
              }
              onChange={handleChange}
            >
              <option value="">
                Select marital status
              </option>

              {MARITAL_STATUS_OPTIONS.map(
                (opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                  >
                    {opt.label}
                  </option>
                )
              )}
            </select>
          </div>
        </div>


        {/* Marriage Date */}
<div className="form-field">
  <label htmlFor="marriage_date">
    Marriage Date

    {data.maritalStatus?.toLowerCase() === 'married' && (
      <span className="required">
        {' '}*
      </span>
    )}
  </label>

  <div
    className="input-wrapper"
    data-icon="date"
  >
    <input
      type="date"
      id="marriage_date"
      name="marriage_date"
      value={data.marriage_date || ''}
      onChange={handleChange}
    />
  </div>
</div>

        {/* Date of Joining */}
        <div className="form-field">
          <label htmlFor="dateOfJoining">
            Date of Joining{' '}
            <span className="required">
              *
            </span>
          </label>

          <div
            className="input-wrapper"
            data-icon="date"
          >
            <input
              type="date"
              id="dateOfJoining"
              name="dateOfJoining"
              value={
                data.dateOfJoining || ''
              }
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Position */}
        <div className="form-field">
          <label htmlFor="position">
            Position Applied For{' '}
            <span className="required">
              *
            </span>
          </label>

          <div className="input-wrapper">
            <input
              type="text"
              id="position"
              name="position"
              placeholder="Enter position"
              value={
                data.position || ''
              }
              onChange={handleChange}
            />
          </div>
        </div>

      </div>
    </FormSection>
  );
};