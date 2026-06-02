import { memo, useState } from "react";
import type { AppTab } from "../appTypes";
import { ScreenContainer, Title, Body, AppHeader } from '../../ui/system';
import { PrimaryButton, SecondaryButton, Input, Select, Modal } from '../components/ui';
import { db } from '../../storage/dexieDatabase';

const generateId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);

interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
  account?: any;
}

export const HomeScreen = memo(function HomeScreen({
  onNavigate,
  account,
}: HomeScreenProps) {
  const [isExpressModalOpen, setIsExpressModalOpen] = useState(false);
  const [expressTitle, setExpressTitle] = useState('');
  const [expressType, setExpressType] = useState('Climatização');

  const handleCreateExpressOS = async () => {
    if (!expressTitle) return;

    // Criar Cliente Avulso, Local Atual, OS nos bastidores (FASE 2)
    const companyId = 'express-company';
    const workspaceId = 'express-workspace';
    const now = new Date().toISOString();
    const clientId = generateId();
    const siteId = generateId();
    const workOrderId = generateId();

    await db.transaction('rw', db.clients, db.sites, db.workOrders, async () => {
      await db.clients.add({
        id: clientId,
        companyId,
        workspaceId,
        name: 'Cliente Avulso (Express)',
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending'
      });

      await db.sites.add({
        id: siteId,
        companyId,
        workspaceId,
        clientId,
        name: 'Local Atual',
        fullAddress: 'Endereço não informado',
        isMain: true,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending'
      });

      await db.workOrders.add({
        id: workOrderId,
        companyId,
        workspaceId,
        clientId,
        siteId,
        title: expressTitle,
        description: `OS Gerada via Express (${expressType})`,
        status: 'in-progress',
        paymentStatus: 'pending',
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending'
      });
    });

    setIsExpressModalOpen(false);
    
    // Na próxima fase (P0) isso deve direcionar direto pro Cockpit refatorado, 
    // mas por hora navegamos para a view 'base' com a OS selecionada.
    // Como a integração state/context completa será feita depois, enviamos pra 'base'.
    onNavigate('base');
  };

  const handleTestNow = async () => {
    // FASE 2: Testar Agora utiliza o DemoBootstrapService que já preparamos (Shopping Exemplo)
    const { DemoBootstrapService } = await import('../../services/DemoBootstrapService');
    await DemoBootstrapService.bootstrapIfEmpty();
    onNavigate('base');
  };

  return (
    <ScreenContainer className="pb-32 bg-surface-900 flex flex-col items-center justify-center min-h-[90vh]">
      
      <div className="w-full max-w-sm px-6 py-12 flex flex-col gap-12 text-center animate-fade-in">
        
        <div className="flex flex-col gap-4">
          <div className="mx-auto w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(212,169,78,0.3)]">
            <span className="text-surface-900 font-black text-2xl tracking-tighter">A</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-4">AFERIX</h1>
          <p className="text-text-secondary text-lg leading-relaxed">
            O jeito mais rápido de gerar <br/>
            <span className="text-white font-bold">laudos técnicos profissionais.</span>
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <PrimaryButton 
            onClick={handleTestNow}
            className="w-full py-5 text-[14px] shadow-[0_0_24px_rgba(212,169,78,0.25)] rounded-xl"
          >
            TESTAR AGORA (DEMO)
          </PrimaryButton>

          <SecondaryButton 
            onClick={() => setIsExpressModalOpen(true)}
            className="w-full py-5 text-[14px] bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] rounded-xl"
          >
            NOVA OS EXPRESSA
          </SecondaryButton>

          <button 
            className="mt-6 text-sm font-bold text-text-muted hover:text-text-secondary tracking-widest uppercase transition-colors"
            onClick={() => onNavigate('pulse')}
          >
            ENTRAR NA EMPRESA
          </button>
        </div>
      </div>

      {isExpressModalOpen && (
        <Modal 
          isOpen={true} 
          onClose={() => setIsExpressModalOpen(false)}
          title="Nova OS Expressa"
        >
          <div className="flex flex-col gap-5 py-4">
            <Input 
              label="Título" 
              placeholder="Ex: PMOC Shopping Central" 
              value={expressTitle}
              onChange={e => setExpressTitle(e.target.value)}
              autoFocus
            />
            
            <Select 
              label="Tipo de Serviço"
              value={expressType}
              onChange={val => setExpressType(val)}
            >
              <option value="Climatização">Climatização</option>
              <option value="Elétrica">Elétrica</option>
              <option value="Solar">Solar</option>
              <option value="Hidráulica">Hidráulica</option>
              <option value="Automação">Automação</option>
            </Select>

            <PrimaryButton 
              onClick={handleCreateExpressOS} 
              disabled={!expressTitle}
              className="mt-4 py-4 rounded-xl"
            >
              INICIAR SERVIÇO
            </PrimaryButton>
          </div>
        </Modal>
      )}

    </ScreenContainer>
  );
});
