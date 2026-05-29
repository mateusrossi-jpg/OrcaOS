import React from 'react';
import './WorkflowStepper.css';
import { WorkflowStepId, WorkflowStep } from '../../../domain/budgetWorkflow';
import { cn } from '../../../utils/ui';

interface WorkflowStepperProps {
  currentStep: WorkflowStepId;
  workflowMap: Record<WorkflowStepId, WorkflowStep>;
  onStepClick?: (stepId: WorkflowStepId) => void;
}

/**
 * WorkflowStepper V6: Executive Pipeline Tracker.
 * Part of the Aferix Design Authority - Section 5
 */
export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ 
  currentStep, 
  workflowMap,
  onStepClick 
}) => {
  const steps = Object.values(workflowMap) as WorkflowStep[];
  const currentStepData = workflowMap[currentStep];

  return (
    <nav className="aferix-workflow-stepper" aria-label="Pipeline de Operação">
      <div className="stepper-label">
        <span className="step-counter">Progresso · Etapa {currentStep} de {steps.length}</span>
        <strong className="step-name">{currentStepData.label}</strong>
      </div>

      <div className="stepper-track">
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          
          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                className={cn(
                  "stepper-node",
                  isCompleted && "completed",
                  isActive && "active"
                )}
                onClick={() => onStepClick?.(step.id as WorkflowStepId)}
                title={step.label}
                aria-label={`Etapa ${step.id}: ${step.label}`}
                aria-current={isActive ? 'step' : undefined}
              />
              {step.id < steps.length && (
                <div className={cn("stepper-line", isCompleted && "completed")} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};

