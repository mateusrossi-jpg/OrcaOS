const fs = require('fs');

const path = 'src/app/screens/HomeScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find the return statement start
const startIdx = content.indexOf('  return (\n    <div \n      className="pb-6 bg-[#07080A]');
if (startIdx === -1) {
  console.log('Start index not found');
  process.exit(1);
}

const beforeReturn = content.substring(0, startIdx);

const newRender = `  const isExecuting = nextActionOS?.status === 'in-progress' || nextActionOS?.status === 'en_route';

  // Contextual Alerts
  const alerts = [];
  if (stats.followUps > 0) alerts.push({ text: \`\${stats.followUps} follow-ups pendentes\`, type: 'amber' });
  // Simulate overdue collections for demo based on expectedRevenue
  if (stats.toCollect > 5000) alerts.push({ text: 'Cobranças vencidas', type: 'red' });

  // 1. ATENÇÃO BLOCK
  const renderAttention = () => {
    if (alerts.length === 0) return null;
    return (
      <div className="flex flex-col gap-2">
        <SectionLabel className="!mb-0 text-[#FF453A] opacity-100 uppercase tracking-[0.3em] text-[11px] font-black">
          Atenção
        </SectionLabel>
        <div className="bg-[#FF453A]/10 border border-[#FF453A]/20 rounded-[20px] p-4 flex flex-col gap-3">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF453A] animate-pulse shrink-0" />
              <span className="text-xs font-bold text-white/90 uppercase tracking-wider">{a.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 2. EXECUTION BLOCK
  const renderExecution = () => (
    <div className="flex flex-col gap-3">
      <SectionLabel className="!mb-0 text-[#0A84FF] opacity-100 uppercase tracking-[0.3em] text-[11px] font-black">
        {isExecuting ? "Em Execução" : "Próxima Missão"}
      </SectionLabel>
      {nextActionOS ? (
         <div className="bg-[#0A84FF]/10 border border-[#0A84FF]/20 rounded-[24px] p-5 shadow-lg flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0A84FF]/5 blur-2xl pointer-events-none rounded-full" />
            
            <div className="flex justify-between items-start gap-4">
               <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] font-black text-[#0A84FF] uppercase tracking-[0.25em]">OPERACIONAL</span>
                  <h3 className="text-lg font-black text-white tracking-tight leading-snug mt-1 truncate">
                     {nextActionOS.title}
                  </h3>
                  <span className="text-xs text-white/50 uppercase tracking-wider font-bold truncate">
                     {nextActionClient?.name || "Cliente Avulso"}
                  </span>
               </div>
               
               <div className="flex flex-col items-end shrink-0">
                  <span className="text-[13px] font-mono font-black text-[#0A84FF] bg-[#0A84FF]/10 px-2.5 py-1.5 rounded-lg border border-[#0A84FF]/20 shadow-inner leading-none">
                     {nextActionOS.scheduledDate?.slice(11, 16) || "AGORA"}
                  </span>
               </div>
            </div>

            <div className="flex items-center gap-2.5 text-white/60 text-xs bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 shrink-0">
               <MapPin size={14} className="shrink-0 text-[#0A84FF]" />
               <span className="truncate">{nextActionClient?.fullAddress || nextActionOS.address || "Endereço não informado"}</span>
            </div>

            <button 
              onClick={() => onNavigate({ tab: 'operations', workOrderId: nextActionOS.id })}
              className="w-full h-12 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
            >
               {isExecuting ? <><RefreshCw size={14} className="animate-spin shrink-0" /> CONTINUAR ATENDIMENTO</> : <><Play size={14} className="fill-current shrink-0" /> INICIAR ROTA</>}
            </button>
         </div>
       ) : (
         <div 
           onClick={() => onNavigate('new-budget')}
           className="bg-white/[0.02] border border-white/[0.05] border-dashed rounded-[20px] p-4 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer"
         >
            <span className="text-[11px] font-black text-white/30 uppercase tracking-widest">Nenhuma missão</span>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#0A84FF]/10 rounded-full border border-[#0A84FF]/20 group-hover:bg-[#0A84FF]/20 transition-colors shrink-0">
               <Plus size={14} className="text-[#0A84FF]" />
               <span className="text-[10px] font-black text-white uppercase tracking-wider">Nova OS</span>
            </div>
         </div>
       )}
    </div>
  );

  // 3. MONEY BLOCK
  const renderMoney = () => (
    <div className="flex flex-col gap-3">
      <SectionLabel className="!mb-0 text-[#30D158] opacity-100 uppercase tracking-[0.3em] text-[11px] font-black">
        Financeiro
      </SectionLabel>
      <div className="bg-[#30D158]/10 border border-[#30D158]/20 p-5 rounded-[24px] flex flex-col gap-4 relative overflow-hidden group">
        <div className="flex justify-between items-start gap-4">
           <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] font-black text-[#30D158] uppercase tracking-[0.25em]">A RECEBER</span>
              <span className="text-2xl font-mono font-black text-[#30D158] leading-none mt-1">
                {formatCurrencyBRL(stats.toCollect)}
              </span>
           </div>
           {stats.followUps > 0 && (
             <div className="flex flex-col items-end shrink-0">
                <span className="text-[11px] font-bold text-white/50 text-right uppercase tracking-wider">
                  {stats.followUps} cobranças<br/>pendentes
                </span>
             </div>
           )}
        </div>
        <button 
          onClick={() => onNavigate('revenue')}
          className="w-full h-12 mt-1 bg-[#30D158]/15 hover:bg-[#30D158]/25 text-[#30D158] font-black text-[10px] uppercase tracking-widest rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          ABRIR FINANCEIRO
        </button>
      </div>
    </div>
  );

  // 4. OPPORTUNITY BLOCK
  const renderOpportunity = () => (
    <div className="flex flex-col gap-3">
      <SectionLabel className="!mb-0 text-[var(--accent-gold)] opacity-100 uppercase tracking-[0.3em] text-[11px] font-black">Próxima Oportunidade</SectionLabel>
      {topOpportunity ? (
        <div className="bg-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/20 rounded-[24px] p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-gold)]/5 blur-2xl pointer-events-none rounded-full" />
          
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] font-black text-[var(--accent-gold)] uppercase tracking-[0.25em]">ESTRATÉGICO</span>
              <h3 className="text-xl font-black text-white tracking-tight leading-snug mt-1 truncate">
                {topOpportunity.clientName}
              </h3>
            </div>
            
            <div className="flex flex-col items-end shrink-0">
              <span className="text-lg font-mono font-black text-[#30D158] leading-none">
                {formatCurrencyBRL(topOpportunity.expectedRevenue)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
              {topOpportunity.recommendedAction || "LIGAR AGORA"}
            </span>
            <button 
              onClick={() => onNavigate({ tab: 'revenue', budgetId: topOpportunity.id })}
              className="px-4 py-2 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/90 text-black font-black text-[10px] uppercase tracking-wider rounded-lg active:scale-95 transition-all cursor-pointer"
            >
              ABRIR OPORTUNIDADE
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => onNavigate('new-budget')}
          className="bg-white/[0.02] border border-white/[0.05] border-dashed rounded-[20px] p-4 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer"
        >
           <span className="text-[11px] font-black text-white/30 uppercase tracking-widest">Sem oportunidades</span>
           <div className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-gold)]/10 rounded-full border border-[var(--accent-gold)]/20 group-hover:bg-[var(--accent-gold)]/20 transition-colors shrink-0">
              <Plus size={14} className="text-[var(--accent-gold)]" />
              <span className="text-[10px] font-black text-white uppercase tracking-wider">Criar Orçamento</span>
           </div>
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
    // If high value pending, prioritize money
    blocks.push(renderMoney());
    blocks.push(renderExecution());
    blocks.push(renderOpportunity());
  } else {
    // Default flow
    blocks.push(renderExecution());
    blocks.push(renderMoney());
    blocks.push(renderOpportunity());
  }

  return (
    <div 
      className="pb-6 bg-[#07080A] pt-0 px-0 relative overflow-x-hidden flex flex-col w-full bg-black/10 animate-fade-in"
      style={{ minHeight: 'auto' }}
    >
      {/* Background glow overlay */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-[#161B29]/30 via-transparent to-transparent pointer-events-none blur-[120px] z-0" />

      <div className="px-6 pt-6 pb-[120px] flex flex-col gap-10 relative z-10 max-w-md mx-auto w-full">
        
        {/* 1. HEADER (Compact & Tactical) */}
        <div className="flex flex-col gap-1 mt-2">
          <h1 className="text-[28px] font-black text-white tracking-tight leading-none">
            Bom dia, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">{account?.name?.split(' ')[0] || "Mateus"}</span>.
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30D158] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#30D158]"></span>
            </span>
            <span className="text-[10px] font-black text-[#30D158] uppercase tracking-wider">
              Sincronizado • Online
            </span>
          </div>
        </div>

        {/* DYNAMIC BLOCKS (Contextual Order) */}
        {blocks.map((block, i) => (
          <div key={i}>{block}</div>
        ))}

        {/* 5. TOOLBOX (Operational Action Rows) */}
        <div className="flex flex-col gap-2">
           <ToolboxRow 
             icon={<Plus size={18} className="text-[var(--accent-gold)]" strokeWidth={3} />} 
             label="Criar Orçamento" 
             onClick={() => onNavigate('new-budget')} 
           />
           <ToolboxRow 
             icon={<Users size={18} className="text-white/60" />} 
             label="Cadastrar Cliente" 
             onClick={() => onNavigate('relationships')} 
           />
           <ToolboxRow 
             icon={<DollarSign size={18} className="text-[#30D158]" />} 
             label="Registrar Recebimento" 
             onClick={() => onNavigate('revenue')} 
           />
           <ToolboxRow 
             icon={<Settings size={18} className="text-[#AF52DE]" />} 
             label="Planos Recorrentes" 
             onClick={() => onNavigate('relationships')} 
           />
        </div>

        {/* 6. SEARCH (Recovery Tool at bottom) */}
        <div className="mt-4 pt-8 border-t border-white/[0.04]">
          <SectionLabel className="mb-4 opacity-40 uppercase tracking-[0.3em] text-[11px] font-black">Busca Global</SectionLabel>
          <div className="w-full relative flex items-center group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--accent-gold)] transition-colors pointer-events-none">
              <Search size={20} />
            </div>
            <input 
              type="text"
              placeholder="Pesquisar cliente, OS, propostas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pr-12 bg-white/[0.02] border border-white/10 rounded-[18px] text-white text-sm placeholder:text-white/20 outline-none focus:border-white/20 focus:bg-white/[0.04] transition-all"
              style={{ paddingLeft: "3.5rem" }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-[10px] font-black uppercase tracking-wider"
              >
                Limpar
              </button>
            )}
          </div>

          {searchQuery.trim() !== "" && (
            <div className="flex flex-col gap-6 mt-6 animate-slide-up">
              {isSearching ? (
                <div className="py-6 flex flex-col items-center justify-center gap-3">
                  <ERPLoader />
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {searchResults.clients.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 px-1">Clientes</span>
                      {searchResults.clients.map((client) => (
                        <SearchRow key={client.id} title={client.name} sub={client.phone} onClick={() => onNavigate({ tab: 'relationships', clientId: client.id })} />
                      ))}
                    </div>
                  )}
                  {searchResults.budgets.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 px-1">Orçamentos</span>
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

function ToolboxRow({ icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full min-h-[64px] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] active:scale-[0.98] transition-all rounded-[16px] px-5 py-3 flex items-center justify-between group cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <span className="text-[15px] font-bold text-white/90 tracking-tight">{label}</span>
      </div>
      <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all shrink-0" />
    </button>
  );
}

function SearchRow({ title, sub, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-xl flex items-center justify-between gap-4 cursor-pointer active:scale-[0.98] transition-all"
    >
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-bold text-white truncate">{title}</span>
        <span className="text-[10px] text-white/30 truncate uppercase tracking-wider">{sub}</span>
      </div>
      <ChevronRight size={12} className="text-white/20" />
    </div>
  );
}
`;

fs.writeFileSync(path, beforeReturn + newRender, 'utf8');
console.log('File successfully updated.');