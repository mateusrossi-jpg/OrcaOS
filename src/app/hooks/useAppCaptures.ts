import type { ActiveWorkContext } from '../appTypes';
import { loadActiveWorkOrderId } from '../../features/clients/storage/clientWorkOrderStorage';
import type { CalculationCapture } from '../../core/types/workflow';

/**
 * Hook para centralizar a lógica de captura de cálculos no App.
 * Simplificado para o MVP Aferix.
 */
export function useAppCaptures(
  activeWorkOrderId: string | null,
  setCaptures: React.Dispatch<React.SetStateAction<CalculationCapture[]>>
) {
  function attachActiveWorkOrder(capture: CalculationCapture): CalculationCapture {
    const currentActiveId = activeWorkOrderId || loadActiveWorkOrderId();
    return currentActiveId && !capture.workOrderId 
      ? { ...capture, workOrderId: currentActiveId } 
      : capture;
  }

  function addCalculationCapture(capture: CalculationCapture) {
    setCaptures((current) => [
      attachActiveWorkOrder(capture),
      ...current
    ]);
  }

  function addManyCalculationCaptures(items: CalculationCapture[]) {
    setCaptures((current) => [
      ...items.map(attachActiveWorkOrder),
      ...current
    ]);
  }

  function updateCalculationCapture(id: string, patch: Partial<CalculationCapture>) {
    setCaptures((current) => 
      current.map((capture) => (capture.id === id ? { ...capture, ...patch } : capture))
    );
  }

  function removeCalculationCapture(id: string) {
    setCaptures((current) => current.filter((capture) => capture.id !== id));
  }

  return {
    addCalculationCapture,
    addManyCalculationCaptures,
    updateCalculationCapture,
    removeCalculationCapture,
    attachActiveWorkOrder
  };
}
