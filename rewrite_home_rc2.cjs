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
      <div className="flex flex-col gap-1.5">
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

  // 2. EXECUTION BLOCK
  const renderExecution = () => (
    <div className="flex flex-col gap-2">
      <SectionLabel className="!mb-0 text-[#0A84FF] opacity-100 uppercase tracking-[0.2em] text-[10px] font-black">
        {isExecuting ? "Em Execução" : "Próxima Missão"}
      </SectionLabel>
      {nextActionOS ? (
         <div className="bg-[#0A84FF]/10 border border-[#0A84FF]/20 rounded-[16px] p-4 flex flex-col gap-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#0A84FF]/5 blur-2xl pointer-events-none rounded-full" />
            
            <div className="flex justify-between items-start gap-3">
               <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-black text-[#0A84FF] uppercase tracking-[0.2em]">OPERACIONAL</span>
                  <h3 className="text-base font-black text-white tracking-tight leading-snug mt-0.5 truncate">
                     {nextActionOS.title}
                  </h3>
                  <span className="text-[11px] text-white/50 uppercase tracking-wider font-bold truncate">
                     {nextActionClient?.name || "Cliente Avulso"}
                  </span>
               </div>
               
               <div className="flex flex-col items-end shrink-0">
                  <span className="text-[11px] font-mono font-black text-[#0A84FF] bg-[#0A84FF]/10 px-2 py-1 rounded-md border border-[#0A84FF]/20 leading-none">
                     {nextActionOS.scheduledDate?.slice(11, 16) || "AGORA"}
                  </span>
               </div>
            </div>

            <div className="flex items-center gap-2 text-white/60 text-[11px] bg-white/[0.02] border border-white/[0.04] rounded-lg p-2 shrink-0 mt-1">
               <MapPin size={12} className="shrink-0 text-[#0A84FF]" />
               <span className="truncate">{nextActionClient?.fullAddress || nextActionOS.address || "Endereço não informado"}</span>
            </div>

            <button 
              onClick={() => onNavigate({ tab: 'operations', workOrderId: nextActionOS.id })}
              className="w-full h-10 mt-1 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white font-black text-[10px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
               {isExecuting ? <><RefreshCw size={12} className="animate-spin shrink-0" /> CONTINUAR ATENDIMENTO</> : <><Play size={12} className="fill-current shrink-0" /> INICIAR ROTA</>}
            </button>
         </div>
       ) : (
         <div className="bg-white/[0.02] border border-white/[0.04] rounded-[16px] p-5 flex flex-col items-center justify-center text-center gap-4 transition-all">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-black text-white uppercase tracking-wide">Nenhuma missão agendada</span>
              <span className="text-[11px] font-medium text-white/40">Crie uma OS para iniciar um atendimento.</span>
            </div>
            <button
              onClick={() => onNavigate('new-budget')}
              className="w-[45%] h-10 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white font-black text-[10px] uppercase tracking-widest rounded-lg flex items-center justify-center transition-all shadow-sm"
            >
               NOVA OS
            </button>
         </div>
       )}
    </div>
  );

  // 3. MONEY BLOCK
  const renderMoney = () => (
    <div className="flex flex-col gap-2">
      <SectionLabel className="!mb-0 text-[#30D158] opacity-100 uppercase tracking-[0.2em] text-[10px] font-black">
        Financeiro
      </SectionLabel>
      <div className="bg-[#30D158]/5 border border-[#30D158]/10 p-4 rounded-[16px] flex flex-col gap-3 group">
        <div className="flex justify-between items-center gap-3">
           <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-black text-[#30D158] uppercase tracking-[0.2em]">A RECEBER</span>
              <span className="text-xl font-mono font-black text-[#30D158] leading-none mt-1">
                {formatCurrencyBRL(stats.toCollect)}
              </span>
           </div>
           <div className="flex flex-col items-end shrink-0">
              <span className="text-[10px] font-bold text-white/50 text-right uppercase tracking-wider">
                {stats.followUps} contas pendentes
              </span>
           </div>
        </div>
        <button 
          onClick={() => onNavigate('revenue')}
          className="w-full h-10 mt-1 bg-[#30D158]/15 hover:bg-[#30D158]/25 text-[#30D158] font-black text-[10px] uppercase tracking-widest rounded-lg active:scale-95 transition-all flex items-center justify-center"
        >
          ABRIR FINANCEIRO
        </button>
      </div>
    </div>
  );

  // 4. OPPORTUNITY BLOCK
  const renderOpportunity = () => (
    <div className="flex flex-col gap-2">
      <SectionLabel className="!mb-0 text-[var(--accent-gold)] opacity-100 uppercase tracking-[0.2em] text-[10px] font-black">Próxima Oportunidade</SectionLabel>
      {topOpportunity ? (
        <div className="bg-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/10 rounded-[16px] p-4 relative overflow-hidden group flex flex-col gap-3">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-gold)]/5 blur-2xl pointer-events-none rounded-full" />
          
          <div className="flex justify-between items-start gap-3">
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-black text-[var(--accent-gold)] uppercase tracking-[0.2em]">ESTRATÉGICO</span>
              <h3 className="text-base font-black text-white tracking-tight leading-snug mt-0.5 truncate">
                {topOpportunity.clientName}
              </h3>
            </div>
            
            <div className="flex flex-col items-end shrink-0">
              <span className="text-lg font-mono font-black text-[#30D158] leading-none">
                {formatCurrencyBRL(topOpportunity.expectedRevenue)}
              </span>
            </div>
          </div>

          <div className="mt-1 pt-3 border-t border-white/[0.04] flex items-center justify-between">
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">
              {topOpportunity.recommendedAction || "LIGAR AGORA"}
            </span>
            <button 
              onClick={() => onNavigate({ tab: 'revenue', budgetId: topOpportunity.id })}
              className="px-4 py-2 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/90 text-black font-black text-[9px] uppercase tracking-widest rounded-lg active:scale-95 transition-all cursor-pointer"
            >
              ABRIR OPORTUNIDADE
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-[16px] p-5 flex flex-col items-center justify-center text-center gap-4 transition-all">
           <div className="flex flex-col gap-1">
             <span className="text-[12px] font-black text-white uppercase tracking-wide">Nenhuma oportunidade ativa</span>
             <span className="text-[11px] font-medium text-white/40">Crie um orçamento para iniciar uma negociação.</span>
           </div>
           <button
             onClick={() => onNavigate('new-budget')}
             className="w-[45%] h-10 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/90 text-black font-black text-[10px] uppercase tracking-widest rounded-lg flex items-center justify-center transition-all shadow-sm"
           >
              NOVO ORÇAMENTO
           </button>
        </div>
      )}
    </div>
  );

  // Contextual Ordering Logic
  const blocks = [];
  
  if (alerts.length > 0) blocks.push(renderAttention());
  
  if (isExecuting) {
    blocks.push(renderExecution());
    blocks.push(renderMoney());
    blocks.push(renderOpportunity());
  } else if (stats.toCollect > 10000 || stats.followUps > 5) {
    blocks.push(renderMoney());
    blocks.push(renderExecution());
    blocks.push(renderOpportunity());
  } else {
    blocks.push(renderExecution());
    blocks.push(renderMoney());
    blocks.push(renderOpportunity());
  }

  return (
    <div 
      className="pb-4 bg-[#07080A] pt-0 px-0 relative overflow-x-hidden flex flex-col w-full animate-fade-in"
      style={{ minHeight: 'auto' }}
    >
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-[#161B29]/30 via-transparent to-transparent pointer-events-none blur-[120px] z-0" />

      <div className="px-5 pt-4 pb-[80px] flex flex-col gap-6 relative z-10 max-w-md mx-auto w-full">
        
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
        <div className="flex flex-col gap-6">
          {blocks.map((block, i) => (
            <div key={i}>{block}</div>
          ))}
        </div>

        {/* 5. TOOLBOX (Dock Operacional) */}
        <div className="flex flex-col mt-2">
           <ToolboxRow 
             icon={<Plus size={16} className="text-[var(--accent-gold)]" strokeWidth={3} />} 
             title="Criar Orçamento" 
             sub="Formular uma nova proposta"
             onClick={() => onNavigate('new-budget')} 
           />
           <ToolboxRow 
             icon={<Users size={16} className="text-white/60" />} 
             title="Cadastrar Cliente" 
             sub="Adicionar cliente ao sistema"
             onClick={() => onNavigate('relationships')} 
           />
           <ToolboxRow 
             icon={<DollarSign size={16} className="text-[#30D158]" />} 
             title="Registrar Recebimento" 
             sub="Lançar pagamento recebido"
             onClick={() => onNavigate('revenue')} 
           />
           <ToolboxRow 
             icon={<Settings size={16} className="text-[#AF52DE]" />} 
             title="Planos Recorrentes" 
             sub="Gerenciar serviços periódicos"
             onClick={() => onNavigate('relationships')} 
           />
        </div>

        {/* 6. SEARCH (Recovery Tool at bottom) */}
        <div className="mt-2 pt-6 border-t border-white/[0.04]">
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

function ToolboxRow({ icon, title, sub, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full bg-transparent border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] active:scale-[0.99] transition-all py-3.5 px-2 flex items-center justify-between group cursor-pointer"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex flex-col items-start min-w-0">
          <span className="text-[11px] font-black text-white uppercase tracking-wider">{title}</span>
          <span className="text-[10px] font-medium text-white/40 mt-0.5">{sub}</span>
        </div>
      </div>
      <ChevronRight size={14} className="text-white/10 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all shrink-0" />
    </button>
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
