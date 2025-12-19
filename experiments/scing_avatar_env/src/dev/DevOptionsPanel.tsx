import { useEffect, useState } from 'react'
import { getDevOptions, setDevOptions, subscribeDevOptions, type DevOptions } from './devOptionsStore'
import { setMediaEnabled, startMediaSensors, stopMediaSensors } from '../sensors/mediaSensors'

function Row(props: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontSize: 12, opacity: 0.92 }}>{props.label}</span>
      <input
        type="checkbox"
        checked={props.checked}
        onChange={(e) => props.onChange(e.currentTarget.checked)}
      />
    </label>
  )
}

function SliderRow(props: {
  label: string
  value: number
  min: number
  max: number
  step: number
  disabled: boolean
  onChange: (v: number) => void
}) {
  return (
    <div style={{ display: 'grid', gap: 6, opacity: props.disabled ? 0.55 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontSize: 12, opacity: 0.92 }}>{props.label}</span>
        <span style={{ fontSize: 12, opacity: 0.75 }}>{props.value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        disabled={props.disabled}
        onChange={(e) => props.onChange(Number(e.currentTarget.value))}
      />
    </div>
  )
}

export default function DevOptionsPanel() {
  const [opt, setOpt] = useState<DevOptions>(() => getDevOptions())

  useEffect(() => subscribeDevOptions(() => setOpt(getDevOptions())), [])

  if (!opt.devPanelVisible) return null

  const width = 'min(20vw, 320px)'

  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        right: 12,
        width,
        maxHeight: 'calc(100vh - 24px)',
        overflow: 'auto',
        zIndex: 40,
        pointerEvents: 'auto',
        background: 'rgba(8, 6, 14, 0.72)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 12,
        padding: 12,
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3, marginBottom: 10 }}>
        SCING AVATAR ENVIRONMENT DEV OPTIONS
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        <Row
          label="SCING AVATAR-LIVE HUD"
          checked={opt.hudVisible}
          onChange={(v) => setDevOptions({ hudVisible: v })}
        />
        <Row
          label="Avatar Visible"
          checked={opt.avatarVisible}
          onChange={(v) => setDevOptions({ avatarVisible: v })}
        />
        <Row
          label="Mesh Visible"
          checked={opt.meshVisible}
          onChange={(v) => setDevOptions({ meshVisible: v })}
        />
        <Row
          label="Starfield"
          checked={opt.starfieldEnabled}
          onChange={(v) => setDevOptions({ starfieldEnabled: v })}
        />
        <Row
          label="Mic Input"
          checked={opt.micEnabled}
          onChange={(v) => {
            setDevOptions({ micEnabled: v })
            setMediaEnabled({ mic: v })
            if (!v) {
              if (!getDevOptions().camEnabled) stopMediaSensors()
              return
            }
            void startMediaSensors({ mic: true, cam: getDevOptions().camEnabled })
          }}
        />
        <Row
          label="Camera Input"
          checked={opt.camEnabled}
          onChange={(v) => {
            setDevOptions({ camEnabled: v })
            setMediaEnabled({ cam: v })
            if (!v) {
              if (!getDevOptions().micEnabled) stopMediaSensors()
              return
            }
            void startMediaSensors({ mic: getDevOptions().micEnabled, cam: true })
          }}
        />

        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '6px 0' }} />

        <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.95 }}>Floor Reflection</div>
        <Row
          label="Floor Reflection"
          checked={opt.floorReflectEnabled}
          onChange={(v) => setDevOptions({ floorReflectEnabled: v })}
        />
        <SliderRow
          label="Intensity"
          value={opt.floorReflectIntensity}
          min={0.0}
          max={1.0}
          step={0.01}
          disabled={!opt.floorReflectEnabled}
          onChange={(v) => setDevOptions({ floorReflectIntensity: v })}
        />
        <SliderRow
          label="Radius (tightness)"
          value={opt.floorReflectRadius}
          min={0.1}
          max={0.9}
          step={0.01}
          disabled={!opt.floorReflectEnabled}
          onChange={(v) => setDevOptions({ floorReflectRadius: v })}
        />
        <SliderRow
          label="Sharpness"
          value={opt.floorReflectSharpness}
          min={1.0}
          max={6.0}
          step={0.01}
          disabled={!opt.floorReflectEnabled}
          onChange={(v) => setDevOptions({ floorReflectSharpness: v })}
        />
        <div style={{ fontSize: 11, opacity: 0.72, lineHeight: 1.25 }}>
          Tighter radius + higher sharpness = condensed reflection
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '6px 0' }} />

        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 12, opacity: 0.92 }}>Active Phase Palette</span>
          </div>
          <select
            value={opt.paletteMode}
            onChange={(e) => setDevOptions({ paletteMode: e.currentTarget.value as DevOptions['paletteMode'] })}
            disabled={opt.chromaEnabled}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(8, 6, 14, 0.65)',
              color: 'rgba(255,255,255,0.92)',
              fontSize: 12,
              opacity: opt.chromaEnabled ? 0.6 : 1,
            }}
          >
            <option value="SCING">SCING</option>
            <option value="LARI">LARI</option>
            <option value="BANE">BANE</option>
          </select>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '6px 0' }} />

        <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.95 }}>Chroma Workstation</div>
        <Row label="Chroma Enabled" checked={opt.chromaEnabled} onChange={(v) => setDevOptions({ chromaEnabled: v })} />
        <div style={{ display: 'grid', gap: 6, opacity: opt.chromaEnabled ? 1 : 0.55 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 12, opacity: 0.92 }}>Chroma Channel</span>
          </div>
          <select
            value={opt.chromaChannel}
            disabled={!opt.chromaEnabled}
            onChange={(e) => setDevOptions({ chromaChannel: e.currentTarget.value as DevOptions['chromaChannel'] })}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(8, 6, 14, 0.65)',
              color: 'rgba(255,255,255,0.92)',
              fontSize: 12,
            }}
          >
            <option value="SCING">SCING</option>
            <option value="LARI">LARI</option>
            <option value="BANE">BANE</option>
          </select>
        </div>
        <SliderRow
          label="Chroma Rate"
          value={opt.chromaRate}
          min={0.2}
          max={2.5}
          step={0.01}
          disabled={!opt.chromaEnabled}
          onChange={(v) => setDevOptions({ chromaRate: v })}
        />
        <SliderRow
          label="Chroma Intensity"
          value={opt.chromaIntensity}
          min={0.2}
          max={1.8}
          step={0.01}
          disabled={!opt.chromaEnabled}
          onChange={(v) => setDevOptions({ chromaIntensity: v })}
        />
        <SliderRow
          label="Chroma Phase Bias"
          value={opt.chromaPhaseBias}
          min={-1.0}
          max={1.0}
          step={0.01}
          disabled={!opt.chromaEnabled}
          onChange={(v) => setDevOptions({ chromaPhaseBias: v })}
        />

        <Row label="Light Rig" checked={opt.lightRigEnabled} onChange={(v) => setDevOptions({ lightRigEnabled: v })} />
        <SliderRow
          label="Light Rig Intensity"
          value={opt.lightRigIntensity}
          min={0.25}
          max={1.75}
          step={0.01}
          disabled={!opt.lightRigEnabled}
          onChange={(v) => setDevOptions({ lightRigIntensity: v })}
        />
      </div>
    </div>
  )
}
