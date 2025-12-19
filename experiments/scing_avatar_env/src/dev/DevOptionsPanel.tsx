import { useCallback, useEffect, useMemo, useState } from 'react'
import { getDevOptions, resetDevOptionsToDefaults, setDevOptions, subscribeDevOptions } from './devOptionsStore'
import type { DevOptions } from './devOptionsStore'
import * as legacy from './devOptions'

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

  const [legacyOpt, setLegacyOpt] = useState<legacy.DevOptions>(() => legacy.getDevOptions())

  useEffect(() => subscribeDevOptions(() => setOpt(getDevOptions())), [])
  useEffect(() => legacy.subscribeDevOptions(() => setLegacyOpt(legacy.getDevOptions())), [])

  if (!opt.ui.devPanelVisible) return null

  const dockRight = opt.ui.devPanelDock !== 'left'
  const maxWidth = Math.max(0, Math.min(20, opt.ui.panelsMaxWidthPct))

  const shell = useMemo(
    () => ({
      position: 'fixed' as const,
      top: 10,
      right: dockRight ? 10 : undefined,
      left: dockRight ? undefined : 10,
      width: `min(${maxWidth}vw, 360px)`,
      maxWidth: '20vw',
      zIndex: 99999,
      pointerEvents: 'auto' as const,
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    }),
    [dockRight, maxWidth],
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
        {/* CB: explicit full-control sections (arrays must be editable). */}
        <Section title="Floor (full control)">
          <Row label="Floor visible">
            <Toggle checked={opt.floor.floorVisible} onChange={(v) => setAtPath(['floor', 'floorVisible'], v)} />
          </Row>
          <NumberRow label="Floor Y" path={['floor', 'floorY']} value={opt.floor.floorY} step={0.01} />
          <Row label="Floor infinite">
            <div style={controlStyles.disabledWrap}>
              <Toggle checked={true} onChange={() => {}} />
            </div>
          </Row>
        </Section>

        <Section title="Reflection (full control)">
          <Row label="Reflection enabled">
            <Toggle checked={opt.reflection.reflectionEnabled} onChange={(v) => setAtPath(['reflection', 'reflectionEnabled'], v)} />
          </Row>
          <NumberRow label="Intensity" path={['reflection', 'reflectionIntensity']} value={opt.reflection.reflectionIntensity} step={0.01} />
          <NumberRow label="Max distance" path={['reflection', 'reflectionMaxDistance']} value={opt.reflection.reflectionMaxDistance} step={0.1} />
          <SelectRow
            label="Resolution"
            path={['reflection', 'reflectionResolution']}
            value={String(opt.reflection.reflectionResolution)}
            options={[
              { label: '256', value: '256' },
              { label: '512', value: '512' },
              { label: '1024', value: '1024' },
              { label: '2048', value: '2048' },
            ]}
          />
          <NumberRow label="Blur" path={['reflection', 'reflectionBlur']} value={opt.reflection.reflectionBlur} step={0.01} />
          <NumberRow label="Sharpness" path={['reflection', 'reflectionSharpness']} value={opt.reflection.reflectionSharpness} step={0.01} />
          <NumberRow label="Roughness" path={['reflection', 'reflectionRoughness']} value={opt.reflection.reflectionRoughness} step={0.01} />
          <NumberRow label="Distortion" path={['reflection', 'reflectionDistortion']} value={opt.reflection.reflectionDistortion} step={0.01} />
          <NumberRow label="Normal strength" path={['reflection', 'reflectionNormalStrength']} value={opt.reflection.reflectionNormalStrength} step={0.01} />
          <NumberRow label="Fade start" path={['reflection', 'reflectionFadeStart']} value={opt.reflection.reflectionFadeStart} step={0.1} />
          <NumberRow label="Fade end" path={['reflection', 'reflectionFadeEnd']} value={opt.reflection.reflectionFadeEnd} step={0.1} />
          <NumberRow label="Ground Y" path={['reflection', 'reflectionGroundY']} value={opt.reflection.reflectionGroundY} step={0.01} />
          <NumberRow label="Clip bias" path={['reflection', 'reflectionClipBias']} value={opt.reflection.reflectionClipBias} step={0.0005} />
        </Section>

        <Section title="Lights (4-spot full control)">
          <Row label="Rig enabled">
            <Toggle checked={opt.lights.enabled} onChange={(v) => setAtPath(['lights', 'enabled'], v)} />
          </Row>
          <Row label="Ambient enabled">
            <Toggle checked={opt.lights.ambientEnabled} onChange={(v) => setAtPath(['lights', 'ambientEnabled'], v)} />
          </Row>
          <NumberRow label="Ambient intensity" path={['lights', 'ambientIntensity']} value={opt.lights.ambientIntensity} step={0.01} />

          {opt.lights.spots.map((s, idx) => (
            <div key={idx} style={{ borderTop: '1px solid rgba(255,255,255,0.10)', paddingTop: 10, marginTop: 10 }}>
              <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 8 }}>{`Spot ${idx + 1}`}</div>

              <Row label="Enabled">
                <Toggle checked={s.enabled} onChange={(v) => setAtPath(['lights', 'spots', idx, 'enabled'], v)} />
              </Row>

              {/* color */}
              <Row label="Color">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="color"
                    value={s.color}
                    onChange={(e) => setAtPath(['lights', 'spots', idx, 'color'], e.target.value)}
                    style={{ width: 28, height: 22, border: 'none', padding: 0, background: 'transparent' }}
                  />
                  <input
                    type="text"
                    value={s.color}
                    onChange={(e) => setAtPath(['lights', 'spots', idx, 'color'], e.target.value)}
                    style={controlStyles.inputMid}
                  />
                </div>
              </Row>

              <NumberRow label="Intensity" path={['lights', 'spots', idx, 'intensity']} value={s.intensity} step={0.1} />
              <NumberRow label="Distance" path={['lights', 'spots', idx, 'distance']} value={s.distance} step={0.1} />
              <NumberRow label="Decay" path={['lights', 'spots', idx, 'decay']} value={s.decay} step={0.1} />
              <NumberRow label="Angle" path={['lights', 'spots', idx, 'angle']} value={s.angle} step={0.01} />
              <NumberRow label="Penumbra" path={['lights', 'spots', idx, 'penumbra']} value={s.penumbra} step={0.01} />

              <Vec3Row label="Position" path={['lights', 'spots', idx, 'position']} value={s.position} />
              <Vec3Row label="Target" path={['lights', 'spots', idx, 'target']} value={s.target} />

              <Row label="Cast shadow">
                <Toggle checked={s.castShadow} onChange={(v) => setAtPath(['lights', 'spots', idx, 'castShadow'], v)} />
              </Row>
              <Row label="Avatar-only layer">
                <Toggle checked={s.layerAvatarOnly} onChange={(v) => setAtPath(['lights', 'spots', idx, 'layerAvatarOnly'], v)} />
              </Row>

              <Row label="Rotation enabled">
                <Toggle checked={s.rotationEnabled} onChange={(v) => setAtPath(['lights', 'spots', idx, 'rotationEnabled'], v)} />
              </Row>
              <SelectRow
                label="Rotation axis"
                path={['lights', 'spots', idx, 'rotationAxis']}
                value={s.rotationAxis}
                options={[
                  { label: 'X', value: 'x' },
                  { label: 'Y', value: 'y' },
                  { label: 'Z', value: 'z' },
                ]}
              />
              <NumberRow label="Rotation rate (rad/s)" path={['lights', 'spots', idx, 'rotationRate']} value={s.rotationRate} step={0.01} />
              <NumberRow label="Radius hint" path={['lights', 'spots', idx, 'radiusHint']} value={s.radiusHint} step={0.01} />
            </div>
          ))}
        </Section>

        <Section title="Floor shine (separate system)">
          <Row label="Enabled">
            <Toggle checked={opt.floorShine.floorShineEnabled} onChange={(v) => setAtPath(['floorShine', 'floorShineEnabled'], v)} />
          </Row>
          <Row label="Follow avatar">
            <Toggle checked={opt.floorShine.floorShineFollowAvatar} onChange={(v) => setAtPath(['floorShine', 'floorShineFollowAvatar'], v)} />
          </Row>
          <NumberRow label="Radius" path={['floorShine', 'floorShineRadius']} value={opt.floorShine.floorShineRadius} step={0.01} />
          <NumberRow label="Intensity" path={['floorShine', 'floorShineIntensity']} value={opt.floorShine.floorShineIntensity} step={0.01} />
          <NumberRow label="Falloff" path={['floorShine', 'floorShineFalloff']} value={opt.floorShine.floorShineFalloff} step={0.1} />
        </Section>

        {/* Render the full canonical options tree (never hide fields). */}
        {renderAny('UI', opt.ui, ['ui'], false)}
        {renderAny('Avatar', opt.avatar, ['avatar'], false)}
        {renderAny('Material', opt.material, ['material'], false)}
        {renderAny('Motion', opt.motion, ['motion'], false)}
        {renderAny('State', opt.state, ['state'], false)}
        {renderAny('Sensors', opt.sensors, ['sensors'], false)}
        {renderAny('Lights (raw)', opt.lights, ['lights'], false)}
        {renderAny('Floor (raw)', opt.floor, ['floor'], false)}
        {renderAny('Reflection (raw)', opt.reflection, ['reflection'], false)}
        {renderAny('Floor shine (raw)', opt.floorShine, ['floorShine'], false)}
        {renderAny('Post', opt.post, ['post'], false)}
        {renderAny('Performance', opt.perf, ['perf'], false)}
        {renderAny('Chroma', opt.chroma, ['chroma'], false)}
        {renderAny('Log', opt.log, ['log'], false)}
        {renderAny('Security', opt.security, ['security'], false)}

        {/* Legacy options: preserved in UI (greyed) so nothing “disappears” during migration. */}
        {renderAny('Legacy (not wired yet)', legacyOpt, ['legacy'], true)}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, gap: 8 }}>
        <button
          type="button"
          onClick={() => resetDevOptionsToDefaults()}
          style={{ fontSize: 12 }}
        >
          Reset Defaults
        </button>
      </div>
    </div>
  )
}
