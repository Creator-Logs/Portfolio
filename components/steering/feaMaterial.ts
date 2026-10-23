import * as THREE from "three";

// Result material for the Ansys model (scripts/fea/build_fea.py). Every body gets its own instance (own
// colour/metalness/focus) but they share one program (same onBeforeCompile + cache key), so a mode switch
// is a uniform tween, never a shader compile (3D_GUIDE §7b rule 28).
//   _VM   (float) nodal von Mises, psi, at 100 % load
//   _DISP (vec3)  nodal displacement, model metres, at 100 % load
// Linear static solve, so stress and displacement scale exactly with the load factor uLoad.
// Contours use Mechanical's default 9-band legend (blue -> red), banded per fragment like Mechanical.

export const ANSYS_BANDS = ["#0000ff", "#00b2ff", "#00ffff", "#00ffb2", "#00ff00", "#b2ff00", "#ffff00", "#ffb200", "#ff0000"];

/** Shared by every body: written by the viewer, read on the GPU. */
export const feaUniforms = {
  uMix: { value: 0 }, // 0 = material look, 1 = von Mises contours
  uLoad: { value: 1 }, // load factor 0..1
  uDispScale: { value: 1 }, // deformation exaggeration (1 = true scale)
  uVmMax: { value: 1 }, // psi at the top of the legend
  // context bodies fade into the page background around the framed region, so the View's box never shows a hard edge
  uFadeCenter: { value: new THREE.Vector3() }, // model space
  uFadeRange: { value: new THREE.Vector2(1, 2) }, // start, end radius (m)
  // --ink as raw sRGB: it's mixed in after the output colour-space conversion (a THREE.Color would be linearised)
  uInk: { value: new THREE.Vector3(0x10, 0x09, 0x04).divideScalar(255) },
};

const bands = ANSYS_BANDS.map((c) => new THREE.Color(c)); // linear (three converts hex sRGB -> working space)

export function createFeaMaterial(params: THREE.MeshStandardMaterialParameters, fade = false) {
  const mat = new THREE.MeshStandardMaterial(params);
  // uFocus: 1 = normal, 0 = ghosted (another body is focused); uFade: 1 = fades out with distance (context body)
  const own = { uFocus: { value: 1 }, uFade: { value: fade ? 1 : 0 } };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, feaUniforms, own, { uBands: { value: bands } });
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
        attribute float _vm;
        attribute vec3 _disp;
        uniform float uLoad;
        uniform float uDispScale;
        varying float vVm;
        varying vec3 vFeaPos;`,
      )
      .replace(
        "#include <begin_vertex>",
        /* glsl */ `#include <begin_vertex>
        transformed += _disp * uLoad * uDispScale;
        vVm = _vm * uLoad;
        vFeaPos = position;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
        uniform float uMix;
        uniform float uVmMax;
        uniform float uFocus;
        uniform vec3 uBands[9];
        uniform float uFade;
        uniform vec3 uFadeCenter;
        uniform vec2 uFadeRange;
        uniform vec3 uInk;
        varying float vVm;
        varying vec3 vFeaPos;
        vec3 feaBand() {
          int i = int(clamp(floor(vVm / uVmMax * 9.0), 0.0, 8.0));
          vec3 c = uBands[0];
          for (int k = 1; k < 9; k++) if (k == i) c = uBands[k];
          return c;
        }`,
      )
      .replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
        vec3 feaColor = feaBand();
        diffuseColor.rgb = mix(diffuseColor.rgb, feaColor * 0.55, uMix);`,
      )
      .replace(
        "#include <metalnessmap_fragment>",
        /* glsl */ `#include <metalnessmap_fragment>
        metalnessFactor = mix(metalnessFactor, 0.0, uMix);`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        /* glsl */ `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 0.55, uMix);`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        /* glsl */ `#include <emissivemap_fragment>
        // contours read as data, not as paint in a dark room: part of the colour is self-lit
        totalEmissiveRadiance += feaColor * 0.35 * uMix;`,
      )
      .replace(
        "#include <dithering_fragment>",
        /* glsl */ `#include <dithering_fragment>
        gl_FragColor.rgb = mix(vec3(dot(gl_FragColor.rgb, vec3(0.3333)) * 0.25), gl_FragColor.rgb, uFocus);
        float fade = uFade * smoothstep(uFadeRange.x, uFadeRange.y, length(vFeaPos - uFadeCenter));
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uInk, fade);`,
      );
  };
  mat.customProgramCacheKey = () => "creator-logs-fea";
  return { material: mat, focus: own.uFocus };
}
