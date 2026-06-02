import React from 'react';
import { Users, AlertOctagon, Clock, ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../storage/dexieDatabase';
import { 
  ScreenContainer, 
  AppHeader, 
  Section, 
  SectionLabel, 
  SurfaceCard, 
  OpsChip, 
  Body,
  Subtitle,
  FinancialValue,
  ERPLoader
} from "../../../ui/system";

/**
 * ManagerWorkspace: Operational Tower of Control.
 * Connected to Real Data Engine.
 */
export const ManagerWorkspace: React.FC = () => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const stats = useLiveQuery(async () => {
    const [team, wos, anomalies, clients] = await Promise.all([
      db.teamMembers.where('role').equals('FIELD').toArray(),
      db.workOrders.toArray(),
      db.anomalies.toArray(),
      db.clients.toArray()
    ]);

    const activeTechs = team.filter(t => t.status === 'active');
    const delayedOS = wos.filter(wo => wo.status === 'scheduled' && wo.scheduledDate && wo.scheduledDate < todayStr);
    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical' && a.status === 'OPEN');
    const inProgress = wos.filter(wo => wo.status === 'in-progress' || wo.status === 'scheduled');

    return {
      techsCount: activeTechs.length,
      totalTechs: team.length,
      delayedCount: delayedOS.length,
      criticalAnomalies: criticalAnomalies.length,
      activeOS: inProgress,
      recentAnomalies: anomalies.filter(a => a.status === 'OPEN').slice(0, 3)
    };
  });

  if (!stats) return <div className="flex items-center justify-center h-screen bg-[#050505]"><ERPLoader message="Sincronizando torre de controle..." /></div>;

  return (
    <ScreenContainer className="pb-32 bg-[var(--bg-primary)]">
      <AppHeader title="Central de Operações" />

      <div className="px-6 py-8 flex flex-col gap-10">
        
        {/* METRICAS RAPIDAS */}
        <Section className="gap-4">
          <div className="grid grid-cols-2 gap-4">
            <SurfaceCard padding="lg" className="border-[var(--accent-blue)]/30 bg-gradient-to-br from-surface-900 to-surface-800 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Técnicos em Campo</span>
                <span className="text-2xl font-black text-white mt-1">{stats.techsCount}/{stats.totalTechs}</span>
              </div>
              <Users size={24} className="text-[var(--accent-blue)] opacity-50" />
            </SurfaceCard>
            
            <SurfaceCard padding="lg" className="border-status-error/30 bg-gradient-to-br from-surface-900 to-status-error/5 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-status-error uppercase tracking-widest">SLAs em Risco</span>
                <span className="text-2xl font-black text-white mt-1">{stats.delayedCount}</span>
              </div>
              <Clock size={24} className="text-status-error opacity-50" />
            </SurfaceCard>
          </div>
        </Section>

        {/* URGÊNCIAS E ATRASOS (FOGO NA RUA) */}
        <Section className="gap-4">
          <div className="flex justify-between items-end">
            <SectionLabel className="!mb-0 text-status-error flex items-center gap-2">
              <AlertOctagon size={16} /> Fogo na Rua
            </SectionLabel>
            <span className="text-[10px] text-status-error font-bold tracking-widest uppercase">{stats.criticalAnomalies} CRÍTICOS</span>
          </div>
          
          {stats.recentAnomalies.length > 0 ? (
            <div className="flex flex-col gap-4">
              {stats.recentAnomalies.map(a => (
                <SurfaceCard key={a.id} padding="lg" className="flex flex-col gap-3 relative overflow-hidden border-status-error/40">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-error"></div>
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white uppercase tracking-widest">{a.title}</span>
                      <span className="text-xs text-text-secondary mt-1">{a.description}</span>
                    </div>
                    <span className="bg-status-error text-[#050505] font-black text-[10px] px-2 py-1 rounded uppercase tracking-widest">{a.severity}</span>
                  </div>
                </SurfaceCard>
              ))}
            </div>
          ) : (
            <SurfaceCard padding="xl" className="border-dashed border-white/5 opacity-20 text-center">
               <CheckCircle2 size={32} className="mx-auto mb-4" />
               <Body className="text-[11px] font-bold uppercase tracking-widest">Operação Nominal (Sem emergências)</Body>
            </SurfaceCard>
          )}
        </Section>

        {/* DISPATCH BOARD MINI */}
        <Section className="gap-4">
          <SectionLabel>Operação Ativa ({stats.activeOS.length})</SectionLabel>
          
          {stats.activeOS.length > 0 ? (
            <div className="flex flex-col gap-3">
              {stats.activeOS.map(os => (
                <SurfaceCard key={os.id} padding="lg" className="flex justify-between items-center opacity-90 border-white/10">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-white uppercase tracking-widest">{os.title}</span>
                    <span className="text-[10px] text-text-tertiary font-bold tracking-widest uppercase mt-1">Status: {os.status}</span>
                  </div>
                  <OpsChip label={os.status === 'in-progress' ? 'EXECUÇÃO' : 'AGENDADO'} tone={os.status === 'in-progress' ? 'green' : 'blue'} />
                </SurfaceCard>
              ))}
            </div>
          ) : (
            <SurfaceCard padding="lg" className="border-dashed border-white/5 opacity-20 text-center">
               <Body className="text-[10px] font-bold uppercase tracking-widest">Nenhuma OS em andamento</Body>
            </SurfaceCard>
          )}
        </Section>

      </div>
    </ScreenContainer>
  );
};
