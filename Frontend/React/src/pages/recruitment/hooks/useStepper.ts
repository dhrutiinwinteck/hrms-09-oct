/**
 * Stepper Hook
 * Manages the multi-step form navigation state
 */

import { useState, useCallback, useMemo } from 'react';
import { IStep, StepStatus, IStepperState } from '../types/stepper.types';

/**
 * Step Configuration
 */
const STEP_CONFIG = [
  { id: 1, label: 'Basic Information' },
  { id: 2, label: 'Personal Details' },
  { id: 3, label: 'Emergency Contacts' },
  { id: 4, label: 'Work Experience' },
  { id: 5, label: 'Education' },
  { id: 6, label: 'References' },
];

/**
 * Initial Step Status
 */
const getInitialSteps = (currentStep: number): IStep[] => {
  return STEP_CONFIG.map((step, index) => ({
    id: step.id,
    label: step.label,
    status: index + 1 === currentStep ? 'current' : 
            index + 1 < currentStep ? 'completed' : 'pending',
    isEnabled: index + 1 <= currentStep,
  }));
};

/**
 * useStepper Hook
 * Manages stepper state and navigation
 */
export const useStepper = (initialStep: number = 1) => {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [steps, setSteps] = useState<IStep[]>(getInitialSteps(initialStep));
  const [isComplete, setIsComplete] = useState<boolean>(false);

  /**
   * Update step statuses based on current step
   */
  const updateStepStatuses = useCallback((step: number) => {
    setSteps((prevSteps) =>
      prevSteps.map((s) => ({
        ...s,
        status: s.id === step ? 'current' :
                s.id < step ? 'completed' : 'pending',
        isEnabled: s.id <= step,
      }))
    );
  }, []);

  /**
   * Navigate to a specific step
   */
  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= STEP_CONFIG.length) {
        setCurrentStep(step);
        updateStepStatuses(step);
        setIsComplete(step === STEP_CONFIG.length);
      }
    },
    [updateStepStatuses]
  );

  /**
   * Navigate to next step
   */
  const nextStep = useCallback(() => {
    if (currentStep < STEP_CONFIG.length) {
      const next = currentStep + 1;
      setCurrentStep(next);
      updateStepStatuses(next);
      setIsComplete(next === STEP_CONFIG.length);
    }
  }, [currentStep, updateStepStatuses]);

  /**
   * Navigate to previous step
   */
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      updateStepStatuses(prev);
      setIsComplete(false);
    }
  }, [currentStep, updateStepStatuses]);

  /**
   * Set specific step status
   */
  const setStepStatus = useCallback((stepId: number, status: StepStatus) => {
    setSteps((prevSteps) =>
      prevSteps.map((s) =>
        s.id === stepId ? { ...s, status } : s
      )
    );
  }, []);

  /**
   * Reset stepper to initial state
   */
  const resetStepper = useCallback(() => {
    setCurrentStep(1);
    setSteps(getInitialSteps(1));
    setIsComplete(false);
  }, []);

  /**
   * Stepper state
   */
  const state: IStepperState = useMemo(
    () => ({
      currentStep,
      steps,
      isComplete,
    }),
    [currentStep, steps, isComplete]
  );

  /**
   * Check if step is accessible
   */
  const isStepAccessible = useCallback(
    (step: number) => {
      return steps.find((s) => s.id === step)?.isEnabled || false;
    },
    [steps]
  );

  /**
   * Get current step label
   */
  const getCurrentStepLabel = useCallback(() => {
    return STEP_CONFIG.find((s) => s.id === currentStep)?.label || '';
  }, [currentStep]);

  return {
    state,
    goToStep,
    nextStep,
    previousStep,
    setStepStatus,
    resetStepper,
    isStepAccessible,
    getCurrentStepLabel,
    totalSteps: STEP_CONFIG.length,
  };
};

export default useStepper;