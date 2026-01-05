import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { dispatchAvatarIntent, subscribeAvatarIntents } from './intentBridge';
import { RadialMenu } from './RadialMenu';
import { setSrtModifiers } from '../srt/feedback/srtFeedbackStore';

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

export function AvatarInteractive(props: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  const [pressed, setPressed] = useState(false);
  const [hoverProximity, setHoverProximity] = useState(0);
  const [attentionPulse, setAttentionPulse] = useState(0);

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  const cssVars = useMemo(() => {
    return {
      '--scing-hover': hoverProximity,
      '--scing-pressed': pressed ? 1 : 0,
      '--scing-attn': attentionPulse,
		'--srt-hover': hoverProximity,
		'--srt-pressed': pressed ? 1 : 0,
		'--srt-attn': attentionPulse,
    } as React.CSSProperties;
  }, [hoverProximity, pressed, attentionPulse]);

  useEffect(() => {
    setSrtModifiers({
      hover: hoverProximity,
      pressed: pressed ? 1 : 0,
      attn: attentionPulse,
    });
  }, [hoverProximity, pressed, attentionPulse]);

  useEffect(() => {
    return subscribeAvatarIntents((intent) => {
      if (intent.type === 'close_radial_menu') setMenuOpen(false);
      if (intent.type === 'reset') setMenuOpen(false);
    });
  }, []);

  const computeHoverProximity = useCallback((clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = Math.max(1, Math.max(rect.width, rect.height) / 2);
    // 0 at edge, 1 at center
    return clamp01(1 - dist / radius);
  }, []);

  const onClick = useCallback(() => {
    setAttentionPulse(1);
    window.setTimeout(() => setAttentionPulse(0), 220);
    dispatchAvatarIntent('toggle_panel', { hoverProximity, pressed, attentionPulse: 1 });
  }, [hoverProximity, pressed]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    setPressed(true);

    try {
      (e.currentTarget as any).setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }

    dispatchAvatarIntent('voice_ptt_start', {
      pointerType: e.pointerType,
      x: e.clientX,
      y: e.clientY,
      hoverProximity,
      pressed: true,
    });
  }, [hoverProximity]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    setPressed(false);

    try {
      (e.currentTarget as any).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }

    dispatchAvatarIntent('voice_ptt_stop', {
      pointerType: e.pointerType,
      x: e.clientX,
      y: e.clientY,
      hoverProximity,
      pressed: false,
    });
  }, [hoverProximity]);

  const onPointerCancel = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    setPressed(false);

    try {
      (e.currentTarget as any).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }

    dispatchAvatarIntent('voice_ptt_stop', {
      pointerType: e.pointerType,
      x: e.clientX,
      y: e.clientY,
      hoverProximity,
      pressed: false,
      cancelled: true,
    });
  }, [hoverProximity]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const p = computeHoverProximity(e.clientX, e.clientY);
    setHoverProximity(p);
  }, [computeHoverProximity]);

  const onContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setMenuOpen(true);
    setMenuPos({ x: e.clientX, y: e.clientY });
    dispatchAvatarIntent('open_radial_menu', { x: e.clientX, y: e.clientY });
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ') {
      e.preventDefault();
      dispatchAvatarIntent('voice_ptt_start', { hoverProximity, pressed });
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      dispatchAvatarIntent('toggle_panel', { hoverProximity, pressed });
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      dispatchAvatarIntent('close_panel');
      closeMenu();
      dispatchAvatarIntent('close_radial_menu');
      return;
    }
  }, [closeMenu, hoverProximity, pressed]);

  const onKeyUp = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ') {
      e.preventDefault();
      dispatchAvatarIntent('voice_ptt_stop', { hoverProximity, pressed: false });
    }
  }, [hoverProximity]);

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label="Scing"
      className={props.className}
      style={{ cursor: 'pointer', userSelect: 'none', ...cssVars }}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onPointerMove={onPointerMove}
      onContextMenu={onContextMenu}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
    >
      {props.children}
      <RadialMenu
        isOpen={menuOpen}
        x={menuPos.x}
        y={menuPos.y}
        onClose={closeMenu}
      />
    </div>
  );
}
