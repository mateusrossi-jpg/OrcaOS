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

export interface ResistanceFromVoltageCurrentInput {
  voltageVolts: number;
  currentAmps: number;
}

export interface PowerByResistanceInput {
  currentAmps?: number;
  voltageVolts?: number;
  resistanceOhms: number;
}

export interface ResistorNetworkInput {
  resistorsOhms: number[];
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

export interface CableSectionFromVoltageDropInput {
  currentAmps: number;
  distanceMeters: number;
  voltageVolts: number;
  maxDropPercent: number;
  phase?: CircuitPhase;
  material?: 'copper' | 'aluminum';
}

export interface CableSectionFromVoltageDropResult {
  maxDropVolts: number;
  requiredSectionMm2: number;
}

export interface MaxDistanceFromVoltageDropInput {
  currentAmps: number;
  sectionMm2: number;
  voltageVolts: number;
  maxDropPercent: number;
  phase?: CircuitPhase;
  material?: 'copper' | 'aluminum';
}

export interface MaxDistanceFromVoltageDropResult {
  maxDropVolts: number;
  maxDistanceMeters: number;
}

export interface TransformerSizingInput {
  loadWatts: number;
  powerFactor?: PowerFactor;
  safetyMarginPercent?: number;
}

export interface TransformerSizingResult {
  apparentPowerKva: number;
  apparentPowerWithMarginKva: number;
  suggestedCommercialKva: number;
}

export interface AwgConversionResult {
  awg: string;
  sectionMm2: number;
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

export interface MotorCurrentInput {
  mechanicalPowerKw: number;
  voltageVolts: number;
  efficiency?: number;
  powerFactor?: PowerFactor;
  phase?: CircuitPhase;
}

export interface MotorSpeedInput {
  frequencyHz: number;
  poles: number;
  measuredRpm?: number;
}

export interface MotorSpeedResult {
  synchronousRpm: number;
  slipPercent?: number;
}

export interface PulleyRatioInput {
  motorRpm: number;
  motorPulleyDiameterMm: number;
  drivenPulleyDiameterMm: number;
}

export interface PulleyRatioResult {
  drivenRpm: number;
  ratio: number;
}

export interface AnalogScalingInput {
  inputValue: number;
  inputMin: number;
  inputMax: number;
  engineeringMin: number;
  engineeringMax: number;
}

export interface AnalogScalingResult {
  engineeringValue: number;
  percent: number;
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
