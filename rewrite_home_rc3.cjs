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

  // Contextual Alerts
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
        <div className="bg-[#FF453A]/10 border border-[#FF453A]/20 rounded-[12px] p-3 flex flex-col gap-2">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF453A] animate-pulse shrink-0" />
              <span className="text-[11px] font-bold text-white/90 uppercase tracking-wider">{a.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 2. EXECUTION BLOCK (HERO)
  const renderExecution = () => (
    <div className="flex flex-col gap-1.5">
      <SectionLabel className="!mb-0 text-[#0A84FF] opacity-100 uppercase tracking-[0.2em] text-[10px] font-black">
        {isExecuting ? "Em Execução" : "Próxima Missão"}
      </SectionLabel>
      {nextActionOS ? (
         <div className="bg-[#0A84FF]/15 border border-[#0A84FF]/30 rounded-[16px] p-4 flex flex-col gap-3 relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#0A84FF]/10 blur-2xl pointer-events-none rounded-full" />
            
            <div className="flex justify-between items-start gap-3">
               <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-black text-[#0A84FF] uppercase tracking-[0.2em]">OPERACIONAL</span>
                  <h3 className="text-base font-black text-white tracking-tight leading-snug mt-0.5 truncate">
                     {nextActionOS.title}
                  </h3>
                  <span className="text-[11px] text-white/60 uppercase tracking-wider font-bold truncate">
                     {nextActionClient?.name || "Cliente Avulso"}
                  </span>
               </div>
               
               <div className="flex flex-col items-end shrink-0">
                  <span className="text-[11px] font-mono font-black text-white bg-[#0A84FF]/20 px-2 py-1 rounded-md border border-[#0A84FF]/30 leading-none">
                     {nextActionOS.scheduledDate?.slice(11, 16) || "AGORA"}
                  </span>
               </div>
            </div>

            <div className="flex items-center gap-2 text-white/80 text-[11px] bg-black/20 border border-white/[0.04] rounded-lg p-2 shrink-0 mt-1">
               <MapPin size={12} className="shrink-0 text-[#0A84FF]" />
               <span className="truncate">{nextActionClient?.fullAddress || nextActionOS.address || "Endereço não informado"}</span>
            </div>

            <button 
              onClick={() => onNavigate({ tab: 'operations', workOrderId: nextActionOS.id })}
              className="w-full h-11 mt-1 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white font-black text-[11px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
            >
               {isExecuting ? <><RefreshCw size={14} className="animate-spin shrink-0" /> CONTINUAR ATENDIMENTO</> : <><Play size={14} className="fill-current shrink-0" /> INICIAR ROTA</>}
            </button>
         </div>
       ) : (
         <div className="bg-[#0A84FF]/10 border border-[#0A84FF]/20 rounded-[16px] p-5 flex flex-col items-center justify-center text-center gap-4 transition-all shadow-md">
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-black text-white uppercase tracking-wide">Nenhuma missão agendada</span>
              <span className="text-[11px] font-medium text-white/60">Crie uma OS para iniciar um atendimento.</span>
            </div>
            <button
              onClick={() => onNavigate('new-budget')}
              className="w-full max-w-[200px] h-10 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white font-black text-[10px] uppercase tracking-widest rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-95"
            >
               NOVA OS
            </button>
         </div>
       )}
    </div>
  );

  // 3. OPPORTUNITY BLOCK (AÇÃO)
  const renderOpportunity = () => (
    <div className="flex flex-col gap-1.5">
      <SectionLabel className="!mb-0 text-[var(--accent-gold)] opacity-100 uppercase tracking-[0.2em] text-[10px] font-black">Próxima Oportunidade</SectionLabel>
      {topOpportunity ? (
        <div 
          onClick={() => onNavigate({ tab: 'revenue', budgetId: topOpportunity.id })}
          className="bg-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/10 rounded-[16px] p-4 relative overflow-hidden group flex flex-col gap-2 cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-gold)]/5 blur-2xl pointer-events-none rounded-full" />
          
          <div className="flex justify-between items-start gap-3">
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-black text-[var(--accent-gold)] uppercase tracking-[0.2em]">ESTRATÉGICO</span>
              <h3 className="text-base font-black text-white tracking-tight leading-snug mt-0.5 truncate">
                {topOpportunity.clientName}
              </h3>
            </div>
          </div>
          <span className="text-xl font-mono font-black text-[#30D158] leading-none mt-1">
            {formatCurrencyBRL(topOpportunity.expectedRevenue)}
          </span>
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider mt-1 group-hover:text-white/60 transition-colors">
            TOQUE PARA ABRIR
          </span>
        </div>
      ) : (
        <div 
           onClick={() => onNavigate('new-budget')}
           className="bg-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/10 rounded-[16px] p-5 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
        >
           <span className="text-[12px] font-black text-white uppercase tracking-wide">Nenhuma oportunidade ativa</span>
           <span className="text-[11px] font-medium text-white/60">Crie um orçamento para iniciar uma negociação.</span>
        </div>
      )}
    </div>
  );

  // 4. MONEY BLOCK (COMPACTO)
  const renderMoney = () => (
    <div className="flex flex-col gap-1.5">
      <SectionLabel className="!mb-0 text-[#30D158] opacity-100 uppercase tracking-[0.2em] text-[10px] font-black">
        Financeiro
      </SectionLabel>
      <div 
        onClick={() => onNavigate('revenue')}
        className="bg-[#30D158]/5 border border-[#30D158]/10 p-4 rounded-[16px] flex flex-col gap-1 group active:scale-[0.98] transition-all cursor-pointer"
      >
        <span className="text-[9px] font-black text-[#30D158] uppercase tracking-[0.2em]">A RECEBER</span>
        <span className="text-xl font-mono font-black text-[#30D158] leading-none mt-0.5">
          {formatCurrencyBRL(stats.toCollect)}
        </span>
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider mt-1.5">
          {stats.followUps} contas pendentes
        </span>
      </div>
    </div>
  );

  // Contextual Ordering Logic
  const blocks = [];
  
  if (alerts.length > 0) blocks.push(renderAttention());
  
  // A prioridade operacional deve ser: 1. Próxima Missão 2. Próxima Oportunidade 3. Financeiro
  blocks.push(renderExecution());
  blocks.push(renderOpportunity());
  blocks.push(renderMoney());

  return (
    <div 
      className="pb-4 bg-[#07080A] pt-0 px-0 relative overflow-x-hidden flex flex-col w-full animate-fade-in"
      style={{ minHeight: 'auto' }}
    >
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-[#161B29]/30 via-transparent to-transparent pointer-events-none blur-[120px] z-0" />

      <div className="px-5 pt-4 pb-[80px] flex flex-col gap-4 relative z-10 max-w-md mx-auto w-full">
        
        {/* 1. HEADER (Professional Tool) */}
        <div className="flex flex-col mt-1">
          <h1 className="text-[20px] font-black text-white uppercase tracking-tight leading-none">
            Centro Operacional
          </h1>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30D158] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#30D158]"></span>
            </span>
            <span className="text-[9px] font-black text-[#30D158] uppercase tracking-widest">
              Sincronizado • Online
            </span>
          </div>
        </div>

        {/* DYNAMIC BLOCKS */}
        <div className="flex flex-col gap-4">
          {blocks.map((block, i) => (
            <div key={i}>{block}</div>
          ))}
        </div>

        {/* 5. TOOLBOX (Grid Operacional) */}
        <div className="flex flex-col mt-1 gap-2">
           <div className="grid grid-cols-2 gap-3">
             <GridTool 
               icon={<Plus size={16} className="text-[var(--accent-gold)]" strokeWidth={3} />} 
               title="Criar Orçamento" 
               sub="Nova proposta"
               onClick={() => onNavigate('new-budget')} 
             />
             <GridTool 
               icon={<Users size={16} className="text-[#0A84FF]" />} 
               title="Cadastrar Cliente" 
               sub="Novo cadastro"
               onClick={() => onNavigate('relationships')} 
             />
             <GridTool 
               icon={<DollarSign size={16} className="text-[#30D158]" />} 
               title="Recebimento" 
               sub="Financeiro"
               onClick={() => onNavigate('revenue')} 
             />
             <GridTool 
               icon={<Settings size={16} className="text-[#AF52DE]" />} 
               title="Planos" 
               sub="Recorrentes"
               onClick={() => onNavigate('relationships')} 
             />
           </div>
        </div>

        {/* 6. SEARCH (Recovery Tool at bottom) */}
        <div className="mt-1 pt-5 border-t border-white/[0.04]">
          <div className="w-full relative flex items-center group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--accent-gold)] transition-colors pointer-events-none">
              <Search size={18} />
            </div>
            <input 
              type="text"
              placeholder="Pesquisar OS, cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pr-12 bg-white/[0.02] border border-white/[0.06] rounded-[14px] text-white text-[13px] placeholder:text-white/20 outline-none focus:border-white/20 focus:bg-white/[0.04] transition-all"
              style={{ paddingLeft: "2.75rem" }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-[9px] font-black uppercase tracking-wider"
              >
                Limpar
              </button>
            )}
          </div>

          {searchQuery.trim() !== "" && (
            <div className="flex flex-col gap-4 mt-4 animate-slide-up">
              {isSearching ? (
                <div className="py-4 flex flex-col items-center justify-center gap-2">
                  <ERPLoader />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {searchResults.clients.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 px-1">Clientes</span>
                      {searchResults.clients.map((client) => (
                        <SearchRow key={client.id} title={client.name} sub={client.phone} onClick={() => onNavigate({ tab: 'relationships', clientId: client.id })} />
                      ))}
                    </div>
                  )}
                  {searchResults.budgets.length > 0 && (
                    <div className="flex flex-col gap-1.5">
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
      className="bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] active:scale-[0.97] transition-all rounded-[16px] p-3.5 flex flex-col gap-2.5 cursor-pointer"
    >
      <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] font-black text-white uppercase tracking-wider leading-tight">{title}</span>
        <span className="text-[10px] font-medium text-white/40 mt-0.5">{sub}</span>
      </div>
    </div>
  );
}

function SearchRow({ title, sub, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer active:scale-[0.98] transition-all"
    >
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] font-bold text-white truncate">{title}</span>
        <span className="text-[9px] text-white/30 truncate uppercase tracking-wider mt-0.5">{sub}</span>
      </div>
      <ChevronRight size={12} className="text-white/20" />
    </div>
  );
}
`;

fs.writeFileSync(path, beforeReturn + newRender, 'utf8');
console.log('File successfully updated.');
