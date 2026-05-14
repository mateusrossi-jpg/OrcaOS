import React, { useState } from 'react';
import { downloadErrorLogsTxt } from '../src/core/error/exportLocalLogs';

/**
 * Dashboard Component - Aferix
 * Focus: Typographic hierarchy, whitespace, and financial clarity.
 * Strategy: No secondary icons, scale limited to text-4xl, semantic coloring.
 */
export const Dashboard: React.FC = () => {
  // Mock data for visual representation
  const metrics = {
    netProfit: 12450.00,
    grossRevenue: 18500.00,
    receivables: 2800.00,
    expenses: 1200.00,
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Estado para controlar os "toques secretos"
  const [devClicks, setDevClicks] = useState(0);

  const handleVersionClick = () => {
    const clicks = devClicks + 1;
    setDevClicks(clicks);
    if (clicks >= 7) {
      setDevClicks(0); // Reseta o contador
      downloadErrorLogsTxt();
    }
  };

  // Estado para animar o botão de cópia
  const [copiedProfit, setCopiedProfit] = useState(false);

  const handleCopyProfit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`*Resumo Aferix*\nLucro Líquido: ${formatCurrency(metrics.netProfit)}\nReceita Bruta: ${formatCurrency(metrics.grossRevenue)}\nDespesas: ${formatCurrency(metrics.expenses)}`);
    setCopiedProfit(true);
    setTimeout(() => setCopiedProfit(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-gray-100 font-sans selection:bg-[#2DD4BF]/30">
      {/* Main Container with generous padding */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Header - Simple and direct */}
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tighter uppercase font-sans">AFERIX</h1>
          <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">Resumo Financeiro</p>
        </header>

        {/* Refatoração: Grade de KPIs Financeiros (High-Contrast Dark) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Bloco 1: Lucro Líquido */}
          <div className="bg-[#111111] border border-[#27272A] rounded-lg p-5 relative overflow-hidden transition-colors duration-300 hover:border-[#2DD4BF] group">
            <div className="absolute -top-4 -right-4 opacity-30 text-[#10B981] group-hover:scale-110 transition-transform duration-500">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
            </div>
            <div className="flex justify-between items-start relative z-10">
              <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
                Lucro Líquido
              </h3>
              <button 
                onClick={handleCopyProfit}
                className="text-slate-500 hover:text-[#2DD4BF] transition-colors p-1.5 -mt-1.5 -mr-1.5 rounded hover:bg-[#2DD4BF]/10"
                title="Copiar resumo para WhatsApp"
              >
                {copiedProfit ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                )}
              </button>
            </div>
            <div className="mt-2 text-2xl md:text-3xl font-bold text-white tabular-nums relative z-10 font-mono">
              {formatCurrency(metrics.netProfit)}
            </div>
            <div className="mt-4 flex items-center relative z-10">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#10B981]/10 text-xs font-semibold text-[#10B981]">
                ↑ +18.2%
              </span>
            </div>
          </div>

          {/* Bloco 2: Receita Bruta */}
          <div className="bg-[#111111] border border-[#27272A] rounded-lg p-5 relative overflow-hidden transition-colors duration-300 hover:border-[#2DD4BF] group">
            <div className="absolute -top-4 -right-4 opacity-30 text-[#2DD4BF] group-hover:scale-110 transition-transform duration-500">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line><line x1="6" y1="14" x2="6.01" y2="14"></line></svg>
            </div>
            <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest relative z-10">
              Receita Bruta
            </h3>
            <div className="mt-2 text-2xl md:text-3xl font-bold text-white tabular-nums relative z-10 font-mono">
              {formatCurrency(metrics.grossRevenue)}
            </div>
            <div className="mt-4 flex items-center relative z-10">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#10B981]/10 text-xs font-semibold text-[#10B981]">
                ↑ +5.4%
              </span>
            </div>
          </div>

          {/* Bloco 3: Contas a Receber */}
          <div className="bg-[#111111] border border-[#27272A] rounded-lg p-5 relative overflow-hidden transition-colors duration-300 hover:border-[#2DD4BF] group">
            <div className="absolute -top-4 -right-4 opacity-[0.25] text-[#F59E0B] group-hover:scale-110 transition-transform duration-500">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest relative z-10">
              Contas a Receber
            </h3>
            <div className="mt-2 text-2xl md:text-3xl font-bold text-white tabular-nums relative z-10 font-mono">
              {formatCurrency(metrics.receivables)}
            </div>
            <div className="mt-4 flex items-center relative z-10">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#F59E0B]/10 text-xs font-semibold text-[#F59E0B]">
                4 pendentes
              </span>
            </div>
          </div>

          {/* Bloco 4: Despesas Fixas */}
          <div className="bg-[#111111] border border-[#27272A] rounded-lg p-5 relative overflow-hidden transition-colors duration-300 hover:border-[#2DD4BF] group">
            <div className="absolute -top-4 -right-4 opacity-30 text-[#EF4444] group-hover:scale-110 transition-transform duration-500">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>
            </div>
            <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest relative z-10">
              Despesas Fixas
            </h3>
            <div className="mt-2 text-2xl md:text-3xl font-bold text-white tabular-nums relative z-10 font-mono">
              {formatCurrency(metrics.expenses)}
            </div>
            <div className="mt-4 flex items-center relative z-10">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#EF4444]/10 text-xs font-semibold text-[#EF4444]">
                ↓ -2.1%
              </span>
            </div>
          </div>

        </section>

        {/* Ações Rápidas (Estilo Ghost/Outline) */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            
            <button className="flex flex-col items-center justify-center h-24 rounded-lg bg-[#111111] border border-[#27272A] transition-colors duration-300 hover:border-[#2DD4BF] focus:border-[#2DD4BF] focus:outline-none group">
              <svg className="mb-2 text-slate-400 group-hover:text-[#2DD4BF] transition-colors" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              <span className="text-[10px] font-medium text-slate-400 group-hover:text-white uppercase tracking-widest transition-colors">Novo Atendimento</span>
            </button>

            <button className="flex flex-col items-center justify-center h-24 rounded-lg bg-[#111111] border border-[#27272A] transition-colors duration-300 hover:border-[#2DD4BF] focus:border-[#2DD4BF] focus:outline-none group">
              <svg className="mb-2 text-slate-400 group-hover:text-[#2DD4BF] transition-colors" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <span className="text-[10px] font-medium text-slate-400 group-hover:text-white uppercase tracking-widest transition-colors">Gerar Orçamento</span>
            </button>

            <button className="flex flex-col items-center justify-center h-24 rounded-lg bg-[#111111] border border-[#27272A] transition-colors duration-300 hover:border-[#2DD4BF] focus:border-[#2DD4BF] focus:outline-none group">
              <svg className="mb-2 text-slate-400 group-hover:text-[#2DD4BF] transition-colors" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span className="text-[10px] font-medium text-slate-400 group-hover:text-white uppercase tracking-widest transition-colors">Cadastrar Cliente</span>
            </button>

            <button className="flex flex-col items-center justify-center h-24 rounded-lg bg-[#111111] border border-[#27272A] transition-colors duration-300 hover:border-[#2DD4BF] focus:border-[#2DD4BF] focus:outline-none group">
              <svg className="mb-2 text-slate-400 group-hover:text-[#2DD4BF] transition-colors" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
              <span className="text-[10px] font-medium text-slate-400 group-hover:text-white uppercase tracking-widest transition-colors">Registrar Despesa</span>
            </button>

          </div>
        </section>

        {/* Gestão do Dia */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            Gestão do Dia
          </h2>
          <div className="bg-[#000000] border border-[#27272A] rounded-lg overflow-hidden flex flex-col">
            
            <div className="flex items-center justify-between p-4 border-b border-[#1A1A1A] last:border-0 hover:bg-[#111111] transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-slate-500 group-hover:text-slate-400 transition-colors">09:30</span>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-white tracking-tight">Levantamento Sistema Solar</span>
                  <span className="text-[10px] text-slate-500">Cliente: Empresa Alpha</span>
                </div>
              </div>
              <span className="text-xs font-mono text-[#10B981]">+ R$ 2.450,00</span>
            </div>

            <div className="flex items-center justify-between p-4 border-b border-[#1A1A1A] last:border-0 hover:bg-[#111111] transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-slate-500 group-hover:text-slate-400 transition-colors">14:00</span>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-white tracking-tight">Manutenção Quadro Elétrico</span>
                  <span className="text-[10px] text-slate-500">Cliente: Residencial Figueiras</span>
                </div>
              </div>
              <span className="text-xs font-mono text-[#10B981]">+ R$ 480,00</span>
            </div>

          </div>
        </section>

        {/* Footer info/Context */}
        <footer className="pt-10 flex justify-between items-center border-t border-[#27272A]/50">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-xs text-gray-500 font-medium uppercase tracking-tight">Sincronizado com Aferix Cloud</span>
          </div>
          <span 
            onClick={handleVersionClick}
            className="text-[10px] text-gray-600 font-mono italic cursor-pointer select-none active:text-[#2DD4BF] transition-colors"
          >
            v0.1.0-rc.1
          </span>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;