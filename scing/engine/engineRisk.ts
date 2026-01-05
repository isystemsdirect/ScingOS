import { EngineId, RiskClass } from './engineTypes';

export type EngineRiskProfile = {
  id: EngineId;
  risk: RiskClass;
  requiresCriticGate: boolean; // “nothing ships to UI/memory/external without validation”
  requiresBaneGate: boolean; // policy/security review required
  affectsPhysicalControl: boolean; // can cause device action (drone/actuator)
};

export const RISK: Record<EngineId, EngineRiskProfile> = {
  SCING: {
    id: 'SCING',
    risk: 'R1-low',
    requiresCriticGate: false,
    requiresBaneGate: true,
    affectsPhysicalControl: false,
  },
  LARI: {
    id: 'LARI',
    risk: 'R3-high',
    requiresCriticGate: true,
    requiresBaneGate: true,
    affectsPhysicalControl: false,
  },
  BANE: {
    id: 'BANE',
    risk: 'R4-critical',
    requiresCriticGate: false,
    requiresBaneGate: false,
    affectsPhysicalControl: true,
  },

  'LARI-VISION': {
    id: 'LARI-VISION',
    risk: 'R2-medium',
    requiresCriticGate: true,
    requiresBaneGate: true,
    affectsPhysicalControl: false,
  },
  'LARI-MAPPER': {
    id: 'LARI-MAPPER',
    risk: 'R2-medium',
    requiresCriticGate: true,
    requiresBaneGate: true,
    affectsPhysicalControl: false,
  },
  'LARI-DOSE': {
    id: 'LARI-DOSE',
    risk: 'R4-critical',
    requiresCriticGate: true,
    requiresBaneGate: true,
    affectsPhysicalControl: true,
  },
  'LARI-PRISM': {
    id: 'LARI-PRISM',
    risk: 'R3-high',
    requiresCriticGate: true,
    requiresBaneGate: true,
    affectsPhysicalControl: false,
  },
  'LARI-ECHO': {
    id: 'LARI-ECHO',
    risk: 'R3-high',
    requiresCriticGate: true,
    requiresBaneGate: true,
    affectsPhysicalControl: false,
  },

  'LARI-WEATHERBOT': {
    id: 'LARI-WEATHERBOT',
    risk: 'R3-high',
    requiresCriticGate: true,
    requiresBaneGate: true,
    affectsPhysicalControl: true,
  },
  'LARI-GIS': {
    id: 'LARI-GIS',
    risk: 'R2-medium',
    requiresCriticGate: true,
    requiresBaneGate: true,
    affectsPhysicalControl: false,
  },
  'LARI-CONTROL': {
    id: 'LARI-CONTROL',
    risk: 'R4-critical',
    requiresCriticGate: true,
    requiresBaneGate: true,
    affectsPhysicalControl: true,
  },

  'LARI-THERM': {
    id: 'LARI-THERM',
    risk: 'R3-high',
    requiresCriticGate: true,
    requiresBaneGate: true,
    affectsPhysicalControl: false,
  },
  'LARI-NOSE': {
    id: 'LARI-NOSE',
    risk: 'R4-critical',
    requiresCriticGate: true,
    requiresBaneGate: true,
    affectsPhysicalControl: true,
  },
  'LARI-SONIC': {
    id: 'LARI-SONIC',
    risk: 'R3-high',
    requiresCriticGate: true,
    requiresBaneGate: true,
    affectsPhysicalControl: false,
  },
  'LARI-GROUND': {
    id: 'LARI-GROUND',
    risk: 'R3-high',
    requiresCriticGate: true,
    requiresBaneGate: true,
    affectsPhysicalControl: false,
  },
  'LARI-AEGIS': {
    id: 'LARI-AEGIS',
    risk: 'R4-critical',
    requiresCriticGate: true,
    requiresBaneGate: true,
    affectsPhysicalControl: true,
  },
  'LARI-EDDY': {
    id: 'LARI-EDDY',
    risk: 'R3-high',
    requiresCriticGate: true,
    requiresBaneGate: true,
    affectsPhysicalControl: false,
  },
};
