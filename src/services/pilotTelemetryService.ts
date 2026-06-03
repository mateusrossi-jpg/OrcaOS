/**
 * AFERIX PILOT TELEMETRY SERVICE V1
 *
 * Local-first behavioral telemetry for FASE 4: REAL OPERATOR VALIDATION.
 * Writes to IndexedDB via Dexie. Zero external dependencies.
 * Zero impact on normal operations — fire-and-forget pattern.
 *
 * Tracks:
 * - Flow timing (start → complete | abandon)
 * - Screen dwell time
 * - Edit counts (form friction detector)
 * - Touch counts per flow
 * - Session continuity
 */

import { db } from '../storage/dexieDatabase';

export type PilotFlowType =
  | 'new_proposal'
  | 'quick_service'
  | 'client_creation'
  | 'os_execution'
  | 'payment_receipt'
  | 'budget_authorization'
  | 'os_scheduling'
  | 'client_search';

export type PilotEventType =
  | 'flow_start'
  | 'flow_complete'
  | 'flow_abandon'
  | 'screen_view'
  | 'screen_leave'
  | 'action'
  | 'field_edit'
  | 'error'
  | 'session_start'
  | 'session_end';

export interface PilotEvent {
  id: string;
  sessionId: string;
  type: PilotEventType;
  flow?: PilotFlowType;
  screen?: string;
  durationMs?: number;
  touchCount?: number;
  editCount?: number;
  abandoned?: boolean;
  errorCode?: string;
  metadata?: string; // JSON string
  dayOfWeek: number; // 0=Sun, 1=Mon…
  hourOfDay: number;
  timestamp: string; // ISO
}

// ─── Session Management ───────────────────────────────────────────────────────

function getSessionId(): string {
  const key = 'aferix_pilot_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

function getSessionStartTime(): number {
  const key = 'aferix_pilot_session_start';
  let t = sessionStorage.getItem(key);
  if (!t) {
    t = Date.now().toString();
    sessionStorage.setItem(key, t);
  }
  return parseInt(t, 10);
}

function generateEventId(): string {
  return `pe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowMeta() {
  const now = new Date();
  return {
    timestamp: now.toISOString(),
    dayOfWeek: now.getDay(),
    hourOfDay: now.getHours(),
  };
}

// ─── Core Service ─────────────────────────────────────────────────────────────

class PilotTelemetryService {
  private sessionId: string;
  private enabled: boolean = true;

  constructor() {
    this.sessionId = getSessionId();
    // Kick off session start event asynchronously
    this._emit({
      type: 'session_start',
      metadata: JSON.stringify({
        ua: navigator.userAgent.slice(0, 80),
        screenW: window.innerWidth,
        screenH: window.innerHeight,
      }),
    }).catch(() => {});
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Start timing a flow. Returns a function that completes or abandons the flow.
   * Usage:
   *   const completeFlow = pilotTelemetry.startFlow('new_proposal');
   *   // ... user completes or leaves ...
   *   completeFlow(); // or completeFlow(true) to mark as abandoned
   */
  startFlow(
    flow: PilotFlowType,
    meta?: Record<string, unknown>
  ): (abandoned?: boolean, extra?: Record<string, unknown>) => void {
    if (!this.enabled) return () => {};
    const startTime = performance.now();
    let touchCount = 0;
    let editCount = 0;

    // Track touches during the flow
    const onTouch = () => { touchCount++; };
    document.addEventListener('touchstart', onTouch, { passive: true });
    document.addEventListener('click', onTouch, { passive: true });

    this._emit({
      type: 'flow_start',
      flow,
      metadata: meta ? JSON.stringify(meta) : undefined,
    }).catch(() => {});

    return (abandoned = false, extra) => {
      document.removeEventListener('touchstart', onTouch);
      document.removeEventListener('click', onTouch);
      const durationMs = Math.round(performance.now() - startTime);
      this._emit({
        type: abandoned ? 'flow_abandon' : 'flow_complete',
        flow,
        durationMs,
        touchCount,
        editCount,
        abandoned,
        metadata: extra ? JSON.stringify(extra) : undefined,
      }).catch(() => {});
    };
  }

  /**
   * Track a screen view. Returns cleanup function for when user leaves.
   */
  trackScreen(screen: string): () => void {
    if (!this.enabled) return () => {};
    const startTime = performance.now();
    this._emit({ type: 'screen_view', screen }).catch(() => {});
    return () => {
      const durationMs = Math.round(performance.now() - startTime);
      this._emit({ type: 'screen_leave', screen, durationMs }).catch(() => {});
    };
  }

  /** Track an arbitrary user action */
  trackAction(screen: string, action: string, meta?: Record<string, unknown>): void {
    if (!this.enabled) return;
    this._emit({
      type: 'action',
      screen,
      metadata: JSON.stringify({ action, ...meta }),
    }).catch(() => {});
  }

  /** Track a field edit (call on onChange) */
  trackEdit(flow: PilotFlowType, field: string): void {
    if (!this.enabled) return;
    this._emit({
      type: 'field_edit',
      flow,
      metadata: JSON.stringify({ field }),
    }).catch(() => {});
  }

  /** Track an operational error */
  trackError(screen: string, errorCode: string, message?: string): void {
    if (!this.enabled) return;
    this._emit({
      type: 'error',
      screen,
      errorCode,
      metadata: message ? JSON.stringify({ message }) : undefined,
    }).catch(() => {});
  }

  // ── Analytics Read API ──────────────────────────────────────────────────────

  async getSessionCount(): Promise<number> {
    try {
      return await db.pilotEvents
        .where('type').equals('session_start')
        .count();
    } catch { return 0; }
  }

  async getFlowStats(flow: PilotFlowType) {
    try {
      const completions = await db.pilotEvents
        .where('[flow+type]').equals([flow, 'flow_complete'])
        .toArray();
      const abandons = await db.pilotEvents
        .where('[flow+type]').equals([flow, 'flow_abandon'])
        .toArray();

      const durations = completions.map(e => e.durationMs || 0).filter(d => d > 0);
      const avgDuration = durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;

      const avgTouches = completions.length > 0
        ? Math.round(completions.reduce((a, e) => a + (e.touchCount || 0), 0) / completions.length)
        : 0;

      return {
        flow,
        completions: completions.length,
        abandons: abandons.length,
        abandonRate: completions.length + abandons.length > 0
          ? Math.round(abandons.length / (completions.length + abandons.length) * 100)
          : 0,
        avgDurationMs: avgDuration,
        avgDurationSec: Math.round(avgDuration / 100) / 10,
        avgTouches,
      };
    } catch { 
      return { flow, completions: 0, abandons: 0, abandonRate: 0, avgDurationMs: 0, avgDurationSec: 0, avgTouches: 0 };
    }
  }

  async getScreenDwellTimes() {
    try {
      const events = await db.pilotEvents
        .where('type').equals('screen_leave')
        .toArray();
      
      const byScreen: Record<string, { totalMs: number; count: number }> = {};
      for (const e of events) {
        const s = e.screen || 'unknown';
        if (!byScreen[s]) byScreen[s] = { totalMs: 0, count: 0 };
        byScreen[s].totalMs += e.durationMs || 0;
        byScreen[s].count++;
      }
      return Object.entries(byScreen)
        .map(([screen, data]) => ({
          screen,
          avgDwellSec: Math.round(data.totalMs / data.count / 100) / 10,
          visits: data.count,
        }))
        .sort((a, b) => b.avgDwellSec - a.avgDwellSec);
    } catch { return []; }
  }

  async getDailyActivity() {
    try {
      const sessions = await db.pilotEvents
        .where('type').equals('session_start')
        .toArray();
      
      const byDate: Record<string, number> = {};
      for (const s of sessions) {
        const date = s.timestamp.slice(0, 10);
        byDate[date] = (byDate[date] || 0) + 1;
      }
      return Object.entries(byDate)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 30)
        .map(([date, count]) => ({ date, sessions: count }));
    } catch { return []; }
  }

  async getUsageStreak(): Promise<number> {
    try {
      const activity = await this.getDailyActivity();
      if (activity.length === 0) return 0;
      
      let streak = 0;
      const today = new Date().toISOString().slice(0, 10);
      let checkDate = today;
      
      for (const { date } of activity) {
        if (date === checkDate) {
          streak++;
          const d = new Date(checkDate);
          d.setDate(d.getDate() - 1);
          checkDate = d.toISOString().slice(0, 10);
        } else if (date < checkDate) {
          break;
        }
      }
      return streak;
    } catch { return 0; }
  }

  async getAbandonedFlows() {
    try {
      const events = await db.pilotEvents
        .where('type').equals('flow_abandon')
        .toArray();
      const byFlow: Record<string, number> = {};
      for (const e of events) {
        if (e.flow) byFlow[e.flow] = (byFlow[e.flow] || 0) + 1;
      }
      return byFlow;
    } catch { return {}; }
  }

  async getAllStats() {
    const flows: PilotFlowType[] = [
      'new_proposal', 'quick_service', 'client_creation',
      'os_execution', 'payment_receipt', 'budget_authorization',
    ];
    const [flowStats, screenDwell, dailyActivity, streak, abandoned] = await Promise.all([
      Promise.all(flows.map(f => this.getFlowStats(f))),
      this.getScreenDwellTimes(),
      this.getDailyActivity(),
      this.getUsageStreak(),
      this.getAbandonedFlows(),
    ]);
    return { flowStats, screenDwell, dailyActivity, streak, abandoned };
  }

  async exportCSV(): Promise<string> {
    try {
      const events = await db.pilotEvents.toArray();
      const header = 'id,sessionId,type,flow,screen,durationMs,touchCount,editCount,abandoned,dayOfWeek,hourOfDay,timestamp';
      const rows = events.map(e =>
        [e.id, e.sessionId, e.type, e.flow || '', e.screen || '',
          e.durationMs || '', e.touchCount || '', e.editCount || '',
          e.abandoned ? '1' : '0', e.dayOfWeek, e.hourOfDay, e.timestamp]
          .join(',')
      );
      return [header, ...rows].join('\n');
    } catch { return ''; }
  }

  async clearData(): Promise<void> {
    try {
      await db.pilotEvents.clear();
    } catch { /* silent */ }
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  private async _emit(partial: Partial<PilotEvent>): Promise<void> {
    if (!this.enabled) return;
    const meta = nowMeta();
    const event: PilotEvent = {
      id: generateEventId(),
      sessionId: this.sessionId,
      type: partial.type || 'action',
      dayOfWeek: meta.dayOfWeek,
      hourOfDay: meta.hourOfDay,
      timestamp: meta.timestamp,
      ...partial,
    };
    try {
      await db.pilotEvents.add(event);
    } catch (e) {
      // Silent - never interrupt user operations
      console.debug('[Pilot] Telemetry write failed (non-critical):', e);
    }
  }
}

// Singleton export
export const pilotTelemetry = new PilotTelemetryService();
