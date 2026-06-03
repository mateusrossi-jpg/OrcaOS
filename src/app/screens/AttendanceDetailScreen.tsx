import { useEffect, useState, memo } from 'react';
import { 
  ClipboardList, 
  Clock, 
  User, 
  MapPin, 
  FileText, 
  Wrench, 
  Phone, 
  CalendarDays, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { db } from '../../storage/dexieDatabase';
import { Attendance } from '../../domain/attendance';
import { Client } from '../../domain/client';
import { Site } from '../../domain/site';
import { Budget } from '../../domain/budget';
import { Service as WorkOrder } from '../../core/types/business';
import { 
  ScreenContainer, 
  AppHeader, 
  SurfaceCard, 
  SectionLabel, 
  SemanticBadge, 
  Stack,
  Heading,
  ValueBlock
} from '../../ui/system';
import { PrimaryButton, ERPLoader } from '../components/ui';
import { formatCurrencyBRL } from '../../utils/formatters';

const STATUS_LABELS: Record<string, string> = {
  iniciado: 'Iniciado',
  autorizado: 'Autorizado',
  em_execucao: 'Em Execução',
  finalizado: 'Finalizado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  arquivado: 'Arquivado'
};

const STATUS_VARIANTS: Record<string, any> = {
  iniciado: 'info',
  autorizado: 'warning',
  em_execucao: 'accent',
  finalizado: 'success',
  concluido: 'success',
  cancelado: 'danger',
  arquivado: 'default'
};

interface AttendanceDetailScreenProps {
  id: string;
  onBack: () => void;
  onNavigate: (tab: string) => void;
  onOpenBudget?: (budgetId: string) => void;
  onOpenWorkOrder?: (workOrderId: string) => void;
}

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
        // Load Attendance
        const att = await db.attendances.get(id);
        if (!att) return;

        setAttendance(att);

        // Run concurrent loads for linked data
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
        year: 'numeric',
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
      <ScreenContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <ERPLoader message="Carregando detalhes do atendimento..." />
        </div>
      </ScreenContainer>
    );
  }

  if (!attendance) {
    return (
      <ScreenContainer>
        <AppHeader title="Atendimento" onBack={onBack} />
        <div className="text-center py-12 text-[var(--text-muted)]">
          Atendimento não encontrado.
        </div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="pb-32">
      <AppHeader 
        title="Atendimento Operacional" 
        subtitle="Workspace consolidado do ciclo de vida em campo." 
        onBack={onBack} 
      />

      <Stack className="gap-5 mt-4">
        {/* SEÇÃO: CLIENTE */}
        <div className="flex flex-col gap-2">
          <SectionLabel className="ml-1">CLIENTE</SectionLabel>
          <SurfaceCard variant="cinematic" padding="lg" className="border-white/[0.04] bg-gradient-to-b from-white/[0.02] to-transparent">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 flex items-center justify-center text-[var(--accent-gold)]">
                  <User size={16} />
                </div>
                <div>
                  <h4 className="text-[15px] font-black text-white leading-tight">
                    {client?.name || 'Cliente não identificado'}
                  </h4>
                  {client?.phone && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] mt-1">
                      <Phone size={11} />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {site && (
                <div className="flex items-start gap-2 pt-3 border-t border-white/[0.04] text-[11px] text-[var(--text-muted)] leading-relaxed">
                  <MapPin size={12} className="shrink-0 mt-0.5 text-[var(--accent-gold)]" />
                  <span>{site.name} {site.fullAddress && `— ${site.fullAddress}`}</span>
                </div>
              )}
            </div>
          </SurfaceCard>
        </div>

        {/* SEÇÃO: DETALHES DO ATENDIMENTO */}
        <div className="flex flex-col gap-2">
          <SectionLabel className="ml-1">DADOS OPERACIONAIS</SectionLabel>
          <SurfaceCard variant="cinematic" padding="lg" className="border-white/[0.04]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold tracking-widest text-[var(--text-muted)] uppercase">STATUS ATUAL</span>
                  <div className="mt-1">
                    <SemanticBadge 
                      label={(STATUS_LABELS[attendance.status] || attendance.status).toUpperCase()} 
                      variant={STATUS_VARIANTS[attendance.status] || 'neutral'} 
                    />
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-bold tracking-widest text-[var(--text-muted)] uppercase">ID ATENDIMENTO</span>
                  <span className="text-[11px] font-mono text-white/55 mt-1">{(attendance?.id || 'DESC').slice(0, 8)}...</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.04]">
                <div>
                  <span className="text-[9px] font-bold tracking-widest text-[var(--text-muted)] uppercase">CRIADO EM</span>
                  <div className="flex items-center gap-1.5 text-[11px] text-white mt-1">
                    <CalendarDays size={11} className="text-[var(--text-muted)]" />
                    <span>{formatDate(attendance.createdAt)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-bold tracking-widest text-[var(--text-muted)] uppercase">ÚLTIMA ATUALIZAÇÃO</span>
                  <div className="flex items-center gap-1.5 text-[11px] text-white mt-1">
                    <Clock size={11} className="text-[var(--text-muted)]" />
                    <span>{formatDate(attendance.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </SurfaceCard>
        </div>

        {/* SEÇÃO: ORÇAMENTO */}
        <div className="flex flex-col gap-2">
          <SectionLabel className="ml-1">PROPOSTA COMERCIAL</SectionLabel>
          <SurfaceCard variant="cinematic" padding="lg" className="border-white/[0.04]">
            {budget ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-[var(--accent-gold)]" />
                    <strong className="text-ui-md font-bold text-white leading-tight">
                      {budget.title}
                    </strong>
                  </div>
                  <SemanticBadge 
                    label={budget.status.toUpperCase()} 
                    variant={budget.status === 'finalizado' ? 'success' : 'info'} 
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                  <div>
                    <span className="text-[9px] font-bold tracking-widest text-[var(--text-muted)] uppercase">FATURAMENTO</span>
                    <strong className="text-[15px] font-mono font-black text-white block mt-0.5">
                      {formatCurrencyBRL(budget.chargedValue || 0)}
                    </strong>
                  </div>
                  <PrimaryButton 
                    onClick={() => onOpenBudget?.(budget.id)}
                    className="py-2.5 px-4 text-[11px] font-bold tracking-wider uppercase rounded-lg"
                  >
                    ABRIR ORÇAMENTO
                  </PrimaryButton>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <p className="text-[12px] text-[var(--text-muted)] mb-3">
                  Nenhum orçamento comercial vinculado a este atendimento.
                </p>
                <PrimaryButton 
                  onClick={handleCreateBudget}
                  className="py-3 px-6 text-[11px] font-black tracking-widest uppercase rounded-xl"
                >
                  CRIAR ORÇAMENTO
                </PrimaryButton>
              </div>
            )}
          </SurfaceCard>
        </div>

        {/* SEÇÃO: ORDEM DE SERVIÇO */}
        {workOrder ? (
          <div className="flex flex-col gap-2">
            <SectionLabel className="ml-1">EXECUÇÃO EM CAMPO</SectionLabel>
            <SurfaceCard variant="cinematic" padding="lg" className="border-white/[0.04]">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Wrench size={16} className="text-[var(--accent-gold)]" />
                    <strong className="text-ui-md font-bold text-white leading-tight">
                      {workOrder.title}
                    </strong>
                  </div>
                  <SemanticBadge 
                    label={workOrder.status === 'in-progress' ? 'EXECUTANDO' : 'CONCLUÍDO'} 
                    variant={workOrder.status === 'in-progress' ? 'warning' : 'success'} 
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                  <div>
                    <span className="text-[9px] font-bold tracking-widest text-[var(--text-muted)] uppercase">PRIORIDADE</span>
                    <strong className="text-[12px] font-bold text-white block mt-0.5 uppercase">
                      {workOrder.priority || 'Normal'}
                    </strong>
                  </div>
                  <PrimaryButton 
                    onClick={() => onOpenWorkOrder?.(workOrder.id)}
                    className="py-2.5 px-4 text-[11px] font-bold tracking-wider uppercase rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                  >
                    ABRIR OS
                  </PrimaryButton>
                </div>
              </div>
            </SurfaceCard>
          </div>
        ) : (
          budget && (
            <div className="text-center py-2 text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
              Aguardando aprovação comercial para gerar OS de execução
            </div>
          )
        )}
      </Stack>
    </ScreenContainer>
  );
});
