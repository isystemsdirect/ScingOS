import { useMemo, useState } from 'react'
import DevCard from '../dev/DevCard'
import { setDevOptions, toggle, type DevOptions } from '../dev/devOptionsStore'
import { useDevOptionsStore } from '../dev/useDevOptionsStore'

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

function TextRow(props: { label: string; value: string; onChange: (v: string) => void }) {
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
      <div style={{ fontSize: 12.5, opacity: 0.9 }}>{props.label}</div>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '6px 8px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.10)',
          background: 'rgba(0,0,0,0.25)',
          color: 'inherit',
          outline: 'none',
        }}
      />
    </div>
  )
}

function NumberRow(props: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
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
        <div style={{ fontSize: 11, opacity: 0.65 }}>{props.value}</div>
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

function withPatch(p: Partial<DevOptions>) {
  setDevOptions(p)
}

export default function DevPanel() {
  const opt = useDevOptionsStore()
  const [materialOpen, setMaterialOpen] = useState(true)
  const [floorOpen, setFloorOpen] = useState(true)
  const [lightsOpen, setLightsOpen] = useState(false)
  const [chromaOpen, setChromaOpen] = useState(false)

  const content = useMemo(() => {
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ fontSize: 11, opacity: 0.65 }}>SCENE</div>
        <Row label="Starfield" on={opt.starfieldVisible} onToggle={() => toggle('starfieldVisible')} />
        <Row label="Avatar" on={opt.avatarVisible} onToggle={() => toggle('avatarVisible')} />
        <Row label="Mesh Wire" on={opt.meshWireVisible} onToggle={() => toggle('meshWireVisible')} />

        <div style={{ marginTop: 6, fontSize: 11, opacity: 0.65 }}>SENSORS</div>
        <Row label="Mic" on={opt.micEnabled} onToggle={() => toggle('micEnabled')} />
        <Row label="Camera" on={opt.cameraEnabled} onToggle={() => toggle('cameraEnabled')} />

        <button
          onClick={() => setFloorOpen((v) => !v)}
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
          <div style={{ fontSize: 12.5, fontWeight: 700 }}>FLOOR ECHO</div>
          <div style={{ fontSize: 11, opacity: 0.65 }}>{floorOpen ? 'Hide' : 'Show'}</div>
        </button>

        {floorOpen ? (
          <>
            <Row label="Enabled" on={opt.floorEchoEnabled} onToggle={() => toggle('floorEchoEnabled')} />
            <SliderRow
              label="Strength"
              value={opt.floorEchoStrength}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => withPatch({ floorEchoStrength: v })}
            />
            <SliderRow
              label="Blur"
              value={opt.floorEchoBlur}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => withPatch({ floorEchoBlur: v })}
            />
            <SliderRow
              label="Squash"
              value={opt.floorEchoSquash}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => withPatch({ floorEchoSquash: v })}
            />
            <SliderRow
              label="Radius"
              value={opt.floorEchoRadius}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => withPatch({ floorEchoRadius: v })}
            />
          </>
        ) : null}

        <button
          onClick={() => setMaterialOpen((v) => !v)}
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
          <div style={{ fontSize: 12.5, fontWeight: 700 }}>MATERIAL</div>
          <div style={{ fontSize: 11, opacity: 0.65 }}>{materialOpen ? 'Hide' : 'Show'}</div>
        </button>

        {materialOpen ? (
          <>
            <SliderRow
              label="Spec Intensity"
              value={opt.specIntensity}
              min={0}
              max={2}
              step={0.01}
              onChange={(v) => withPatch({ specIntensity: v })}
            />
            <SliderRow
              label="Vein Intensity"
              value={opt.veinIntensity}
              min={0}
              max={2}
              step={0.01}
              onChange={(v) => withPatch({ veinIntensity: v })}
            />
            <SliderRow
              label="Glass Thickness"
              value={opt.glassThickness}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => withPatch({ glassThickness: v })}
            />
            <SliderRow
              label="Filament Strength"
              value={opt.filamentStrength}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => withPatch({ filamentStrength: v })}
            />
          </>
        ) : null}

        <button
          onClick={() => setLightsOpen((v) => !v)}
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
          <div style={{ fontSize: 12.5, fontWeight: 700 }}>CONTOUR LIGHTS</div>
          <div style={{ fontSize: 11, opacity: 0.65 }}>{lightsOpen ? 'Hide' : 'Show'}</div>
        </button>

        {lightsOpen ? (
          <>
            <SliderRow
              label="Key"
              value={opt.keyLightIntensity}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => withPatch({ keyLightIntensity: v })}
            />
            <SliderRow
              label="Rim"
              value={opt.rimLightIntensity}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => withPatch({ rimLightIntensity: v })}
            />
            <SliderRow
              label="Fill"
              value={opt.fillLightIntensity}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => withPatch({ fillLightIntensity: v })}
            />
          </>
        ) : null}

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
            <Row label="Enabled" on={opt.chromaWorkstationEnabled} onToggle={() => toggle('chromaWorkstationEnabled')} />
            <TextRow label="Host" value={opt.chromaHost} onChange={(v) => withPatch({ chromaHost: v })} />
            <NumberRow
              label="Port"
              value={opt.chromaPort}
              min={1}
              max={65535}
              step={1}
              onChange={(v) => withPatch({ chromaPort: Math.floor(v) })}
            />
            <NumberRow
              label="Update Hz"
              value={opt.chromaUpdateHz}
              min={5}
              max={60}
              step={1}
              onChange={(v) => withPatch({ chromaUpdateHz: Math.floor(v) })}
            />
            <Row
              label="Map Arousal → Brightness"
              on={opt.chromaMapArousalToBrightness}
              onToggle={() => toggle('chromaMapArousalToBrightness')}
            />
            <Row label="Map Focus → Blue" on={opt.chromaMapFocusToBlue} onToggle={() => toggle('chromaMapFocusToBlue')} />
            <SliderRow
              label="Valence Hue Shift"
              value={opt.chromaValenceHueShift}
              min={-1}
              max={1}
              step={0.01}
              onChange={(v) => withPatch({ chromaValenceHueShift: v })}
            />
          </>
        ) : null}
      </div>
    )
  }, [
    opt.avatarVisible,
    opt.cameraEnabled,
    opt.chromaHost,
    opt.chromaMapArousalToBrightness,
    opt.chromaMapFocusToBlue,
    opt.chromaPort,
    opt.chromaUpdateHz,
    opt.chromaValenceHueShift,
    opt.chromaWorkstationEnabled,
    opt.filamentStrength,
    opt.fillLightIntensity,
    opt.floorEchoBlur,
    opt.floorEchoEnabled,
    opt.floorEchoRadius,
    opt.floorEchoSquash,
    opt.floorEchoStrength,
    opt.keyLightIntensity,
    opt.meshWireVisible,
    opt.micEnabled,
    opt.rimLightIntensity,
    opt.specIntensity,
    opt.starfieldVisible,
    opt.veinIntensity,
    opt.glassThickness,
    floorOpen,
    materialOpen,
    lightsOpen,
    chromaOpen,
  ])

  return (
    <DevCard title="DEV PANEL" side="right" top={14}>
      {content}
    </DevCard>
  )
}
