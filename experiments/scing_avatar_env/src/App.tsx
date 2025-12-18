import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Suspense, useEffect, useState } from 'react'
import Scene3D from './visual/Scene3D'
import { AVATAR_CENTER_Y, CAMERA_Z } from './visual/scale'
import { LAYER_AVATAR } from './visual/layers'

import HudCard from './ui/HudCard'
import RightRail from './ui/RightRail'

import { getDevOptions, resetDevOptions, setDevOptions, subscribeDevOptions, toggle } from './dev/devOptionsStore'
import { startMediaSensors, stopMediaSensors } from './sensors/mediaSensors'
import { resetAvatarStateToDefaults } from './influence/InfluenceBridge'

function StudioRig() {
  const [opt, setOpt] = useState(() => getDevOptions())
  useEffect(() => subscribeDevOptions(() => setOpt(getDevOptions())), [])

  if (!opt.studioLightsEnabled) return null

  // Intensity scales (kept bounded, designed for chrome highlights)
  const keyI = 1.05
  const fillI = 0.55
  const rimI = 0.95

  const setLightLayers = (l: THREE.Light | null) => {
    if (!l) return
    if (opt.studioLightsAffectOnlyAvatar) {
      // Avatar-only lighting layer (reflection stays avatar-only too)
      l.layers.enable(LAYER_AVATAR)
    } else {
      // Affect default env layer + avatar layer
      l.layers.enable(0)
      l.layers.enable(LAYER_AVATAR)
    }
  }

  return (
    <>
      {/* Low ambient just to keep shadows readable */}
      <ambientLight intensity={0.18} ref={setLightLayers} />

      <directionalLight
        position={[4.0, AVATAR_CENTER_Y + 2.0, 6.0]}
        intensity={keyI}
        color="#e9d7ff"
        ref={setLightLayers}
      />

      <directionalLight
        position={[-5.0, AVATAR_CENTER_Y + 1.0, 8.0]}
        intensity={fillI}
        color="#9fd7ff"
        ref={setLightLayers}
      />

      <directionalLight
        position={[0.0, AVATAR_CENTER_Y + 4.5, -6.0]}
        intensity={rimI}
        color="#c06bff"
        ref={setLightLayers}
      />
    </>
  )
}

// If you already have sensor start logic elsewhere, keep it.
// This CB does not force sensors on/off; it focuses on visual definition.

export default function App() {
  useEffect(() => {
    // Hard reset runtime state to known-visible defaults (runtime only; no persistence).
    resetAvatarStateToDefaults()
    // Prevent persisted "avatar off" from blanking the scene on boot (boot-only enforcement).
    setDevOptions({ showAvatar: true, showHud: true })
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (k === 'h') toggle('showHud')
      else if (k === 'd') toggle('showDevPanel')
      else if (k === 'a') toggle('showAvatar')
      else if (k === 'w') toggle('showWireframe')
      else if (k === 's') toggle('showStarfield')
      else if (k === 'r') resetDevOptions()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    let disposed = false
    let lastKey = ''

    const reconcile = () => {
      const opt = getDevOptions()
      const wantAudio = opt.enableMic
      const wantVideo = opt.enableCamera
      const nextKey = `${wantAudio ? 'a' : '-'}${wantVideo ? 'v' : '-'}`
      if (nextKey === lastKey) return
      lastKey = nextKey

      stopMediaSensors()
      if (!disposed && (wantAudio || wantVideo)) {
        startMediaSensors().catch(() => {
          // status is exposed in HUD via getMediaSensorsStatus
        })
      }
    }

    reconcile()
    const unsub = subscribeDevOptions(reconcile)

    return () => {
      disposed = true
      unsub()
      stopMediaSensors()
    }
  }, [])

  return (
    <>
      {/* HUD: locked top-left (toggleable) */}
      <HudCard />

      {/* Dev panel: locked top-right */}
      <RightRail />

      <Canvas
        camera={{ position: [0, AVATAR_CENTER_Y, CAMERA_Z], fov: 38, near: 0.05, far: 5000 }}
        dpr={[1, 2]}
        gl={{ antialias: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' }}
      >
        {/* Background: deep studio black-purple */}
        <color attach="background" args={['#05020b']} />

        {/* ===== STUDIO LIGHT RIG (THE BIG MOVE) ===== */}
        <StudioRig />

        <Suspense fallback={null}>
          <Scene3D />
        </Suspense>
      </Canvas>
    </>
  )
}
