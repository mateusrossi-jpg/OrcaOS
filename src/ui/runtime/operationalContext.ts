import { createContext, useContext } from 'react';

export type ScreenType = 
  | 'dashboard' 
  | 'operational' 
  | 'finance' 
  | 'timeline' 
  | 'form' 
  | 'analytics' 
  | 'workspace' 
  | 'command-center' 
  | 'detail-view';

export type VisualDensity = 'D1' | 'D2' | 'D3' | 'D4';

export interface VisualConfig {
  type: ScreenType;
  density: VisualDensity;
  spacingScale: number; // multiplier for base units
  sectionRhythm: string; // e.g. "48px"
  cardDepth: 1 | 2 | 3;
  atmosphereIntensity: number; // 0.0 to 1.0
  blurLevel: string; // e.g. "32px"
  motionProfile: 'fluid' | 'fast' | 'minimal' | 'instant';
  typographyHierarchy: 'emotional' | 'tactical' | 'numerical' | 'standard';
  surfaceSoftness: string; // radius
}

export const VisualRuntimeContext = createContext<VisualConfig | null>(null);

export const useVisualRuntime = () => {
  const context = useContext(VisualRuntimeContext);
  if (!context) {
    throw new Error('useVisualRuntime must be used within a SemanticScreen or VisualRuntimeProvider');
  }
  return context;
};
