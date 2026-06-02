import React from 'react';
import { Activity, Plus, FileText, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../storage/dexieDatabase';
import { 
  ScreenContainer, 
  AppHeader, 
  Section, 
  SectionLabel, 
  SurfaceCard, 
  OpsChip,
  ERPLoader,
  Body,
  Subtitle
} from "../../../ui/system";

/**
 * DiagnosticsWorkspace: Technical Intelligence & Evidence Hub.
 * Connected to Real Data Engine.
 */
export const DiagnosticsWorkspace: React.FC = () => {
  const data = useLiveQuery(async () => {
    const [anomalies, assets, wos] = await Promise.all([
      db.anomalies.toArray(),
      db.assets.toArray(),
      db.workOrders.where('status').equals('completed').limit(10).reverse().sortBy('updatedAt')
    ]);

    const openAnomalies = anomalies.filter(a => a.status === 'OPEN');

    return {
      openAnomalies,
      totalAssets: assets.length,
      recentCompletions: wos
    };
  });

  if (!data) return <div className="flex items-center justify-center h-screen bg-[#050505]"><ERPLoader message="Recuperando laudos reais..." /></div>;

  return (
    <ScreenContainer className="pb-32 bg-[var(--bg-primary)]">
      <AppHeader title="Laudos & Evidências" subtitle={`${data.totalAssets} Ativos Mapeados`} />

      <div className="px-6 py-6 flex flex-col gap-8">
        
        {/* AÇÃO PRINCIPAL */}
        <Section className="gap-2">
          <button className="w-full bg-gradient-to-r from-surface-800 to-surface-900 border border-[var(--accent-gold)]/30 text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform hover:bg-surface-800">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center">
              <Plus size={24} className="text-[var(--accent-gold)]" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-black tracking-widest uppercase">Novo Laudo Técnico</span>
              <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-1">Registrar Anomalia ou Serviço</span>
            </div>
          </button>
        </Section>

        {/* ANOMALIAS ATIVAS */}
        <Section className="gap-4">
          <div className="flex justify-between items-end px-1">
             <SectionLabel className="!text-[var(--accent-gold)]">Anomalias em Aberto</SectionLabel>
             <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">{data.openAnomalies.length} DETECTADAS</span>
          </div>

          {data.openAnomalies.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.openAnomalies.map(a => (
                <SurfaceCard key={a.id} padding="lg" className="border-l-4 border-l-[var(--accent-gold)]">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-black text-white uppercase tracking-widest leading-tight">{a.title}</span>
                      <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest font-bold">Gravidade: {a.severity}</span>
                    </div>
                    <OpsChip label="EM ABERTO" tone="orange" />
                  </div>
                  <div className="text-xs text-white/40 mb-3 line-clamp-2 italic">
                    "{a.description}"
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-surface-800 border border-white/5 text-white flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest py-3 rounded active:scale-95">
                      <FileText size={12} /> Editar
                    </button>
                  </div>
                </SurfaceCard>
              ))}
            </div>
          ) : (
            <SurfaceCard padding="xl" className="border-dashed border-white/5 opacity-20 text-center">
               <CheckCircle2 size={32} className="mx-auto mb-4" />
               <Body className="text-[11px] font-bold uppercase tracking-widest">Nenhuma anomalia pendente</Body>
            </SurfaceCard>
          )}
        </Section>

        {/* ÚLTIMOS TRABALHOS FINALIZADOS */}
        <Section className="gap-4">
          <SectionLabel>Histórico de Execuções</SectionLabel>
          
          <div className="flex flex-col gap-3">
            {data.recentCompletions.length > 0 ? (
              data.recentCompletions.map(os => (
                <SurfaceCard key={os.id} padding="lg" className="border border-white/5 opacity-80">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-black text-white uppercase tracking-widest leading-tight">{os.title}</span>
                      <span className="text-xs text-white/40 font-bold uppercase tracking-widest font-mono">{new Date(os.updatedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <OpsChip label="Concluído" tone="success" />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 bg-surface-800 border border-white/5 text-white flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest py-2 rounded">
                      <FileText size={12} /> Visualizar
                    </button>
                  </div>
                </SurfaceCard>
              ))
            ) : (
              <SurfaceCard padding="lg" className="border-dashed border-white/5 opacity-20 text-center">
                 <Body className="text-[10px] font-bold uppercase tracking-widest">Aguardando primeira execução</Body>
              </SurfaceCard>
            )}
          </div>
        </Section>
      </div>
    </ScreenContainer>
  );
};
