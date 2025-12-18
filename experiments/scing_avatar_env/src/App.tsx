import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Suspense, useEffect, useMemo, useState } from 'react'
import Scene3D from './visual/Scene3D'
import { AVATAR_CENTER_Y, CAMERA_Z } from './visual/scale'
import ScingAvatarLiveHud from './hud/ScingAvatarLiveHud'
import DevOptionsPanel from './dev/DevOptionsPanel'

import { getDevOptions, setDevOptions, subscribeDevOptions, type DevOptions } from './dev/devOptionsStore'
import { LAYER_AVATAR } from './visual/layers'
import { startMediaSensors, stopMediaSensors } from './sensors/mediaSensors'
import { resetAvatarStateToDefaults } from './influence/InfluenceBridge'

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
