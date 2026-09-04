import { useEffect, useState, memo } from 'react';
import { 
  Clock, 
  User, 
  MapPin, 
  FileText, 
  Wrench, 
  Phone, 
  CalendarDays, 
  MessageCircle,
  Navigation,
  ArrowUpRight
} from 'lucide-react';
import { db } from '../../storage/dexieDatabase';
import { Attendance } from '../../domain/attendance';
import { Client } from '../../domain/client';
import { Site } from '../../domain/site';
import { Budget } from '../../domain/budget';
import { Service as WorkOrder } from '../../core/types/business';
import { 
  ScreenContainer, 
  ExecutiveHeader,
  SurfaceCard, 
  SectionLabel, 
  SemanticBadge, 
  Stack,
  ValueBlock,
  HeroCard,
  Section,
  Body,
  Subtitle,
  ExecutiveSummaryGrid
} from '../../ui/system';
import { PrimaryButton, ERPLoader } from '../components/ui';
import { formatCurrencyBRL } from '../../utils/formatters';
import { openWhatsApp, openExternalGPS } from '../../utils/mobility';
import { cn } from '../../utils/ui';

interface AttendanceDetailScreenProps {
  id: string;
  onBack: () => void;
  onNavigate: (tab: string) => void;
  onOpenBudget?: (budgetId: string) => void;
  onOpenWorkOrder?: (workOrderId: string) => void;
}

/**
 * AttendanceDetailScreen: High-fidelity Operational Workspace.
 * Aligned with AFERIX EXECUTIVE OS (Phase 6 Hardening).
 */
export const AttendanceDetailScreen = memo(function AttendanceDetailScreen({
  id,
  onBack,
  onNavigate,
  onOpenBudget,
  onOpenWorkOrder
}: AttendanceDetailScreenProps) {
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [site, setSite] = useState<Site | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const att = await db.attendances.get(id);
        if (!att) return;

        setAttendance(att);

        const [loadedClient, loadedSite, loadedBudget, loadedWorkOrder] = await Promise.all([
          att.clientId ? db.clients.get(att.clientId) : Promise.resolve(null),
          att.siteId ? db.sites.get(att.siteId) : Promise.resolve(null),
          db.budgets.where('attendanceId').equals(att.id).first(),
          db.workOrders.where('attendanceId').equals(att.id).first()
        ]);

        setClient(loadedClient || null);
        setSite(loadedSite || null);
        setBudget(loadedBudget || null);
        setWorkOrder(loadedWorkOrder || null);
      } catch (err) {
        console.error('Erro ao carregar dados do atendimento:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id]);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const handleCreateBudget = () => {
    if (!attendance) return;
    localStorage.setItem('aferix_active_attendance_id', attendance.id);
    onNavigate('new-budget');
  };

  if (isLoading) {
    return (
      <ScreenContainer className="bg-aferix-bg flex items-center justify-center min-h-screen">
        <ERPLoader message="Recuperando workspace técnico..." />
      </ScreenContainer>
    );
  }

  if (!attendance) {
    return (
      <ScreenContainer className="bg-aferix-bg">
        <div className="p-10 text-center">
            <Subtitle onClick={onBack} className="cursor-pointer underline">Atendimento não localizado. Voltar.</Subtitle>
        </div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="pb-40 bg-aferix-bg">
      <div className="relative">
         <button 
           onClick={onBack}
           className="absolute top-16 left-6 z-50 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
         >
           <Navigation size={18} className="-rotate-90" />
         </button>
         <ExecutiveHeader userName="Mateus" score={92} />
      </div>

      <div className="px-6 flex flex-col gap-10">
        
        {/* HERO ESTRATÉGICO DO ATENDIMENTO */}
        <HeroCard 
          state={attendance.status === 'em_execucao' ? 'active' : 'upcoming'}
          title={workOrder?.title || budget?.title || "Atendimento Técnico"}
          client={client?.name || "Cliente Individual"}
          time={formatDate(workOrder?.scheduledDate || attendance.createdAt)}
          eta="Ponto de Execução"
          onAction={() => workOrder ? onOpenWorkOrder?.(workOrder.id) : handleCreateBudget()}
        />

        {/* SUMÁRIO EXECUTIVO DO WORKSPACE */}
        <ExecutiveSummaryGrid>
           <ValueBlock 
            label="TRACKING" 
            value={attendance.id.slice(0, 6).toUpperCase()} 
            icon={<Clock size={12} />} 
           />
           <ValueBlock 
            label="PROPOSTA" 
            value={budget ? formatCurrencyBRL(budget.chargedValue) : '---'} 
            icon={<FileText size={12} />} 
            variant={budget?.status === 'finalizado' ? 'success' : 'warning'}
           />
           <ValueBlock 
            label="STATUS_OS" 
            value={workOrder ? workOrder.status.toUpperCase() : 'NENHUMA'} 
            icon={<Wrench size={12} />} 
           />
        </ExecutiveSummaryGrid>

        {/* DETALHES DO CLIENTE E SITE */}
        <Section>
          <SectionLabel>Relacionamento</SectionLabel>
          <SurfaceCard padding="lg" className="border-white/[0.08] bg-white/[0.02] shadow-2xl">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                    <User size={24} />
                  </div>
                  <div>
                    <h4 className="text-[17px] font-black text-white uppercase tracking-tight leading-none">
                      {client?.name || 'CLIENTE_INDIVIDUAL'}
                    </h4>
                    <Subtitle className="mt-1 text-[11px] font-bold text-white/30 uppercase tracking-widest">{client?.documentNumber || 'Documento N/D'}</Subtitle>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openWhatsApp(client?.phone || '')}
                    className="w-10 h-10 rounded-xl bg-[#47C46A]/10 border border-[#47C46A]/20 flex items-center justify-center text-[#47C46A] active:scale-90 transition-all"
                  >
                    <MessageCircle size={20} />
                  </button>
                  <button 
                    onClick={() => window.location.href = `tel:${client?.phone}`}
                    className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/40 active:scale-90 transition-all"
                  >
                    <Phone size={20} />
                  </button>
                </div>
              </div>

              {site && (
                <div 
                  onClick={() => openExternalGPS(site.fullAddress || '')}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] active:bg-white/5 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-[#D4AF37]" />
                    <div className="flex flex-col">
                      <Body className="text-[13px] font-bold text-white/80 leading-none">{site.name}</Body>
                      <Subtitle className="text-[10px] mt-1 truncate max-w-[200px]">{site.fullAddress}</Subtitle>
                    </div>
                  </div>
                  <Navigation size={16} className="text-white/20" />
                </div>
              )}
            </div>
          </SurfaceCard>
        </Section>

        {/* CICLO COMERCIAL */}
        <Section>
          <SectionLabel>Comercial</SectionLabel>
          <SurfaceCard padding="lg" className="border-white/[0.08]">
            {budget ? (
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <Body className="font-black text-white leading-none uppercase">{budget.title}</Body>
                  <div className="flex items-center gap-2 mt-1">
                    <SemanticBadge label={budget.status.toUpperCase()} variant={budget.status === 'finalizado' ? 'success' : 'warning'} className="scale-90 origin-left" />
                    <span className="text-[12px] font-mono font-black text-white/40">{formatCurrencyBRL(budget.chargedValue)}</span>
                  </div>
                </div>
                <button 
                  onClick={() => onOpenBudget?.(budget.id)}
                  className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] active:scale-90 transition-all"
                >
                  <ArrowUpRight size={20} />
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Subtitle className="mb-4">Nenhuma proposta vinculada.</Subtitle>
                <PrimaryButton onClick={handleCreateBudget} className="h-15 !text-[12px] font-black tracking-widest rounded-2xl uppercase">GERAR ORÇAMENTO</PrimaryButton>
              </div>
            )}
          </SurfaceCard>
        </Section>
      </div>
    </ScreenContainer>
  );
});
