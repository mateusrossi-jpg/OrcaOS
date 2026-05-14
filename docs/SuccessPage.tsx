import React, { useEffect } from 'react';

export const SuccessPage: React.FC = () => {
  
  // Opcional: Aqui você pode forçar a revalidação do hook useSubscription 
  // ou disparar eventos de analytics de conversão se necessário no futuro.
  useEffect(() => {
    // Dispara fogos virtuais, recarrega o estado do usuário, etc.
    console.log("Usuário convertido para PRO com sucesso!");
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-gray-100 font-sans selection:bg-[#2DD4BF]/30 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Efeito de iluminação de fundo (Sucesso) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#10B981] opacity-5 blur-[120px] rounded-full pointer-events-none"></div>

      <main className="max-w-md w-full flex flex-col items-center relative z-10">
        
        {/* Ícone de Check com pulso (LED de Sucesso) */}
        <div className="w-20 h-20 bg-[#161618] border border-[#27272A] rounded-2xl flex items-center justify-center mb-8 relative shadow-[0_0_30px_rgba(16,185,129,0.1)]">
          <div className="absolute inset-0 bg-[#10B981] opacity-20 blur-xl rounded-2xl animate-pulse"></div>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        {/* Tipografia de Confirmação */}
        <header className="text-center space-y-4 mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Bem-vindo ao <span className="text-[#2DD4BF]">Aferix PRO</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Seu pagamento foi aprovado e a assinatura está ativa. 
            Todos os cálculos avançados, exportação premium em PDF e relatórios na nuvem já estão liberados para o seu perfil.
          </p>
        </header>

        {/* Ações (Redirecionamento para o App) */}
        <div className="w-full space-y-4">
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-4 bg-[#2DD4BF] text-[#0A0A0B] font-bold text-xs rounded uppercase tracking-widest transition-colors hover:bg-[#26bba8]"
          >
            Abrir Painel de Controle
          </button>
          <p className="text-center text-[10px] text-slate-500 font-mono tracking-widest uppercase">
            Sincronização concluída
          </p>
        </div>

      </main>
    </div>
  );
};