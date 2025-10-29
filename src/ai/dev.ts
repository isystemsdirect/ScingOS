import { config } from 'dotenv';
config();

import '@/ai/flows/enable-voice-commands.ts';
import '@/ai/flows/cross-check-standards.ts';
import '@/ai/flows/generate-audio-presentations.ts';
import '@/ai/flows/generate-executive-summary.ts';
import '@/ai/flows/ingest-telemetry.ts';
