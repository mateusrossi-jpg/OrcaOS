import React, { type ReactNode, useMemo } from 'react';
import { ScreenType, VisualRuntimeContext } from './operationalContext';
import { resolveVisualConfig } from './semanticResolver';
import { cn } from '../../utils/ui';

interface SemanticScreenProps {
  type: ScreenType;
  children: ReactNode;
  className?: string;
  intensity?: 'standard' | 'high' | 'institutional';
  cinematic?: boolean;
}

/**
 * SemanticScreen: The primary entry point for the Visual Runtime Engine.
 * It infers spacing, density, and atmosphere from the screen type.
 */
export const SemanticScreen = ({ 
  type, 
  children, 
  className,
  cinematic
}: SemanticScreenProps) => {
  const config = useMemo(() => {
    const baseConfig = resolveVisualConfig(type);
    
    // Manual overrides if provided, but respecting runtime laws
    if (cinematic !== undefined) baseConfig.atmosphereIntensity = cinematic ? 1.0 : 0.2;
    
    return baseConfig;
  }, [type, cinematic]);

  // Map config to CSS variables for lower-level components to consume
  const runtimeStyles = {
    '--runtime-section-spacing': config.sectionRhythm,
    '--runtime-blur-intensity': config.blurLevel,
    '--runtime-opacity-atmosphere': config.atmosphereIntensity.toString(),
    '--runtime-radius-surface': config.surfaceSoftness,
    '--runtime-motion-duration': config.motionProfile === 'fluid' ? '500ms' : config.motionProfile === 'fast' ? '300ms' : '150ms',
  } as React.CSSProperties;

  return (
    <VisualRuntimeContext.Provider value={config}>
      <div 
        className={cn(
          "min-h-screen w-full flex flex-col",
          `density-${config.density.toLowerCase()}`,
          `hierarchy-${config.typographyHierarchy}`,
          className
        )}
        style={runtimeStyles}
      >
        {children}
      </div>
    </VisualRuntimeContext.Provider>
  );
};
