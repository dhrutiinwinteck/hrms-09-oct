import {
  CalendarDays,
} from 'lucide-react';

const CompOffHowItWorks = () => {
  const steps = [
    'Submit a request with worked date and reason.',
    'HR reviews and approves/rejects the request.',
    'Once approved, comp off will be added to your balance.',
    'You can apply for comp off while applying for leave.',
  ];

  return (
    <div className="comp-off-how-card">
      <div className="how-card-header">
        <div className="how-icon">
          <CalendarDays size={22} />
        </div>

        <h2>How Comp Off Works?</h2>
      </div>

      <div className="how-steps">
        {steps.map((step, index) => (
          <div
            className="how-step"
            key={step}
          >
            <div className="how-step-number">
              {index + 1}
            </div>

            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompOffHowItWorks;