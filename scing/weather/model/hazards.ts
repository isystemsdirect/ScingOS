import type { HazardWeights } from '../config/thresholds';
import { DEFAULT_HAZARD_WEIGHTS } from '../config/thresholds';

export const getDefaultHazardWeights = (): HazardWeights => ({ ...DEFAULT_HAZARD_WEIGHTS });
