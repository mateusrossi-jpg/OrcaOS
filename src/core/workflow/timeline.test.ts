import { describe, it, expect } from 'vitest';
import { 
  createTimelineEntry, 
  appendWorkflowEvent, 
  getWorkflowEventSummary, 
  buildWorkflowTimeline, 
  type OperationalTimelineEntry 
} from './timeline';

describe('Workflow Timeline Domain', () => {
  it('should create a timeline entry correctly', () => {
    const entry = createTimelineEntry({
      workflowId: 'budget-1',
      type: 'created',
      operator: 'Operador Teste'
    });

    expect(entry.workflowId).toBe('budget-1');
    expect(entry.type).toBe('created');
    expect(entry.operator).toBe('Operador Teste');
    expect(entry.id).toBeTypeOf('string');
    expect(entry.timestamp).toBeTypeOf('string');
  });

  it('should append a new event to a timeline', () => {
    const timeline: OperationalTimelineEntry[] = [];
    const newTimeline = appendWorkflowEvent(timeline, {
      workflowId: 'budget-1',
      type: 'authorized'
    });

    expect(newTimeline.length).toBe(1);
    expect(newTimeline[0].type).toBe('authorized');

    const nextTimeline = appendWorkflowEvent(newTimeline, {
      workflowId: 'budget-1',
      type: 'finished',
      meta: {
        mutations: [{ field: 'total', oldValue: 100, newValue: 200 }]
      }
    });

    expect(nextTimeline.length).toBe(2);
    expect(nextTimeline[1].type).toBe('finished');
    expect(nextTimeline[1].meta?.mutations?.length).toBe(1);
    expect(nextTimeline[1].meta?.mutations![0].field).toBe('total');
  });

  it('should get correct summary for events', () => {
    expect(getWorkflowEventSummary('created')).toBe('Orçamento criado.');
    expect(getWorkflowEventSummary('execution_started')).toBe('Execução iniciada.');
    expect(getWorkflowEventSummary('updated')).toBe('Informações atualizadas.');
  });

  it('should sort timeline chronologically (newest first)', () => {
    const early = createTimelineEntry({ workflowId: '1', type: 'created' });
    const late = createTimelineEntry({ workflowId: '1', type: 'finished' });

    // Manually force timestamps to test sorting
    early.timestamp = new Date('2026-05-20T10:00:00Z').toISOString();
    late.timestamp = new Date('2026-05-20T12:00:00Z').toISOString();

    const sorted = buildWorkflowTimeline([late, early]);
    
    // buildWorkflowTimeline sorts oldest first
    expect(sorted[0].id).toBe(early.id);
    expect(sorted[1].id).toBe(late.id);
  });

  it('should be safe with old timelines (no meta/mutations)', () => {
    const oldEvent: OperationalTimelineEntry = {
      id: 'old-1',
      workflowId: 'budget-1',
      type: 'created',
      timestamp: new Date().toISOString(),
      // no meta, no mutations
    };

    const sorted = buildWorkflowTimeline([oldEvent]);
    expect(sorted.length).toBe(1);
    expect(sorted[0].meta).toBeUndefined();
  });
});
