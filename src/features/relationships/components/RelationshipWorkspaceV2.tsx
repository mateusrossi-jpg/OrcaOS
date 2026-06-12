import React, { useEffect, useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  ChevronRight, 
  Star, 
  History, 
  MessageCircle, 
  Phone, 
  MapPin,
  FileText,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  UserPlus,
  Zap
} from 'lucide-react';
import { 
  SurfaceCard, 
  SectionLabel, 
  Stack, 
  Body, 
  Subtitle,
  OpsChip,
  ERPLoader,
  FinancialValue,
  SemanticBadge
} from '../../../ui/system';
import { db } from '../../../storage/dexieDatabase';
import { Client } from '../../../domain/client';
import { MaintenancePlan } from '../../../domain/maintenancePlan';
import { cn } from '../../../utils/ui';
import { formatCurrencyBRL } from '../../../utils/formatters';

interface RelationshipWorkspaceV2Props {
  onNavigate: (tab: any) => void;
}

/**
 * RelationshipWorkspaceV2: Customer Memory Hub (RC14).
 * Refactored to align with the official Home screen DNA.
 */
export const RelationshipWorkspaceV2: React.FC<RelationshipWorkspaceV2Props> = ({ onNavigate }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [allClients, allPlans] = await Promise.all([
        db.clients.toArray(),
        db.maintenancePlans.toArray()
      ]);
      setClients(allClients as Client[]);
      setPlans(allPlans as MaintenancePlan[]);
      setIsLoading(false);
    }
    load();
  }, []);

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      (c.phone || '').includes(search)
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [clients, search]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-primary">
        <ERPLoader message="Recuperando memória de clientes..." />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background-primary overflow-hidden relative">
      <main className="flex-1 overflow-y-auto scrollbar-none overscroll-none pb-32">
        <div className="px-5 pt-4 flex flex-col relative z-10 max-w-md mx-auto w-full gap-8">
          
          {/* BUSCA CONTEXTUAL (Estilo Home) */}
          <div className="bg-surface-secondary border border-white/[0.04] h-12 rounded-[14px] px-4 text-text-secondary w-full focus-within:border-accent-primary/20 transition-all flex items-center gap-3 shadow-inner">
            <Search size={18} className="text-white/20 shrink-0" />
            <input 
              type="text" 
              placeholder="Localizar cliente ou telefone..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full bg-transparent text-[15px] outline-none border-none p-0 m-0 focus:ring-0 shadow-none placeholder:text-white/10 text-white" 
            />
          </div>
          
          {/* QUICK ACTIONS ROW */}
          <div className="flex gap-3">
            <button 
              onClick={() => onNavigate('clients')} 
              className="flex-1 h-12 bg-white hover:bg-white/95 text-black font-black text-[12px] uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 active:scale-[0.975] transition-all shadow-[0_10px_25px_rgba(255,255,255,0.08)] cursor-pointer"
            >
               <UserPlus size={16} /> Novo Cliente
            </button>
            <button 
              onClick={() => {}} 
              className="flex-1 h-12 bg-surface-primary hover:bg-surface-secondary border border-border-primary rounded-xl flex items-center justify-center gap-2 text-[12px] font-bold text-text-secondary hover:text-white uppercase tracking-wider active:scale-[0.975] transition-all cursor-pointer"
            >
               <Star size={16} className="text-accent-primary" /> Ver VIPs
            </button>
          </div>

          {/* GESTÃO DE RECORRÊNCIA (PMOC) */}
          {plans.length > 0 && (
            <div className="flex flex-col gap-2.5">
               <div className="flex items-center justify-between px-1">
                  <SectionLabel className="!mb-0 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Contratos de PMOC</SectionLabel>
                  <span className="text-[9px] font-extrabold text-info uppercase tracking-[0.2em] bg-info/10 px-2.5 py-1 rounded-md border border-info/25 shadow-sm">
                     {plans.length} ATIVOS
                  </span>
               </div>

               <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
                  {plans.slice(0, 5).map(plan => (
                    <div 
                      key={plan.id} 
                      className="min-w-[240px] snap-start bg-surface-primary border border-info/15 p-5 rounded-[24px] flex flex-col gap-4 active:scale-[0.975] hover:-translate-y-0.5 transition-all duration-200 shadow-md cursor-pointer"
                      onClick={() => onNavigate({ tab: 'relationships', clientId: plan.clientId })}
                    >
                       <div className="flex justify-between items-start">
                          <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center text-info">
                             <Zap size={16} fill="currentColor" />
                          </div>
                          <SemanticBadge label={plan.frequency.toUpperCase()} variant="info" className="scale-75 origin-right" />
                       </div>
                       <div className="flex flex-col gap-1">
                          <span className="text-[13.5px] font-bold text-white uppercase truncate leading-tight">{plan.title}</span>
                          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Próxima: {new Date(plan.nextExecutionDate).toLocaleDateString('pt-BR')}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* LISTA DE CLIENTES */}
          <div className="flex flex-col gap-2.5">
             <SectionLabel className="!mb-0 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 px-1">Base de Ativos & Pessoas</SectionLabel>
             
             <div className="flex flex-col gap-3">
                {filteredClients.map(client => (
                  <ClientDossierCard 
                    key={client.id} 
                    client={client} 
                    onClick={() => onNavigate({ tab: 'relationships', clientId: client.id })}
                  />
                ))}

                {filteredClients.length === 0 && (
                  <div className="py-20 text-center opacity-20 border border-dashed border-white/10 rounded-[24px]">
                     <Body className="text-[11px] font-black uppercase tracking-[0.25em]">Nenhum cliente localizado</Body>
                  </div>
                )}
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

const ClientDossierCard = ({ client, onClick }: { client: Client, onClick: () => void }) => {
  return (
    <button 
      onClick={onClick}
      className="w-full text-left bg-surface-primary border border-border-primary p-5 rounded-[24px] flex flex-col gap-4 hover:-translate-y-0.5 active:scale-[0.975] transition-all duration-200 shadow-lg relative overflow-hidden"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-surface-secondary border border-border-primary flex items-center justify-center text-accent-primary font-black text-md shrink-0">
            {client.name.substring(0, 1).toUpperCase()}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[15px] font-bold text-white uppercase tracking-tight truncate max-w-[190px]">
              {client.name}
            </span>
            <span className="text-[11px] text-text-muted uppercase tracking-widest font-semibold">
              Cliente Cadastrado
            </span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-surface-secondary border border-border-secondary flex items-center justify-center text-text-muted active:bg-white/10 transition-colors">
          <ChevronRight size={14} />
        </div>
      </div>

      <div className="flex items-center gap-5 pt-3.5 border-t border-border-secondary">
        <div className="flex items-center gap-2">
          <MessageCircle size={13} className="text-accent-primary" />
          <span className="text-[12px] font-mono text-text-secondary">{client.phone || '--'}</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <History size={13} className="text-text-muted" />
          <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em]">Dossiê Completo</span>
        </div>
      </div>
    </button>
  );
};
