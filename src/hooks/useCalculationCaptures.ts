import { useState, useEffect, useCallback } from 'react';
import { CalculationCapture } from '../core/types/workflow';
import { calculationCaptureService } from '../services/calculationCaptureService';

export function useCalculationCaptures() {
  const [captures, setCaptures] = useState<CalculationCapture[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCaptures = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await calculationCaptureService.listCaptures();
      setCaptures(data);
    } catch (error) {
      console.error('Failed to load calculation captures:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCaptures();
  }, [refreshCaptures]);

  const addManyCalculationCaptures = useCallback(async (items: CalculationCapture[]) => {
    try {
      await calculationCaptureService.addCaptures(items);
      await refreshCaptures();
    } catch (error) {
      console.error('Failed to add calculation captures:', error);
    }
  }, [refreshCaptures]);

  const removeCapture = useCallback(async (id: string) => {
    try {
      await calculationCaptureService.deleteCapture(id);
      await refreshCaptures();
    } catch (error) {
      console.error('Failed to remove calculation capture:', error);
    }
  }, [refreshCaptures]);

  return {
    captures,
    isLoading,
    refreshCaptures,
    addManyCalculationCaptures,
    removeCapture,
  };
}
