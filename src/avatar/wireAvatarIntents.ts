import { subscribeAvatarIntents } from './intentBridge';
import * as scingPanelStore from '../ui/scingPanelStore';

let initialized = false;

async function tryChat(text: string) {
  if (typeof fetch === 'undefined') {
    console.log('[avatar-intent] chat:', text);
    return;
  }

  const correlationId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `corr_${Date.now()}`;

  try {
    const res = await fetch('/api/scing/chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-bane-identity': 'local-dev',
        'x-bane-capabilities': 'bane:invoke',
      },
      body: JSON.stringify({ correlationId, text }),
    });

    const payload = await res.json().catch(() => null);
    if (!res.ok) throw new Error(payload?.message || payload?.error || `HTTP ${res.status}`);

    console.log('[avatar-intent] chat ok:', payload?.textOut ?? payload);
  } catch (e: any) {
    console.log('[avatar-intent] chat error:', e?.message || e);
  }
}

export function initAvatarIntentWiring(): void {
  if (initialized) return;
  initialized = true;

  subscribeAvatarIntents((intent) => {
    switch (intent.type) {
      case 'toggle_panel':
        scingPanelStore.toggle();
        break;
      case 'open_panel':
        scingPanelStore.open();
        break;
      case 'close_panel':
        scingPanelStore.close();
        break;
      case 'open_radial_menu':
      case 'close_radial_menu':
        // handled locally inside AvatarInteractive
        break;
      case 'status':
      case 'help':
      case 'reset':
        void tryChat(intent.type);
        break;
      case 'privacy_toggle_mic':
      case 'privacy_toggle_cam':
      case 'privacy_toggle_wearables':
        console.log('[avatar-intent] privacy toggle:', intent.type);
        break;
      case 'voice_ptt_start':
      case 'voice_ptt_stop':
        // Voice wiring is handled in the client (Voice MVP hook).
        break;
      default:
        console.log('[avatar-intent] unhandled:', intent);
    }
  });
}
