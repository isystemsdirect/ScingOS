import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'
import Scene3D from './visual/Scene3D'
import { LAYER_AVATAR } from './visual/layers'
import { AVATAR_CENTER_Y, CAMERA_Z } from './visual/scale'

import DevPanel from './ui/DevPanel'
import HudCard from './ui/HudCard'

import { getDevOptions, subscribeDevOptions } from './dev/devOptionsStore'
import { startMediaSensors, stopMediaSensors } from './sensors/mediaSensors'

function StudioRig() {
  const [opt, setOpt] = useState(() => getDevOptions())
  useEffect(() => subscribeDevOptions(() => setOpt(getDevOptions())), [])

  const keyI = 1.05 * opt.keyLightIntensity
  const fillI = 0.55 * opt.fillLightIntensity
  const rimI = 0.95 * opt.rimLightIntensity

  return (
    <>
      {/* Low ambient just to keep shadows readable */}
      <ambientLight intensity={0.18} ref={(l) => { if (l) l.layers.set(LAYER_AVATAR) }} />

      <directionalLight
        position={[4.0, AVATAR_CENTER_Y + 2.0, 6.0]}
        intensity={keyI}
        color="#e9d7ff"
        ref={(l) => {
          if (l) l.layers.set(LAYER_AVATAR)
        }}
      />

      <directionalLight
        position={[-5.0, AVATAR_CENTER_Y + 1.0, 8.0]}
        intensity={fillI}
        color="#9fd7ff"
        ref={(l) => {
          if (l) l.layers.set(LAYER_AVATAR)
        }}
      />

      <directionalLight
        position={[0.0, AVATAR_CENTER_Y + 4.5, -6.0]}
        intensity={rimI}
        color="#c06bff"
        ref={(l) => {
          if (l) l.layers.set(LAYER_AVATAR)
        }}
      />
    </>
  )
}

// If you already have sensor start logic elsewhere, keep it.
// This CB does not force sensors on/off; it focuses on visual definition.

export default function App() {
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
      {/* Dev overlay(s) */}
      <DevPanel />
      <HudCard />

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
