import React from 'react';
import { Activity, Download, FileText, CheckCircle2, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../storage/dexieDatabase';
import { useRole } from '../../../hooks/useRole';
import { formatCurrencyBRL } from '../../../utils/formatters';
import { 
  ScreenContainer, 
  AppHeader, 
  SurfaceCard, 
  ExecutiveSummaryGrid, 
  ValueBlock, 
  Body, 
  Subtitle, 
  SectionLabel,
  Stack,
  Section,
  ERPLoader,
  FinancialValue
} from '../../../ui/system';

/**
 * ClientPortalPage: Authority-driven customer transparency hub.
 * SCROLL-FIRST ENFORCED.
 */
export const ClientPortalPage: React.FC = () => {
  const { user } = useRole();
  
  // DATA QUERIES
  const proposals = useLiveQuery(() => 
    db.clientProposals
      .where('status')
      .anyOf(['sent', 'viewed'])
      .toArray()
  );

  const activeContracts = useLiveQuery(() => 
    db.contracts
      .where('status')
      .equals('active')
      .toArray()
  );

  const recentExecutions = useLiveQuery(() => 
    db.workOrders
      .where('status')
      .equals('done')
      .limit(5)
      .reverse()
      .sortBy('updatedAt')
  );

  if (!proposals || !activeContracts || !recentExecutions) {
    return <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]"><ERPLoader message="Sincronizando seu portal..." /></div>;
  }

  return (
    <ScreenContainer className="pb-32">
      
      {/* CABEÇALHO DO PORTAL DO CLIENTE */}
      <div className="bg-[var(--bg-primary)] border-b border-white/[0.05] p-6 pt-12 text-center">
        <h1 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">Seu Portal Aferix</h1>
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{user?.name || 'Acessando como Convidado'}</p>
        
        <div className="flex justify-center mt-8">
          <SurfaceCard className="bg-[var(--accent-green)]/5 border-[var(--accent-green)]/20 rounded-2xl p-6 flex flex-col items-center min-w-[240px] shadow-[0_0_40px_rgba(34,197,94,0.05)]">
            <Activity size={24} className="text-[var(--accent-green)] mb-3" />
            <SectionLabel className="!text-[var(--accent-green)] tracking-[0.3em]">SAÚDE DOS ATIVOS</SectionLabel>
            <span className="text-4xl font-black text-white mt-1">98%</span>
            <div className="flex items-center gap-1.5 mt-2 bg-[var(--accent-green)]/10 px-3 py-1 rounded-full border border-[var(--accent-green)]/20">
               <ShieldCheck size={12} className="text-[var(--accent-green)]" />
               <span className="text-[10px] text-[var(--accent-green)] font-black uppercase">PROTEGIDO</span>
            </div>
          </SurfaceCard>
        </div>
      </div>

      <div className="px-6 py-10 flex flex-col gap-12">
        
        {/* 1. AÇÃO NECESSÁRIA (PROPOSTAS) */}
        <Section className="gap-4">
          <div className="flex items-center justify-between px-1">
             <SectionLabel className="!text-[var(--accent-blue)]">Aprovações Pendentes</SectionLabel>
             <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">{proposals.length} AGUARDANDO</span>
          </div>

          {proposals.length > 0 ? (
            <div className="flex flex-col gap-4">
              {proposals.map(p => (
                <SurfaceCard key={p.id} padding="lg" className="border-[var(--accent-blue)]/30 bg-gradient-to-br from-[#141924]/80 to-transparent relative overflow-hidden group active:scale-[0.98] transition-all">
                  <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[var(--accent-blue)]" />
                  <div className="flex flex-col mb-4">
                    <span className="text-lg font-black text-white uppercase tracking-tight leading-tight">{p.title}</span>
                    <Subtitle className="mt-1 opacity-60 line-clamp-1">{p.summary}</Subtitle>
                  </div>
                  <div className="flex justify-between items-end">
                    <FinancialValue value={p.total} className="text-2xl font-black text-[var(--accent-blue)]" />
                    <button className="bg-white text-black font-black text-[10px] px-5 py-2.5 rounded-lg uppercase tracking-widest flex items-center gap-2 group-hover:bg-[var(--accent-blue)] group-hover:text-white transition-colors">
                      ANALISAR <ArrowRight size={14} />
                    </button>
                  </div>
                </SurfaceCard>
              ))}
            </div>
          ) : (
            <SurfaceCard padding="xl" className="border-dashed border-white/5 opacity-30 text-center">
               <FileText size={32} className="mx-auto mb-4 opacity-20" />
               <Body className="text-[13px] font-bold uppercase tracking-widest">Nenhum orçamento pendente</Body>
            </SurfaceCard>
          )}
        </Section>

        {/* 2. CONTRATOS ATIVOS */}
        <Section className="gap-4">
          <SectionLabel>Contratos & Garantias</SectionLabel>
          
          {activeContracts.length > 0 ? (
            <div className="flex flex-col gap-3">
              {activeContracts.map(c => (
                <SurfaceCard key={c.id} padding="md" className="flex justify-between items-center bg-white/[0.02] border-white/[0.05]">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                      <ShieldCheck size={14} className="text-[var(--accent-green)]" /> {c.title || 'Contrato de Manutenção'}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-white/20 mt-1 uppercase tracking-widest">Vencimento: {new Date(c.endDate || '').toLocaleDateString('pt-BR')}</span>
                  </div>
                  <button className="w-10 h-10 flex items-center justify-center bg-white/[0.04] border border-white/[0.1] rounded-full text-white active:scale-90 transition-all">
                    <Download size={16} />
                  </button>
                </SurfaceCard>
              ))}
            </div>
          ) : (
            <SurfaceCard padding="lg" className="border-dashed border-white/5 opacity-30 text-center">
               <Body className="text-[11px] uppercase tracking-widest">Sem contratos ativos registrados</Body>
            </SurfaceCard>
          )}
        </Section>

        {/* 3. HISTÓRICO DE EXECUÇÕES */}
        <Section className="gap-4">
          <SectionLabel>Últimas Execuções</SectionLabel>
          
          <div className="flex flex-col gap-4">
            {recentExecutions.length > 0 ? (
              recentExecutions.map(ex => (
                <SurfaceCard key={ex.id} padding="md" className="border-white/[0.04] bg-white/[0.01] opacity-70">
                   <div className="flex justify-between items-start">
                     <div className="flex flex-col">
                        <Body className="text-[13px] font-bold uppercase">{ex.title}</Body>
                        <div className="flex items-center gap-2 mt-1">
                           <Clock size={12} className="text-white/20" />
                           <span className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-widest">Realizado em {new Date(ex.updatedAt || ex.createdAt || new Date().toISOString()).toLocaleDateString('pt-BR')}</span>
                        </div>
                     </div>
                     <CheckCircle2 size={16} className="text-[var(--accent-green)] opacity-40" />
                   </div>
                </SurfaceCard>
              ))
            ) : (
              <SurfaceCard padding="lg" className="border-dashed border-white/5 opacity-30 text-center">
                 <Body className="text-[11px] uppercase tracking-widest font-bold">Nenhuma execução finalizada</Body>
              </SurfaceCard>
            )}
          </div>
        </Section>

        {/* FOOTER BRANDING */}
        <div className="mt-8 flex flex-col items-center gap-4 py-8 border-t border-white/[0.03]">
           <div className="flex items-center gap-2 opacity-20">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Powering Trust by Aferix</span>
           </div>
        </div>

      </div>
    </ScreenContainer>
  );
};
