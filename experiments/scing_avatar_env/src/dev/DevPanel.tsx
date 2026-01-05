import { useEffect, useMemo, useState } from 'react'
import DevCard from './DevCard'
import {
  applyCinematicPreset,
  exportDevOptionsJSON,
  getDevOptions,
  importDevOptionsJSON,
  resetDevOptions,
  setChromaWorkstation,
  setDevOptions,
  subscribeDevOptions,
  toggleDevOption,
  type DevOptions,
} from './devOptions'

function Row(props: { label: string; on: boolean; onToggle: () => void; hint?: string }) {
  return (
    <button
      onClick={props.onToggle}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        padding: '8px 10px',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.08)',
        background: props.on ? 'rgba(138, 92, 255, 0.16)' : 'rgba(255,255,255,0.04)',
        color: 'inherit',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
        <div style={{ fontSize: 12.5 }}>{props.label}</div>
        {props.hint ? <div style={{ fontSize: 11, opacity: 0.65 }}>{props.hint}</div> : null}
      </div>
      <div
        style={{
          width: 40,
          height: 22,
          borderRadius: 999,
          background: props.on ? 'rgba(85, 230, 255, 0.35)' : 'rgba(255,255,255,0.10)',
          border: '1px solid rgba(255,255,255,0.10)',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 999,
            background: props.on ? 'rgba(200, 180, 255, 0.95)' : 'rgba(240,240,255,0.65)',
            position: 'absolute',
            top: 1.5,
            left: props.on ? 20 : 2,
            transition: 'left 120ms linear',
          }}
        />
      </div>
    </button>
  )
}

function SliderRow(props: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: '8px 10px',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ fontSize: 12.5, opacity: 0.9 }}>{props.label}</div>
        <div style={{ fontSize: 11, opacity: 0.65 }}>{props.value.toFixed(3)}</div>
      </div>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  )
}

export default function DevPanel() {
  const [opt, setOpt] = useState<DevOptions>(() => getDevOptions())
  const [chromaOpen, setChromaOpen] = useState(false)
  const [reflectionOpen, setReflectionOpen] = useState(false)

  useEffect(() => subscribeDevOptions(() => setOpt(getDevOptions())), [])

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // avoid hijacking typing
      if ((e.target as HTMLElement | null)?.tagName === 'INPUT') return

      if (e.key === 'h' || e.key === 'H') toggleDevOption('showHud') // HUD toggle
      if (e.key === 'p' || e.key === 'P') toggleDevOption('showDevPanel') // panel toggle
      if (e.key === 'm' || e.key === 'M') toggleDevOption('micEnabled') // mic toggle
      if (e.key === 'c' || e.key === 'C') toggleDevOption('camEnabled') // cam toggle
      if (e.key === 'w' || e.key === 'W') toggleDevOption('showMeshWire') // wire toggle
      if (e.key === 's' || e.key === 'S') toggleDevOption('showStarfield') // stars toggle
      if (e.key === 'a' || e.key === 'A') toggleDevOption('showAvatar') // avatar toggle
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const content = useMemo(() => {
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <Row label="SCING AVATAR-LIVE HUD" on={opt.showHud} onToggle={() => toggleDevOption('showHud')} hint="Toggle: H" />
        <Row label="Avatar" on={opt.showAvatar} onToggle={() => toggleDevOption('showAvatar')} hint="Toggle: A" />
        <Row
          label="Mesh Wire Overlay"
          on={opt.showMeshWire}
          onToggle={() => toggleDevOption('showMeshWire')}
          hint="Toggle: W"
        />
        <Row label="Starfield" on={opt.showStarfield} onToggle={() => toggleDevOption('showStarfield')} hint="Toggle: S" />
        <Row label="Mic Input" on={opt.micEnabled} onToggle={() => toggleDevOption('micEnabled')} hint="Toggle: M" />
        <Row label="Camera Input" on={opt.camEnabled} onToggle={() => toggleDevOption('camEnabled')} hint="Toggle: C" />
        <Row
          label="Orbit Controls"
          on={opt.enableOrbitControls}
          onToggle={() => toggleDevOption('enableOrbitControls')}
          hint="Manual camera control"
        />
        <Row label="Auto Rotate" on={opt.autoRotate} onToggle={() => toggleDevOption('autoRotate')} hint="Hands-off motion" />

        <button
          onClick={() => setReflectionOpen((v) => !v)}
          style={{
            marginTop: 6,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            padding: '8px 10px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: 'inherit',
            cursor: 'pointer',
            opacity: 0.95,
          }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 700 }}>Reflection / Floor</div>
          <div style={{ fontSize: 11, opacity: 0.65 }}>{reflectionOpen ? 'Hide' : 'Show'}</div>
        </button>

        {reflectionOpen ? (
          <>
            <Row
              label="Reflection Enabled"
              on={opt.reflection.enabled}
              onToggle={() => setDevOptions({ reflection: { ...opt.reflection, enabled: !opt.reflection.enabled } })}
            />
            <SliderRow
              label="Mirror Strength"
              value={opt.reflection.mirror}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setDevOptions({ reflection: { ...opt.reflection, mirror: v } })}
            />
            <SliderRow
              label="Intensity Scalar"
              value={opt.reflection.strength}
              min={0}
              max={2}
              step={0.01}
              onChange={(v) => setDevOptions({ reflection: { ...opt.reflection, strength: v } })}
            />
            <SliderRow
              label="Organic Distortion"
              value={opt.reflection.distortion}
              min={0}
              max={0.5}
              step={0.01}
              onChange={(v) => setDevOptions({ reflection: { ...opt.reflection, distortion: v } })}
            />
          </>
        ) : null}

        <div style={{ marginTop: 6, fontSize: 11, opacity: 0.65 }}>POST FX</div>
        <SliderRow
          label="Bloom Intensity"
          value={opt.bloomIntensity}
          min={0}
          max={2}
          step={0.01}
          onChange={(v) => setDevOptions({ bloomIntensity: v })}
        />
        <SliderRow
          label="Bloom Threshold"
          value={opt.bloomThreshold}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setDevOptions({ bloomThreshold: v })}
        />
        <SliderRow
          label="Chroma Offset"
          value={opt.chromaOffset}
          min={0}
          max={0.01}
          step={0.0001}
          onChange={(v) => setDevOptions({ chromaOffset: v })}
        />
        <SliderRow
          label="Vignette Darkness"
          value={opt.vignetteDarkness}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setDevOptions({ vignetteDarkness: v })}
        />
        <SliderRow
          label="Vignette Offset"
          value={opt.vignetteOffset}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setDevOptions({ vignetteOffset: v })}
        />

        <div style={{ marginTop: 6, fontSize: 11, opacity: 0.65 }}>LIGHTING</div>
        <SliderRow
          label="Key Light"
          value={opt.lightKey}
          min={0}
          max={2}
          step={0.01}
          onChange={(v) => setDevOptions({ lightKey: v })}
        />
        <SliderRow
          label="Fill Light"
          value={opt.lightFill}
          min={0}
          max={2}
          step={0.01}
          onChange={(v) => setDevOptions({ lightFill: v })}
        />
        <SliderRow
          label="Rim Light"
          value={opt.lightRim}
          min={0}
          max={2}
          step={0.01}
          onChange={(v) => setDevOptions({ lightRim: v })}
        />

        <button
          onClick={() => setChromaOpen((v) => !v)}
          style={{
            marginTop: 6,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            padding: '8px 10px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: 'inherit',
            cursor: 'pointer',
            opacity: 0.95,
          }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 700 }}>CHROMA WORKSTATION</div>
          <div style={{ fontSize: 11, opacity: 0.65 }}>{chromaOpen ? 'Hide' : 'Show'}</div>
        </button>

        {chromaOpen ? (
          <>
            <Row
              label="Enabled"
              on={opt.chromaWorkstation.enabled}
              onToggle={() => setChromaWorkstation({ enabled: !opt.chromaWorkstation.enabled })}
              hint="Optional visual hook (no hardware)"
            />
            <SliderRow
              label="Master Intensity"
              value={opt.chromaWorkstation.masterIntensity}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setChromaWorkstation({ masterIntensity: v })}
            />
            <SliderRow
              label="Device Brightness Cap"
              value={opt.chromaWorkstation.brightnessCap}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setChromaWorkstation({ brightnessCap: v })}
            />
            <SliderRow
              label="Hue Shift"
              value={opt.chromaWorkstation.hueShift}
              min={-1}
              max={1}
              step={0.01}
              onChange={(v) => setChromaWorkstation({ hueShift: v })}
            />
            <SliderRow
              label="Wave Speed"
              value={opt.chromaWorkstation.waveSpeed}
              min={0}
              max={3}
              step={0.01}
              onChange={(v) => setChromaWorkstation({ waveSpeed: v })}
            />
            <SliderRow
              label="Strobe"
              value={opt.chromaWorkstation.strobe}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setChromaWorkstation({ strobe: v })}
            />
            <SliderRow
              label="Update Hz"
              value={opt.chromaWorkstation.updateHz}
              min={5}
              max={60}
              step={1}
              onChange={(v) => setChromaWorkstation({ updateHz: v })}
            />
          </>
        ) : null}

        <div style={{ marginTop: 6, fontSize: 11, opacity: 0.65 }}>PRESETS</div>
        <button
          onClick={() => applyCinematicPreset()}
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: 'inherit',
            cursor: 'pointer',
            opacity: 0.9,
          }}
        >
          Apply Cinematic Preset
        </button>

        <button
          onClick={() => {
            const json = exportDevOptionsJSON()
            navigator.clipboard.writeText(json).catch(() => {})
          }}
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: 'inherit',
            cursor: 'pointer',
            opacity: 0.9,
          }}
        >
          Copy Preset JSON
        </button>

        <button
          onClick={async () => {
            const txt = await navigator.clipboard.readText().catch(() => '')
            if (txt) importDevOptionsJSON(txt)
          }}
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: 'inherit',
            cursor: 'pointer',
            opacity: 0.9,
          }}
        >
          Paste Preset JSON
        </button>

        <button
          onClick={() => resetDevOptions()}
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: 'inherit',
            cursor: 'pointer',
            opacity: 0.9,
          }}
        >
          Reset Preset
        </button>

        <button
          onClick={() => setDevOptions({ ...opt, showDevPanel: false })}
          style={{
            marginTop: 6,
            width: '100%',
            padding: '8px 10px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: 'inherit',
            cursor: 'pointer',
            opacity: 0.85,
          }}
        >
          Hide Dev Panel (P)
        </button>

        <div style={{ marginTop: 6, fontSize: 11, opacity: 0.65 }}>
          Shortcuts: H HUD · P Panel · A Avatar · W Wire · S Stars · M Mic · C Cam
        </div>
      </div>
    )
  }, [chromaOpen, reflectionOpen, opt])

  if (!opt.showDevPanel) return null

  return (
    <DevCard title="SCING AVATAR ENVIRONMENT DEV OPTIONS" side="right">
      {content}
    </DevCard>
  )
}
