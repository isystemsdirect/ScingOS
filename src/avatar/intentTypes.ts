export type AvatarIntentType =
  | 'toggle_panel'
  | 'open_panel'
  | 'close_panel'
  | 'voice_ptt_start'
  | 'voice_ptt_stop'
  | 'status'
  | 'help'
  | 'reset'
  | 'open_radial_menu'
  | 'close_radial_menu'
  | 'privacy_toggle_mic'
  | 'privacy_toggle_cam'
  | 'privacy_toggle_wearables';

export interface AvatarIntent {
  correlationId: string;
  type: AvatarIntentType;
  ts: number;
  meta?: Record<string, any>;
}
