import { useEffect, useState, memo } from 'react';
import { ClipboardList, Clock, User, ArrowRight } from 'lucide-react';
import { db } from '../../storage/dexieDatabase';
import { Attendance } from '../../domain/attendance';
import { 
  ScreenContainer, 
  AppHeader, 
  SurfaceCard, 
  SectionLabel, 
  SemanticBadge, 
  Stack 
} from '../../ui/system';
import { QueueEmptyState, ERPLoader } from '../components/ui';

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

export const AttendanceListScreen = memo(function AttendanceListScreen({ 
  onNavigate,
  onSelectAttendance
}: { 
  onNavigate: (tab: string) => void;
  onSelectAttendance?: (id: string) => void;
}) {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [clientMap, setClientMap] = useState<Map<string, string>>(new Map());
  const [linkedAttendanceIds, setLinkedAttendanceIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        // Load all attendances and sort desc by createdAt
        const allAttendances = await db.attendances.toArray();
        const sorted = allAttendances.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Load all clients to resolve names
        const allClients = await db.clients.toArray();
        const map = new Map(allClients.map(c => [c.id, c.name]));

        // Load all budgets to check linked ones
        const allBudgets = await db.budgets.toArray();
        const linkedIds = new Set(
          allBudgets.map(b => b.attendanceId).filter(Boolean) as string[]
        );

        setAttendances(sorted);
        setClientMap(map);
        setLinkedAttendanceIds(linkedIds);
      } catch (err) {
        console.error('Erro ao carregar atendimentos:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

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

  return (
    <ScreenContainer className="pb-32">
      <AppHeader 
        title="Atendimentos" 
        subtitle="Controle e rastreabilidade de atendimentos em campo." 
      />

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <ERPLoader message="Carregando atendimentos..." />
        </div>
      ) : attendances.length === 0 ? (
        <QueueEmptyState 
          title="Nenhum atendimento" 
          meta="Inicie um novo atendimento a partir do painel de controle principal ou crie uma proposta."
        />
      ) : (
        <Stack className="gap-3 mt-4">
          <SectionLabel className="ml-2">Histórico de Atendimentos Recentes</SectionLabel>
          
          {attendances.map((att) => {
            const clientName = clientMap.get(att.clientId) || 'Cliente não identificado';
            const statusLabel = STATUS_LABELS[att.status] || att.status;
            const statusVariant = STATUS_VARIANTS[att.status] || 'neutral';

            return (
              <SurfaceCard 
                key={att.id} 
                variant="cinematic" 
                padding="md"
                className="active:scale-[0.99] transition-transform duration-200 border-white/[0.04] cursor-pointer hover:bg-white/[0.02]"
                onClick={() => onSelectAttendance?.(att.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-[var(--accent-gold)]" />
                      <strong className="text-ui-md font-bold text-white tracking-wide">
                        {clientName}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-mono">
                      <Clock size={11} />
                      <span>{formatDate(att.createdAt)}</span>
                    </div>

                    {linkedAttendanceIds.has(att.id) && (
                      <div className="flex items-center gap-1.5 text-[10px] text-[var(--accent-gold)] font-mono mt-1">
                        <span>ORÇAMENTO VINCULADO</span>
                        <ArrowRight size={10} />
                      </div>
                    )}
                  </div>

                  <SemanticBadge 
                    label={statusLabel.toUpperCase()} 
                    variant={statusVariant} 
                  />
                </div>
              </SurfaceCard>
            );
          })}
        </Stack>
      )}
    </ScreenContainer>
  );
});
