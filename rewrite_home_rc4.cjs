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

  const alerts = [];
  if (stats.followUps > 0) alerts.push({ text: \`\${stats.followUps} follow-ups pendentes\`, type: 'amber' });
  if (stats.toCollect > 5000) alerts.push({ text: 'Cobranças vencidas', type: 'red' });

  // 1. ATENÇÃO BLOCK
  const renderAttention = () => {
    if (alerts.length === 0) return null;
    return (
      <div className="flex flex-col gap-1">
        <SectionLabel className="!mb-0 text-[#FF453A] opacity-100 uppercase tracking-[0.2em] text-[10px] font-black">
          Atenção
        </SectionLabel>
        <div className="bg-[#FF453A]/10 border border-[#FF453A]/20 rounded-[12px] p-2.5 flex flex-col gap-1.5">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF453A] animate-pulse shrink-0" />
              <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider">{a.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 2. EXECUTION BLOCK (HERO)
  const renderExecution = () => (
    <div className="flex flex-col gap-1">
      <SectionLabel className="!mb-0 text-[#0A84FF] opacity-100 uppercase tracking-[0.2em] text-[10px] font-black">
        {isExecuting ? "Em Execução" : "Próxima Missão"}
      </SectionLabel>
      {nextActionOS ? (
         <div 
           onClick={() => onNavigate({ tab: 'operations', workOrderId: nextActionOS.id })}
           className="bg-[#0A84FF]/10 border border-[#0A84FF]/20 rounded-[12px] p-3 flex flex-col gap-2 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
         >
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
               <span className="truncate">{nextActionClient?.fullAddress || nextActionOS.address || "Endereço não informado"}</span>
            </div>
         </div>
       ) : (
         <div 
           onClick={() => onNavigate('new-budget')}
           className="bg-white/[0.02] border border-white/[0.05] border-dashed rounded-[12px] p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer active:scale-[0.98]"
         >
            <span className="text-[11px] font-black text-white uppercase tracking-wide">Nenhuma missão agendada</span>
            <span className="text-[9px] font-bold text-[#0A84FF] uppercase tracking-widest mt-1">Toque para criar OS</span>
         </div>
       )}
    </div>
  );

  // 3. OPPORTUNITY BLOCK
  const renderOpportunity = () => (
    <div className="flex flex-col gap-1">
      <SectionLabel className="!mb-0 text-[var(--accent-gold)] opacity-100 uppercase tracking-[0.2em] text-[10px] font-black">Próxima Oportunidade</SectionLabel>
      {topOpportunity ? (
        <div 
          onClick={() => onNavigate({ tab: 'revenue', budgetId: topOpportunity.id })}
          className="bg-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/10 rounded-[12px] p-3 relative overflow-hidden group flex justify-between items-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-black text-white tracking-tight leading-snug truncate">
              {topOpportunity.clientName}
            </h3>
            <span className="text-[9px] font-bold text-[var(--accent-gold)] uppercase tracking-wider mt-0.5">
              {topOpportunity.recommendedAction || "AÇÃO PENDENTE"}
            </span>
          </div>
          <span className="text-lg font-mono font-black text-[#30D158] leading-none shrink-0">
            {formatCurrencyBRL(topOpportunity.expectedRevenue)}
          </span>
        </div>
      ) : (
        <div 
           onClick={() => onNavigate('new-budget')}
           className="bg-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/10 rounded-[12px] p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer active:scale-[0.98]"
        >
           <span className="text-[11px] font-black text-white uppercase tracking-wide">Nenhuma oportunidade ativa</span>
           <span className="text-[9px] font-bold text-[var(--accent-gold)] uppercase tracking-widest mt-1">Toque para criar orçamento</span>
        </div>
      )}
    </div>
  );

  // 4. MONEY BLOCK
  const renderMoney = () => (
    <div className="flex flex-col gap-1">
      <SectionLabel className="!mb-0 text-[#30D158] opacity-100 uppercase tracking-[0.2em] text-[10px] font-black">
        Financeiro
      </SectionLabel>
      <div 
        onClick={() => onNavigate('revenue')}
        className="bg-[#30D158]/5 border border-[#30D158]/10 p-3 rounded-[12px] flex justify-between items-center group active:scale-[0.98] transition-all cursor-pointer"
      >
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-[#30D158] uppercase tracking-[0.2em]">A RECEBER</span>
          <span className="text-xl font-mono font-black text-[#30D158] leading-none mt-0.5">
            {formatCurrencyBRL(stats.toCollect)}
          </span>
        </div>
        <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider text-right">
          {stats.followUps} pendências
        </span>
      </div>
    </div>
  );

  // Order is strict: MISSÃO -> OPORTUNIDADE -> FINANCEIRO -> FERRAMENTAS
  const blocks = [];
  if (alerts.length > 0) blocks.push(renderAttention());
  blocks.push(renderExecution());
  blocks.push(renderOpportunity());
  blocks.push(renderMoney());

  return (
    <div 
      className="pb-2 bg-[#07080A] pt-0 px-0 relative overflow-x-hidden flex flex-col w-full animate-fade-in"
      style={{ minHeight: 'auto' }}
    >
      <div className="px-5 pt-4 pb-[80px] flex flex-col gap-3.5 relative z-10 max-w-md mx-auto w-full">
        
        {/* 1. HEADER (Operational Context) */}
        <div className="flex flex-col mt-0.5 mb-1">
          <h1 className="text-[22px] font-black text-white uppercase tracking-tight leading-none">
            HOJE
          </h1>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30D158] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#30D158]"></span>
            </span>
            <span className="text-[10px] font-black text-[#30D158] uppercase tracking-widest">
              {stats.todayMissions} missões • {topOpportunity ? 1 : 0} oport. • {stats.followUps} cobr.
            </span>
          </div>
        </div>

        {/* DYNAMIC BLOCKS */}
        <div className="flex flex-col gap-3.5">
          {blocks.map((block, i) => (
            <div key={i}>{block}</div>
          ))}
        </div>

        {/* 5. TOOLBOX (Operational Grid) */}
        <div className="flex flex-col mt-0.5 gap-1">
           <SectionLabel className="!mb-0.5 text-white/30 opacity-100 uppercase tracking-[0.2em] text-[10px] font-black">Ferramentas</SectionLabel>
           <div className="grid grid-cols-2 gap-2.5">
             <GridTool 
               icon={<FileText size={14} className="text-[var(--accent-gold)]" />} 
               title="ORÇAMENTOS" 
               sub="Criar proposta"
               onClick={() => onNavigate('new-budget')} 
             />
             <GridTool 
               icon={<Users size={14} className="text-[#0A84FF]" />} 
               title="CLIENTES" 
               sub="Novo cadastro"
               onClick={() => onNavigate('relationships')} 
             />
             <GridTool 
               icon={<DollarSign size={14} className="text-[#30D158]" />} 
               title="FINANCEIRO" 
               sub="Recebimentos"
               onClick={() => onNavigate('revenue')} 
             />
             <GridTool 
               icon={<Settings size={14} className="text-[#AF52DE]" />} 
               title="PLANOS" 
               sub="Recorrentes"
               onClick={() => onNavigate('relationships')} 
             />
           </div>
        </div>

        {/* 6. SEARCH */}
        <div className="mt-1 pt-3 border-t border-white/[0.04]">
          <div className="w-full relative flex items-center group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--accent-gold)] transition-colors pointer-events-none">
              <Search size={16} />
            </div>
            <input 
              type="text"
              placeholder="Pesquisar OS, cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pr-10 bg-white/[0.02] border border-white/[0.06] rounded-[10px] text-white text-[12px] placeholder:text-white/20 outline-none focus:border-white/20 focus:bg-white/[0.04] transition-all"
              style={{ paddingLeft: "2.25rem" }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-[9px] font-black uppercase tracking-wider"
              >
                Limpar
              </button>
            )}
          </div>

          {searchQuery.trim() !== "" && (
            <div className="flex flex-col gap-3 mt-3 animate-slide-up">
              {isSearching ? (
                <div className="py-2 flex flex-col items-center justify-center">
                  <ERPLoader />
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {searchResults.clients.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 px-1">Clientes</span>
                      {searchResults.clients.map((client) => (
                        <SearchRow key={client.id} title={client.name} sub={client.phone} onClick={() => onNavigate({ tab: 'relationships', clientId: client.id })} />
                      ))}
                    </div>
                  )}
                  {searchResults.budgets.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 px-1">Orçamentos</span>
                      {searchResults.budgets.map((budget) => (
                        <SearchRow key={budget.id} title={budget.title || 'Sem Título'} sub={budget.clientName} onClick={() => onNavigate({ tab: 'revenue', budgetId: budget.id })} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
});

function GridTool({ icon, title, sub, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] active:scale-[0.97] transition-all rounded-[12px] p-2.5 flex flex-col gap-2 cursor-pointer"
    >
      <div className="w-6 h-6 rounded-md bg-white/[0.03] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-black text-white uppercase tracking-wider leading-tight">{title}</span>
        <span className="text-[9px] font-medium text-white/40 mt-0.5 truncate">{sub}</span>
      </div>
    </div>
  );
}

function SearchRow({ title, sub, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="bg-white/[0.02] border border-white/[0.04] p-2.5 rounded-lg flex items-center justify-between gap-2 cursor-pointer active:scale-[0.98] transition-all"
    >
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold text-white truncate">{title}</span>
        <span className="text-[8px] text-white/30 truncate uppercase tracking-wider mt-0.5">{sub}</span>
      </div>
      <ChevronRight size={10} className="text-white/20" />
    </div>
  );
}
`;

fs.writeFileSync(path, beforeReturn + newRender, 'utf8');
console.log('File successfully updated.');
