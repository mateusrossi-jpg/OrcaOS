import { generateUUID } from '../../../core/utils/idGenerator';
import { pilotTelemetry } from '../../../services/pilotTelemetryService';
import React, { useState, useEffect, useRef } from 'react';
import { ExecutionHeader } from './ExecutionHeader';
import { ChecklistExecutionPanel } from './ChecklistExecutionPanel';
import { db } from '../../../storage/dexieDatabase';
import { Asset } from '../../../domain/asset';
import { AssetExecution } from '../../../domain/assetExecution';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Wrench, 
  Activity, 
  History, 
  ShieldCheck 
} from 'lucide-react';
import { ExecutionClosingFlow } from './ExecutionClosingFlow';
import { checklistTemplateService } from '../../../services/ChecklistTemplateService';
import { AnomalyCaptureBottomSheet } from '../screens/AnomalyCaptureBottomSheet';
import { 
  SurfaceCard, 
  SectionLabel, 
  Stack, 
  Section 
} from '../../../ui/system';
import { cn } from '../../../utils/ui';

interface ExecutionCockpitProps {
  readonly workOrderId: string;
  readonly clientName: string;
  readonly onExit: () => void;
  readonly onCheckout: () => void;
  readonly onNavigate?: (tab: string) => void;
}

/**
 * ExecutionCockpit: High-fidelity field execution command center.
 * Aligned with AFERIX EXECUTIVE OS (Phase 6 Hardening).
 */
export const ExecutionCockpit: React.FC<ExecutionCockpitProps> = ({ workOrderId, clientName, onExit, onCheckout, onNavigate }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [executions, setExecutions] = useState<Record<string, AssetExecution>>({});
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const [workOrder, setWorkOrder] = useState<any>(null);
  const [showAnomalyCapture, setShowAnomalyCapture] = useState(false);
  const [activeAssetTemplate, setActiveAssetTemplate] = useState<any>(null);
  const [selectedAssetForAnomaly, setSelectedAssetForAnomaly] = useState<Asset | null>(null);

  // PILOT TELEMETRY (FASE 4)
  const completeFlowRef = useRef<((abandoned?: boolean) => void) | null>(null);

  useEffect(() => {
    const endTrack = pilotTelemetry.trackScreen('ExecutionCockpit');
    completeFlowRef.current = pilotTelemetry.startFlow('os_execution', { workOrderId });
    
    return () => {
      endTrack();
      if (completeFlowRef.current) {
        completeFlowRef.current(true); // Abandon by default
      }
    };
  }, [workOrderId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const wo = await db.workOrders.get(workOrderId);
      setWorkOrder(wo);
      let foundAssets: Asset[] = [];
      
      if (wo?.assetIds && wo.assetIds.length > 0) {
        foundAssets = await db.assets.where('id').anyOf(wo.assetIds).toArray();
      } else if (wo?.siteId) {
        foundAssets = await db.assets.where('siteId').equals(wo.siteId).toArray();
      } else if (wo?.clientId) {
        foundAssets = await db.assets.where('clientId').equals(wo.clientId).toArray();
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
    ex.checklistResults && ex.checklistResults.length > 0 && ex.checklistResults.every(r => r.status !== 'pending')
  ).length;

  const totalCount = assets.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const handleSelectAsset = async (id: string) => {
    const asset = assets.find(a => a.id === id);
    if (asset) {
      const template = await checklistTemplateService.getTemplateForAsset(asset.category);
      setActiveAssetTemplate(template);
      setActiveAssetId(id);
    }
  };

  const handleSaveExecution = async (assetId: string, execution: Partial<AssetExecution>) => {
    try {
      let currentEx = executions[assetId];
      if (!currentEx) {
        currentEx = {
          id: generateUUID(),
          companyId: workOrder?.companyId || 'demo-company',
          workspaceId: workOrder?.workspaceId || 'demo-workspace',
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

  const handleAllCompliant = async () => {
    if (navigator.vibrate) navigator.vibrate([50, 50, 100]);
    try {
      const updatedExecutions = { ...executions };

      for (const asset of assets) {
        const template = await checklistTemplateService.getTemplateForAsset(asset.category);
        const defaultChecklist = template.checklist.map(item => ({
          ...item,
          itemKey: item.key,
          status: 'compliant' as const
        }));

        const currentEx = executions[asset.id] || {
          id: generateUUID(),
          companyId: workOrder?.companyId || 'demo-company',
          workspaceId: workOrder?.workspaceId || 'demo-workspace',
          workOrderId,
          assetId: asset.id,
          syncStatus: 'pending',
          createdAt: new Date().toISOString(),
          measurements: {},
        };
        
        const updatedEx = {
          ...currentEx,
          checklistResults: defaultChecklist,
          updatedAt: new Date().toISOString()
        } as AssetExecution;
        
        await db.assetExecutions.put(updatedEx);
        updatedExecutions[asset.id] = updatedEx;
      }
      
      setExecutions(updatedExecutions);
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickMarkAssetOk = async (assetId: string) => {
    if (navigator.vibrate) navigator.vibrate(50);
    try {
      const asset = assets.find(a => a.id === assetId);
      if (!asset) return;
      const template = await checklistTemplateService.getTemplateForAsset(asset.category);
      const defaultChecklist = template.checklist.map(item => ({
        itemKey: item.key,
        description: item.description,
        status: 'compliant' as const
      }));

      await handleSaveExecution(assetId, {
        checklistResults: defaultChecklist
      });
      
      window.dispatchEvent(new CustomEvent('aferix_toast', { 
        detail: { type: 'success', message: `${asset.name} marcado como conforme.` } 
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickMarkAssetFail = async (assetId: string, assetName: string) => {
    if (navigator.vibrate) navigator.vibrate(50);
    try {
      const asset = assets.find(a => a.id === assetId);
      if (!asset) return;
      
      // Mark it as non-compliant first
      const template = await checklistTemplateService.getTemplateForAsset(asset.category);
      const defaultChecklist = template.checklist.map(item => ({
        itemKey: item.key,
        description: item.description,
        status: 'non-compliant' as const
      }));

      await handleSaveExecution(assetId, {
        checklistResults: defaultChecklist
      });

      setSelectedAssetForAnomaly(asset);
      setShowAnomalyCapture(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveAnomaly = async (anomalyData: {
    assetId?: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'CRITICAL';
    photoUuids?: string[];
  }) => {
    try {
      const assetId = anomalyData.assetId || selectedAssetForAnomaly?.id || assets[0]?.id || 'general';
      const asset = assets.find(a => a.id === assetId);
      
      const anomaly = {
        id: generateUUID(),
        companyId: workOrder?.companyId || 'demo-company',
        workspaceId: workOrder?.workspaceId || 'demo-workspace',
        clientId: workOrder?.clientId || 'demo-client',
        siteId: workOrder?.siteId || 'demo-site',
        assetId: assetId,
        workOrderId: workOrderId,
        title: `Falha: ${asset?.name || workOrder?.title || 'Geral'}`,
        description: anomalyData.description || '',
        recommendedAction: '',
        severity: anomalyData.severity.toLowerCase() as any,
        status: 'OPEN' as const,
        photoUuids: anomalyData.photoUuids || [],
        createdBy: 'current-tech',
        createdAt: new Date().toISOString()
      };

      await db.anomalies.put(anomaly as any);

      // Ensure asset status is set to non-compliant when saved
      if (assetId && assetId !== 'general') {
        const template = await checklistTemplateService.getTemplateForAsset(asset?.category || '');
        const defaultChecklist = template.checklist.map(item => ({
          itemKey: item.key,
          description: item.description,
          status: 'non-compliant' as const
        }));

        await handleSaveExecution(assetId, {
          checklistResults: defaultChecklist
        });
      }

      setShowAnomalyCapture(false);
      setSelectedAssetForAnomaly(null);
      
      window.dispatchEvent(new CustomEvent('aferix_toast', { 
        detail: { type: 'success', message: 'Relatório de anomalia registrado.' } 
      }));
    } catch (err) {
      console.error("Erro ao salvar anomalia:", err);
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
        onCheckout={onCheckout}
        onCompleteFlow={(abandoned) => {
          if (completeFlowRef.current) {
            completeFlowRef.current(abandoned);
            completeFlowRef.current = null;
          }
        }}
      />
    );
  }

  if (activeAssetId) {
    const activeAsset = assets.find(a => a.id === activeAssetId);
    if (!activeAsset || !activeAssetTemplate) return null;
    
    return (
      <ChecklistExecutionPanel
        assetName={activeAsset.name}
        initialExecution={executions[activeAssetId] || {}}
        templateItems={activeAssetTemplate.checklist}
        measurementTemplates={activeAssetTemplate.measurements}
        onClose={() => {
           setActiveAssetId(null);
           setActiveAssetTemplate(null);
        }}
        onSave={(ex) => handleSaveExecution(activeAssetId, ex)}
        workOrder={workOrder}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-[#06080B] z-[1000] flex flex-col overflow-hidden animate-in slide-in-from-right-6 duration-500">
      {/* ── Atmospheric Background Glows ── */}
      <div className="absolute top-[-5%] left-[-10%] w-[80%] h-[45%] bg-[#D4AF37]/5 pointer-events-none blur-[120px] z-0" />
      <div className="absolute top-[30%] right-[-15%] w-[50%] h-[40%] bg-[#0A84FF]/5 pointer-events-none blur-[100px] z-0" />
      <div className="absolute bottom-[15%] left-[-10%] w-[50%] h-[35%] bg-[#47C46A]/4 pointer-events-none blur-[100px] z-0" />

      {/* ── Header ── */}
      <div className="w-full max-w-md mx-auto shrink-0 relative z-10">
        <ExecutionHeader
          clientName={clientName}
          workOrderId={workOrderId}
          status="Em execução"
          onBack={onExit}
        />
      </div>

      {/* ── Scrollable content ── */}
      <div 
        className="flex-1 overflow-y-auto relative z-10"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 140px)' }}
      >
        <div className="flex flex-col gap-8 px-5 pt-6 pb-2 max-w-md mx-auto">

          {/* TACTICAL QUICK ACCESS */}
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate?.('clients')}
              className="flex-1 h-13 bg-white/[0.03] border border-white/[0.07] rounded-2xl text-[10px] font-black text-white/50 uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-white/[0.05] hover:text-white/70"
              style={{ height: '52px' }}
            >
              Dossiê Cliente <ChevronRight size={13} />
            </button>
            <button
              onClick={() => onNavigate?.('assets')}
              className="flex-1 h-13 bg-white/[0.03] border border-white/[0.07] rounded-2xl text-[10px] font-black text-white/50 uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-white/[0.05] hover:text-white/70"
              style={{ height: '52px' }}
            >
              Prontuário <History size={13} />
            </button>
          </div>

          {/* ── PROGRESS HERO CARD ── */}
          <div className="relative bg-gradient-to-br from-[#141720] via-[#0E1016] to-[#080A0D] border border-white/[0.08] rounded-[28px] p-7 shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Radial gold glow */}
            <div className="absolute top-0 right-0 w-52 h-52 bg-[#D4AF37]/10 blur-[60px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#D4AF37]/5 blur-[40px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Status de Conclusão</span>

              {/* Big counter */}
              <div className="flex items-end gap-2 mb-6">
                <span className="text-[72px] font-black text-white font-mono tracking-tighter leading-none">
                  {completedCount}
                </span>
                <span className="text-[32px] font-black text-white/20 font-mono leading-none mb-2">
                  /{totalCount}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full flex flex-col gap-3">
                <div className="w-full bg-white/[0.04] h-2.5 rounded-full overflow-hidden border border-white/[0.04]">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${progressPercent}%`,
                      background: progressPercent === 100
                        ? 'linear-gradient(90deg, #30D158, #47C46A)'
                        : 'linear-gradient(90deg, #D4AF37, #E8BC5A)',
                      boxShadow: progressPercent === 100
                        ? '0 0 16px rgba(48,209,88,0.5)'
                        : '0 0 16px rgba(212,169,74,0.5)'
                    }}
                    role="progressbar"
                    aria-valuenow={progressPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <div className="flex justify-between items-center px-0.5">
                  <span className="text-[10px] font-black text-white/25 uppercase tracking-widest">
                    {progressPercent}% completo
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#D4AF37]" />
                    </span>
                    <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Ao Vivo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MARK ALL OK */}
          {assets.length > 0 && completedCount < totalCount && (
            <button
              onClick={handleAllCompliant}
              className="w-full h-14 bg-[#47C46A]/[0.08] border border-[#47C46A]/20 text-[#47C46A] rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(53,199,89,0.12)] hover:bg-[#47C46A]/15"
            >
              <ShieldCheck size={18} /> MARCAR TUDO OK
            </button>
          )}

          {/* ── ASSET LIST ── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[9px] font-black text-white/25 uppercase tracking-[0.3em]">Malha de Ativos</span>
              <span className="text-[9px] font-black text-white/20 font-mono">{assets.length} equipamentos</span>
            </div>

            {isLoading ? (
              <div className="py-16 text-center flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <Activity size={22} className="text-white/20 animate-pulse" />
                </div>
                <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-white/20">Varrendo sistema...</span>
              </div>
            ) : assets.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center gap-4 bg-white/[0.01] border border-dashed border-white/[0.05] rounded-[24px]">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/20">
                  <Wrench size={22} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[13px] font-black text-white/30 uppercase tracking-tight">Nenhum ativo vinculado</span>
                  <span className="text-[11px] text-white/15">A OS não possui equipamentos associados.</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {assets.map((asset, idx) => {
                  const ex = executions[asset.id];
                  const checklistResults = ex?.checklistResults || [];
                  const hasPending = checklistResults.length === 0 || checklistResults.some(r => r.status === 'pending');
                  const hasFailure = checklistResults.some(r => r.status === 'non-compliant');
                  const isDone = !hasPending;

                  return (
                    <div
                      key={asset.id}
                      className={cn(
                        "w-full border rounded-[24px] p-4 transition-all flex items-center justify-between shadow-lg relative overflow-hidden",
                        isDone && !hasFailure
                          ? "bg-[#47C46A]/[0.04] border-[#47C46A]/25 shadow-[0_0_20px_rgba(53,199,89,0.06)]"
                          : isDone && hasFailure
                          ? "bg-[#E85D5D]/[0.04] border-[#E85D5D]/25 shadow-[0_0_20px_rgba(255,92,92,0.06)]"
                          : "bg-white/[0.02] border-white/[0.07] hover:bg-white/[0.04]"
                      )}
                    >
                      {/* Subtle inner glow */}
                      {isDone && !hasFailure && (
                        <div className="absolute top-0 right-0 w-20 h-20 bg-[#47C46A]/10 blur-[30px] rounded-full pointer-events-none" />
                      )}
                      {isDone && hasFailure && (
                        <div className="absolute top-0 right-0 w-20 h-20 bg-[#E85D5D]/10 blur-[30px] rounded-full pointer-events-none" />
                      )}

                      <div
                        onClick={() => handleSelectAsset(asset.id)}
                        className="flex-1 flex items-center gap-4 cursor-pointer min-w-0"
                      >
                        {/* Status icon/number */}
                        <div className={cn(
                          "w-11 h-11 rounded-2xl flex items-center justify-center font-mono font-black text-[13px] shrink-0 border transition-all",
                          isDone && !hasFailure
                            ? "bg-[#47C46A]/15 text-[#47C46A] border-[#47C46A]/20"
                            : isDone && hasFailure
                            ? "bg-[#E85D5D]/15 text-[#E85D5D] border-[#E85D5D]/20"
                            : "bg-white/[0.04] text-white/25 border-white/[0.06]"
                        )}>
                          {isDone && !hasFailure ? (
                            <CheckCircle2 size={20} />
                          ) : isDone && hasFailure ? (
                            <AlertTriangle size={20} />
                          ) : (
                            (idx + 1).toString().padStart(2, '0')
                          )}
                        </div>

                        {/* Name + tag */}
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="text-[15px] font-black text-white uppercase tracking-tight leading-none truncate">
                            {asset.name}
                          </span>
                          <span className="text-[10px] text-white/25 font-bold uppercase tracking-widest mt-1 truncate">
                            {asset.tag || 'Sem Identificação'}
                          </span>
                        </div>
                      </div>

                      {/* Quick action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleQuickMarkAssetOk(asset.id); }}
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90 cursor-pointer",
                            isDone && !hasFailure
                              ? "bg-[#47C46A] text-black border-transparent shadow-[0_0_12px_rgba(53,199,89,0.4)]"
                              : "bg-white/[0.02] border-white/[0.06] text-white/25 hover:text-[#47C46A] hover:bg-[#47C46A]/10 hover:border-[#47C46A]/20"
                          )}
                          title="Marcar como Conforme"
                        >
                          <CheckCircle2 size={17} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleQuickMarkAssetFail(asset.id, asset.name); }}
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90 cursor-pointer",
                            isDone && hasFailure
                              ? "bg-[#E85D5D] text-white border-transparent shadow-[0_0_12px_rgba(255,92,92,0.4)]"
                              : "bg-white/[0.02] border-white/[0.06] text-white/25 hover:text-[#E85D5D] hover:bg-[#E85D5D]/10 hover:border-[#E85D5D]/20"
                          )}
                          title="Registrar Falha"
                        >
                          <AlertTriangle size={17} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer Action Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Gradient fade from bg */}
        <div className="h-10 bg-gradient-to-t from-[#06080B] to-transparent pointer-events-none" />
        <div 
          className="bg-[#06080B]/95 backdrop-blur-2xl pt-3 px-5"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}
        >
          <div className="max-w-md mx-auto">
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[28px] p-3 flex gap-3 shadow-[0_-20px_60px_rgba(0,0,0,0.4)]">
              <button
                onClick={() => setShowAnomalyCapture(true)}
                className="flex-1 h-14 bg-[#E85D5D]/10 border border-[#E85D5D]/20 text-[#E85D5D] font-black text-[11px] tracking-[0.2em] rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all uppercase hover:bg-[#E85D5D]/15"
              >
                <AlertTriangle size={16} /> Falha
              </button>
              <button
                onClick={handleFinish}
                disabled={isFinishing || (totalCount > 0 && completedCount < totalCount)}
                className="flex-[2] h-14 bg-[#D4AF37] text-black font-black text-[12px] tracking-[0.2em] rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all uppercase shadow-[0_8px_32px_rgba(212,169,74,0.35)] hover:brightness-110 disabled:opacity-30 disabled:grayscale disabled:shadow-none"
              >
                {isFinishing ? 'PROCESSANDO...' : (totalCount === 0 ? 'ENCERRAR' : 'FINALIZAR MISSÃO')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAnomalyCapture && (
        <AnomalyCaptureBottomSheet
          assets={assets}
          executions={executions}
          selectedAsset={selectedAssetForAnomaly}
          onClose={() => {
            setShowAnomalyCapture(false);
            setSelectedAssetForAnomaly(null);
          }}
          onSave={handleSaveAnomaly}
          onSaveExecution={handleSaveExecution}
        />
      )}
    </div>
  );
};
