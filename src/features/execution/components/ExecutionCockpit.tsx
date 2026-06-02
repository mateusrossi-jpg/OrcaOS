import React, { useState, useEffect } from 'react';
import { ExecutionHeader } from './ExecutionHeader';
import { ChecklistExecutionPanel } from './ChecklistExecutionPanel';
import { db } from '../../../storage/dexieDatabase';
import { Asset } from '../../../domain/asset';
import { AssetExecution } from '../../../domain/assetExecution';
import { PrimaryButton } from '../../../app/components/ui';
import { CheckCircle2 } from 'lucide-react';
import { ExecutionClosingFlow } from './ExecutionClosingFlow';

interface ExecutionCockpitProps {
  readonly workOrderId: string;
  readonly clientName: string;
  readonly onExit: () => void;
}

export const ExecutionCockpit: React.FC<ExecutionCockpitProps> = ({ workOrderId, clientName, onExit }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [executions, setExecutions] = useState<Record<string, AssetExecution>>({});
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Pega a OS para saber o siteId (se aplicável), mas como a Modelagem do Aferix pode não ter siteId direto na OS, 
      // ou a OS já ter a lista de ativos, vamos simplificar e buscar todos os ativos dessa OS.
      // Se não houver vínculo direto, buscamos todos os ativos da empresa para teste.
      const workOrder = await db.workOrders.get(workOrderId);
      let foundAssets: Asset[] = [];
      if (workOrder?.siteId) {
        foundAssets = await db.assets.where('siteId').equals(workOrder.siteId).toArray();
      } else {
        foundAssets = await db.assets.toArray(); // fallback
      }
      
      const foundExecutions = await db.assetExecutions.where('workOrderId').equals(workOrderId).toArray();
      const execMap: Record<string, AssetExecution> = {};
      foundExecutions.forEach(ex => {
        execMap[ex.assetId] = ex;
      });

      setAssets(foundAssets);
      setExecutions(execMap);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [workOrderId]);

  const completedCount = Object.values(executions).filter(ex => 
    ex.checklistResults && ex.checklistResults.every(r => r.status !== 'pending')
  ).length;

  const totalCount = assets.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const handleSelectAsset = (id: string) => {
    setActiveAssetId(id);
  };

  const handleSaveExecution = async (assetId: string, execution: Partial<AssetExecution>) => {
    try {
      let currentEx = executions[assetId];
      if (!currentEx) {
        currentEx = {
          id: crypto.randomUUID(),
          companyId: 'default',
          workspaceId: 'default',
          workOrderId,
          assetId,
          syncStatus: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          measurements: {},
          checklistResults: [],
        } as AssetExecution;
      }

      const updatedEx = { ...currentEx, ...execution, updatedAt: new Date().toISOString() };
      await db.assetExecutions.put(updatedEx as AssetExecution);
      
      setExecutions(prev => ({ ...prev, [assetId]: updatedEx as AssetExecution }));
    } catch (err) {
      console.error(err);
    }
  };

  const activeAssetIndex = assets.findIndex(a => a.id === activeAssetId);

  const handlePrevious = () => {
    if (activeAssetIndex > 0) setActiveAssetId(assets[activeAssetIndex - 1].id);
  };

  const handleNext = () => {
    if (activeAssetIndex < assets.length - 1) {
      setActiveAssetId(assets[activeAssetIndex + 1].id);
    } else {
      setActiveAssetId(null);
    }
  };

  const handleFinish = () => {
    setIsFinishing(true);
  };

  if (isFinishing) {
    return (
      <ExecutionClosingFlow 
        workOrderId={workOrderId}
        clientName={clientName}
        executions={executions}
        totalAssets={totalCount}
        onExit={onExit}
      />
    );
  }

  if (activeAssetId) {
    const activeAsset = assets[activeAssetIndex];
    return (
      <ChecklistExecutionPanel
        assetName={activeAsset.name}
        initialExecution={executions[activeAssetId] || {}}
        templateItems={[
          { key: 't1', description: 'Limpeza dos filtros' },
          { key: 't2', description: 'Verificação de ruídos e vibrações' },
          { key: 't3', description: 'Medição de corrente do compressor' }
        ]}
        measurementTemplates={[]}
        onClose={() => setActiveAssetId(null)}
        onSave={(ex) => handleSaveExecution(activeAssetId, ex)}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isFirst={activeAssetIndex === 0}
        isLast={activeAssetIndex === assets.length - 1}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-surface-900 z-40 flex flex-col overflow-hidden animate-fade-in">
      <ExecutionHeader 
        clientName={clientName} 
        workOrderId={workOrderId} 
        status="Em andamento"
        onBack={onExit} 
      />

      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {/* Cockpit Header */}
        <div className="bg-surface-800 rounded-[20px] p-5 mb-6 border border-surface-700 shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-[40px] pointer-events-none" />
          <h2 className="text-[12px] font-bold text-text-muted uppercase tracking-widest mb-1">Status da OS</h2>
          <div className="text-4xl font-black text-white font-mono tracking-tighter mb-4">
            {completedCount}<span className="text-surface-500">/{totalCount}</span>
          </div>
          <div className="w-full bg-surface-700 h-3 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-brand-500 transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Lista de Batalha */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest ml-2 mb-2">Ativos Pendentes & Concluídos</h3>
          
          {isLoading ? (
            <div className="text-center text-text-muted py-8 text-sm">Carregando ativos...</div>
          ) : (
            assets.map(asset => {
              const ex = executions[asset.id];
              const isDone = ex?.checklistResults && ex.checklistResults.every(r => r.status !== 'pending') && ex.checklistResults.length > 0;

              return (
                <button
                  key={asset.id}
                  onClick={() => handleSelectAsset(asset.id)}
                  className="w-full text-left bg-surface-800 border border-surface-700 hover:border-surface-600 rounded-2xl p-4 active:scale-[0.98] transition-all flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-white leading-tight">{asset.name}</span>
                    <span className="text-[11px] text-text-muted font-mono mt-1">{asset.tag || 'Sem TAG'}</span>
                  </div>
                  {isDone ? (
                    <div className="w-8 h-8 rounded-full bg-status-success/20 text-status-success flex items-center justify-center">
                      <CheckCircle2 size={16} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-700 border border-surface-600 text-text-tertiary flex items-center justify-center text-xs font-bold">
                      {assets.findIndex(a => a.id === asset.id) + 1}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Footer fixo para Encerramento */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface-900/90 backdrop-blur-md border-t border-surface-800">
        <PrimaryButton 
          onClick={handleFinish}
          disabled={completedCount < totalCount || totalCount === 0 || isFinishing}
          className="w-full py-4 text-[13px] rounded-xl shadow-[0_0_20px_rgba(212,169,78,0.2)]"
        >
          {isFinishing ? 'GERANDO...' : 'ENCERRAR E GERAR LAUDO'}
        </PrimaryButton>
      </div>
    </div>
  );
};
