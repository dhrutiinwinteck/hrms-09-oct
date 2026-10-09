import React from 'react';
import './JoiningFormHeader.css';

export const JoiningFormHeader: React.FC = () => {
  return (
    <div className="joining-form-header">
      <h1 className="joining-form-title">Employee Joining Form</h1>
      <p className="joining-form-subtitle">
        Please fill in the details step by step to complete the joining formalities.
      </p>
    </div>
  );
};