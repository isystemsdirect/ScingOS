"use client";

import React, { useMemo, useRef, useState } from "react";
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
    if (next) {
      camStreamRef.current = await enableCameraWeb();
      setCamOn(true);
      return;
    }
    disableCameraWeb(camStreamRef.current);
    camStreamRef.current = null;
    setCamOn(false);
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
      isDemoMode={(import.meta as any)?.env?.VITE_DEMO_MODE === "true"}
    />
  );
}
