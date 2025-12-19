import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Suspense, useEffect, useMemo, useState } from 'react'
import Scene3D from './visual/Scene3D'
import { AVATAR_CENTER_Y, CAMERA_Z } from './visual/scale'
import ScingAvatarLiveHud from './hud/ScingAvatarLiveHud'
import DevOptionsPanel from './dev/DevOptionsPanel'

import { getDevOptions, setDevOptions, subscribeDevOptions, type DevOptions } from './dev/devOptionsStore'
import { LAYER_AVATAR } from './visual/layers'
import { getMediaStatus, setMediaEnabled, startMediaSensors, stopMediaSensors } from './sensors/mediaSensors'
import { resetAvatarStateToDefaults, setAvatarState } from './influence/InfluenceBridge'

// If you already have sensor start logic elsewhere, keep it.
// This CB does not force sensors on/off; it focuses on visual definition.

export default function App() {
  const [opt, setOpt] = useState<DevOptions>(() => getDevOptions())

  useEffect(() => subscribeDevOptions(() => setOpt(getDevOptions())), [])

  const lightTarget = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.set(0, AVATAR_CENTER_Y, 0)
    return o
  }, [])

  useEffect(() => {
    // Hard reset runtime state to known-visible defaults (runtime only; no persistence).
    resetAvatarStateToDefaults()
    // Prevent persisted "avatar off" from blanking the scene on boot (boot-only enforcement).
    setDevOptions({ avatarVisible: true, hudVisible: true })
  }, [])

  useEffect(() => {
    let lastMic = getDevOptions().micEnabled
    let lastCam = getDevOptions().camEnabled

    // Start sensors on boot using dev toggles.
    setMediaEnabled({ mic: lastMic, cam: lastCam })
    void startMediaSensors({ mic: lastMic, cam: lastCam })

    const unsub = subscribeDevOptions(() => {
      const o = getDevOptions()
      if (o.micEnabled === lastMic && o.camEnabled === lastCam) return

      // Apply desired state immediately.
      setMediaEnabled({ mic: o.micEnabled, cam: o.camEnabled })

      // If enabling, start streams (exact request set determined by the current toggles).
      if ((o.micEnabled && !lastMic) || (o.camEnabled && !lastCam)) {
        void startMediaSensors({ mic: o.micEnabled, cam: o.camEnabled })
      }

      // If disabling both, fully stop.
      if (!o.micEnabled && !o.camEnabled) {
        stopMediaSensors()
      }

      lastMic = o.micEnabled
      lastCam = o.camEnabled
    })

    return () => {
      unsub()
      stopMediaSensors()
    }
  }, [])

  useEffect(() => {
    // Sensor-driven avatar state driver (deterministic; no Math.random).
    const id = window.setInterval(() => {
      const s = getMediaStatus()
      const t = performance.now() * 0.001

      const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

      const mic = clamp01(s.micRms)
      const camMotion = clamp01(s.camMotion)

      const arousal = clamp01(mic * 1.35)

      // Rhythm rises with voice and gets a tiny deterministic phase nudge from pitch.
      let rhythm = clamp01(mic * 1.1)
      if (s.pitchHz > 0 && s.pitchClarity > 0) {
        const phase = Math.sin(t * 1.9 + s.pitchHz * 0.01)
        rhythm = clamp01(rhythm + phase * 0.05 * clamp01(s.pitchClarity))
      }

      const focus = clamp01(0.55 + 0.35 * (1 - camMotion))
      const cognitiveLoad = clamp01(0.35 + 0.65 * camMotion)

      // Small bounded oscillation from pitch clarity (no randomness).
      const valence = clamp01(s.pitchClarity) * 0.22 * Math.sin(t * 0.33)

      setAvatarState({
        arousal,
        rhythm,
        focus,
        cognitiveLoad,
        valence,
        entropy: 0.04,
      })
    }, 50)

    return () => window.clearInterval(id)
  }, [])

  return (
    <>
      {/* HUD: locked top-left (toggleable) */}
      <ScingAvatarLiveHud />

      {/* Dev panel: locked top-right (<= 20% viewport) */}
      <DevOptionsPanel />

      <Canvas
        camera={{ position: [0, AVATAR_CENTER_Y, CAMERA_Z], fov: 38, near: 0.05, far: 5000 }}
        dpr={[1, 2]}
        gl={{ antialias: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' }}
        onCreated={({ camera }) => {
          camera.lookAt(0, AVATAR_CENTER_Y, 0)
          camera.updateMatrixWorld()
        }}
      >
        {/* Background: deep studio black-purple */}
        <color attach="background" args={['#05020b']} />

        {/* Ambient must stay extremely low to preserve contrast */}
        <ambientLight intensity={0.06} />

        {/* Shared spotlight target at avatar center (hover height accounted for) */}
        <primitive object={lightTarget} />

        {/* Stage 3: Cinematic 4-spot light rig (single source of truth) */}
        <spotLight
          // A) GOLDEN KEY (primary contour)
          color={'#ffcc3a'}
          position={[3.8, 2.6, 2.8]}
          target={lightTarget}
          intensity={opt.lightRigEnabled ? 45 * opt.lightRigIntensity : 0}
          distance={18}
          angle={0.42}
          penumbra={0.85}
          decay={2}
          castShadow={false}
          onUpdate={(o) => o.layers.set(LAYER_AVATAR)}
        />

        <spotLight
          // B) VIOLET RIM (back/side rim)
          color={'#7a2cff'}
          position={[-4.2, 3.1, -1.8]}
          target={lightTarget}
          intensity={opt.lightRigEnabled ? 32 * opt.lightRigIntensity : 0}
          distance={18}
          angle={0.48}
          penumbra={0.95}
          decay={2}
          onUpdate={(o) => o.layers.set(LAYER_AVATAR)}
        />

        <spotLight
          // C) MAGENTA SHEAR (lateral color break)
          color={'#ff2dbd'}
          position={[-1.2, 1.9, 4.4]}
          target={lightTarget}
          intensity={opt.lightRigEnabled ? 28 * opt.lightRigIntensity : 0}
          distance={16}
          angle={0.5}
          penumbra={0.9}
          decay={2}
          onUpdate={(o) => o.layers.set(LAYER_AVATAR)}
        />

        <spotLight
          // D) SOFT WHITE FILL (support only; not dominant)
          color={'#ffffff'}
          position={[1.6, 4.6, -4.6]}
          target={lightTarget}
          intensity={opt.lightRigEnabled ? 10 * opt.lightRigIntensity : 0}
          distance={22}
          angle={0.55}
          penumbra={1.0}
          decay={2}
          onUpdate={(o) => o.layers.set(LAYER_AVATAR)}
        />

        <Suspense fallback={null}>
          <Scene3D />
        </Suspense>
      </Canvas>
    </>
  )
}
