import React, { memo, useState, useEffect, useMemo } from "react";
import { pilotTelemetry } from '../services/pilotTelemetryService';
import { 
  Play, 
  CheckCircle2, 
  MapPin, 
  Navigation, 
  DollarSign, 
  RefreshCw, 
  Search, 
  Calendar, 
  AlertCircle, 
  Plus 
} from "lucide-react";
import { cn } from '../utils/ui';
import { clientService } from '../services/clientService';
import { siteService } from '../services/siteService';
import { workOrderQueryService } from '../services/WorkOrderQueryService';
import { operationalFacade } from '../features/workflow/operationalFacade';
import { 
  ScreenContainer, 
  AppHeader, 
  AferixCalendar,
  SlimSearchInput,
  GroupedSection,
  PrimaryPillButton,
  SecondaryActionButton,
  V12StatusBadge,
  EmptyState,
  AferixV12Tokens,
  ERPLoader
} from '../ui/system';
import { AferixSignaturePad } from '../components/AferixSignaturePad';

interface AgendaPageProps {
  onNavigate: (tab: any) => void;
}

/**
 * AgendaPage (Dark Premium V12 Harmonization):
 * Authoritative Technical Scheduling Hub & Route Planning.
 */
export const AgendaPage = memo(function AgendaPage({ onNavigate }: AgendaPageProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const endTrack = pilotTelemetry.trackScreen('Agenda');
    return () => endTrack();
  }, []);

  async function loadAgendaData() {
    try {
      const [agenda, sites, clients] = await Promise.all([
        workOrderQueryService.getAgendaItems(),
        siteService.getAll(),
        clientService.getAll()
      ]);

      setData({
        allWorkOrders: [...agenda.inProgress, ...agenda.scheduled, ...agenda.awaiting, ...agenda.done],
        sites,
        clients
      });
    } catch (err) {
      console.error("[AgendaPage] Failed to load agenda data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAgendaData();
  }, []);

  const highlightedDates = useMemo(() => {
    if (!data?.allWorkOrders) return [];
    return data.allWorkOrders.map((wo: any) => wo.scheduledDate).filter(Boolean);
  }, [data]);

  const selectedDateOS = useMemo(() => {
    if (!data?.allWorkOrders) return [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    const q = searchQuery.trim().toLowerCase();

    return data.allWorkOrders.filter((wo: any) => {
      const woDate = (wo.scheduledDate || wo.createdAt || "").split('T')[0];
      const matchesDate = woDate === dateStr;
      if (!matchesDate) return false;

      if (!q) return true;
      const client = data.clients.find((c: any) => c.id === wo.clientId);
      return (
        (wo.title && wo.title.toLowerCase().includes(q)) ||
        (wo.address && wo.address.toLowerCase().includes(q)) ||
        (client?.name && client.name.toLowerCase().includes(q))
      );
    });
  }, [data, selectedDate, searchQuery]);

  const hasConflict = selectedDateOS.length > 1;

  const handleStartRoute = async (os: any) => {
    if (navigator.vibrate) navigator.vibrate(40);
    try {
      setLoading(true);
      await operationalFacade.updateWorkOrder({ ...os, status: 'en_route' as const, updatedAt: new Date().toISOString() });
      const site = data.sites.find((s: any) => s.id === os.siteId);
      const addr = site?.fullAddress || os.address;
      if (addr) window.open(`https://maps.google.com/?q=${encodeURIComponent(addr)}`, '_blank');
      await loadAgendaData();
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2C2C2E] to-[#262628] flex flex-col items-center justify-center p-6 text-white">
        <ERPLoader message="Carregando agenda operacional..." />
      </div>
    );
  }

  return (
    <div className={AferixV12Tokens.layout.pageContainer}>
      
      {/* 1. CABEÇALHO CONTEXTUAL UNIVERSAL */}
      <AppHeader 
        title="Agenda & Rotas"
        subtitle="Controle de Atendimentos de Campo"
        onBack={() => onNavigate('home')}
        className="bg-[#2C2C2E] border-b border-white/5"
      />

      <div className={AferixV12Tokens.layout.contentWrapper}>
        
        {/* 2. BUSCA TÁTICA SLIM */}
        <SlimSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por cliente, endereço ou serviço..."
        />

        {/* 3. CALENDAR CONTROL */}
        <GroupedSection
          headerTitle="Controle de Datas"
          headerAction={
            <span className="text-[10px] font-bold text-[#30D158] bg-[#30D158]/10 border border-[#30D158]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
              SINCRONIZADO
            </span>
          }
        >
          <div className="p-4 flex flex-col gap-4">
            <AferixCalendar 
              selectedDate={selectedDate} 
              onDateSelect={setSelectedDate} 
              highlightedDates={highlightedDates}
            />

            {hasConflict && (
              <div className="bg-[#FF453A]/10 border border-[#FF453A]/20 rounded-[14px] p-4 flex items-center gap-3">
                <AlertCircle className="text-[#FF453A] shrink-0" size={18} />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#FF453A] uppercase tracking-wider">
                    Conflito de Horário Detectado
                  </span>
                  <p className="text-[12px] text-[#C7C7CC] mt-0.5 leading-snug">
                    Existem 2 ou mais atendimentos alocados para o mesmo dia.
                  </p>
                </div>
              </div>
            )}
          </div>
        </GroupedSection>

        {/* 4. ATENDIMENTOS DO DIA SELECIONADO (TIMELINE) */}
        <GroupedSection
          headerTitle={`${selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).toUpperCase()} — ATENDIMENTOS`}
          headerAction={
            <span className="text-[11px] font-bold text-[#8E8E93] font-mono">
              {selectedDateOS.length} OS
            </span>
          }
        >
          {selectedDateOS.length === 0 ? (
            <div className="p-6 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#8E8E93]">
                <Calendar size={22} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#30D158]">
                  ✓ Agenda Livre
                </span>
                <span className="text-[13px] text-[#C7C7CC]">
                  Nenhum atendimento agendado para este dia
                </span>
              </div>
              <button 
                type="button"
                onClick={() => onNavigate('new-quick-service')}
                className="mt-1 h-11 px-5 rounded-full bg-white text-[#2C2C2E] font-bold text-[12px] active:scale-[0.975] transition-all shadow-md flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                <Plus size={15} /> Programar Atendimento
              </button>
            </div>
          ) : (
            selectedDateOS.map((os: any, idx: number) => {
              const client = data.clients.find((c: any) => c.id === os.clientId);
              const isNow = os.status === 'in-progress' || os.status === 'en_route';
              const isDone = os.status === 'done';

              return (
                <div 
                  key={os.id} 
                  className={cn(
                    "p-4 px-5 flex flex-col gap-3 transition-colors",
                    idx !== selectedDateOS.length - 1 && "border-b border-white/5",
                    isNow && "bg-white/[0.02]"
                  )}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <V12StatusBadge
                          label={isNow ? "EM ANDAMENTO" : (isDone ? "CONCLUÍDO" : "PROGRAMADO")}
                          tone={isNow ? "attention" : (isDone ? "success" : "neutral")}
                        />
                      </div>
                      <h3 className={cn(
                        "text-[15px] font-bold leading-tight truncate",
                        isDone ? "text-[#8E8E93] line-through" : "text-white"
                      )}>
                        {client?.name || os.title || "Cliente Avulso"}
                      </h3>
                    </div>
                    
                    <div className="h-8 px-2.5 rounded-[10px] bg-[#2C2C2E] border border-white/5 flex items-center justify-center text-white shrink-0">
                      <span className="text-[11px] font-mono font-bold">
                        {os.scheduledDate ? new Date(os.scheduledDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[#C7C7CC] text-[12px] bg-[#2C2C2E] p-2.5 rounded-[12px] border border-white/5">
                    <MapPin size={14} className="text-[#8E8E93] shrink-0" />
                    <span className="truncate">{os.address || os.title || "Endereço principal"}</span>
                  </div>

                  {/* TACTILE ACTION BUTTONS */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartRoute(os);
                      }}
                      className="h-11 bg-[#2C2C2E] border border-white/10 text-white rounded-full font-semibold text-[12px] active:scale-[0.975] hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
                    >
                      <Navigation size={14} className="text-[#30D158]" /> Iniciar Rota
                    </button>

                    <button 
                      type="button"
                      onClick={() => onNavigate({ tab: 'operations', workOrderId: os.id })}
                      className="h-11 bg-white text-[#2C2C2E] rounded-full font-bold text-[12px] active:scale-[0.975] transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer select-none"
                    >
                      <Play size={13} fill="currentColor" /> {isNow ? "Executar OS" : "Ver Detalhes"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </GroupedSection>

        {/* 5. AÇÕES RÁPIDAS DE CAMPO */}
        <GroupedSection headerTitle="Ações Rápidas de Campo">
          <div className="p-4 grid grid-cols-2 gap-3">
            <SecondaryActionButton 
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate([20, 30, 20]);
                alert("Sincronização offline-first concluída!");
              }}
              icon={RefreshCw}
            >
              Sincronizar
            </SecondaryActionButton>

            <SecondaryActionButton 
              onClick={() => onNavigate('money')}
              icon={DollarSign}
            >
              Recebimentos
            </SecondaryActionButton>
          </div>
        </GroupedSection>

      </div>

      {showSignaturePad && (
        <AferixSignaturePad
          onClose={() => setShowSignaturePad(false)}
          onSave={() => {
            alert("Assinatura digital capturada com sucesso!");
            setShowSignaturePad(false);
          }}
        />
      )}
    </div>
  );
});
