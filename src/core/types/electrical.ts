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
