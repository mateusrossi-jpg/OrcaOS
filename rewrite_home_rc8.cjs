const fs = require('fs');

const path = 'src/app/screens/HomeScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

const startIdx = content.indexOf('  const isExecuting = nextActionOS?.status === \'in-progress\'');
if (startIdx === -1) {
  console.log('Start index not found');
  process.exit(1);
}

const beforeReturn = content.substring(0, startIdx);

const newRender = `  const isExecuting = nextActionOS?.status === 'in-progress' || nextActionOS?.status === 'en_route';

  // 1. EXECUTION BLOCK (HERO - ALTA PROFUNDIDADE)
  const renderExecution = () => (
    <div className="flex flex-col gap-1.5">
      <SectionLabel className="!mb-0 text-[#0A84FF] opacity-100 uppercase tracking-[0.2em] text-[10px] font-black">
        {isExecuting ? "Em Execução" : "Próxima Missão"}
      </SectionLabel>
      {nextActionOS ? (
         <div className="bg-[#0A84FF]/10 border border-[#0A84FF]/40 rounded-[16px] p-4 flex flex-col gap-3.5 relative overflow-hidden group shadow-[0_8px_30px_rgba(10,132,255,0.15)]">
            <div className="flex justify-between items-start gap-2">
               <div className="flex flex-col min-w-0">
                  <h3 className="text-base font-black text-white tracking-tight leading-snug truncate">
                     {nextActionOS.title}
                  </h3>
                  <span className="text-[11px] text-white/60 uppercase tracking-wider font-bold truncate mt-1">
                     {nextActionClient?.name || "Cliente Avulso"}
                  </span>
               </div>
               <div className="flex flex-col items-end shrink-0">
                  <span className="text-[11px] font-mono font-black text-white bg-[#0A84FF]/20 px-2 py-1 rounded-md border border-[#0A84FF]/30 leading-none">
                     {nextActionOS.scheduledDate?.slice(11, 16) || "AGORA"}
                  </span>
               </div>
            </div>
            
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center gap-2 text-white/80 text-[11px] bg-black/20 border border-white/[0.04] rounded-md p-2 shrink-0">
                 <MapPin size={12} className="shrink-0 text-[#0A84FF]" />
                 <span className="truncate">{nextActionOS.address}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#30D158]">
                Valor previsto: {formatCurrencyBRL(nextActionOS.expectedValue)}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
               <button 
                 onClick={() => onNavigate({ tab: 'operations', workOrderId: nextActionOS.id })}
                 className="flex-1 h-11 bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold text-[10px] uppercase tracking-widest rounded-lg flex items-center justify-center transition-all active:scale-95 border border-white/[0.08]"
               >
                  VER DETALHES
               </button>
               <button 
                 onClick={() => onNavigate({ tab: 'operations', workOrderId: nextActionOS.id })}
                 className="flex-1 h-11 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg flex items-center justify-center transition-all shadow-md active:scale-95"
               >
                  INICIAR ROTA
               </button>
            </div>
         </div>
       ) : (
         <div className="bg-white/[0.02] border border-white/[0.04] rounded-[16px] p-4 flex flex-col items-start gap-4 transition-all">
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-black text-white">Nenhuma missão agendada</span>
              <span className="text-[11px] font-medium text-white/40">Crie uma OS para iniciar um atendimento.</span>
            </div>
            <button
              onClick={() => onNavigate('new-budget')}
              className="px-6 h-10 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white font-black text-[10px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
            >
               <Plus size={14} strokeWidth={3} /> NOVA OS
            </button>
         </div>
       )}
    </div>
  );

  // 2. OPPORTUNITY BLOCK (MEDIA PROFUNDIDADE)
  const renderOpportunity = () => (
    <div className="flex flex-col gap-1.5">
      <SectionLabel className="!mb-0 text-[var(--accent-gold)] opacity-100 uppercase tracking-[0.2em] text-[10px] font-black">Próxima Oportunidade</SectionLabel>
      {topOpportunity ? (
        <div 
          className="bg-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/20 rounded-[16px] p-5 relative overflow-hidden group flex flex-col gap-4 shadow-[0_4px_20px_rgba(212,169,74,0.05)] transition-all"
        >
          <div className="flex flex-col min-w-0 gap-1.5">
            <span className="text-[9px] font-black text-[var(--accent-gold)] uppercase tracking-[0.2em]">ESTRATÉGICO</span>
            <h3 className="text-base font-black text-white tracking-tight leading-snug truncate">
              {topOpportunity.clientName}
            </h3>
            <span className="text-[11px] text-white/60 font-medium truncate">
              {topOpportunity.title}
            </span>
          </div>

          <div className="flex flex-col gap-2.5 bg-black/20 p-3.5 rounded-xl border border-white/[0.04]">
            <div className="flex justify-between items-center">
               <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                 {topOpportunity.status}
               </span>
               <span className="text-[10px] font-mono font-bold bg-white/10 text-white px-2 py-0.5 rounded-md">
                 {topOpportunity.probability}%
               </span>
            </div>
            <span className="text-xl font-mono font-black text-[#30D158] leading-none">
              {formatCurrencyBRL(topOpportunity.expectedRevenue)}
            </span>
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); onNavigate({ tab: 'revenue', budgetId: topOpportunity.id }); }}
            className="w-full h-11 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/90 text-black font-bold text-[10px] uppercase tracking-widest rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-95 mt-1"
          >
            {topOpportunity.recommendedAction || "VER PROPOSTA"}
          </button>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-[16px] p-4 flex flex-col items-start gap-4 transition-all">
           <div className="flex flex-col gap-1">
             <span className="text-[13px] font-black text-white">Nenhuma oportunidade ativa</span>
             <span className="text-[11px] font-medium text-white/40">Crie um orçamento para iniciar uma negociação.</span>
           </div>
           <button
             onClick={() => onNavigate('new-budget')}
             className="px-6 h-10 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/90 text-black font-black text-[10px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
           >
              <Plus size={14} strokeWidth={3} /> NOVO ORÇAMENTO
           </button>
        </div>
      )}
    </div>
  );

  // 3. MONEY BLOCK (LEVE PROFUNDIDADE)
  const renderMoney = () => (
    <div className="flex flex-col gap-1.5">
      <SectionLabel className="!mb-0 text-[#28A745] opacity-100 uppercase tracking-[0.2em] text-[10px] font-black">
        Financeiro
      </SectionLabel>
      <div 
        onClick={() => onNavigate('revenue')}
        className="bg-[#28A745]/[0.02] border border-[#28A745]/[0.08] p-4 rounded-[16px] flex flex-col gap-3 group active:scale-[0.98] transition-all cursor-pointer"
      >
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-[#28A745] uppercase tracking-[0.2em]">A RECEBER</span>
            <span className="text-lg font-mono font-bold text-[#28A745] leading-none">
              {formatCurrencyBRL(stats.toCollect)}
            </span>
          </div>
          <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider text-right">
            {stats.followUps} cobranças<br/>pendentes
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-white/[0.03] pt-3 mt-0.5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#28A745]" />
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
              Próximo: Amanhã
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-[#28A745]">
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
      <div className="px-5 pt-4 pb-[80px] flex flex-col relative z-10 max-w-md mx-auto w-full">
        
        {/* HEADER */}
        <div className="flex flex-col mt-0.5 mb-8">
          <h1 className="text-[22px] font-black text-white tracking-tight leading-none">
            Bom dia, <span className="text-white/80">{account?.name?.split(' ')[0] || "Mateus"}</span>
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
          
          {/* 3. RESUMO OPERACIONAL EM CHIPS */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-md text-[10px] font-medium text-white/70">
              {stats.todayMissions} {stats.todayMissions === 1 ? 'missão' : 'missões'}
            </span>
            <span className="bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-md text-[10px] font-medium text-white/70">
              {topOpportunity ? 1 : 0} {topOpportunity ? 'oportunidade' : 'oportunidades'}
            </span>
            <span className="bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-md text-[10px] font-bold text-[#30D158]/90">
              {formatCurrencyBRL(stats.toCollect)} a receber
            </span>
          </div>
        </div>

        {/* 5. HIERARQUIA VERTICAL (RITMO VISUAL) */}
        <div className="flex flex-col">
          <div style={{ marginBottom: "32px" }}>{renderExecution()}</div>
          <div style={{ marginBottom: "24px" }}>{renderOpportunity()}</div>
          <div style={{ marginBottom: "40px" }}>{renderMoney()}</div>
        </div>

        {/* 4. MÓDULOS DO SISTEMA */}
        <div className="flex flex-col gap-2">
           <SectionLabel className="!mb-0 text-white/30 opacity-100 uppercase tracking-[0.2em] text-[10px] font-black">Módulos</SectionLabel>
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
               icon={<DollarSign size={14} className="text-[#28A745]" />} 
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

        {/* BUSCA GLOBAL */}
        <div className="mt-6 pt-0">
          <div className="w-full relative flex items-center group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--accent-gold)] transition-colors pointer-events-none">
              <Search size={16} />
            </div>
            <input 
              type="text"
              placeholder="Pesquisar cliente, OS, proposta ou endereço"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pr-10 bg-white/[0.02] border border-white/[0.05] rounded-[12px] text-white text-[12px] placeholder:text-white/20 outline-none focus:border-white/20 focus:bg-white/[0.04] transition-all"
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
      className="bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] active:scale-[0.97] transition-all rounded-[12px] p-3 flex flex-col cursor-pointer group"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-white/[0.03] flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black text-white uppercase tracking-wider truncate">{title}</span>
            <span className="text-[9px] font-medium text-white/40 truncate mt-0.5">{sub}</span>
          </div>
        </div>
        <div className="mt-1 pt-2 border-t border-white/[0.03] flex justify-end items-center text-[9px] font-bold text-white/30 uppercase tracking-widest group-hover:text-white/60 transition-colors">
          Entrar <ArrowRight size={10} className="ml-1" />
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path, beforeReturn + newRender, 'utf8');
console.log('File successfully updated.');
