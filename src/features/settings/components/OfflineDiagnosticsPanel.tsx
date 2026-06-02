import { useState, useEffect, memo } from 'react';
import { cn } from '../../../utils/ui';
import { 
  Activity, 
  Database, 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCw, 
  Wrench, 
  AlertTriangle,
  Info,
  ChevronRight,
  Terminal,
  Zap,
  BarChart3
} from "lucide-react";
import { InternalDiagnosticsService, OperationalHealthReport } from '../../../services/InternalDiagnosticsService';
import { databaseRecoveryService } from '../../../services/DatabaseRecoveryService';
import { cloudSyncService } from '../../../services/CloudSyncService';
import { 
  ERPLoader,
  ContextBanner,
  PrimaryButton,
  SecondaryButton
} from '../../../app/components/ui';

import { 
  SurfaceCard,
  SectionLabel,
  ExecutiveSummaryGrid,
  ValueBlock,
  InteractiveRow,
  SemanticBadge
} from '../../../ui/system';

const diagnosticsService = new InternalDiagnosticsService();

// ── tokens ────────────────────────────────────────────────────────────────
const C = {
  bg: "var(--bg-primary)",
  surface: "var(--surface)",
  surfaceElevated: "var(--surface-elevated)",
  surfaceBorder: "rgba(255,255,255,0.07)",
  gold: "var(--accent-gold)",
  red: "var(--accent-red)",
  green: "var(--accent-green)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textTertiary: "var(--text-tertiary)",
};

/**
 * OfflineDiagnosticsPanel: The Resilience Cockpit.
 * Refactored for absolute Home DNA parity (Phase 4F).
 */
export const OfflineDiagnosticsPanel = memo(function OfflineDiagnosticsPanel() {
  const [report, setReport] = useState<OperationalHealthReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecovering, setIsRecovering] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const runAudit = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const fullReport = await diagnosticsService.runFullIntegrityAudit();
      setReport(fullReport);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleRecovery = async () => {
    setIsRecovering(true);
    setFeedback(null);
    try {
      // Step 1: Reindex and reopen
      await databaseRecoveryService.attemptSoftRecovery();
      
      // Step 2: Deep Healing (Fase 4F)
      const { repaired, purged } = await databaseRecoveryService.healOperationalAnomalies();
      
      setFeedback(`RECONSTRUÇÃO_OK: ${repaired} corrigidos, ${purged} purgados.`);
      await runAudit();
    } catch (e) {
      setFeedback('FALHA_NA_RECUPERAÇÃO: Erro técnico grave.');
    } finally { setIsRecovering(false); }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setFeedback(null);
    try {
      const res = await cloudSyncService.syncLocalToCloud();
      setFeedback(`SYNC_COMPLETE: ${res.sent} replicados.`);
      await runAudit();
    } catch (e) { setFeedback('SYNC_FAIL: Erro na replicação cloud.'); } finally { setIsSyncing(false); }
  };

  useEffect(() => { void runAudit(); }, []);

  if (isLoading && !report) {
    return <div className="py-20 flex flex-col items-center justify-center gap-6"><ERPLoader message="Auditando integridade..." /></div>;
  }

  const score = report?.healthScore || 0;
  const isHealthy = score >= 90;
  const warnings = report?.warnings || [];
  const criticalIssues = report?.criticalIssues || [];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 pb-20">
      
      {/* 1. HEALTH SCORE HERO (Absolute Home DNA) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
        <SectionLabel style={{ marginLeft: "8px" }}>Status da Integridade</SectionLabel>
        <SurfaceCard variant="cinematic" padding="lg">
           <div className="flex items-center justify-between mb-8">
              <SectionLabel className={isHealthy ? "!text-[var(--accent-green)]" : "!text-[var(--accent-red)]"}>BI_DATA_PULSE</SectionLabel>
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] px-2.5 py-1 rounded-lg">
                 <Activity size={11} className={isHealthy ? "text-[var(--accent-green)]" : "text-[var(--accent-red)] animate-pulse"} />
                 <span className="num text-[11px] font-bold text-white">{score}% RATING</span>
              </div>
           </div>
           
           <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.1, letterSpacing: "-0.025em" }}>
              {isHealthy ? 'Banco de dados saudável e consolidado.' : 'Ações de integridade requeridas.'}
           </h2>
           <p style={{ fontSize: "14px", fontWeight: 600, color: isHealthy ? "var(--accent-gold)" : "var(--text-secondary)", marginTop: "12px" }}>
              {isHealthy ? 'Seus dados estão protegidos e auditados.' : 'Detectamos desvios na trilha operacional.'}
           </p>

           <div style={{ backgroundColor: "rgba(255,255,255,0.025)", border: `1px solid ${C.surfaceBorder}`, borderRadius: "14px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
              <div className="flex justify-between items-center">
                 <SectionLabel className="!text-[8.5px]">Registros Eventos</SectionLabel>
                 <span className="num text-sm font-bold text-white">{report?.eventStoreCount}</span>
              </div>
              <div className="flex justify-between items-center">
                 <SectionLabel className="!text-[8.5px]">Pendentes de Sync</SectionLabel>
                 <span className={cn("num text-sm font-bold", report?.pendingSyncCount ? "text-[var(--accent-gold)]" : "text-white")}>{report?.pendingSyncCount}</span>
              </div>
           </div>
        </SurfaceCard>
      </div>

      {feedback && (
        <div className="bg-[var(--accent-gold)]/10 border-[var(--accent-gold)]/20 rounded-xl p-4 text-center">
           <span className="text-[10px] font-bold text-[var(--accent-gold)] font-mono tracking-widest uppercase">{feedback}</span>
        </div>
      )}

      {/* 2. ANOMALY STREAM (Frictions Pattern) */}
      {(criticalIssues.length > 0 || warnings.length > 0) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
           <SurfaceCard padding="none" className="overflow-hidden">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px" }}>
                 <SectionLabel>Anomalias e Detecções</SectionLabel>
                 <Terminal size={12} style={{ color: "var(--text-tertiary)" }} />
              </div>

              {criticalIssues.map((issue, idx) => (
                <div 
                  key={`crit-${idx}`}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "16px 20px",
                    borderTop: `1px solid ${C.surfaceBorder}`, backgroundColor: "rgba(192,57,43,0.05)"
                  }}
                >
                   <ShieldAlert size={16} className="shrink-0 text-[var(--accent-red)]" />
                   <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#EFEFEF", margin: 0 }}>{issue.split(':')[0]}</p>
                      <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0 0", fontFamily: "'DM Mono', monospace" }}>{issue.split(':')[1] || 'CRITICAL_DRIFT'}</p>
                   </div>
                   <SemanticBadge label="BLOQUEADO" variant="danger" className="scale-75 origin-right" />
                </div>
              ))}

              {warnings.map((issue, idx) => (
                <div 
                  key={`warn-${idx}`}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "16px 20px",
                    borderTop: `1px solid ${C.surfaceBorder}`
                  }}
                >
                   <AlertTriangle size={16} className="shrink-0 opacity-40 text-[var(--accent-gold)]" />
                   <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#808080", margin: 0 }}>{issue}</p>
                   </div>
                   <SemanticBadge label="REVISÃO" variant="default" className="scale-75 origin-right" />
                </div>
              ))}
              <div style={{ height: "4px" }} />
           </SurfaceCard>
        </div>
      )}

      {/* 3. RESILIENCE ACTIONS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
        <SectionLabel style={{ marginLeft: "8px" }}>Ações de Resiliência</SectionLabel>
        <SurfaceCard padding="lg">
           <div className="flex items-center gap-4 mb-8">
              <div className="h-10 w-10 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
                 <Wrench size={18} className="text-[var(--accent-gold)]" />
              </div>
              <div className="flex flex-col">
                 <strong className="text-[15px] font-bold text-[var(--text-primary)] uppercase tracking-tight">Diagnóstico e Autocura</strong>
                 <span className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed">Índices locais, event store e drifts financeiros.</span>
              </div>
           </div>

           <div className="flex gap-3 items-center">
              <SecondaryButton 
                onClick={handleRecovery}
                disabled={isRecovering}
                className="flex-1 h-14 !rounded-2xl !text-[10px] !tracking-[0.2em] font-mono flex items-center justify-center"
              >
                 {isRecovering ? 'PROCESSANDO...' : 'REINDEXAR_DEXIE'}
              </SecondaryButton>
              <PrimaryButton 
                onClick={handleSync}
                disabled={isSyncing}
                className="flex-1 h-14 !rounded-2xl !text-[10px] !tracking-[0.2em] font-mono flex items-center justify-center"
              >
                 {isSyncing ? 'SINCRONIZANDO...' : 'SINCRONIZAR_CLOUD'}
              </PrimaryButton>
           </div>
        </SurfaceCard>
      </div>

      <ContextBanner title="Resiliência Ativa" meta="O Aferix reconstrói o estado operacional a partir da trilha de eventos imutável em caso de corrupção." icon={<RefreshCw size={14} />} />

    </div>
  );
});
