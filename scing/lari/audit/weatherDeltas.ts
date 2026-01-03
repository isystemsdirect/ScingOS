import type { WeatherHazard } from '../../weather/contracts/weatherSignal';
import type { LariWeatherContext } from '../context/weatherContext';

export type WeatherDecisionDeltaLogEntry = {
  decisionId: string;
  previousPlanId: string;
  newPlanId: string;
  weatherSnapshot: {
    severityIndex: number;
    hazards: WeatherHazard[];
    certaintyScore: number;
  };
  rationale: string;
};

const describeHazards = (hazards: WeatherHazard[]): string => {
  if (!hazards || hazards.length === 0) return 'no hazards';
  if (hazards.length === 1) return hazards[0];
  return `${hazards[0]} (+${hazards.length - 1} more)`;
};

export const buildWeatherDeltaRationale = (context: LariWeatherContext, opts?: { note?: string }): string => {
  const hazardDesc = describeHazards(context.hazards);
  const isForecast = context.horizon !== 'now';

  const parts: string[] = [];
  parts.push(
    `Plan adjusted due to ${isForecast ? 'forecasted' : 'current'} ${hazardDesc} risk (severity ${context.severityIndex.toFixed(0)})`,
  );

  if (context.confidenceBand === 'low') {
    parts.push(`Uncertainty noted (certainty ${context.certaintyScore.toFixed(2)})`);
  }

  if (context.stale) {
    parts.push('Stale signal; background refresh requested');
  }

  if (opts?.note) parts.push(opts.note);

  return parts.join('. ') + '.';
};

export const makeWeatherDecisionDeltaLogEntry = (input: {
  decisionId: string;
  previousPlanId: string;
  newPlanId: string;
  context: LariWeatherContext;
  note?: string;
}): WeatherDecisionDeltaLogEntry => {
  const { decisionId, previousPlanId, newPlanId, context, note } = input;

  return {
    decisionId,
    previousPlanId,
    newPlanId,
    weatherSnapshot: {
      severityIndex: context.severityIndex,
      hazards: context.hazards,
      certaintyScore: context.certaintyScore,
    },
    rationale: buildWeatherDeltaRationale(context, { note }),
  };
};
