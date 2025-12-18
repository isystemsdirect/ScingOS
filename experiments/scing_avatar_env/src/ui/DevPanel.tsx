import { setDevOptions, toggle } from '../dev/devOptionsStore'
import { useDevOptionsStore } from '../dev/useDevOptionsStore'

function SectionTitle(props: { children: string }) {
  return <div style={{ marginTop: 10, fontSize: 11, opacity: 0.65 }}>{props.children}</div>
}

function ToggleRow(props: { label: string; value: boolean; onToggle: () => void; hint?: string }) {
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
        background: props.value ? 'rgba(138, 92, 255, 0.16)' : 'rgba(255,255,255,0.04)',
        color: 'inherit',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
        <div style={{ fontSize: 12.5 }}>{props.label}</div>
        {props.hint ? <div style={{ fontSize: 11, opacity: 0.65 }}>{props.hint}</div> : null}
      </div>
      <div style={{ fontSize: 11, opacity: 0.85 }}>{props.value ? 'ON' : 'OFF'}</div>
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

function SelectRow(props: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
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
      <div style={{ fontSize: 12.5, opacity: 0.9 }}>{props.label}</div>
      <select
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
      >
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function DevPanel() {
  const opt = useDevOptionsStore()

  return (
    <div
      style={{
        width: '100%',
        padding: 12,
        borderRadius: 12,
        background: 'rgba(8, 6, 18, 0.78)',
        border: '1px solid rgba(138, 92, 255, 0.30)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
        color: 'rgba(240,240,255,0.92)',
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
        fontSize: 12.5,
        lineHeight: 1.25,
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ marginBottom: 10, fontSize: 12, letterSpacing: 0.6, opacity: 0.9 }}>
        SCING AVATAR ENVIRONMENT DEV OPTIONS
      </div>

      <SectionTitle>Visibility</SectionTitle>
      <div style={{ display: 'grid', gap: 8 }}>
        <ToggleRow label="Avatar" value={opt.showAvatar} onToggle={() => toggle('showAvatar')} />
        <ToggleRow label="HUD" value={opt.showHud} onToggle={() => toggle('showHud')} hint="Hotkey: H" />
        <ToggleRow label="Dev Panel" value={opt.showDevPanel} onToggle={() => toggle('showDevPanel')} hint="Hotkey: D" />
        <ToggleRow label="Starfield" value={opt.showStarfield} onToggle={() => toggle('showStarfield')} hint="Hotkey: S" />
        <ToggleRow label="Wireframe" value={opt.showWireframe} onToggle={() => toggle('showWireframe')} hint="Hotkey: W" />
        <ToggleRow label="Mesh" value={opt.showMesh} onToggle={() => toggle('showMesh')} />
      </div>

      <SectionTitle>Camera</SectionTitle>
      <div style={{ display: 'grid', gap: 8 }}>
        <ToggleRow label="Allow controls" value={opt.allowCameraControls} onToggle={() => toggle('allowCameraControls')} />
        <ToggleRow label="Autorotate" value={opt.autorotateCamera} onToggle={() => toggle('autorotateCamera')} />
        <div style={{ fontSize: 11, opacity: 0.65, paddingLeft: 2 }}>Zoom limits: min 0.9 / max 800</div>
      </div>

      <SectionTitle>Lighting</SectionTitle>
      <div style={{ display: 'grid', gap: 8 }}>
        <ToggleRow label="Studio lights" value={opt.studioLightsEnabled} onToggle={() => toggle('studioLightsEnabled')} />
        <ToggleRow
          label="Lights affect only avatar"
          value={opt.studioLightsAffectOnlyAvatar}
          onToggle={() => toggle('studioLightsAffectOnlyAvatar')}
          hint="Prevents floor/specular pollution"
        />
        <SliderRow label="Bloom" value={opt.bloomIntensity} min={0} max={2} step={0.01} onChange={(v) => setDevOptions({ bloomIntensity: v })} />
        <SliderRow label="Rim" value={opt.rimStrength} min={0} max={1} step={0.01} onChange={(v) => setDevOptions({ rimStrength: v })} />
      </div>

      <SectionTitle>Floor Reflection</SectionTitle>
      <div style={{ display: 'grid', gap: 8 }}>
        <ToggleRow label="Enabled" value={opt.reflectionEnabled} onToggle={() => toggle('reflectionEnabled')} />
        <SliderRow
          label="Strength"
          value={opt.reflectionStrength}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setDevOptions({ reflectionStrength: v })}
        />
        <SliderRow label="Blur" value={opt.reflectionBlur} min={0} max={1} step={0.01} onChange={(v) => setDevOptions({ reflectionBlur: v })} />
        <SliderRow
          label="Height"
          value={opt.reflectionHeight}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setDevOptions({ reflectionHeight: v })}
        />
      </div>

      <SectionTitle>Inputs</SectionTitle>
      <div style={{ display: 'grid', gap: 8 }}>
        <ToggleRow label="Mic enabled" value={opt.enableMic} onToggle={() => toggle('enableMic')} />
        <ToggleRow label="Camera enabled" value={opt.enableCamera} onToggle={() => toggle('enableCamera')} hint="Default OFF" />
      </div>

      <SectionTitle>Chroma Workstation</SectionTitle>
      <div style={{ display: 'grid', gap: 8 }}>
        <ToggleRow label="Enabled" value={opt.chromaWorkstationEnabled} onToggle={() => toggle('chromaWorkstationEnabled')} />
        <SliderRow
          label="Intensity"
          value={opt.chromaWorkstationIntensity}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setDevOptions({ chromaWorkstationIntensity: v })}
        />
        <SelectRow
          label="Palette"
          value={opt.chromaWorkstationPalette}
          onChange={(v) => setDevOptions({ chromaWorkstationPalette: v as any })}
          options={[
            { value: 'SpectraFlameDarkV2', label: 'SpectraFlameDarkV2' },
            { value: 'NeonGlassBulbs', label: 'NeonGlassBulbs' },
          ]}
        />
      </div>

      <div style={{ marginTop: 10, fontSize: 11, opacity: 0.65 }}>Hotkeys: H HUD / D Panel / A Avatar / W Wire / S Stars / R Reset</div>
    </div>
  )
}
