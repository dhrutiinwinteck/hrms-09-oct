import React from 'react';
import { Check } from 'lucide-react';
import './JoiningFormStepper.css';

interface JoiningFormStepperProps {
  currentStep: number;
  labels: string[]; // Removed 'totalSteps' from here
}

export const JoiningFormStepper: React.FC<JoiningFormStepperProps> = ({
  currentStep,
  labels, // Removed 'totalSteps' from destructuring
}) => {
  return (
    <div className="joining-form-stepper">
      <div className="stepper-track">
        {labels.map((label, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const stepNumber = index + 1;

          return (
            <div key={index} className="stepper-item">
              <div className="stepper-step">
                <div
                  className={`stepper-circle ${
                    isActive ? 'active' : isCompleted ? 'completed' : ''
                  }`}
                >
                  {isCompleted ? <Check size={16} /> : stepNumber}
                </div>
                {index < labels.length - 1 && (
                  <div
                    className={`stepper-line ${
                      isCompleted ? 'completed-line' : ''
                    }`}
                  />
                )}
              </div>
              <span
                className={`stepper-label ${
                  isActive ? 'active-label' : isCompleted ? 'completed-label' : ''
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};