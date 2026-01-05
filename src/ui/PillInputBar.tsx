"use client";

import React, { useEffect, useRef, useState } from "react";

export type MicState = "idle" | "listening" | "error";
export type CamState = "off" | "on" | "error";

export type PillInputBarProps = {
  submitText: (text: string) => Promise<void> | void;

  // PTT (hold-to-talk)
  startPtt: () => void;
  stopPtt: () => void;

  // live state getters (must be truthy, derived from real runtime if possible)
  getMicState: () => MicState;
  getCamState: () => CamState;

  // camera toggle (enable/disable capture + feature extraction)
  toggleCamera: (next: boolean) => Promise<void> | void;

  // optional: demo badge
  isDemoMode?: boolean;
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export default function PillInputBar(props: PillInputBarProps) {
  const {
    submitText,
    startPtt,
    stopPtt,
    getMicState,
    getCamState,
    toggleCamera,
    isDemoMode,
  } = props;

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [statusLine, setStatusLine] = useState("");
  const [micState, setMicState] = useState<MicState>("idle");
  const [camState, setCamState] = useState<CamState>("off");
  const [camEnabled, setCamEnabled] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const pttDownRef = useRef(false);

  // Poll states (cheap and reliable; replace with subscriptions later)
  useEffect(() => {
    if (typeof window === "undefined") return;
    let alive = true;
    const t = window.setInterval(() => {
      if (!alive) return;
      try {
        setMicState(getMicState());
        setCamState(getCamState());
      } catch {
        // do nothing (avoid UI crash)
      }
    }, 200);
    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, [getMicState, getCamState]);

  useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined") return;
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  // Hotkeys: "/" toggles; Esc closes; Enter sends (inside input)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as any)?.tagName?.toLowerCase?.();
      const inTextField =
        tag === "input" ||
        tag === "textarea" ||
        (e.target as any)?.isContentEditable;

      if (e.key === "/" && !inTextField) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }

      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      setStatusLine("Sending…");
      await submitText(trimmed);
      setText("");
      setStatusLine("");
    } catch (err) {
      console.error(err);
      setStatusLine("Send failed.");
      if (typeof window !== "undefined") {
        window.setTimeout(() => setStatusLine(""), 900);
      }
    }
  }

  function micDown() {
    if (pttDownRef.current) return;
    pttDownRef.current = true;
    try {
      setStatusLine("Listening…");
      startPtt();
      setMicState("listening");
    } catch (err) {
      console.error(err);
      setMicState("error");
      setStatusLine("Mic error.");
      if (typeof window !== "undefined") {
        window.setTimeout(() => setStatusLine(""), 900);
      }
    }
  }

  function micUp() {
    if (!pttDownRef.current) return;
    pttDownRef.current = false;
    try {
      stopPtt();
      setStatusLine("");
      setMicState(getMicState());
    } catch (err) {
      console.error(err);
      setMicState("error");
      setStatusLine("Mic error.");
      if (typeof window !== "undefined") {
        window.setTimeout(() => setStatusLine(""), 900);
      }
    }
  }

  async function onToggleCamera() {
    const next = !camEnabled;
    setCamEnabled(next);
    try {
      setStatusLine(next ? "Camera on." : "Camera off.");
      await toggleCamera(next);
      setCamState(next ? "on" : "off");
      if (typeof window !== "undefined") {
        window.setTimeout(() => setStatusLine(""), 600);
      }
    } catch (err) {
      console.error(err);
      setCamState("error");
      setStatusLine("Camera error.");
      if (typeof window !== "undefined") {
        window.setTimeout(() => setStatusLine(""), 900);
      }
    }
  }

  const micDot = micState === "listening" ? 1 : 0;
  const camDot = camEnabled && camState === "on" ? 1 : 0;

  return (
    <>
      {/* Toggle handle */}
      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: open ? 96 : 24,
          transform: "translateX(-50%)",
          zIndex: 9999,
          pointerEvents: "auto",
        }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(0,0,0,0.55)",
            color: "rgba(255,255,255,0.9)",
            borderRadius: 999,
            padding: "8px 14px",
            fontSize: 12,
            letterSpacing: 0.3,
            backdropFilter: "blur(10px)",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
          aria-label={open ? "Close input bar" : "Open input bar"}
          title='Toggle ("/")'
        >
          <span>{open ? "Close" : "Talk"}</span>
          {isDemoMode ? (
            <span
              style={{
                fontSize: 10,
                padding: "2px 8px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.06)",
              }}
            >
              DEMO
            </span>
          ) : null}
        </button>
      </div>

      {/* Pill bar */}
      {open && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: 24,
            transform: "translateX(-50%)",
            zIndex: 9999,
            width: "min(900px, calc(100vw - 28px))",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(0,0,0,0.58)",
            backdropFilter: "blur(14px)",
            padding: 10,
            display: "flex",
            alignItems: "center",
            gap: 10,
            pointerEvents: "auto",
          }}
        >
          {/* MIC (hold to talk) */}
          <button
            type="button"
            onPointerDown={micDown}
            onPointerUp={micUp}
            onPointerCancel={micUp}
            onMouseDown={(e) => e.preventDefault()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              display: "grid",
              placeItems: "center",
              position: "relative",
            }}
            aria-label="Hold to talk"
            title="Hold to talk"
          >
            <span style={{ fontSize: 16, lineHeight: "16px" }}>🎙️</span>
            <span
              style={{
                position: "absolute",
                right: 6,
                bottom: 6,
                width: 8,
                height: 8,
                borderRadius: 99,
                background: `rgba(255,255,255,${0.25 + 0.65 * clamp01(micDot)})`,
              }}
            />
          </button>

          {/* CAMERA toggle */}
          <button
            type="button"
            onClick={onToggleCamera}
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              display: "grid",
              placeItems: "center",
              position: "relative",
            }}
            aria-label="Toggle camera"
            title="Toggle camera"
          >
            <span style={{ fontSize: 16, lineHeight: "16px" }}>📷</span>
            <span
              style={{
                position: "absolute",
                right: 6,
                bottom: 6,
                width: 8,
                height: 8,
                borderRadius: 99,
                background: `rgba(255,255,255,${0.25 + 0.65 * clamp01(camDot)})`,
              }}
            />
          </button>

          {/* INPUT */}
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            placeholder='Type to Scing… (Enter sends, hold mic to talk, "/" toggles)'
            style={{
              flex: 1,
              height: 44,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(0,0,0,0.35)",
              color: "rgba(255,255,255,0.92)",
              padding: "0 14px",
              outline: "none",
              fontSize: 14,
            }}
          />

          {/* SEND */}
          <button
            type="button"
            onClick={() => void handleSend()}
            style={{
              height: 44,
              padding: "0 16px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.92)",
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
            aria-label="Send"
            title="Send"
          >
            Send
          </button>
        </div>
      )}

      {/* Status toast */}
      {open && statusLine && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: 78,
            transform: "translateX(-50%)",
            zIndex: 9999,
            fontSize: 12,
            color: "rgba(255,255,255,0.78)",
            background: "rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 999,
            padding: "6px 10px",
            backdropFilter: "blur(10px)",
          }}
        >
          {statusLine}
        </div>
      )}
    </>
  );
}
