import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, X, Mail } from 'lucide-react';
import { ScreenContainer, AppHeader, Section, SurfaceCard } from '../../../ui/system';
import { AuthService } from '../../../services/AuthService';
import { TeamMember } from '../../../storage/dexieDatabase';

export const TeamWorkspace: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'MANAGER' | 'SALES' | 'FIELD' | 'CUSTOMER'>('FIELD');
  const [error, setError] = useState('');

  const loadMembers = async () => {
    try {
      const user = AuthService.getActiveUser();
      if (user) {
        const team = await AuthService.getTeamMembers(user.companyId);
        setMembers(team);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = AuthService.getActiveUser();
      if (!user) throw new Error('Não autenticado');

      await AuthService.createTeamMember({
        name,
        email,
        role,
        companyId: user.companyId,
        workspaceId: user.workspaceId,
        status: 'active'
      });
      
      setName('');
      setEmail('');
      setRole('FIELD');
      setShowAddForm(false);
      loadMembers();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar prestador.');
    }
  };

  const handleToggleStatus = async (id: string) => {
    await AuthService.toggleMemberStatus(id);
    loadMembers();
  };

  const roleColors = {
    OWNER: 'text-[var(--accent-gold)] border-[var(--accent-gold)]',
    MANAGER: 'text-[var(--accent-red)] border-[var(--accent-red)]',
    SALES: 'text-[var(--accent-yellow)] border-[var(--accent-yellow)]',
    FIELD: 'text-[var(--accent-blue)] border-[var(--accent-blue)]',
    CUSTOMER: 'text-neutral-400 border-neutral-600',
  };

  const roleNames = {
    OWNER: 'Proprietário',
    MANAGER: 'Gestor',
    SALES: 'Comercial',
    FIELD: 'Técnico',
    CUSTOMER: 'Cliente'
  };

  return (
    <ScreenContainer className="pb-32 bg-[var(--bg-primary)]">
      <AppHeader title="Gestão de Equipe" />

      <div className="px-6 py-6 flex flex-col gap-6">
        
        <button 
          onClick={() => setShowAddForm(true)}
          className="w-full bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border border-[var(--accent-blue)]/20 hover:bg-[var(--accent-blue)] hover:text-black active:scale-[0.98] transition-all font-black text-sm uppercase tracking-widest rounded-none py-4 flex items-center justify-center gap-2 cursor-pointer"
        >
          <UserPlus size={16} /> Adicionar Membro
        </button>

        {showAddForm && (
          <SurfaceCard padding="lg" className="border-white/10 relative rounded-none">
            <button onClick={() => setShowAddForm(false)} className="absolute top-4 right-4 text-white/40 hover:text-white cursor-pointer">
              <X size={20} />
            </button>
            <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4">Novo Membro</h2>
            
            {error && <p className="text-status-error text-xs mb-4">{error}</p>}
            
            <form onSubmit={handleAddMember} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-1">Nome Completo</label>
                <input 
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="bg-white/[0.02] border border-white/10 rounded-none px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30"
                  placeholder="Ex: Carlos Silva"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-1">E-mail de Acesso</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-3.5 text-white/30" />
                  <input 
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="bg-white/[0.02] border border-white/10 rounded-none pl-10 pr-4 py-3 w-full text-white text-sm focus:outline-none focus:border-white/30"
                    placeholder="carlos@empresa.com"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-1">Perfil de Acesso (Cargo)</label>
                <select 
                  value={role} onChange={(e) => setRole(e.target.value as any)}
                  className="bg-white/[0.02] border border-white/10 rounded-none px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 appearance-none"
                >
                  <option value="FIELD">Técnico em Campo (Execução)</option>
                  <option value="SALES">Comercial (Propostas)</option>
                  <option value="MANAGER">Gestor (Controle de OS)</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-white/5 border border-white/10 hover:bg-white hover:text-black text-white font-black uppercase tracking-widest text-xs py-3.5 rounded-none mt-2 cursor-pointer transition-all">
                Salvar Membro
              </button>
            </form>
          </SurfaceCard>
        )}

        <Section className="gap-4">
          <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Users size={14} /> Membros Ativos ({members.length})
          </h2>
          
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <div className="text-white/40 text-sm text-center py-6">Carregando equipe...</div>
            ) : members.length === 0 ? (
              <div className="text-white/40 text-sm text-center py-6">Nenhum membro encontrado.</div>
            ) : (
              members.map(member => (
                <SurfaceCard key={member.id} padding="md" className={`border-white/5 flex flex-col gap-3 rounded-none ${member.status === 'inactive' ? 'opacity-50' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{member.name}</span>
                      <span className="text-[10px] text-white/40 mt-0.5">{member.email}</span>
                    </div>
                    <div className={`px-2 py-1 border rounded-none text-[9px] font-black uppercase tracking-widest ${roleColors[member.role]}`}>
                      {roleNames[member.role]}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <Shield size={12} className={member.status === 'active' ? 'text-status-success' : 'text-status-error'} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                        {member.status === 'active' ? 'Ativo' : 'Bloqueado'}
                      </span>
                    </div>
                    
                    {member.role !== 'OWNER' && (
                      <button 
                        onClick={() => handleToggleStatus(member.id)}
                        className="text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-none bg-white/5 border border-white/10 text-white/60 hover:text-white cursor-pointer transition-all active:scale-95"
                      >
                        {member.status === 'active' ? 'Bloquear Acesso' : 'Desbloquear'}
                      </button>
                    )}
                  </div>
                </SurfaceCard>
              ))
            )}
          </div>
        </Section>

      </div>
    </ScreenContainer>
  );
};
