import { memo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../storage/dexieDatabase";
import type { AppTab } from "../appTypes";
import { ScreenContainer, SurfaceCard } from "../../ui/system";


import { designTokens } from "../../theme/designTokens";
interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
  account?: any;
  role?: string;
}

/**
 * HomeScreen – faithful reconstruction of the approved reference.
 * Visual style: graphite industrial premium, no gradients, no blue, no glow.
 */
export const HomeScreen = memo(function HomeScreen({
  onNavigate,
  account,
  role,
}: HomeScreenProps) {


  // Live query work orders and team members
  const workOrders = useLiveQuery(() => db.workOrders.toArray(), []);
  const teamMembers = useLiveQuery(() => db.teamMembers.toArray(), []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const revenueToday = workOrders?.filter(wo => wo.status === 'done' && wo.updatedAt?.startsWith(todayStr)).reduce((acc, wo) => acc + (wo.executedValue || 0), 0) ?? 0;
  const osPending = workOrders?.filter(wo => wo.status === 'in-progress' || wo.status === 'draft').length ?? 0;
  const osDoneToday = workOrders?.filter(wo => wo.status === 'done' && wo.updatedAt?.startsWith(todayStr)).length ?? 0;
  const osDelayed = workOrders?.filter(wo => wo.status === 'scheduled' && wo.scheduledTo && wo.scheduledTo < todayStr).length ?? 0;
  const teamSize = teamMembers?.length ?? 0;

  return (
    <ScreenContainer className={`bg-transparent text-[${designTokens.textPrimary}] min-h-screen`}>


      {/* Main Content */}
      <main className="flex-1 mt-16 pb-24 px-4 max-w-lg mx-auto w-full">
        {/* Hero Order Card */}
        <section className="mt-4">
          <div className="bg-[${designTokens.surfacePrimary}] rounded-[${designTokens.radiusCard}] p-6 flex flex-col items-center text-center space-y-6">
              <div className={`inline-flex items-center px-4 py-1.5 rounded-full bg-[${designTokens.surfaceSecondary}]/20 border border-[${designTokens.textPrimary}]/20`}>
                <span className={`material-symbols-outlined text-[14px] text-[${designTokens.textPrimary}] mr-2`} style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                <span className="text-sm font-medium text-[${designTokens.white}] tracking-widest uppercase">LIVRO LIMPO</span>
              </div>
              <h2 className={`text-lg font-bold text-[${designTokens.textPrimary}]`}>Nenhuma OS pendente hoje</h2>
              <button
                className={`w-full bg-[${designTokens.surfaceSecondary}] hover:bg-[${designTokens.surfaceSecondary}] text-[${designTokens.textSecondary}] active:scale-[0.97] transition-all py-4 rounded-xl flex items-center justify-center space-x-2`}
                onClick={() => onNavigate('new-quick-service')}
              >
                <span className="material-symbols-outlined font-bold">add</span>
                <span className="font-bold text-base">Nova Ordem de Serviço</span>
              </button>
            </div>
        </section>

          {/* Operational Panel */}
          <section className="mt-6 grid grid-cols-2 gap-4">
            <SurfaceCard className="p-4 rounded-[${designTokens.radiusCard}] shadow-[${designTokens.shadowSoft}]">
              <h3 className={`text-sm font-medium text-[${designTokens.textPrimary}]`}>OS Ativas</h3>
              <p className={`text-xl font-bold text-[${designTokens.textPrimary}]`}>{osPending}</p>
            </SurfaceCard>
            <SurfaceCard className="p-4 rounded-[${designTokens.radiusCard}] shadow-[${designTokens.shadowSoft}]">
              <h3 className={`text-sm font-medium text-[${designTokens.textPrimary}]`}>Orçamentos</h3>
              <p className={`text-xl font-bold text-[${designTokens.textPrimary}]`}>{osDoneToday}</p>
            </SurfaceCard>
            <SurfaceCard className="p-4 rounded-[${designTokens.radiusCard}] shadow-[${designTokens.shadowSoft}]">
              <h3 className={`text-sm font-medium text-[${designTokens.textPrimary}]`}>Pendências</h3>
              <p className={`text-xl font-bold text-[${designTokens.textPrimary}]`}>{osDelayed}</p>
            </SurfaceCard>
            <SurfaceCard className={`p-4 rounded-[${designTokens.radiusCard}] shadow-[${designTokens.shadowSoft}] bg-[${designTokens.surfacePrimary}]`}>
              <h3 className={`text-sm font-medium text-[${designTokens.textPrimary}]`}>Retornos</h3>
              <p className={`text-xl font-bold text-[${designTokens.textPrimary}]`}>R$ {revenueToday.toLocaleString()}</p>
            </SurfaceCard>
          </section>
                        
        </section>

        {/* Latest Activity */}
        <section className="mt-8">
          <h3 className="text-xs font-medium uppercase tracking-widest mb-4 ml-1 opacity-80">Última Atividade</h3>
          <div className={`bg-[${designTokens.surfacePrimary}] rounded-2xl overflow-hidden divide-y divide-[${designTokens.divider}]/30`}>
            {/* Item 1 */}
            <div className="flex items-center justify-between p-4 hover:bg-[${designTokens.hoverBackground}]/5 transition-colors cursor-pointer group">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full bg-[${designTokens.surfaceSecondary}] flex items-center justify-center border border-[${designTokens.white}]/5 shadow-[${designTokens.shadowSoft}]`}>
                  <!-- avatar placeholder -->
                </div>
                <div>
                  <h4 className="text-base font-bold text-[${designTokens.textPrimary}]">Edifício Empresarial Prime</h4>
                  <p className="text-sm font-medium text-[${designTokens.mutedText}] uppercase tracking-wider">Contato Recente</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-[${designTokens.mutedText}] uppercase">Hoje</span>
                <!-- no chevron -->
              </div>
            </div>
            {/* Item 2 */}
            <div className="flex items-center justify-between p-4 hover:bg-[${designTokens.hoverBackground}]/5 transition-colors cursor-pointer group">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full bg-[${designTokens.surfaceSecondary}] flex items-center justify-center border border-[${designTokens.white}]/5 shadow-[${designTokens.shadowSoft}]`}>
                  <!-- avatar placeholder -->
                </div>
                <div>
                  <h4 className="text-base font-bold text-[${designTokens.textPrimary}]">Laboratório BioVida</h4>
                  <p className="text-sm font-medium text-[${designTokens.mutedText}] uppercase tracking-wider">Contato Recente</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-[${designTokens.mutedText}] uppercase">Hoje</span>
                <!-- no chevron -->
              </div>
            </div>
          </div>
        </section>
      </main>
    </ScreenContainer>
  );
});

export default HomeScreen;

