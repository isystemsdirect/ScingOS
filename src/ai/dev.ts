import { config } from 'dotenv';
config();

import '@/ai/flows/lari-scing-bridge.ts';
import '@/ai/flows/lari-compliance.ts';
import '@/ai/flows/lari-narrator.ts';
import '@/ai/flows/lari-synthesizer.ts';
import '@/ai/flows/lari-ingestor.ts';

// LARI Core Sub-Engines
import '@/ai/flows/lari-vision.ts';
import '@/ai/flows/lari-mapper.ts';
import '@/ai/flows/lari-dose.ts';
import '@/ai/flows/lari-prism.ts';
import '@/ai/flows/lari-echo.ts';
import '@/ai/flows/lari-therm.ts';
import '@/ai/flows/lari-nose.ts';
import '@/ai/flows/lari-gis.ts';

// LARI Domain-Specific Models
import '@/ai/flows/lari-guangel-ai.ts';
import '@/ai/flows/lari-enviro-ai.ts';
import '@/ai/flows/lari-geo-ai.ts';
import '@/ai/flows/lari-health-ai.ts';
import '@/ai/flows/lari-logistics-ai.ts';
import '@/ai/flows/lari-weather-ai.ts';
