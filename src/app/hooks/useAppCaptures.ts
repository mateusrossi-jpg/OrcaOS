import { useState, useEffect, useCallback } from 'react';
import type { CalculationCapture } from '../../core/types/workflow';
import { loadStoredCaptures, saveStoredCaptures } from '../storage/calculationCapturesStorage';
import { cleanupRuntimeValidationData } from '../storage/runtimeValidationCleanup';

export function useAppCaptures(activeWorkOrderId: string | null) {
  const [captures, setCaptures] = useState<CalculationCapture[]>(() => {
    cleanupRuntimeValidationData();
    return loadStoredCaptures();
  });

  useEffect(() => {
    saveStoredCaptures(captures);
  }, [captures]);

  const attachActiveWorkOrder = useCallback((capture: CalculationCapture): CalculationCapture => {
    return activeWorkOrderId && !capture.workOrderId ? { ...capture, workOrderId: activeWorkOrderId } : capture;
  }, [activeWorkOrderId]);

  const addCalculationCapture = useCallback((capture: CalculationCapture) => {
    setCaptures((current) => [
      {
        itemType: 'technicalObservation',
        editableDescription: capture.summary,
        quantity: '1',
        unitValue: '',
        shouldGenerateBudgetItem: capture.destination !== 'survey',
        convertedToBudgetItem: false,
        ...attachActiveWorkOrder(capture)
      },
      ...current
    ]);
  }, [attachActiveWorkOrder]);

  const addManyCalculationCaptures = useCallback((items: CalculationCapture[]) => {
    setCaptures((current) => [...items.map(attachActiveWorkOrder), ...current]);
  }, [attachActiveWorkOrder]);

  const updateCalculationCapture = useCallback((id: string, patch: Partial<CalculationCapture>) => {
    setCaptures((current) => current.map((capture) => (capture.id === id ? { ...capture, ...patch } : capture)));
  }, []);

  const removeCalculationCapture = useCallback((id: string) => {
    setCaptures((current) => current.filter((capture) => capture.id !== id));
  }, []);

  return {
    captures,
    addCalculationCapture,
    addManyCalculationCaptures,
    updateCalculationCapture,
    removeCalculationCapture
  };
}
