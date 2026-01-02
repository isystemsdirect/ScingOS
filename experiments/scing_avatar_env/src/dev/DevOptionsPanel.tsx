import { useCallback, useEffect, useMemo, useState } from 'react'
import { getDevOptions, resetDevOptionsToDefaults, setDevOptions, subscribeDevOptions } from './devOptionsStore'
import type { DevOptions } from './devOptionsStore'

function Row(props: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
      <div style={{ opacity: 0.86, fontSize: 12 }}>{props.label}</div>
      <div style={{ flex: '0 0 auto' }}>{props.children}</div>
    </div>
  )
}

function Toggle(props: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <input
      type="checkbox"
      checked={props.checked}
      onChange={(e) => props.onChange(e.target.checked)}
      style={{ width: 16, height: 16 }}
    />
  )
}

function isHexColor(s: unknown): s is string {
  return typeof s === 'string' && /^#[0-9a-fA-F]{6}$/.test(s)
}

function ColorRow(props: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const wrapStyle = props.disabled ? { opacity: 0.45, pointerEvents: 'none' as const } : undefined
  const v = isHexColor(props.value) ? props.value : '#ffffff'
  return (
    <Row label={props.label}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...(wrapStyle ?? {}) }}>
        <input
          type="color"
          value={v}
          onChange={(e) => props.onChange(e.target.value)}
          style={{ width: 28, height: 22, border: 'none', padding: 0, background: 'transparent' }}
        />
        <input
          type="text"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          style={{ width: 160 }}
        />
      </div>
    </Row>
  )
}

function labelizeKey(key: string) {
  // camelCase/PascalCase/snake_case -> readable
  const spaced = key
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
  return spaced.length ? spaced[0].toUpperCase() + spaced.slice(1) : key
}

function buildPatch(path: readonly (string | number)[], value: unknown) {
  if (path.length === 0) return {}

  const out: any = {}
  let cur: any = out

  for (let i = 0; i < path.length; i++) {
    const k = path[i]
    const isLast = i === path.length - 1
    const next = path[i + 1]

    if (isLast) {
      if (typeof k === 'number') {
        if (!Array.isArray(cur)) return {}
        cur[k] = value
        return out
      }

      cur[k] = value
      return out
    }

    const shouldBeArray = typeof next === 'number'

    if (typeof k === 'number') {
      if (!Array.isArray(cur)) return {}
      if (cur[k] === undefined) cur[k] = shouldBeArray ? [] : {}
      cur = cur[k]
      continue
    }

    if (cur[k] === undefined) cur[k] = shouldBeArray ? [] : {}
    cur = cur[k]
  }

  return out
}

function isVec3(v: unknown): v is readonly [number, number, number] {
  return (
    Array.isArray(v) &&
    v.length === 3 &&
    v.every((n) => typeof n === 'number' && Number.isFinite(n))
  )
}

export default function DevOptionsPanel() {
  const [opt, setOpt] = useState<DevOptions>(() => getDevOptions())

  useEffect(() => subscribeDevOptions(() => setOpt(getDevOptions())), [])

  if (!opt.ui.devPanelVisible) return null

  const maxWidth = Math.max(10, Math.min(20, opt.ui.panelsMaxWidthPct))

  const shell = useMemo(
    () => ({
      position: 'fixed' as const,
      top: 10,
      right: 10,
      width: `min(${maxWidth}vw, 360px)`,
      maxWidth: '20vw',
      zIndex: 99999,
      pointerEvents: 'auto' as const,
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    }),
    [maxWidth],
  )

  const setAtPath = useCallback(
    (path: readonly (string | number)[], value: unknown) => {
      setDevOptions(buildPatch(path, value) as any)
    },
    [],
  )

  const controlStyles = useMemo(
    () => ({
      inputNarrow: {
        width: 92,
        textAlign: 'right' as const,
      },
      inputMid: {
        width: 160,
      },
      textarea: {
        width: 210,
        height: 66,
        resize: 'vertical' as const,
        fontSize: 11,
        lineHeight: 1.2,
      },
      disabledWrap: {
        opacity: 0.45,
        pointerEvents: 'none' as const,
      },
    }),
    [],
  )

  const Section = useCallback((props: { title: string; children: React.ReactNode }) => {
    return (
      <div style={{ borderTop: '1px solid rgba(138,92,255,0.18)', paddingTop: 10, marginTop: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 8 }}>{props.title}</div>
        {props.children}
      </div>
    )
  }, [])

  const NumberRow = useCallback(
    (props: {
      label: string
      path: readonly (string | number)[]
      value: number
      step?: number
      min?: number
      max?: number
      disabled?: boolean
    }) => {
      const step = props.step ?? 0.01
      const wrapStyle = props.disabled ? controlStyles.disabledWrap : undefined
      return (
        <Row label={props.label}>
          <div style={wrapStyle}>
            <input
              type="number"
              value={Number.isFinite(props.value) ? props.value : 0}
              step={step}
              min={props.min}
              max={props.max}
              onChange={(e) => {
                const n = Number(e.target.value)
                if (!Number.isFinite(n)) return
                setAtPath(props.path, n)
              }}
              style={controlStyles.inputNarrow}
            />
          </div>
        </Row>
      )
    },
    [controlStyles.disabledWrap, controlStyles.inputNarrow, setAtPath],
  )

  const SelectRow = useCallback(
    (props: {
      label: string
      path: readonly (string | number)[]
      value: string
      options: Array<{ label: string; value: string }>
      disabled?: boolean
    }) => {
      const wrapStyle = props.disabled ? controlStyles.disabledWrap : undefined
      return (
        <Row label={props.label}>
          <div style={wrapStyle}>
            <select
              value={props.value}
              onChange={(e) => setAtPath(props.path, e.target.value)}
              style={controlStyles.inputMid}
            >
              {props.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </Row>
      )
    },
    [controlStyles.disabledWrap, controlStyles.inputMid, setAtPath],
  )

  const Vec3Row = useCallback(
    (props: { label: string; path: readonly (string | number)[]; value: readonly [number, number, number]; disabled?: boolean }) => {
      const wrapStyle = props.disabled ? controlStyles.disabledWrap : undefined
      return (
        <Row label={props.label}>
          <div style={{ display: 'flex', gap: 6, ...(wrapStyle ?? {}) }}>
            {props.value.map((n, idx) => (
              <input
                key={idx}
                type="number"
                value={n}
                step={0.01}
                onChange={(e) => {
                  const next = [...props.value] as number[]
                  const nn = Number(e.target.value)
                  if (!Number.isFinite(nn)) return
                  next[idx] = nn
                  setAtPath(props.path, next as any)
                }}
                style={{ width: 64, textAlign: 'right' }}
              />
            ))}
          </div>
        </Row>
      )
    },
    [controlStyles.disabledWrap, setAtPath],
  )

  const renderLeaf = useCallback(
    (label: string, path: readonly (string | number)[], value: unknown, disabled: boolean) => {
      const wrapStyle = disabled ? controlStyles.disabledWrap : undefined

      if (typeof value === 'boolean') {
        return (
          <Row key={path.join('.')} label={label}>
            <div style={wrapStyle}>
              <Toggle checked={value} onChange={(v) => setAtPath(path, v)} />
            </div>
          </Row>
        )
      }

      if (typeof value === 'number') {
        return (
          <Row key={path.join('.')} label={label}>
            <div style={wrapStyle}>
              <input
                type="number"
                value={Number.isFinite(value) ? value : 0}
                step={0.01}
                onChange={(e) => {
                  const n = Number(e.target.value)
                  if (!Number.isFinite(n)) return
                  setAtPath(path, n)
                }}
                style={controlStyles.inputNarrow}
              />
            </div>
          </Row>
        )
      }

      if (typeof value === 'string') {
        // Provide a color picker when string looks like #RRGGBB.
        if (isHexColor(value)) {
          return (
            <Row key={path.join('.')} label={label}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...(wrapStyle ?? {}) }}>
                <input
                  type="color"
                  value={value}
                  onChange={(e) => setAtPath(path, e.target.value)}
                  style={{ width: 28, height: 22, border: 'none', padding: 0, background: 'transparent' }}
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setAtPath(path, e.target.value)}
                  style={controlStyles.inputMid}
                />
              </div>
            </Row>
          )
        }

        return (
          <Row key={path.join('.')} label={label}>
            <div style={wrapStyle}>
              <input
                type="text"
                value={value}
                onChange={(e) => setAtPath(path, e.target.value)}
                style={controlStyles.inputMid}
              />
            </div>
          </Row>
        )
      }

      if (isVec3(value)) {
        return (
          <Row key={path.join('.')} label={label}>
            <div style={{ display: 'flex', gap: 6, ...(wrapStyle ?? {}) }}>
              {value.map((n, idx) => (
                <input
                  key={idx}
                  type="number"
                  value={n}
                  step={0.01}
                  onChange={(e) => {
                    const next = [...value] as number[]
                    const nn = Number(e.target.value)
                    if (!Number.isFinite(nn)) return
                    next[idx] = nn
                    setAtPath(path, next as any)
                  }}
                  style={{ width: 64, textAlign: 'right' }}
                />
              ))}
            </div>
          </Row>
        )
      }

      // Unknown leaf type -> show as JSON (disabled)
      return (
        <Row key={path.join('.')} label={label}>
          <div style={controlStyles.disabledWrap}>
            <textarea
              value={JSON.stringify(value)}
              readOnly
              style={controlStyles.textarea}
            />
          </div>
        </Row>
      )
    },
    [controlStyles, setAtPath],
  )

  const renderAny = useCallback(
    (
      title: string,
      obj: unknown,
      basePath: readonly (string | number)[],
      disabled: boolean,
    ) => {
      if (!obj || typeof obj !== 'object') return null

      const entries = Object.entries(obj as Record<string, unknown>)
      return (
        <Section title={title}>
          {entries.map(([k, v]) => {
            const nextPath = [...basePath, k]

            if (v && typeof v === 'object' && !Array.isArray(v) && !isVec3(v)) {
              // Nested object: render as its own subsection.
              return renderAny(labelizeKey(k), v, nextPath, disabled)
            }

            if (Array.isArray(v) && !isVec3(v)) {
              // Arrays other than vec3: show as read-only JSON to keep it visible.
              return renderLeaf(labelizeKey(k), nextPath, v, true)
            }

            return renderLeaf(labelizeKey(k), nextPath, v, disabled)
          })}
        </Section>
      )
    },
    [Section, renderLeaf],
  )

  return (
    <div className="scing-devpanel" style={shell}>
      <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 8 }}>SCING AVATAR ENVIRONMENT DEV OPTIONS</div>

      <div>
        <Section title="Visibility">
          <Row label="devPanelVisible">
            <Toggle checked={opt.ui.devPanelVisible} onChange={(v) => setAtPath(['ui', 'devPanelVisible'], v)} />
          </Row>
          <Row label="hudVisible (SCING AVATAR-LIVE)">
            <Toggle checked={opt.ui.hudVisible} onChange={(v) => setAtPath(['ui', 'hudVisible'], v)} />
          </Row>
          <Row label="avatarVisible">
            <Toggle checked={opt.avatar.enabled} onChange={(v) => setAtPath(['avatar', 'enabled'], v)} />
          </Row>
          <Row label="environmentFloorVisible">
            <Toggle checked={opt.floor.floorVisible} onChange={(v) => setAtPath(['floor', 'floorVisible'], v)} />
          </Row>
          <Row label="reflectionsVisible">
            <Toggle checked={opt.reflection.reflectionEnabled} onChange={(v) => setAtPath(['reflection', 'reflectionEnabled'], v)} />
          </Row>
          <Row label="starfieldVisible">
            <Toggle checked={opt.avatar.starfieldEnabled} onChange={(v) => setAtPath(['avatar', 'starfieldEnabled'], v)} />
          </Row>
          <NumberRow label="devPanelWidthPct (<=20%)" path={['ui', 'panelsMaxWidthPct']} value={opt.ui.panelsMaxWidthPct} step={1} min={10} max={20} />
        </Section>

        <Section title="Camera">
          <Row label="orbitEnabled">
            <Toggle checked={opt.camera.orbitEnabled} onChange={(v) => setAtPath(['camera', 'orbitEnabled'], v)} />
          </Row>
          <Row label="orbitAutoRotate">
            <Toggle checked={opt.camera.orbitAutoRotate} onChange={(v) => setAtPath(['camera', 'orbitAutoRotate'], v)} />
          </Row>
          <NumberRow label="orbitRotateSpeed" path={['camera', 'orbitRotateSpeed']} value={opt.camera.orbitRotateSpeed} step={0.01} min={-5} max={5} />
          <Row label="orbitZoomEnabled">
            <Toggle checked={opt.camera.orbitZoomEnabled} onChange={(v) => setAtPath(['camera', 'orbitZoomEnabled'], v)} />
          </Row>
          <Row label="orbitPanEnabled">
            <Toggle checked={opt.camera.orbitPanEnabled} onChange={(v) => setAtPath(['camera', 'orbitPanEnabled'], v)} />
          </Row>
          <NumberRow label="orbitMinDistance" path={['camera', 'orbitMinDistance']} value={opt.camera.orbitMinDistance} step={0.01} min={0.1} max={50} />
          <NumberRow label="orbitMaxDistance" path={['camera', 'orbitMaxDistance']} value={opt.camera.orbitMaxDistance} step={0.1} min={0.2} max={800} />
          <NumberRow label="cameraFov" path={['camera', 'cameraFov']} value={opt.camera.cameraFov} step={1} min={15} max={90} />
          <Row label="resetCamera">
            <button type="button" onClick={() => setAtPath(['camera', 'cameraReset'], opt.camera.cameraReset + 1)} style={{ fontSize: 12 }}>
              Reset
            </button>
          </Row>
        </Section>

        <Section title="Sensors">
          <SelectRow
            label="sensorSource"
            path={['sensors', 'source']}
            value={opt.sensors.source}
            options={[
              { label: 'live', value: 'live' },
              { label: 'sim', value: 'sim' },
            ]}
          />
          <Row label="micEnabled">
            <Toggle checked={opt.sensors.mic.enabled} onChange={(v) => setAtPath(['sensors', 'mic', 'enabled'], v)} />
          </Row>
          <NumberRow label="micGain" path={['sensors', 'mic', 'gain']} value={opt.sensors.mic.gain} step={0.01} min={0} max={5} />
          <Row label="pitchDetect">
            <Toggle checked={opt.sensors.mic.pitchDetect} onChange={(v) => setAtPath(['sensors', 'mic', 'pitchDetect'], v)} />
          </Row>
          <NumberRow label="pitchSensitivity" path={['sensors', 'pitchSensitivity']} value={opt.sensors.pitchSensitivity} step={0.01} min={0} max={3} />
          <Row label="camEnabled">
            <Toggle checked={opt.sensors.cam.enabled} onChange={(v) => setAtPath(['sensors', 'cam', 'enabled'], v)} />
          </Row>
          <NumberRow
            label="camMotionSensitivity"
            path={['sensors', 'cam', 'motionSensitivity']}
            value={opt.sensors.cam.motionSensitivity}
            step={0.01}
            min={0}
            max={5}
          />
          <NumberRow label="sensorSmoothing" path={['sensors', 'sensorSmoothing']} value={opt.sensors.sensorSmoothing} step={0.01} min={0} max={1} />
        </Section>

        <Section title="Möbius Telemetry">
          <Row label="mobiusEnabled">
            <Toggle checked={opt.mobius.mobiusEnabled} onChange={(v) => setAtPath(['mobius', 'mobiusEnabled'], v)} />
          </Row>
          <NumberRow label="phaseSpeed (k)" path={['mobius', 'phaseSpeed']} value={opt.mobius.phaseSpeed} step={0.01} min={0} max={5} />
          <NumberRow label="epsBand" path={['mobius', 'epsBand']} value={opt.mobius.epsBand} step={0.001} min={0.0001} max={Math.PI} />
          <NumberRow label="aMax" path={['mobius', 'aMax']} value={opt.mobius.aMax} step={0.01} min={0} max={1} />
          <NumberRow label="w1" path={['mobius', 'w1']} value={opt.mobius.w1} step={0.01} min={0} max={1.5} />
          <NumberRow label="w2" path={['mobius', 'w2']} value={opt.mobius.w2} step={0.01} min={0} max={1.5} />
          <SelectRow
            label="paletteMode"
            path={['mobius', 'paletteMode']}
            value={opt.mobius.paletteMode}
            options={[
              { label: 'auto', value: 'auto' },
              { label: 'forceSCING', value: 'forceSCING' },
              { label: 'forceLARI', value: 'forceLARI' },
              { label: 'forceBANE', value: 'forceBANE' },
            ]}
          />
          <SelectRow
            label="emissiveFrom"
            path={['mobius', 'emissiveFrom']}
            value={opt.mobius.emissiveFrom}
            options={[
              { label: 'baseColor', value: 'baseColor' },
              { label: 'emissiveColor', value: 'emissiveColor' },
            ]}
          />
        </Section>

        <Section title="Halo + Flares">
          <Row label="haloEnabled">
            <Toggle checked={opt.haloFlares.haloEnabled} onChange={(v) => setAtPath(['haloFlares', 'haloEnabled'], v)} />
          </Row>
          <NumberRow label="haloRadius" path={['haloFlares', 'haloRadius']} value={opt.haloFlares.haloRadius} step={0.001} min={0} max={0.2} />
          <NumberRow label="haloSoftness" path={['haloFlares', 'haloSoftness']} value={opt.haloFlares.haloSoftness} step={0.01} min={0} max={1} />
          <NumberRow label="haloNoiseScale" path={['haloFlares', 'haloNoiseScale']} value={opt.haloFlares.haloNoiseScale} step={0.01} min={0.1} max={5} />
          <NumberRow label="haloDissipation" path={['haloFlares', 'haloDissipation']} value={opt.haloFlares.haloDissipation} step={0.01} min={0} max={1} />
          <NumberRow label="haloIntensity" path={['haloFlares', 'haloIntensity']} value={opt.haloFlares.haloIntensity} step={0.01} min={0} max={3} />
          <Row label="flareEnabled">
            <Toggle checked={opt.haloFlares.flareEnabled} onChange={(v) => setAtPath(['haloFlares', 'flareEnabled'], v)} />
          </Row>
          <NumberRow label="flareCount" path={['haloFlares', 'flareCount']} value={opt.haloFlares.flareCount} step={1} min={0} max={24} />
          <NumberRow label="flareSize" path={['haloFlares', 'flareSize']} value={opt.haloFlares.flareSize} step={0.01} min={0.02} max={1} />
          <NumberRow label="flareIntensity" path={['haloFlares', 'flareIntensity']} value={opt.haloFlares.flareIntensity} step={0.01} min={0} max={3} />
          <NumberRow label="flarePulseRate" path={['haloFlares', 'flarePulseRate']} value={opt.haloFlares.flarePulseRate} step={0.01} min={0} max={10} />
          <NumberRow label="flareDepthBias" path={['haloFlares', 'flareDepthBias']} value={opt.haloFlares.flareDepthBias} step={0.01} min={0} max={5} />
          <NumberRow label="flareFollowStrength" path={['haloFlares', 'flareFollowStrength']} value={opt.haloFlares.flareFollowStrength} step={0.01} min={0} max={1} />
          <NumberRow label="flareParallaxScale" path={['haloFlares', 'flareParallaxScale']} value={opt.haloFlares.flareParallaxScale} step={0.01} min={0} max={5} />
        </Section>

        <Section title="Lighting">
          <Row label="lightsEnabled">
            <Toggle checked={opt.lights.enabled} onChange={(v) => setAtPath(['lights', 'enabled'], v)} />
          </Row>
          <Row label="lightRigRotateEnabled">
            <Toggle checked={opt.lights.rigRotateEnabled} onChange={(v) => setAtPath(['lights', 'rigRotateEnabled'], v)} />
          </Row>
          <NumberRow label="lightRigRotateSpeed" path={['lights', 'rigRotateSpeed']} value={opt.lights.rigRotateSpeed} step={0.01} min={-5} max={5} />
          <Row label="ambientEnabled">
            <Toggle checked={opt.lights.ambientEnabled} onChange={(v) => setAtPath(['lights', 'ambientEnabled'], v)} />
          </Row>
          <NumberRow label="ambientIntensity (hard-capped)" path={['lights', 'ambientIntensity']} value={opt.lights.ambientIntensity} step={0.005} min={0} max={0.25} />
          <div style={{ opacity: 0.75, fontSize: 11, marginTop: 6 }}>Avatar-only lighting is enforced (non-toggle).</div>
        </Section>

        <Section title="Lighting — Spots">
          {opt.lights.spots.map((s, i) => (
            <div key={i} style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(138,92,255,0.14)', paddingTop: i === 0 ? 0 : 10, marginTop: i === 0 ? 0 : 10 }}>
              <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 6 }}>Spot {i + 1}</div>

              <Row label="enabled">
                <Toggle checked={s.enabled} onChange={(v) => setAtPath(['lights', 'spots', i, 'enabled'], v)} />
              </Row>

              <ColorRow label="color" value={s.color} onChange={(v) => setAtPath(['lights', 'spots', i, 'color'], v)} />

              <NumberRow label="intensity" path={['lights', 'spots', i, 'intensity']} value={s.intensity} step={0.5} min={0} max={100} />
              <NumberRow label="distance" path={['lights', 'spots', i, 'distance']} value={s.distance} step={0.5} min={0} max={200} />
              <NumberRow label="decay" path={['lights', 'spots', i, 'decay']} value={s.decay} step={0.1} min={0} max={4} />
              <NumberRow label="angle" path={['lights', 'spots', i, 'angle']} value={s.angle} step={0.01} min={0.01} max={Math.PI / 2} />
              <NumberRow label="penumbra" path={['lights', 'spots', i, 'penumbra']} value={s.penumbra} step={0.01} min={0} max={1} />

              <Row label="castShadow">
                <Toggle checked={s.castShadow} onChange={(v) => setAtPath(['lights', 'spots', i, 'castShadow'], v)} />
              </Row>

              <Vec3Row label="position" path={['lights', 'spots', i, 'position']} value={s.position} />
              <Vec3Row label="target" path={['lights', 'spots', i, 'target']} value={s.target} />

              <div style={{ opacity: 0.8, fontSize: 11, margin: '8px 0 4px' }}>Orbit (counter-rotates by index)</div>
              <Row label="orbitEnabled">
                <Toggle checked={(s as any).orbitEnabled} onChange={(v) => setAtPath(['lights', 'spots', i, 'orbitEnabled'], v)} />
              </Row>
              <SelectRow
                label="orbitAxis"
                path={['lights', 'spots', i, 'orbitAxis']}
                value={String((s as any).orbitAxis ?? 'y')}
                options={[
                  { label: 'x', value: 'x' },
                  { label: 'y', value: 'y' },
                  { label: 'z', value: 'z' },
                ]}
              />
              <NumberRow label="orbitSpeed" path={['lights', 'spots', i, 'orbitSpeed']} value={Number((s as any).orbitSpeed ?? 0)} step={0.01} min={-5} max={5} />
              <NumberRow label="orbitRadius" path={['lights', 'spots', i, 'orbitRadius']} value={Number((s as any).orbitRadius ?? 0)} step={0.05} min={0} max={50} />
              <NumberRow label="orbitPhase" path={['lights', 'spots', i, 'orbitPhase']} value={Number((s as any).orbitPhase ?? 0)} step={0.05} min={-50} max={50} />

              <NumberRow label="radiusHint" path={['lights', 'spots', i, 'radiusHint']} value={s.radiusHint} step={0.01} min={0.05} max={3} />
            </div>
          ))}
        </Section>

        <Section title="Reflections">
          <Row label="reflectionEnabled">
            <Toggle checked={opt.reflection.reflectionEnabled} onChange={(v) => setAtPath(['reflection', 'reflectionEnabled'], v)} />
          </Row>
          <div style={{ opacity: 0.75, fontSize: 11, marginTop: 6 }}>Avatar-only reflection is enforced (non-toggle).</div>
          <NumberRow label="reflectionIntensity" path={['reflection', 'reflectionIntensity']} value={opt.reflection.reflectionIntensity} step={0.01} min={0} max={5} />
          <NumberRow label="reflectionRadius" path={['reflection', 'reflectionRadius']} value={opt.reflection.reflectionRadius} step={0.1} min={0.5} max={80} />
          <NumberRow label="reflectionFade" path={['reflection', 'reflectionFade']} value={opt.reflection.reflectionFade} step={0.01} min={0} max={1} />
          <NumberRow label="reflectionExtent" path={['reflection', 'reflectionExtent']} value={opt.reflection.reflectionExtent} step={10} min={200} max={8000} />
          <NumberRow label="reflectionMaxDistance" path={['reflection', 'reflectionMaxDistance']} value={opt.reflection.reflectionMaxDistance} step={0.1} min={0} max={200} />
          <NumberRow label="reflectionFalloff" path={['reflection', 'reflectionFalloff']} value={opt.reflection.reflectionFalloff} step={0.01} min={0.05} max={2} />
          <NumberRow label="reflectionNoiseAmount" path={['reflection', 'reflectionNoiseAmount']} value={opt.reflection.reflectionNoiseAmount} step={0.01} min={0} max={1} />
          <NumberRow label="reflectionBlur" path={['reflection', 'reflectionBlur']} value={opt.reflection.reflectionBlur} step={0.01} min={0} max={1} />
          <NumberRow label="reflectionSharpness" path={['reflection', 'reflectionSharpness']} value={opt.reflection.reflectionSharpness} step={0.01} min={0} max={1} />
          <NumberRow label="reflectionRoughness" path={['reflection', 'reflectionRoughness']} value={opt.reflection.reflectionRoughness} step={0.01} min={0} max={1} />
          <NumberRow label="reflectionDistortion" path={['reflection', 'reflectionDistortion']} value={opt.reflection.reflectionDistortion} step={0.01} min={0} max={1} />
          <NumberRow
            label="reflectionNormalStrength"
            path={['reflection', 'reflectionNormalStrength']}
            value={opt.reflection.reflectionNormalStrength}
            step={0.01}
            min={0}
            max={2}
          />
        </Section>

        <Section title="Chroma Workstation">
          <Row label="chromaKeyEnabled">
            <Toggle checked={opt.chroma.enabled} onChange={(v) => setAtPath(['chroma', 'enabled'], v)} />
          </Row>
          <NumberRow label="similarity" path={['chroma', 'similarity']} value={opt.chroma.similarity} step={0.01} min={0} max={1} />
          <NumberRow label="smoothness" path={['chroma', 'smoothness']} value={opt.chroma.smoothness} step={0.01} min={0} max={1} />
          <NumberRow label="spill" path={['chroma', 'spill']} value={opt.chroma.spill} step={0.01} min={0} max={1} />
        </Section>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, gap: 8 }}>
        <button type="button" onClick={() => resetDevOptionsToDefaults()} style={{ fontSize: 12 }}>
          Reset Defaults
        </button>
      </div>
    </div>
  )
}
