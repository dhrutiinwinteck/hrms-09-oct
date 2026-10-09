/**
 * Stepper Types
 * Defines types for the multi-step form navigation
 */

export type StepStatus = 'completed' | 'current' | 'pending';

export interface IStep {
  id: number;
  label: string;
  status: StepStatus;
  isEnabled: boolean;
}

export interface IStepperState {
  currentStep: number;
  steps: IStep[];
  isComplete: boolean;
}

export interface IStepperContext {
  state: IStepperState;
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  setStepStatus: (stepId: number, status: StepStatus) => void;
}