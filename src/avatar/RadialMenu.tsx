import { useEffect, useMemo, useRef } from 'react';
import { dispatchAvatarIntent } from './intentBridge';

export function RadialMenu(props: {
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const style = useMemo(() => {
    const left = Math.max(8, props.x);
    const top = Math.max(8, props.y);
    return {
      position: 'fixed' as const,
      left,
      top,
      zIndex: 60,
      background: 'white',
      border: '1px solid rgba(0,0,0,0.12)',
      borderRadius: 12,
      padding: 6,
      minWidth: 180,
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    };
  }, [props.x, props.y]);

  useEffect(() => {
    if (!props.isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      props.onClose();
      dispatchAvatarIntent('close_radial_menu');
    };

    const onPointerDown = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      if (el.contains(e.target as any)) return;
      props.onClose();
      dispatchAvatarIntent('close_radial_menu');
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [props]);

  if (!props.isOpen) return null;

  return (
    <div ref={ref} style={style} onContextMenu={(e) => e.preventDefault()}>
      <MenuButton
        label="Talk"
        onPointerDown={() => dispatchAvatarIntent('voice_ptt_start')}
        onPointerUp={() => dispatchAvatarIntent('voice_ptt_stop')}
      />
      <MenuButton label="Open Panel" onClick={() => dispatchAvatarIntent('open_panel')} />
      <MenuButton label="Status" onClick={() => dispatchAvatarIntent('status')} />
      <MenuButton label="Reset" onClick={() => dispatchAvatarIntent('reset')} />
      <div style={{ height: 1, margin: '6px 4px', background: 'rgba(0,0,0,0.08)' }} />
      <MenuButton label="Mic Toggle" onClick={() => dispatchAvatarIntent('privacy_toggle_mic')} />
      <MenuButton label="Camera Toggle" onClick={() => dispatchAvatarIntent('privacy_toggle_cam')} />
      <MenuButton label="Wearables Toggle" onClick={() => dispatchAvatarIntent('privacy_toggle_wearables')} />
    </div>
  );
}

function MenuButton(props: {
  label: string;
  onClick?: () => void;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
}) {
  return (
    <button
      type="button"
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '10px 10px',
        borderRadius: 10,
      }}
      onClick={props.onClick}
      onPointerDown={props.onPointerDown}
      onPointerUp={props.onPointerUp}
    >
      {props.label}
    </button>
  );
}
