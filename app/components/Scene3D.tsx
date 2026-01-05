"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Mesh } from "three";
import { subscribeToMockNeuralState, NeuralVisualState } from "../../neural/mockNeuralState";

function SpinningCube({ state }: { state: NeuralVisualState }) {
  const meshRef = useRef<Mesh | null>(null);

  // rotation speed based on intensity
  useFrame((_, delta) => {
    const speed = 0.5 + state.intensity * 3.0;
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * speed;
      meshRef.current.rotation.y += delta * speed * 0.8;
    }
  });

  // color based on mode
  const color =
    state.mode === "idle" ? "#3b82f6" :
    state.mode === "thinking" ? "#f59e0b" :
    state.mode === "speaking" ? "#10b981" :
    "#ef4444"; // error

  const scale = 1 + state.intensity * 0.6;

  return (
    <mesh ref={meshRef} scale={[scale, scale, scale]}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color={color} metalness={0.4} roughness={0.2} />
    </mesh>
  );
}

export default function Scene3D() {
  const [neuralState, setNeuralState] = useState<NeuralVisualState>({ mode: "idle", intensity: 0.3 });

  useEffect(() => {
    const unsub = subscribeToMockNeuralState((s) => setNeuralState(s));
    return () => unsub();
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000000",
      }}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1.2} />
        <SpinningCube state={neuralState} />
        <OrbitControls enableDamping />
      </Canvas>
    </div>
  );
}
