export type CircuitPhase = 'single-phase' | 'three-phase';

export type PowerFactor = number;

export interface CurrentFromPowerInput {
  powerWatts: number;
  voltageVolts: number;
  powerFactor?: PowerFactor;
  phase?: CircuitPhase;
}

export interface PowerFromCurrentInput {
  currentAmps: number;
  voltageVolts: number;
  powerFactor?: PowerFactor;
  phase?: CircuitPhase;
}

export interface ApparentPowerInput {
  powerWatts: number;
  powerFactor?: PowerFactor;
}

export interface CurrentFromApparentPowerInput {
  apparentPowerVa: number;
  voltageVolts: number;
  phase?: CircuitPhase;
}

export interface EnergyConsumptionInput {
  powerWatts: number;
  hoursPerDay: number;
  days: number;
  tariffPerKwh?: number;
}

export interface VoltageDropInput {
  currentAmps: number;
  distanceMeters: number;
  sectionMm2: number;
  voltageVolts: number;
  phase?: CircuitPhase;
  material?: 'copper' | 'aluminum';
}

export interface VoltageDropResult {
  dropVolts: number;
  dropPercent: number;
}

export interface LightingInput {
  areaM2: number;
  targetLux: number;
  lampLumens?: number;
}

export interface LightingResult {
  requiredLumens: number;
  lampQuantity?: number;
}

export interface AirConditioningSizingInput {
  areaM2: number;
  people: number;
  electronics: number;
  sunFactor?: number;
}

export interface AirConditioningSizingResult {
  estimatedBtus: number;
  suggestedCommercialBtus: number;
}

export interface ConduitFillInput {
  cableExternalDiameterMm: number;
  cableCount: number;
  conduitInternalDiameterMm: number;
}

export interface ConduitFillResult {
  cableAreaMm2: number;
  totalCableAreaMm2: number;
  conduitAreaMm2: number;
  fillPercent: number;
}

export interface CircuitRecommendationInput {
  powerWatts: number;
  voltageVolts: number;
  powerFactor?: PowerFactor;
  phase?: CircuitPhase;
}

export interface CircuitRecommendationResult {
  currentAmps: number;
  suggestedBreakerAmps: number | null;
  suggestedCableSectionMm2: number | null;
}
