import React from 'react';
import './WorkflowStepper.css';
import { WorkflowStepId, WorkflowStep } from '../../../domain/budgetWorkflow';

interface WorkflowStepperProps {
  currentStep: WorkflowStepId;
  workflowMap: Record<WorkflowStepId, WorkflowStep>;
  onStepClick?: (stepId: WorkflowStepId) => void;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ 
  currentStep, 
  workflowMap,
  onStepClick 
}) => {
  const steps = Object.values(workflowMap) as WorkflowStep[];
  const currentStepData = workflowMap[currentStep];

  return (
    <nav className="aferix-workflow-stepper">
      <div className="stepper-track">
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          
          let stateClass = 'inactive';
          if (isCompleted) stateClass = 'completed';
          if (isActive) stateClass = 'active';

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                className={`stepper-node ${stateClass}`}
                onClick={() => onStepClick?.(step.id as WorkflowStepId)}
                title={step.label}
                aria-label={`Etapa ${step.id}: ${step.label}`}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="node-icon">{isCompleted ? '✓' : step.id}</span>
              </button>
              {step.id < steps.length && (
                <div className={`stepper-line ${isCompleted ? 'completed' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      <div className="stepper-label">
        <span className="step-counter">Etapa {currentStep} de {steps.length}</span>
        <strong className="step-name">{currentStepData.icon} {currentStepData.label}</strong>
      </div>
    </nav>
  );
};
