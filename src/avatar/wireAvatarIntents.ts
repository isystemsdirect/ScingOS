import { subscribeAvatarIntents } from './intentBridge';
import * as scingPanelStore from '../ui/scingPanelStore';
import {
  resetConversation,
  setConversationAssistantText,
  setConversationError,
  setConversationUserText,
} from '../ui/scingConversationStore';
import {
  NeuralIngressError,
  resetNeuralIngress,
  submitTextToScing,
} from '../neural/runtime/neuralIngress';
import { getVoiceRuntime, tryCancelSpeaking } from '../voice/runtime/voiceRuntime';
import { resetSrtFeedback } from '../srt/feedback/srtFeedbackStore';

let initialized = false;
let lastToggleAt = 0;

function safeOpenPanel() {
  try {
    scingPanelStore.open();
  } catch {
    // best-effort
  }
}

function safeClosePanel() {
  try {
    scingPanelStore.close();
  } catch {
    // best-effort
  }
}

async function runQuickCommand(text: string) {
  safeOpenPanel();
  setConversationUserText(text);

  try {
    const res = await submitTextToScing(text);
    setConversationAssistantText(res.textOut, res.correlationId);
  } catch (err: any) {
    const msg = err?.message || 'Unknown error';
    const correlationId = err instanceof NeuralIngressError ? err.correlationId : undefined;
    setConversationError({ message: msg, correlationId });
  }
}

export function initAvatarIntentWiring(): void {
  if (initialized) return;
  initialized = true;

  subscribeAvatarIntents((intent) => {
    switch (intent.type) {
      case 'toggle_panel':
        if (Date.now() - lastToggleAt < 250) break;
        lastToggleAt = Date.now();
        scingPanelStore.toggle();
        break;
      case 'open_panel':
        safeOpenPanel();
        break;
      case 'close_panel':
        safeClosePanel();
        break;
      case 'open_radial_menu':
      case 'close_radial_menu':
        // handled locally inside AvatarInteractive
        break;
      case 'status':
      case 'help':
        void runQuickCommand(intent.type);
        break;
      case 'reset':
        tryCancelSpeaking();
        try {
          getVoiceRuntime().reset();
        } catch {
          // best-effort
        }
        resetNeuralIngress();
        resetConversation();
        resetSrtFeedback();
        safeClosePanel();
        break;
      case 'privacy_toggle_mic':
      case 'privacy_toggle_cam':
      case 'privacy_toggle_wearables':
        console.log('[avatar-intent] privacy toggle:', intent.type);
        break;
      case 'voice_ptt_start':
        tryCancelSpeaking();
        try {
          getVoiceRuntime().startPushToTalk();
        } catch {
          // best-effort
        }
        break;
      case 'voice_ptt_stop':
        try {
          getVoiceRuntime().stopPushToTalk();
        } catch {
          // best-effort
        }
        break;
      default:
        console.log('[avatar-intent] unhandled:', intent);
    }
  });
}
