import React from 'react';
import { 
  TrendingUp, 
  Users, 
  ChevronRight, 
  Zap, 
  DollarSign, 
  ShieldCheck,
  Award
} from 'lucide-react';
import { useRole } from '../../../hooks/useRole';
import { 
  ScreenContainer, 
  AppHeader, 
  Section, 
  SectionLabel, 
  Stack,
  Body,
  Subtitle
} from "../../../ui/system";
import { BusinessScoreboard } from '../../intelligence/components/BusinessScoreboard';

interface OwnerWorkspaceProps {
  onNavigate?: (tab: string) => void;
}

/**
 * OwnerWorkspace: The Executive Outcome Center (RC16).
 * Redesigned as a Scoreboard to answer: "Did I make money? What is at risk?"
 * Focuses on business results rather than operational activities.
 */
export const OwnerWorkspace: React.FC<OwnerWorkspaceProps> = ({ onNavigate }) => {
  const { role } = useRole();
  const isSolo = role === 'SOLO';

  return (
    <ScreenContainer className="pb-16 bg-transparent animate-in fade-in duration-500">
      <AppHeader title={isSolo ? "Meu Negócio" : "Placar Executivo"} />

      <div className="px-6 py-8 flex flex-col gap-10">
        
        {/* RC16: BUSINESS SCOREBOARD (THE RESULTS LAYER) */}
        <BusinessScoreboard onNavigate={(tab) => onNavigate?.(tab)} />

      </div>
    </ScreenContainer>
  );
};
