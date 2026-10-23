import * as THREE from "three";

// Material presets from docs/portfolio/3D_GUIDE.md §4. Starting values — tune live via ?debug.
// Perf: MeshPhysicalMaterial only compiles a clearcoat/sheen/anisotropy pass when the value is > 0, so keep
// those at 0 unless they visibly matter (carbon clearcoat does). They were starving iGPUs during scroll.
// getMaterial() instances are cached per (preset, colour, ao) so every mesh using the same look shares
// one material (3D_GUIDE §7b rule 11). Never mutate a returned material per-mesh.
// Models use createMaterial() instead: one set per <Model> (it owns + disposes them), because the
// model-space detail needs that model's root transform as a uniform. Same programs either way.
//
// Shader layer (onBeforeCompile, 3D_GUIDE §4 "detail"): the CAD GLBs have no UVs, so surface detail is
// procedural in *model space* (metres, so feature sizes are real millimetres):
//   - sls_nylon: sintered grain   - carbon_fiber: 2×2 twill   - alu_*: brushed streaks   - pla_*: layer lines
// plus the pipeline's baked per-vertex AO ("_AO", scripts/models/process.py), applied to indirect light only.
// Detail fades out once a feature is smaller than a pixel, so it never shimmers.

export type Preset =
  | "pla_matte"
  | "pla_silk"
  | "sls_nylon"
  | "plastic_black"
  | "pei_black"
  | "alu_extrusion_black"
  | "alu_machined"
  | "alu_anodized_gold"
  | "steel_polished"
  | "steel_stainless"
  | "steel_black_oxide"
  | "steel_zinc"
  | "brass"
  | "carbon_fiber"
  | "rubber_silicone"
  | "pcb_soldermask"
  | "pcb_gold"
  | "acrylic_clear"
  | "polycarbonate_clear"
  | "screen_glass";

type Params = THREE.MeshPhysicalMaterialParameters;
type Detail = "SLS" | "CARBON" | "BRUSHED" | "LAYERS";

const presets: Record<Preset, Params & { detail?: Detail }> = {
  pla_matte: { metalness: 0, roughness: 0.6, detail: "LAYERS" },
  pla_silk: { metalness: 0, roughness: 0.35, sheen: 0.3, clearcoat: 0.3, detail: "LAYERS" },
  sls_nylon: { color: "#2a2a2a", metalness: 0, roughness: 0.7, detail: "SLS" }, // soft sintered sheen (lower shows the grips' source facets)
  plastic_black: { color: "#121212", metalness: 0, roughness: 0.55, detail: "SLS" }, // glossier than nylon so near-black shapes keep highlights
  pei_black: { color: "#161616", metalness: 0, roughness: 0.82, detail: "SLS" }, // textured PEI build sheet: matte powder-coat grain
  alu_extrusion_black: { color: "#151515", metalness: 1, roughness: 0.4, detail: "BRUSHED" },
  alu_machined: { color: "#c8c8c8", metalness: 1, roughness: 0.25, detail: "BRUSHED" },
  alu_anodized_gold: { color: "#c9a04c", metalness: 1, roughness: 0.3, detail: "BRUSHED" },
  steel_polished: { color: "#d6d6d6", metalness: 1, roughness: 0.15 },
  steel_stainless: { color: "#b9bbbc", metalness: 1, roughness: 0.22 },
  steel_black_oxide: { color: "#2b2b2d", metalness: 1, roughness: 0.38 },
  steel_zinc: { color: "#c4c6c2", metalness: 1, roughness: 0.3 },
  brass: { color: "#c9a14a", metalness: 1, roughness: 0.25 },
  carbon_fiber: { color: "#333333", metalness: 0, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.05, detail: "CARBON" },
  rubber_silicone: { metalness: 0, roughness: 0.7 },
  pcb_soldermask: { color: "#0d3b1e", metalness: 0, roughness: 0.35, clearcoat: 0.6 },
  pcb_gold: { color: "#d4a64a", metalness: 1, roughness: 0.25 },
  acrylic_clear: { color: "#ffffff", metalness: 0, roughness: 0.05, transmission: 1, thickness: 0.5, ior: 1.49 },
  // Cheap see-through (no transmission pass): small windows on trinkets.
  polycarbonate_clear: { color: "#dfe7ea", metalness: 0, roughness: 0.04, transparent: true, opacity: 0.28, clearcoat: 1, depthWrite: false },
  screen_glass: { color: "#000000", metalness: 0, roughness: 0.05, clearcoat: 1 },
};

/** Shared by every preset material; live-tunable from the ?debug panel. */
export const shaderTuning = {
  uDetail: { value: 1 }, // surface-detail strength
  uAO: { value: 1 }, // baked AO strength (indirect light)
  uAODirect: { value: 0.35 }, // share of AO also applied to direct light (cavities)
};

const VERTEX_PARS = /* glsl */ `
uniform mat4 uWorldToModel;
varying vec3 vObjPos;
#ifdef USE_VERTEX_AO
  attribute float _ao;
  varying float vAO;
#endif
#ifdef USE_VERTEX_AO_X
  attribute float _ao_x;
  uniform float uAOX;
#endif
`;

const VERTEX_MAIN = /* glsl */ `
  // model-root space (GLB metres; undoes meshopt quantisation and follows the model as it moves)
  vObjPos = ( uWorldToModel * modelMatrix * vec4( position, 1.0 ) ).xyz;
  #ifdef USE_VERTEX_AO
    vAO = _ao;
    #ifdef USE_VERTEX_AO_X
      vAO = mix( _ao, _ao_x, uAOX ); // exploded-view GLBs: AO baked assembled (_ao) and fully exploded (_ao_x)
    #endif
  #endif
`;

const FRAGMENT_PARS = /* glsl */ `
uniform float uDetail;
uniform float uAO;
uniform float uAODirect;
varying vec3 vObjPos;
#ifdef USE_VERTEX_AO
  varying float vAO;
#endif

float dHash( vec3 p ) {
  p = fract( p * 0.3183099 + 0.1 );
  p *= 17.0;
  return fract( p.x * p.y * p.z * ( p.x + p.y + p.z ) );
}
float dNoise( vec3 x ) {
  vec3 i = floor( x );
  vec3 f = fract( x );
  f = f * f * ( 3.0 - 2.0 * f );
  return mix( mix( mix( dHash( i ), dHash( i + vec3( 1, 0, 0 ) ), f.x ),
                   mix( dHash( i + vec3( 0, 1, 0 ) ), dHash( i + vec3( 1, 1, 0 ) ), f.x ), f.y ),
              mix( mix( dHash( i + vec3( 0, 0, 1 ) ), dHash( i + vec3( 1, 0, 1 ) ), f.x ),
                   mix( dHash( i + vec3( 0, 1, 1 ) ), dHash( i + vec3( 1, 1, 1 ) ), f.x ), f.y ), f.z );
}

// Model-space projection axis for flat patterns: the dominant axis of the model-space face normal
// (from derivatives, so no extra varying).
vec3 dFaceAxis( vec3 p ) {
  vec3 n = abs( normalize( cross( dFdx( p ), dFdy( p ) ) ) );
  return n.x > n.y && n.x > n.z ? vec3( 1, 0, 0 ) : n.y > n.z ? vec3( 0, 1, 0 ) : vec3( 0, 0, 1 );
}
vec2 dPlane( vec3 p, vec3 axis ) {
  return axis.x > 0.5 ? p.zy : axis.y > 0.5 ? p.xz : p.xy;
}

// Height field in model metres (h), roughness offset (r) and albedo multiplier (c) per detail type.
// L = smallest feature size (m), used to fade the detail out below pixel size.
// DETAIL_L is a const, invisible to the preprocessor: USE_DETAIL is what gates the detail blocks below.
#if defined( DETAIL_SLS ) || defined( DETAIL_CARBON ) || defined( DETAIL_BRUSHED ) || defined( DETAIL_LAYERS )
  #define USE_DETAIL
#endif
#if defined( DETAIL_SLS )
  const float DETAIL_L = 0.00035;
  float dHeight( vec3 p, vec3 axis ) {
    return ( dNoise( p * 2800.0 ) * 0.6 + dNoise( p * 900.0 + 7.1 ) * 0.4 ) * 0.00003;
  }
  vec2 dSurface( vec3 p, vec3 axis ) {
    float n = dNoise( p * 1400.0 + 3.7 );
    return vec2( ( n - 0.5 ) * 0.14, 0.94 + 0.12 * n );
  }
#elif defined( DETAIL_CARBON )
  const float TOW = 0.0025; // 2.5 mm tows (3K twill)
  const float DETAIL_L = TOW * 0.8; // weave stays on while a tow is >~1.5 px wide
  // 2x2 twill: each cell is one crossing; warp over two / under two, stepping one per row.
  vec4 dTwill( vec3 p, vec3 axis ) {
    vec2 uv = dPlane( p, axis ) / TOW;
    vec2 cell = floor( uv );
    vec2 f = fract( uv );
    float warp = step( mod( cell.x + cell.y, 4.0 ), 1.5 );
    float across = mix( f.x, f.y, warp );
    float along = mix( f.y, f.x, warp );
    return vec4( warp, across, along, dHash( vec3( cell, 1.0 ) ) );
  }
  float dHeight( vec3 p, vec3 axis ) {
    vec4 t = dTwill( p, axis );
    float bulge = sin( 3.14159 * t.y );
    float fibres = dNoise( vec3( t.y * 48.0, t.z * 3.0, t.w * 40.0 ) ) - 0.5;
    return ( bulge * 0.7 + fibres * 0.25 ) * 0.00006;
  }
  vec2 dSurface( vec3 p, vec3 axis ) {
    vec4 t = dTwill( p, axis );
    // warp and weft tows sit at 90 deg, so they catch the light differently
    // albedo: warp vs weft tows differ strongly (resin-rich vs fibre-rich look), each tow rounded across its width
    float shade = mix( 0.3, 1.7, t.x ) * ( 0.75 + 0.35 * sin( 3.14159 * t.y ) ) * ( 0.9 + 0.2 * t.w );
    return vec2( mix( 0.15, -0.13, t.x ) + ( t.w - 0.5 ) * 0.05, shade );
  }
#elif defined( DETAIL_BRUSHED )
  const float DETAIL_L = 0.0002;
  // streaks run along the model axis that lies in the surface (extrusion / machining direction)
  // (vertical on side faces, along X on top/bottom faces)
  vec3 dStretch( vec3 axis ) {
    vec3 along = axis.y > 0.5 ? vec3( 1, 0, 0 ) : vec3( 0, 1, 0 );
    return mix( vec3( 7000.0 ), vec3( 60.0 ), along );
  }
  float dHeight( vec3 p, vec3 axis ) {
    return dNoise( p * dStretch( axis ) ) * 0.000008;
  }
  vec2 dSurface( vec3 p, vec3 axis ) {
    float n = dNoise( p * dStretch( axis ) * 0.5 + 2.3 );
    return vec2( ( n - 0.5 ) * 0.16, 1.0 );
  }
#elif defined( DETAIL_LAYERS )
  const float LAYER = 0.0002; // 0.2 mm FDM layers along model Y
  const float DETAIL_L = LAYER;
  float dHeight( vec3 p, vec3 axis ) {
    return ( 1.0 - axis.y ) * sin( p.y * 6.28318 / LAYER ) * 0.000006;
  }
  vec2 dSurface( vec3 p, vec3 axis ) {
    return vec2( ( dNoise( p * 600.0 ) - 0.5 ) * 0.08, 1.0 );
  }
#endif
`;

// Runs after roughness is known: roughness / albedo variation.
const FRAGMENT_SURFACE = /* glsl */ `
#ifdef USE_DETAIL
  vec3 dAxis = dFaceAxis( vObjPos );
  // 1 when features are several pixels wide, 0 once they shrink below a pixel
  float dFade = uDetail * ( 1.0 - smoothstep( DETAIL_L * 0.25, DETAIL_L * 0.9, length( fwidth( vObjPos ) ) ) );
  vec2 dSurf = dSurface( vObjPos, dAxis );
  roughnessFactor = clamp( roughnessFactor + dSurf.x * uDetail, 0.04, 1.0 );
  diffuseColor.rgb *= mix( 1.0, dSurf.y, dFade ); // fades with pixel size: strong patterns average out, never alias
#endif
`;

// Runs after the normal is set up: bump from the height field (Mikkelsen surface gradient; heights are
// converted from model metres to view units with the local model->view scale).
const FRAGMENT_NORMAL = /* glsl */ `
#ifdef USE_DETAIL
  if ( dFade > 0.001 ) {
    vec3 dPx = dFdx( - vViewPosition );
    vec3 dPy = dFdy( - vViewPosition );
    vec3 oPx = dFdx( vObjPos );
    vec3 oPy = dFdy( vObjPos );
    float h0 = dHeight( vObjPos, dAxis );
    float toView = length( dPx ) / max( length( oPx ), 1e-9 );
    vec2 dH = vec2( dHeight( vObjPos + oPx, dAxis ) - h0, dHeight( vObjPos + oPy, dAxis ) - h0 ) * toView * dFade;
    vec3 R1 = cross( dPy, normal );
    vec3 R2 = cross( normal, dPx );
    float det = dot( dPx, R1 ) * faceDirection;
    vec3 grad = sign( det ) * ( dH.x * R1 + dH.y * R2 );
    normal = normalize( abs( det ) * normal - grad );
  }
#endif
`;

// Baked AO on indirect light (+ a little on direct, for cavities), with specular occlusion.
const FRAGMENT_AO = /* glsl */ `
#ifdef USE_VERTEX_AO
  float vertexAO = mix( 1.0, vAO, uAO );
  reflectedLight.indirectDiffuse *= vertexAO;
  reflectedLight.directDiffuse *= mix( 1.0, vertexAO, uAODirect );
  reflectedLight.directSpecular *= mix( 1.0, vertexAO, uAODirect );
  #if defined( USE_CLEARCOAT )
    clearcoatSpecularIndirect *= vertexAO;
  #endif
  #if defined( USE_SHEEN )
    sheenSpecularIndirect *= vertexAO;
  #endif
  #if defined( USE_ENVMAP )
    reflectedLight.indirectSpecular *= computeSpecularOcclusion( saturate( dot( geometryNormal, geometryViewDir ) ), vertexAO, material.roughness );
  #endif
#endif
`;

function decorate(mat: THREE.MeshPhysicalMaterial, detail: Detail | undefined, ao: boolean, aoX?: THREE.IUniform<number>) {
  const worldToModel = { value: new THREE.Matrix4() };
  mat.defines = {
    ...mat.defines,
    ...(detail && { [`DETAIL_${detail}`]: "" }),
    ...(ao && { USE_VERTEX_AO: "" }),
    ...(ao && aoX && { USE_VERTEX_AO_X: "" }),
  };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, shaderTuning, { uWorldToModel: worldToModel }, aoX && { uAOX: aoX });
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${VERTEX_PARS}`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\n${VERTEX_MAIN}`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${FRAGMENT_PARS}`)
      .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>\n${FRAGMENT_SURFACE}`)
      .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>\n${FRAGMENT_NORMAL}`)
      .replace("#include <aomap_fragment>", `#include <aomap_fragment>\n${FRAGMENT_AO}`);
  };
  // One onBeforeCompile for every preset: the program differs only by `defines`, which three already
  // includes in the program cache key.
  mat.customProgramCacheKey = () => "creator-logs-preset";
  // Model.tsx tags meshes with their model root; without one (e.g. <Mat>), model space = world space.
  mat.onBeforeRender = (_r, _s, _c, _g, object) => {
    const root = object.userData.modelRoot as THREE.Object3D | undefined;
    if (root) worldToModel.value.copy(root.matrixWorld).invert();
    else worldToModel.value.identity();
  };
}

/** Uncached instance (caller owns + disposes it); see the note at the top.
 *  `aoX`: the geometry also carries "_ao_x" (exploded-view AO); the uniform mixes _ao -> _ao_x (0..1). */
export function createMaterial(preset: Preset, color?: THREE.ColorRepresentation, ao = false, aoX?: THREE.IUniform<number>) {
  const { detail, ...params } = presets[preset];
  const mat = new THREE.MeshPhysicalMaterial({ ...params, ...(color !== undefined && { color }) });
  mat.name = preset;
  decorate(mat, detail, ao, aoX);
  return mat;
}

const cache = new Map<string, THREE.MeshPhysicalMaterial>();

/** `ao`: the mesh's geometry carries the baked "_ao" attribute (without it the shader would read 0 = black). */
export function getMaterial(preset: Preset, color?: THREE.ColorRepresentation, ao = false) {
  const key = `${preset}|${color === undefined ? "" : new THREE.Color(color).getHexString()}|${ao ? "ao" : ""}`;
  let mat = cache.get(key);
  if (!mat) {
    mat = createMaterial(preset, color, ao);
    cache.set(key, mat);
  }
  return mat;
}

export const isPreset = (name: string): name is Preset => name in presets;
