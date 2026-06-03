/**
 * usePilotFlow — React Hook for Pilot Telemetry
 *
 * Provides:
 * - Automatic screen dwell tracking via useEffect cleanup
 * - Flow timing with startFlow / completeFlow / abandonFlow
 * - Edit counter for friction detection
 * - Zero-overhead when pilot is disabled
 */
import { useEffect, useRef, useCallback } from 'react';
import { pilotTelemetry, PilotFlowType } from '../services/pilotTelemetryService';

/**
 * Track dwell time on a screen automatically.
 * Place at the top of any screen component.
 *
 * @example
 * usePilotScreen('budgets');
 */
export function usePilotScreen(screen: string) {
  useEffect(() => {
    const cleanup = pilotTelemetry.trackScreen(screen);
    return cleanup;
  }, [screen]);
}

/**
 * Full flow tracking hook — timing, edits, touch count, abandon detection.
 * The flow is automatically marked as abandoned if the component unmounts
 * before completeFlow() is called.
 *
 * @example
 * const { completeFlow, abandonFlow, trackEdit } = usePilotFlow('new_proposal');
 */
export function usePilotFlow(flow: PilotFlowType) {
  const completionRef = useRef<((abandoned?: boolean, extra?: Record<string, unknown>) => void) | null>(null);
  const completedRef = useRef(false);
  const editCountRef = useRef(0);

  useEffect(() => {
    completedRef.current = false;
    editCountRef.current = 0;
    completionRef.current = pilotTelemetry.startFlow(flow);

    return () => {
      // Unmount without explicit complete = abandon
      if (!completedRef.current && completionRef.current) {
        completionRef.current(true, { editCount: editCountRef.current });
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow]);

  const completeFlow = useCallback((extra?: Record<string, unknown>) => {
    completedRef.current = true;
    if (completionRef.current) {
      completionRef.current(false, { editCount: editCountRef.current, ...extra });
      completionRef.current = null;
    }
  }, []);

  const abandonFlow = useCallback((reason?: string) => {
    completedRef.current = true; // prevent double-fire on unmount
    if (completionRef.current) {
      completionRef.current(true, { editCount: editCountRef.current, reason });
      completionRef.current = null;
    }
  }, []);

  /** Call on every onChange event to measure form friction */
  const trackEdit = useCallback((field: string) => {
    editCountRef.current++;
    pilotTelemetry.trackEdit(flow, field);
  }, [flow]);

  return { completeFlow, abandonFlow, trackEdit };
}
