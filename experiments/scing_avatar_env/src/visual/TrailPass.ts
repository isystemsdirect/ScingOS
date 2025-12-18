import { Effect } from 'postprocessing'
import { Uniform } from 'three'

const fragmentShader = /* glsl */`
uniform sampler2D tDiffuse;
uniform float decay;
uniform float intensity;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outColor) {
  vec4 prev = texture2D(tDiffuse, uv);
  prev.rgb *= decay;
  outColor = vec4(
    max(inputColor.rgb * intensity, prev.rgb),
    1.0
  );
}
`

export class TrailPass extends Effect {
  constructor() {
    super('TrailPass', fragmentShader, {
      uniforms: new Map([
        ['decay', new Uniform(0.94)],
        ['intensity', new Uniform(1.0)],
      ]),
    })
  }

  setDecay(v: number) {
    this.uniforms.get('decay')!.value = v
  }

  setIntensity(v: number) {
    this.uniforms.get('intensity')!.value = v
  }
}
