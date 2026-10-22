import * as THREE from "three";

// Orange fresnel rim for hovered objects (3D_GUIDE §4: a second additive shell, not an outline pass).
// One shared material for the whole app; shells share the model's geometry, so they cost nothing
// until made visible.
export const rimMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uColor: { value: new THREE.Color("#DC5000") },
    uPower: { value: 2.6 },
    uIntensity: { value: 1.6 },
  },
  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vView;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vView = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform float uPower;
    uniform float uIntensity;
    varying vec3 vNormal;
    varying vec3 vView;
    void main() {
      float f = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vView)), 0.0, 1.0), uPower) * uIntensity;
      gl_FragColor = vec4(uColor * f, f);
    }`,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  depthFunc: THREE.LessEqualDepth,
  toneMapped: false,
});

/** Adds a hidden rim shell under every mesh of `root`; returns a toggle and a cleanup. */
export function attachRim(root: THREE.Object3D) {
  const meshes: THREE.Mesh[] = [];
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh && !o.userData.isRim) meshes.push(o as THREE.Mesh);
  });
  const shells = meshes.map((mesh) => {
    const shell = new THREE.Mesh(mesh.geometry, rimMaterial);
    shell.userData.isRim = true;
    shell.visible = false;
    shell.raycast = () => {};
    shell.renderOrder = 1;
    mesh.add(shell); // inherits the mesh transform (incl. glTF dequantization)
    return shell;
  });
  return {
    set(visible: boolean) {
      for (const s of shells) s.visible = visible;
    },
    dispose() {
      for (const s of shells) s.removeFromParent(); // geometry belongs to the model, material is shared
    },
  };
}
