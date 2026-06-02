import React, { useState, useEffect } from 'react';
import { Shield, Mail, KeyRound, AlertTriangle, ArrowRight } from 'lucide-react';
import { AuthService } from '../../../services/AuthService';

interface RoleSelectionScreenProps {
  onComplete: () => void;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onComplete }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Just for visual in this MVP
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Seed default admin just in case
    AuthService.seedDefaultAdmin();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // In this local MVP, we only validate the email against Dexie.
      // Password is intentionally ignored since we don't have a backend crypto setup.
      const user = await AuthService.login(email);
      
      if (user) {
        onComplete();
      } else {
        setError('Acesso negado. Usuário não encontrado ou inativo. (Dica: tente admin@aferix.com)');
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar acessar o sistema.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center p-6 page-fade-in overflow-y-auto">
      
      {/* HEADER LOGO */}
      <div className="flex flex-col items-center mb-10 mt-10">
        <div className="w-16 h-16 bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
          <img src="/icons/aferix-splash-mark.svg" alt="Aferix Logo" className="w-8 h-8 opacity-80" />
        </div>
        <h1 className="text-3xl font-black tracking-widest text-white uppercase text-center">
          AFERIX
        </h1>
        <p className="text-sm font-bold text-white/40 tracking-widest uppercase mt-2 text-center max-w-[280px]">
          Executive Operating System
        </p>
      </div>

      {/* LOGIN FORM */}
      <div className="w-full max-w-[360px] flex flex-col gap-4 pb-10">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-1">E-mail corporativo</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={16} className="text-white/30" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-white/30 focus:bg-[#1E293B] transition-all"
                placeholder="nome@empresa.com.br"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-1">Senha (Opcional no MVP)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <KeyRound size={16} className="text-white/30" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-white/30 focus:bg-[#1E293B] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-white text-black hover:bg-white/90 active:scale-[0.98] transition-all font-bold text-sm tracking-wide rounded-xl py-4 mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
          >
            {isLoading ? 'Autenticando...' : 'Entrar no Workspace'}
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>
      
      <div className="mt-auto pb-6 opacity-40 flex items-center gap-2">
        <Shield size={12} className="text-white" />
        <span className="text-[10px] uppercase tracking-widest font-bold text-white">Aferix Security Layer Active</span>
      </div>
    </div>
  );
};
