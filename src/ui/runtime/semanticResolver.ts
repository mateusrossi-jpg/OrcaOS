import { ScreenType, VisualConfig } from './operationalContext';

/**
 * semanticResolver: The mapping engine between intent and visual behavior.
 */
export function resolveVisualConfig(type: ScreenType): VisualConfig {
  switch (type) {
    case 'dashboard':
      return {
        type,
        density: 'D1',
        spacingScale: 1.5,
        sectionRhythm: '64px',
        cardDepth: 2,
        atmosphereIntensity: 1.0,
        blurLevel: '32px',
        motionProfile: 'fluid',
        typographyHierarchy: 'emotional',
        surfaceSoftness: 'var(--radius-modal)',
      };

    case 'operational':
      return {
        type,
        density: 'D3',
        spacingScale: 1.0,
        sectionRhythm: '32px',
        cardDepth: 1,
        atmosphereIntensity: 0.6,
        blurLevel: '16px',
        motionProfile: 'fast',
        typographyHierarchy: 'tactical',
        surfaceSoftness: 'var(--radius-card)',
      };

    case 'finance':
      return {
        type,
        density: 'D4',
        spacingScale: 0.75,
        sectionRhythm: '24px',
        cardDepth: 1,
        atmosphereIntensity: 0.3,
        blurLevel: '8px',
        motionProfile: 'minimal',
        typographyHierarchy: 'numerical',
        surfaceSoftness: 'var(--radius-md)',
      };

    case 'form':
      return {
        type,
        density: 'D2',
        spacingScale: 1.2,
        sectionRhythm: '48px',
        cardDepth: 2,
        atmosphereIntensity: 0.5,
        blurLevel: '24px',
        motionProfile: 'fluid',
        typographyHierarchy: 'standard',
        surfaceSoftness: 'var(--radius-card)',
      };

    case 'timeline':
      return {
        type,
        density: 'D3',
        spacingScale: 1.0,
        sectionRhythm: '40px',
        cardDepth: 1,
        atmosphereIntensity: 0.4,
        blurLevel: '12px',
        motionProfile: 'fast',
        typographyHierarchy: 'standard',
        surfaceSoftness: 'var(--radius-card)',
      };

    case 'command-center':
      return {
        type,
        density: 'D4',
        spacingScale: 0.6,
        sectionRhythm: '16px',
        cardDepth: 1,
        atmosphereIntensity: 0.1,
        blurLevel: '4px',
        motionProfile: 'instant',
        typographyHierarchy: 'tactical',
        surfaceSoftness: 'var(--radius-sm)',
      };

    default:
      return {
        type,
        density: 'D2',
        spacingScale: 1.0,
        sectionRhythm: '40px',
        cardDepth: 2,
        atmosphereIntensity: 0.5,
        blurLevel: '20px',
        motionProfile: 'fast',
        typographyHierarchy: 'standard',
        surfaceSoftness: 'var(--radius-card)',
      };
  }
}
