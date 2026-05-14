import React, { useEffect, useState } from 'react';
import { ProCheckoutButton } from '../components/ProCheckoutButton';

export const PlansPage: React.FC = () => {
  const [showCancelToast, setShowCancelToast] = useState(false);

  // Detecta se o usuário foi redirecionado pelo Stripe (cancel_url)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('canceled') === 'true') {
      setShowCancelToast(true);
      // Remove o parâmetro da URL para limpar a barra do navegador
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Esconde o toast após 5 segundos
      setTimeout(() => setShowCancelToast(false), 5000);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-gray-100 font-sans selection:bg-[#2DD4BF]/30 flex flex-col">
      
      {/* Toast de Cancelamento */}
      {showCancelToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 bg-[#161618] border border-[#F59E0B]/50 text-[#F59E0B] px-4 py-3 rounded-lg shadow-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span className="text-sm font-medium">Checkout cancelado. Assine quando estiver pronto.</span>
          </div>
        </div>
      )}

      {/* Navegação Superior Simples */}
      <nav className="p-6 md:p-10">
        <button 
          onClick={() => window.history.back()}
          className="text-sm font-medium text-slate-400 hover:text-[#2DD4BF] transition-colors flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Voltar ao Dashboard
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
        <header className="text-center space-y-4 mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Invista no seu <span className="text-[#2DD4BF]">Negócio</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
            Acesse cálculos avançados, exporte propostas profissionais em PDF e organize seus atendimentos com a versão completa do Aferix.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          
          {/* Card: Plano Livre */}
          <section className="bg-[#161618] border border-[#27272A] rounded-2xl p-8 flex flex-col justify-between transition-colors hover:border-[#27272A]/80">
            <div>
              <div className="inline-flex items-center px-2.5 py-1 rounded bg-[#27272A]/50 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
                Plano Base
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Aferix Livre</h2>
              <div className="text-4xl font-bold text-white font-mono mb-6">
                R$ 0<span className="text-sm text-slate-500 font-sans font-medium">/mês</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-sm text-slate-300">
                  <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#27272A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Cálculos elétricos essenciais
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-300">
                  <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#27272A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Levantamento de campo
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-300">
                  <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#27272A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Armazenamento local
                </li>
              </ul>
            </div>
            
            <button disabled className="w-full py-3 bg-[#1A1A1C] border border-[#27272A] text-slate-500 font-bold text-xs rounded uppercase tracking-widest cursor-not-allowed">
              Seu plano atual
            </button>
          </section>

          {/* Card: Plano PRO (Destaque) */}
          <section className="bg-[#161618] border border-[#2DD4BF] rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden group shadow-[0_0_40px_rgba(45,212,191,0.05)]">
            {/* Efeito visual de fundo */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-48 h-48 bg-[#2DD4BF] opacity-10 blur-[80px] rounded-full"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <div className="inline-flex items-center px-2.5 py-1 rounded bg-[#2DD4BF]/10 text-xs font-bold text-[#2DD4BF] uppercase tracking-widest">
                  Recomendado
                </div>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Cancele quando quiser</span>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Aferix Profissional</h2>
              <div className="text-4xl font-bold text-[#2DD4BF] font-mono mb-6 flex items-end gap-1">
                R$ 29<span className="text-2xl">,90</span><span className="text-sm text-slate-500 font-sans font-medium mb-1">/mês</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-sm text-slate-200">
                  <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Todos os cálculos e dimensionamentos técnicos
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-200">
                  <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Relatórios e Orçamentos com o seu logotipo
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-200">
                  <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Cálculos financeiros (Margem e Descontos reais)
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-200">
                  <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Exportação em PDF de alto contraste
                </li>
              </ul>
            </div>
            
            <div className="relative z-10 mt-auto">
              <ProCheckoutButton />
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};