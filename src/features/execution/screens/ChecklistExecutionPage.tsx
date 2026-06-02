import React, { useState } from 'react';
import { ArrowLeft, Check, AlertTriangle, ChevronRight } from 'lucide-react';

interface TaskItem {
  id: string;
  description: string;
  status: 'PENDING' | 'OK' | 'NOK';
}

export const ChecklistExecutionPage: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: '1', description: 'Limpeza de filtros', status: 'PENDING' },
    { id: '2', description: 'Medição de corrente', status: 'PENDING' },
    { id: '3', description: 'Verificação de ruído', status: 'PENDING' },
    { id: '4', description: 'Aperto de bornes', status: 'PENDING' },
  ]);

  const markAllOk = () => {
    // Haptic feedback API simulation
    if (navigator.vibrate) navigator.vibrate(50);
    setTasks(tasks.map(t => ({ ...t, status: 'OK' })));
  };

  const toggleTask = (id: string, newStatus: 'OK' | 'NOK') => {
    if (navigator.vibrate) navigator.vibrate(20);
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const allDone = tasks.every(t => t.status !== 'PENDING');

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background overflow-hidden">
      {/* CABEÇALHO */}
      <div className="flex-none bg-surface-900 border-b border-surface-800 p-4 pt-12 flex items-center gap-3 z-10 shadow-md">
        <button className="w-10 h-10 flex items-center justify-center bg-surface-800 rounded-full hover:bg-surface-700 transition-colors">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-sm font-black text-white tracking-widest uppercase">Chiller Central A-02</h1>
          <span className="text-[10px] text-text-tertiary">OS #1234 • Ativo 2/3</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-40">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Tarefas de Checklist</h2>
          <button 
            onClick={markAllOk}
            className="text-[10px] font-black text-[#050505] bg-[var(--accent-green)] px-3 py-1.5 rounded uppercase tracking-widest active:scale-95 transition-transform"
          >
            MARCAR TUDO OK
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {tasks.map(task => (
            <div key={task.id} className="bg-surface-900 border border-surface-800 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm text-white font-medium">{task.description}</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleTask(task.id, 'NOK')}
                  className={`w-12 h-10 rounded-lg flex items-center justify-center transition-colors ${task.status === 'NOK' ? 'bg-status-error text-white' : 'bg-surface-800 text-text-tertiary'}`}
                >
                  <AlertTriangle size={18} />
                </button>
                <button 
                  onClick={() => toggleTask(task.id, 'OK')}
                  className={`w-12 h-10 rounded-lg flex items-center justify-center transition-colors ${task.status === 'OK' ? 'bg-[var(--accent-green)] text-[#050505]' : 'bg-surface-800 text-text-tertiary'}`}
                >
                  <Check size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AUTO SAVE + PRÓXIMO ATIVO */}
      {allDone && (
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-surface-900 border-t border-surface-800 z-20 animate-fade-in flex flex-col gap-2 items-center">
          <span className="text-[10px] text-[var(--accent-green)] font-bold tracking-widest uppercase flex items-center gap-1">
            <Check size={12} /> Salvo Automaticamente
          </span>
          <button className="w-full max-w-md bg-white text-[#050505] font-black text-sm uppercase tracking-widest py-5 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
            PRÓXIMO ATIVO <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
