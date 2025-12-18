import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'
import Scene3D from './visual/Scene3D'
import { AVATAR_CENTER_Y, CAMERA_Z } from './visual/scale'
import ScingAvatarLiveHud from './hud/ScingAvatarLiveHud'
import DevOptionsPanel from './dev/DevOptionsPanel'

import { getDevOptions, setDevOptions, subscribeDevOptions } from './dev/devOptionsStore'
import { startMediaSensors, stopMediaSensors } from './sensors/mediaSensors'
import { resetAvatarStateToDefaults } from './influence/InfluenceBridge'

// If you already have sensor start logic elsewhere, keep it.
// This CB does not force sensors on/off; it focuses on visual definition.

export default function App() {
  useEffect(() => {
    // Hard reset runtime state to known-visible defaults (runtime only; no persistence).
    resetAvatarStateToDefaults()
    // Prevent persisted "avatar off" from blanking the scene on boot (boot-only enforcement).
    setDevOptions({ avatarVisible: true, hudVisible: true })
  }, [])

  useEffect(() => {
    let disposed = false
    let lastKey = ''

    const reconcile = () => {
      const opt = getDevOptions()
      const wantAudio = opt.micEnabled
      const wantVideo = opt.cameraEnabled
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
      <ScingAvatarLiveHud />

      {/* Dev panel: locked top-right (<= 20% viewport) */}
      <DevOptionsPanel />

      <Canvas
        camera={{ position: [0, AVATAR_CENTER_Y, CAMERA_Z], fov: 38, near: 0.05, far: 5000 }}
        dpr={[1, 2]}
        gl={{ antialias: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' }}
      >
        {/* Background: deep studio black-purple */}
        <color attach="background" args={['#05020b']} />

        {/* Minimal ambient so the scene is never "black" */}
        <ambientLight intensity={0.18} />

        <Suspense fallback={null}>
          <Scene3D />
        </Suspense>
      </Canvas>
    </>
  )
}
