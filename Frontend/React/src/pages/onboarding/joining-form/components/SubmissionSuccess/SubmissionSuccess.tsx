import React from 'react';
import './SubmissionSuccess.css';
// 🟢 IMPORT YOUR IMAGE HERE:
import successImage from '@/assets/images/joining_form/joining_form.png';

interface SubmissionSuccessProps {
  onGoToDashboard?: () => void;
}

export const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({ onGoToDashboard }) => {
  return (
    <div className="submission-success-wrapper">
      <div className="success-illustration">
        {/* Use the imported image here */}
        <img src={successImage} alt="Form Submitted Successfully" className="success-image" />
      </div>

      <h2 className="success-title">Form Submitted Successfully!</h2>
      <p className="success-description">
        Thank you! Your joining form has been submitted successfully.<br />
        Our HR team will review your information and get back to you soon.
      </p>

      {onGoToDashboard && (
        <button className="btn btn-primary dashboard-btn" onClick={onGoToDashboard}>
          Go to Dashboard
        </button>
      )}

      <div className="success-next-steps">
        <h3>What happens next?</h3>
        <ul>
          <li>✔ HR will review your application</li>
          <li>✔ You will receive an email confirmation</li>
          <li>✔ We will contact you if any additional information is required</li>
        </ul>
      </div>
    </div>
  );
};