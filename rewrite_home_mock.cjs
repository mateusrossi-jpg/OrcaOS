const fs = require('fs');

const path = 'src/app/screens/HomeScreen.tsx';

const newRender = `import { memo, useState, useEffect } from "react";
import { 
  ScreenContainer, 
  SectionLabel, 
  ERPLoader 
} from '../../ui/system';
import {
  MapPin, 
  Play, 
  Search, 
  Users, 
  Plus, 
  Settings, 
  DollarSign, 
  FileText, 
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { formatCurrencyBRL } from "../../utils/formatters";
// Using mocked data instead of fetching to validate UX scenario

export const HomeScreen = memo(function HomeScreen({ account, onNavigate }: { onNavigate: (tab: any) => void; account: any }) {
  const [stats] = useState({ toCollect: 8450, followUps: 4, todayMissions: 1, predictedRevenue: 12400 });
  const [topOpportunity] = useState({
    id: 'opp-1',
    clientName: 'Condomínio Jardim Europa',
    title: 'Modernização da iluminação externa',
    expectedRevenue: 12400,
    recommendedAction: 'VER PROPOSTA',
    status: 'Aguardando aprovação há 3 dias',
    probability: 85
  });
  const [nextActionOS] = useState({
    id: 'os-1',
    title: 'Troca de padrão de entrada 127/220V',
    scheduledDate: '2026-06-08T14:00:00',
    address: 'Rua das Palmeiras, 125 - Campinas - SP',
    expectedValue: 1850,
    status: 'scheduled'
  });
  const [nextActionClient] = useState({
    name: 'João Carlos Pereira',
    fullAddress: 'Rua das Palmeiras, 125 - Campinas - SP'
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <ScreenContainer className="bg-[#050505] flex items-center justify-center min-h-screen">
        <ERPLoader message="Carregando Centro de Decisões..." />
      </ScreenContainer>
    );
  }

  const isExecuting = nextActionOS?.status === 'in-progress' || nextActionOS?.status === 'en_route';

  // 2. EXECUTION BLOCK (HERO)
  const renderExecution = () => (
    <div className="flex flex-col gap-1.5">
      <SectionLabel className="!mb-0 text-[#0A84FF] opacity-100 uppercase tracking-[0.2em] text-[10px] font-black">
        {isExecuting ? "Em Execução" : "Próxima Missão"}
      </SectionLabel>
      <div className="bg-[#0A84FF]/10 border border-[#0A84FF]/20 rounded-[16px] p-3.5 flex flex-col gap-2.5 relative overflow-hidden group">
         <div className="flex justify-between items-start gap-2">
            <div className="flex flex-col min-w-0">
               <h3 className="text-sm font-black text-white tracking-tight leading-snug truncate">
                  {nextActionOS.title}
               </h3>
               <span className="text-[10px] text-white/60 uppercase tracking-wider font-bold truncate mt-0.5">
                  {nextActionClient?.name || "Cliente Avulso"}
               </span>
            </div>
            <div className="flex flex-col items-end shrink-0">
               <span className="text-[10px] font-mono font-black text-white bg-[#0A84FF]/20 px-1.5 py-0.5 rounded border border-[#0A84FF]/30 leading-none">
                  {nextActionOS.scheduledDate?.slice(11, 16) || "AGORA"}
               </span>
            </div>
         </div>
         <div className="flex items-center gap-1.5 text-white/80 text-[10px] bg-black/20 border border-white/[0.04] rounded-md p-1.5 shrink-0">
            <MapPin size={10} className="shrink-0 text-[#0A84FF]" />
            <span className="truncate">{nextActionOS.address}</span>
         </div>
         <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#30D158] mt-0.5">
           Valor previsto: {formatCurrencyBRL(nextActionOS.expectedValue)}
         </div>
         <div className="flex items-center gap-2 mt-0.5">
            <button 
              onClick={() => onNavigate({ tab: 'operations', workOrderId: nextActionOS.id })}
              className="flex-1 h-9 bg-white/[0.05] hover:bg-white/[0.1] text-white font-black text-[9px] uppercase tracking-widest rounded-lg flex items-center justify-center transition-all active:scale-95"
            >
               VER DETALHES
            </button>
            <button 
              onClick={() => onNavigate({ tab: 'operations', workOrderId: nextActionOS.id })}
              className="flex-[1.5] h-9 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white font-black text-[9px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
               <Play size={10} className="fill-current shrink-0" /> INICIAR ROTA
            </button>
         </div>
      </div>
    </div>
  );

  // 3. OPPORTUNITY BLOCK
  const renderOpportunity = () => (
    <div className="flex flex-col gap-1.5">
      <SectionLabel className="!mb-0 text-[var(--accent-gold)] opacity-100 uppercase tracking-[0.2em] text-[10px] font-black">Próxima Oportunidade</SectionLabel>
      <div 
        onClick={() => onNavigate({ tab: 'revenue', budgetId: topOpportunity.id })}
        className="bg-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/10 rounded-[16px] p-3.5 relative overflow-hidden group flex flex-col gap-2.5 cursor-pointer active:scale-[0.98] transition-all"
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-black text-white tracking-tight leading-snug truncate">
              {topOpportunity.clientName}
            </h3>
            <span className="text-[10px] text-white/60 font-medium truncate mt-0.5">
              {topOpportunity.title}
            </span>
          </div>
          <span className="text-lg font-mono font-black text-[#30D158] leading-none shrink-0 mt-0.5">
            {formatCurrencyBRL(topOpportunity.expectedRevenue)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex flex-col">
             <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">
               {topOpportunity.status}
             </span>
             <span className="text-[9px] font-bold text-[var(--accent-gold)] uppercase tracking-wider mt-0.5">
               Probabilidade: {topOpportunity.probability}%
             </span>
          </div>
          <span className="text-[9px] font-black bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] px-2 py-1 rounded border border-[var(--accent-gold)]/20 uppercase tracking-wider">
            {topOpportunity.recommendedAction}
          </span>
        </div>
      </div>
    </div>
  );

  // 4. MONEY BLOCK
  const renderMoney = () => (
    <div className="flex flex-col gap-1.5">
      <SectionLabel className="!mb-0 text-[#30D158] opacity-100 uppercase tracking-[0.2em] text-[10px] font-black">
        Financeiro
      </SectionLabel>
      <div 
        onClick={() => onNavigate('revenue')}
        className="bg-[#248A3D]/5 border border-[#248A3D]/10 p-3.5 rounded-[16px] flex flex-col gap-2.5 group active:scale-[0.98] transition-all cursor-pointer"
      >
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-[#248A3D] uppercase tracking-[0.2em]">A RECEBER</span>
            <span className="text-xl font-mono font-black text-[#30D158] leading-none mt-0.5">
              {formatCurrencyBRL(stats.toCollect)}
            </span>
          </div>
          <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider text-right">
            {stats.followUps} cobranças<br/>pendentes
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-white/[0.04] pt-2.5 mt-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
            <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider">
              Próximo: Amanhã
            </span>
          </div>
          <span className="text-[10px] font-mono font-black text-[#30D158]">
            R$ 1.200,00
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className="pb-2 bg-[#07080A] pt-0 px-0 relative overflow-x-hidden flex flex-col w-full animate-fade-in"
      style={{ minHeight: 'auto' }}
    >
      <div className="px-5 pt-4 pb-[80px] flex flex-col gap-4 relative z-10 max-w-md mx-auto w-full">
        
        {/* 1. HEADER (Professional Tool - Humanized) */}
        <div className="flex flex-col mt-0.5 mb-1">
          <h1 className="text-[22px] font-black text-white tracking-tight leading-none">
            Bom dia, <span className="text-white/80">Mateus</span>
          </h1>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30D158] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#30D158]"></span>
            </span>
            <span className="text-[10px] font-black text-[#30D158] uppercase tracking-widest">
              Sincronizado • Online
            </span>
          </div>
        </div>

        {/* DYNAMIC BLOCKS */}
        <div className="flex flex-col gap-4">
          {renderExecution()}
          {renderOpportunity()}
          {renderMoney()}
        </div>

        {/* 5. TOOLBOX (Operational Grid with Densified Info) */}
        <div className="flex flex-col gap-1.5">
           <SectionLabel className="!mb-0 text-white/30 opacity-100 uppercase tracking-[0.2em] text-[10px] font-black">Ferramentas</SectionLabel>
           <div className="grid grid-cols-2 gap-2">
             <GridTool 
               icon={<FileText size={14} className="text-[var(--accent-gold)]" />} 
               title="ORÇAMENTOS" 
               sub="12 ativos"
               onClick={() => onNavigate('new-budget')} 
             />
             <GridTool 
               icon={<Users size={14} className="text-[#0A84FF]" />} 
               title="CLIENTES" 
               sub="84 cadastrados"
               onClick={() => onNavigate('relationships')} 
             />
             <GridTool 
               icon={<DollarSign size={14} className="text-[#30D158]" />} 
               title="FINANCEIRO" 
               sub="4 pendências"
               onClick={() => onNavigate('revenue')} 
             />
             <GridTool 
               icon={<Settings size={14} className="text-[#AF52DE]" />} 
               title="PLANOS" 
               sub="16 recorrentes"
               onClick={() => onNavigate('relationships')} 
             />
           </div>
        </div>

        {/* 6. SEARCH */}
        <div className="mt-2 pt-4 border-t border-white/[0.04]">
          <div className="w-full relative flex items-center group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--accent-gold)] transition-colors pointer-events-none">
              <Search size={16} />
            </div>
            <input 
              type="text"
              placeholder="Pesquisar cliente, OS, proposta ou endereço"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pr-10 bg-white/[0.02] border border-white/[0.06] rounded-[12px] text-white text-[12px] placeholder:text-white/20 outline-none focus:border-white/20 focus:bg-white/[0.04] transition-all"
              style={{ paddingLeft: "2.25rem" }}
            />
          </div>
        </div>

      </div>
    </div>
  );
});

function GridTool({ icon, title, sub, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] active:scale-[0.97] transition-all rounded-[12px] p-2.5 flex flex-col gap-1.5 cursor-pointer"
    >
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-md bg-white/[0.03] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <span className="text-[10px] font-black text-white uppercase tracking-wider truncate">{title}</span>
      </div>
      <span className="text-[9px] font-medium text-white/40 truncate ml-0.5">{sub}</span>
    </div>
  );
}
`

fs.writeFileSync(path, newRender, 'utf8');
console.log('File successfully updated.');