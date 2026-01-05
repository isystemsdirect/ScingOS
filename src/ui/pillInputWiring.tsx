"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import PillInputBar, { CamState, MicState } from "./PillInputBar";

import { submitTextToScing } from "../neural/runtime/neuralIngress";
import { getVoiceRuntime } from "../voice/runtime/voiceRuntime";

async function enableCameraWeb(): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  return stream;
}

function disableCameraWeb(stream: MediaStream | null) {
  if (!stream) return;
  for (const t of stream.getTracks()) t.stop();
}

export default function PillInputWiring() {
  const vr = useMemo(() => getVoiceRuntime(), []);
  const camStreamRef = useRef<MediaStream | null>(null);
  const [camOn, setCamOn] = useState(false);

  const stopCamera = () => {
    disableCameraWeb(camStreamRef.current);
    camStreamRef.current = null;
    setCamOn(false);
  };

  useEffect(() => {
    return () => {
      // Ensure camera shuts off if component unmounts while active
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getMicState = (): MicState => {
    try {
      return vr.isListening() ? "listening" : "idle";
    } catch {
      return "error";
    }
  };

  const getCamState = (): CamState => {
    return camOn ? "on" : "off";
  };

  const toggleCamera = async (next: boolean) => {
    if (!next) {
      stopCamera();
      return;
    }

    // Guard: already active (avoid overwriting stream ref and leaking tracks)
    if (camStreamRef.current) {
      setCamOn(true);
      return;
    }

    try {
      const stream = await enableCameraWeb();
      camStreamRef.current = stream;
      setCamOn(true);
    } catch (err) {
      // Permission denied / no device / etc.
      disableCameraWeb(camStreamRef.current);
      camStreamRef.current = null;
      setCamOn(false);
      console.error("enableCameraWeb failed:", err);
      throw err;
    }
  };

  const submitText = async (text: string) => {
    await submitTextToScing(text);
  };

  const startPtt = () => {
    try {
      if (vr.isSpeaking()) vr.cancelSpeaking();
    } catch {
      // ignore
    }
    vr.startPushToTalk();
  };

  const stopPtt = () => {
    vr.stopPushToTalk();
  };

  return (
    <PillInputBar
      submitText={submitText}
      startPtt={startPtt}
      stopPtt={stopPtt}
      getMicState={getMicState}
      getCamState={getCamState}
      toggleCamera={toggleCamera}
      isDemoMode={(process.env.NEXT_PUBLIC_DEMO_MODE ?? "").toLowerCase() === "true"}
    />
  );
}
