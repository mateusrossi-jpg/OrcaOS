/**
 * AFERIX PILOT DASHBOARD V1
 *
 * Real-time behavioral analytics for FASE 4: Real Operator Validation.
 *
 * Fases:
 * 1 — Telemetria Operacional (flow times, touch counts)
 * 2 — Detecção de Atrito (abandonment, friction)
 * 3 — Mapa de Uso (screen dwell, most used)
 * 4 — Mapa de Velocidade (vs targets)
 * 5 — Análise de Campo (field edits, redundancies)
 * 6 — Certificação de Mercado (pilot checklist)
 */
import { useState, useEffect } from 'react';
import {
  Activity, BarChart3, Clock, Zap, Target, AlertTriangle,
  CheckCircle2, TrendingUp, Download, Trash2, RefreshCw,
  Flame, Eye, XCircle, ChevronRight
} from 'lucide-react';
import { pilotTelemetry } from '../../../services/pilotTelemetryService';
import { cn } from '../../../utils/ui';
import { formatCurrencyBRL } from '../../../utils/formatters';
import { db } from '../../../storage/dexieDatabase';

// Speed targets (V5 goals)
const SPEED_TARGETS: Record<string, number> = {
  new_proposal: 10000,      // 10s
  quick_service: 15000,     // 15s
  client_creation: 8000,    // 8s
  payment_receipt: 5000,    // 5s
  budget_authorization: 8000,
  os_execution: 12000,
};

const FLOW_LABELS: Record<string, string> = {
  new_proposal: 'Nova Proposta',
  quick_service: 'Serviço Expresso',
  client_creation: 'Novo Cliente',
  os_execution: 'Execução OS',
  payment_receipt: 'Receber Pagamento',
  budget_authorization: 'Autorização',
  os_scheduling: 'Agendamento OS',
  client_search: 'Busca Cliente',
};

const SCREEN_LABELS: Record<string, string> = {
  dashboard: 'EMPRESA',
  budgets: 'PROPOSTAS',
  agenda: 'AGENDA / OS',
  money: 'FINANCEIRO',
  clients: 'CLIENTES',
  settings: 'MENU',
  'new-budget': 'Nova Proposta',
  'new-quick-service': 'Serviço Expresso',
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m${Math.floor((ms % 60000) / 1000)}s`;
}

function SpeedGauge({ label, avgMs, targetMs }: { label: string; avgMs: number; targetMs: number }) {
  if (avgMs === 0) return null;
  const ratio = avgMs / targetMs;
  const isGood = ratio <= 1.0;
  const isWarn = ratio <= 1.5;

  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-[12px] bg-white/[0.03] border border-white/[0.06]">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black tracking-widest uppercase text-text-tertiary">{label}</span>
        <span className={cn(
          "text-[10px] font-black tracking-wider",
          isGood ? "text-[var(--accent-green)]" : isWarn ? "text-amber-400" : "text-[var(--accent-red)]"
        )}>
          {isGood ? '✓ OK' : isWarn ? '⚠ LENTO' : '✗ CRÍTICO'}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[18px] font-black text-white">{formatDuration(avgMs)}</span>
        <span className="text-[9px] text-text-muted font-mono">meta: {formatDuration(targetMs)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isGood ? "bg-[var(--accent-green)]" : isWarn ? "bg-amber-400" : "bg-[var(--accent-red)]"
          )}
          style={{ width: `${Math.min(100, (targetMs / avgMs) * 100)}%` }}
        />
      </div>
    </div>
  );
}

function StatBlock({ value, label, sub, color }: { value: string | number; label: string; sub?: string; color?: string }) {
  return (
    <div className="flex flex-col gap-0.5 p-3 rounded-[12px] bg-white/[0.03] border border-white/[0.06]">
      <span className={cn("text-[22px] font-black leading-none", color || "text-white")}>{value}</span>
      <span className="text-[9px] font-black tracking-widest uppercase text-text-tertiary">{label}</span>
      {sub && <span className="text-[8px] text-text-muted font-mono">{sub}</span>}
    </div>
  );
}

type PilotTab = 'overview' | 'speed' | 'screens' | 'friction' | 'field';

export function PilotDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<PilotTab>('overview');
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  async function loadData() {
    setIsLoading(true);
    try {
      const [allStats, sessions, total] = await Promise.all([
        pilotTelemetry.getAllStats(),
        pilotTelemetry.getSessionCount(),
        db.pilotEvents.count(),
      ]);
      setStats(allStats);
      setSessionCount(sessions);
      setTotalEvents(total);
      setLastRefresh(new Date().toLocaleTimeString('pt-BR'));
    } catch (e) {
      console.error('Pilot Dashboard load error:', e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csv = await pilotTelemetry.exportCSV();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aferix_pilot_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Apagar todos os dados de telemetria? Esta ação não pode ser desfeita.')) return;
    setIsClearing(true);
    try {
      await pilotTelemetry.clearData();
      await loadData();
    } finally {
      setIsClearing(false);
    }
  };

  const tabs: Array<{ id: PilotTab; label: string; icon: any }> = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'speed', label: 'Velocidade', icon: Zap },
    { id: 'screens', label: 'Uso', icon: Eye },
    { id: 'friction', label: 'Atrito', icon: AlertTriangle },
    { id: 'field', label: 'Campo', icon: Target },
  ];

  return (
    <div className="flex flex-col gap-6 pb-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)]/15 flex items-center justify-center">
            <Activity size={15} className="text-[var(--accent-gold)]" />
          </div>
          <div>
            <p className="text-[11px] font-black tracking-[0.2em] text-white uppercase">Pilot Dashboard</p>
            <p className="text-[9px] text-text-muted font-mono">
              {lastRefresh ? `Atualizado: ${lastRefresh}` : 'Carregando...'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white active:scale-95 transition-all"
          >
            <RefreshCw size={14} className={cn(isLoading && "animate-spin")} />
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-[var(--accent-gold)]/70 hover:text-[var(--accent-gold)] active:scale-95 transition-all"
            title="Exportar CSV"
          >
            <Download size={14} />
          </button>
          <button
            onClick={handleClear}
            disabled={isClearing}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-[var(--accent-red)]/70 hover:text-[var(--accent-red)] active:scale-95 transition-all"
            title="Limpar dados"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black tracking-widest uppercase whitespace-nowrap transition-all active:scale-95",
              tab === t.id
                ? "bg-[var(--accent-gold)] text-black"
                : "bg-white/[0.04] border border-white/[0.07] text-white/50 hover:text-white"
            )}
          >
            <t.icon size={10} />
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <RefreshCw size={24} className="text-[var(--accent-gold)] animate-spin" />
          <span className="text-[10px] text-text-muted font-mono uppercase tracking-widest">Carregando telemetria...</span>
        </div>
      ) : (

        <>
          {/* ═══ OVERVIEW TAB ═══ */}
          {tab === 'overview' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <StatBlock
                  value={stats?.dailyActivity?.length || 0}
                  label="Dias de Uso"
                  sub="dias com pelo menos 1 sessão"
                  color="text-[var(--accent-gold)]"
                />
                <StatBlock
                  value={sessionCount}
                  label="Sessões"
                  sub="aperturas do app"
                />
                <StatBlock
                  value={stats?.streak || 0}
                  label="Sequência"
                  sub="dias consecutivos"
                  color={stats?.streak >= 3 ? "text-[var(--accent-green)]" : "text-white"}
                />
                <StatBlock
                  value={totalEvents}
                  label="Eventos"
                  sub="ações capturadas"
                />
              </div>

              {/* Usage Streak Visual */}
              {stats?.streak > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-[16px] bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/20">
                  <Flame size={20} className="text-[var(--accent-green)] shrink-0" />
                  <div>
                    <p className="text-[13px] font-black text-white">{stats.streak} dias consecutivos</p>
                    <p className="text-[10px] text-[var(--accent-green)] font-mono">O sistema está virando hábito ✓</p>
                  </div>
                </div>
              )}

              {/* Daily Activity */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black tracking-[0.2em] text-text-tertiary uppercase">Atividade Diária (últimos 30 dias)</span>
                {stats?.dailyActivity?.length === 0 ? (
                  <div className="p-4 rounded-[12px] bg-white/[0.02] border border-white/[0.05] text-center">
                    <span className="text-[10px] text-text-muted font-mono">Nenhuma sessão registrada ainda.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {stats?.dailyActivity?.slice(0, 7).map((d: any) => (
                      <div key={d.date} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02]">
                        <span className="text-[10px] text-text-muted font-mono w-24">
                          {new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                        <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--accent-gold)] rounded-full"
                            style={{ width: `${Math.min(100, d.sessions * 20)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-white/60 font-mono w-8 text-right">{d.sessions}x</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Flow Summary */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black tracking-[0.2em] text-text-tertiary uppercase">Resumo de Fluxos</span>
                {stats?.flowStats?.filter((f: any) => f.completions + f.abandons > 0).length === 0 ? (
                  <div className="p-4 rounded-[12px] bg-white/[0.02] border border-white/[0.05] text-center">
                    <span className="text-[10px] text-text-muted font-mono">Nenhum fluxo monitorado ainda.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {stats?.flowStats
                      ?.filter((f: any) => f.completions + f.abandons > 0)
                      .sort((a: any, b: any) => b.completions - a.completions)
                      .map((f: any) => (
                        <div key={f.flow} className="flex items-center gap-3 p-3 rounded-[12px] bg-white/[0.03] border border-white/[0.05]">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-black text-white">{FLOW_LABELS[f.flow] || f.flow}</span>
                              <span className={cn(
                                "text-[9px] font-mono",
                                f.abandonRate < 20 ? "text-[var(--accent-green)]" :
                                f.abandonRate < 40 ? "text-amber-400" : "text-[var(--accent-red)]"
                              )}>
                                {f.abandonRate}% abandono
                              </span>
                            </div>
                            <div className="flex gap-3 text-[9px] text-text-muted font-mono">
                              <span>{f.completions} ok</span>
                              <span>{f.abandons} abandon</span>
                              {f.avgDurationSec > 0 && <span>~{f.avgDurationSec}s</span>}
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ SPEED TAB ═══ */}
          {tab === 'speed' && (
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-[14px] bg-[var(--accent-gold)]/8 border border-[var(--accent-gold)]/20">
                <p className="text-[10px] font-black text-[var(--accent-gold)] uppercase tracking-widest mb-1">Meta de Velocidade</p>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  Proposta ≤ 10s • Cliente Recorrente ≤ 3s • Recebimento ≤ 5s
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {stats?.flowStats
                  ?.filter((f: any) => f.avgDurationMs > 0 && SPEED_TARGETS[f.flow])
                  .map((f: any) => (
                    <SpeedGauge
                      key={f.flow}
                      label={FLOW_LABELS[f.flow] || f.flow}
                      avgMs={f.avgDurationMs}
                      targetMs={SPEED_TARGETS[f.flow]}
                    />
                  ))
                }
                {stats?.flowStats?.filter((f: any) => f.avgDurationMs > 0).length === 0 && (
                  <div className="p-6 rounded-[14px] bg-white/[0.02] text-center">
                    <Zap size={20} className="text-text-muted mx-auto mb-3" />
                    <span className="text-[10px] text-text-muted font-mono block">Nenhum dado de velocidade ainda.</span>
                    <span className="text-[9px] text-text-muted/60 font-mono">Use o app para ver métricas aqui.</span>
                  </div>
                )}
              </div>

              {/* Touch counts */}
              {stats?.flowStats?.some((f: any) => f.avgTouches > 0) && (
                <>
                  <span className="text-[9px] font-black tracking-[0.2em] text-text-tertiary uppercase">Média de Toques por Fluxo</span>
                  <div className="grid grid-cols-2 gap-2">
                    {stats?.flowStats
                      ?.filter((f: any) => f.avgTouches > 0)
                      .map((f: any) => (
                        <div key={f.flow} className="p-3 rounded-[12px] bg-white/[0.03] border border-white/[0.06] flex flex-col gap-1">
                          <span className="text-[8px] text-text-muted uppercase tracking-widest">{FLOW_LABELS[f.flow] || f.flow}</span>
                          <span className={cn(
                            "text-[18px] font-black",
                            f.avgTouches <= 5 ? "text-[var(--accent-green)]" :
                            f.avgTouches <= 10 ? "text-amber-400" : "text-[var(--accent-red)]"
                          )}>
                            {f.avgTouches}
                          </span>
                          <span className="text-[8px] text-text-muted font-mono">toques</span>
                        </div>
                      ))
                    }
                  </div>
                </>
              )}
            </div>
          )}

          {/* ═══ SCREENS TAB ═══ */}
          {tab === 'screens' && (
            <div className="flex flex-col gap-4">
              <span className="text-[9px] font-black tracking-[0.2em] text-text-tertiary uppercase">Tempo Médio por Tela</span>
              {stats?.screenDwell?.length === 0 ? (
                <div className="p-6 rounded-[14px] bg-white/[0.02] text-center">
                  <Eye size={20} className="text-text-muted mx-auto mb-3" />
                  <span className="text-[10px] text-text-muted font-mono">Nenhum dado de uso de telas ainda.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {stats?.screenDwell?.map((s: any, i: number) => {
                    const maxDwell = stats.screenDwell[0]?.avgDwellSec || 1;
                    return (
                      <div key={s.screen} className="flex flex-col gap-1 p-3 rounded-[12px] bg-white/[0.03] border border-white/[0.06]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-text-muted w-4 text-right">{i + 1}</span>
                            <span className="text-[11px] font-bold text-white">
                              {SCREEN_LABELS[s.screen] || s.screen}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[9px] font-mono text-text-muted">
                            <span>{s.visits}x</span>
                            <span className="text-white font-black">{s.avgDwellSec}s</span>
                          </div>
                        </div>
                        <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(s.avgDwellSec / maxDwell) * 100}%`,
                              backgroundColor: i === 0 ? 'var(--accent-gold)' : i < 3 ? 'var(--accent-blue)' : 'rgba(255,255,255,0.3)'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══ FRICTION TAB ═══ */}
          {tab === 'friction' && (
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-[14px] bg-[var(--accent-red)]/8 border border-[var(--accent-red)]/20">
                <p className="text-[10px] font-black text-[var(--accent-red)] uppercase tracking-widest mb-1">Detecção de Atrito</p>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  Fluxos abandonados indicam onde o operador encontra barreiras operacionais.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black tracking-[0.2em] text-text-tertiary uppercase">Taxa de Abandono por Fluxo</span>
                {stats?.flowStats?.filter((f: any) => f.completions + f.abandons > 0).length === 0 ? (
                  <div className="p-6 rounded-[14px] bg-white/[0.02] text-center">
                    <CheckCircle2 size={20} className="text-[var(--accent-green)] mx-auto mb-3" />
                    <span className="text-[10px] text-text-muted font-mono">Nenhum dado de abandono ainda.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {stats?.flowStats
                      ?.filter((f: any) => f.completions + f.abandons > 0)
                      .sort((a: any, b: any) => b.abandonRate - a.abandonRate)
                      .map((f: any) => (
                        <div key={f.flow} className="flex items-center gap-3 p-3 rounded-[12px] bg-white/[0.03] border border-white/[0.05]">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                            f.abandonRate === 0 ? "bg-[var(--accent-green)]/15" :
                            f.abandonRate < 20 ? "bg-[var(--accent-green)]/10" :
                            f.abandonRate < 40 ? "bg-amber-500/15" : "bg-[var(--accent-red)]/15"
                          )}>
                            {f.abandonRate === 0
                              ? <CheckCircle2 size={14} className="text-[var(--accent-green)]" />
                              : f.abandonRate < 30
                              ? <AlertTriangle size={14} className="text-amber-400" />
                              : <XCircle size={14} className="text-[var(--accent-red)]" />
                            }
                          </div>
                          <div className="flex-1">
                            <p className="text-[11px] font-bold text-white">{FLOW_LABELS[f.flow] || f.flow}</p>
                            <div className="flex gap-3 text-[9px] text-text-muted font-mono">
                              <span>{f.completions} completos</span>
                              <span>{f.abandons} abandonados</span>
                            </div>
                          </div>
                          <span className={cn(
                            "text-[14px] font-black",
                            f.abandonRate === 0 ? "text-[var(--accent-green)]" :
                            f.abandonRate < 20 ? "text-amber-400" : "text-[var(--accent-red)]"
                          )}>
                            {f.abandonRate}%
                          </span>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ FIELD TAB — Certificação ═══ */}
          {tab === 'field' && (
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-[14px] bg-white/[0.03] border border-white/[0.07]">
                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Checklist de Certificação</p>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Critérios para classificar o Aferix como READY TO CHARGE.
                </p>
              </div>

              {/* Certification Checklist */}
              <div className="flex flex-col gap-2">
                {[
                  {
                    q: 'O operador usa diariamente?',
                    pass: (stats?.streak || 0) >= 3,
                    detail: `Sequência atual: ${stats?.streak || 0} dias`,
                    metric: 'Sequência ≥ 3 dias'
                  },
                  {
                    q: 'A velocidade de proposta está OK?',
                    pass: stats?.flowStats?.find((f: any) => f.flow === 'new_proposal')?.avgDurationMs > 0
                      && stats?.flowStats?.find((f: any) => f.flow === 'new_proposal')?.avgDurationMs <= 10000,
                    detail: (() => {
                      const f = stats?.flowStats?.find((f: any) => f.flow === 'new_proposal');
                      return f?.avgDurationMs > 0 ? `Média: ${(f.avgDurationMs/1000).toFixed(1)}s` : 'Sem dados';
                    })(),
                    metric: 'Proposta ≤ 10s'
                  },
                  {
                    q: 'Taxa de abandono controlada?',
                    pass: stats?.flowStats?.every((f: any) =>
                      f.completions + f.abandons === 0 || f.abandonRate < 30
                    ),
                    detail: 'Todos os fluxos < 30% abandono',
                    metric: 'Abandono < 30%'
                  },
                  {
                    q: 'Há múltiplas sessões por dia?',
                    pass: (stats?.dailyActivity?.length > 0) &&
                      stats.dailyActivity.some((d: any) => d.sessions >= 2),
                    detail: 'Pelo menos 1 dia com 2+ sessões',
                    metric: 'Uso intensivo'
                  },
                  {
                    q: 'Todas as telas principais foram acessadas?',
                    pass: stats?.screenDwell?.length >= 3,
                    detail: `${stats?.screenDwell?.length || 0} telas distintas`,
                    metric: '≥ 3 telas diferentes'
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-4 rounded-[14px] border flex items-start gap-3 transition-all",
                      item.pass
                        ? "bg-[var(--accent-green)]/8 border-[var(--accent-green)]/25"
                        : "bg-white/[0.03] border-white/[0.07]"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                      item.pass ? "bg-[var(--accent-green)]/20" : "bg-white/[0.05]"
                    )}>
                      {item.pass
                        ? <CheckCircle2 size={12} className="text-[var(--accent-green)]" />
                        : <div className="w-2 h-2 rounded-full bg-white/20" />
                      }
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        "text-[11px] font-bold leading-snug",
                        item.pass ? "text-white" : "text-white/60"
                      )}>{item.q}</p>
                      <p className="text-[9px] text-text-muted font-mono mt-0.5">{item.detail}</p>
                    </div>
                    <span className={cn(
                      "text-[8px] font-mono tracking-wider shrink-0",
                      item.pass ? "text-[var(--accent-green)]" : "text-text-muted"
                    )}>
                      {item.metric}
                    </span>
                  </div>
                ))}
              </div>

              {/* Overall verdict */}
              {(() => {
                const checks = [
                  (stats?.streak || 0) >= 3,
                  stats?.flowStats?.find((f: any) => f.flow === 'new_proposal')?.avgDurationMs <= 10000,
                  stats?.flowStats?.every((f: any) => f.completions + f.abandons === 0 || f.abandonRate < 30),
                  stats?.dailyActivity?.some((d: any) => d.sessions >= 2),
                  (stats?.screenDwell?.length || 0) >= 3,
                ];
                const passed = checks.filter(Boolean).length;
                const isReady = passed >= 4;
                return (
                  <div className={cn(
                    "p-4 rounded-[16px] border flex items-center gap-4",
                    isReady
                      ? "bg-[var(--accent-green)]/12 border-[var(--accent-green)]/30"
                      : "bg-[var(--accent-gold)]/8 border-[var(--accent-gold)]/20"
                  )}>
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                      isReady ? "bg-[var(--accent-green)]/20" : "bg-[var(--accent-gold)]/15"
                    )}>
                      {isReady
                        ? <CheckCircle2 size={24} className="text-[var(--accent-green)]" />
                        : <Clock size={24} className="text-[var(--accent-gold)]" />
                      }
                    </div>
                    <div>
                      <p className={cn(
                        "text-[13px] font-black uppercase tracking-wider",
                        isReady ? "text-[var(--accent-green)]" : "text-[var(--accent-gold)]"
                      )}>
                        {isReady ? '✓ READY TO CHARGE' : 'EM VALIDAÇÃO'}
                      </p>
                      <p className="text-[10px] text-text-secondary font-mono">{passed}/5 critérios aprovados</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
}
