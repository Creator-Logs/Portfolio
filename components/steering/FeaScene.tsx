"use client";

import { PerspectiveCamera, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { StudioEnvironment } from "@/components/three/StudioEnvironment";
import { useWarmup } from "@/components/three/useWarmup";
import { createFeaMaterial, feaUniforms } from "./feaMaterial";
import type { FeaControls } from "./feaControls";
import { FEA_GROUPS, fea, peakBody } from "./feaData";

// The solved Ansys model (scripts/fea/build_fea.py): real nodal von Mises + displacement per vertex.
// Model space: column axis +Z (driver side towards the camera at yaw 0), origin at the load pilot node.
const SRC = "/models/steering-wheel/fea.glb";
const FILL = 0.9; // share of the viewport the framed region fills (the whole stack, plate included)
const LOAD_RAMP_S = 2.4;

const ORANGE = new THREE.Color("#DC5000");
const arrowMaterial = new THREE.MeshBasicMaterial({ color: ORANGE, toneMapped: false });

const tmp = new THREE.Vector3();
const damp = THREE.MathUtils.damp;

export default function FeaScene({ ctl }: { ctl: RefObject<FeaControls> }) {
  const camera = useRef<THREE.PerspectiveCamera>(null);
  const spin = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const radius = useRef(0.15);
  const lastAspect = useRef(0);
  const lastLoad = useRef(-1);
  const arrows = useRef<THREE.Group>(null);
  useWarmup(camera);

  const { scene: source } = useGLTF(SRC, false, true);
  const { model, focus, anchors, centre, frameRadius } = useMemo(() => {
    const model = source.clone(true);
    const focus = new Map<string, THREE.IUniform<number>>();
    let qdBox: THREE.Box3 | null = null;
    for (const g of FEA_GROUPS) {
      const { material, focus: f } = createFeaMaterial(g.look);
      focus.set(g.id, f);
      for (const body of g.bodies) {
        const mesh = model.getObjectByName(THREE.PropertyBinding.sanitizeNodeName(body)) as THREE.Mesh | undefined;
        if (!mesh) continue;
        mesh.material = material;
        mesh.raycast = () => null; // nothing to pick: the body list is the (accessible) interaction
        if (g.id === "qd") qdBox = new THREE.Box3().setFromObject(mesh);
      }
    }
    const anchors = {
      peak: new THREE.Vector3(...peakBody.peakAt),
      force: new THREE.Vector3(0, 0, FORCE_TAIL),
      moment: new THREE.Vector3(MOMENT_R * Math.cos(MOMENT_END), MOMENT_R * Math.sin(MOMENT_END), MOMENT_Z),
      fixed: (qdBox as THREE.Box3 | null)?.getCenter(new THREE.Vector3()) ?? new THREE.Vector3(),
    };
    // pivot + frame on the whole model (Ansh 2026-10-22: show the plate too, not just the standoff stack)
    const sphere = new THREE.Box3().setFromObject(model).getBoundingSphere(new THREE.Sphere());
    return { model, focus, anchors, centre: sphere.center, frameRadius: sphere.radius };
  }, [source]);

  // own the per-body materials: dispose with the scene (3D_GUIDE §7b rule 12)
  useEffect(() => {
    const mats = new Set<THREE.Material>();
    model.traverse((o) => (o as THREE.Mesh).isMesh && mats.add((o as THREE.Mesh).material as THREE.Material));
    return () => mats.forEach((m) => m.dispose());
  }, [model]);

  useLayoutEffect(() => {
    feaUniforms.uVmMax.value = fea.vmMaxPsi;
    radius.current = frameRadius;
  }, [frameRadius]);

  useFrame((state, dt) => {
    const c = ctl.current;
    const cam = camera.current;
    const s = spin.current;
    if (!c || !cam || !s) return;
    if (cam.aspect !== lastAspect.current) {
      lastAspect.current = cam.aspect;
      const v = THREE.MathUtils.degToRad(cam.fov);
      const h = 2 * Math.atan(Math.tan(v / 2) * cam.aspect);
      const dist = radius.current / Math.sin(Math.min(v, h) / 2) / FILL;
      cam.position.set(0, 0, dist);
      cam.lookAt(0, 0, 0);
    }

    // load ramp (first view) or follow the slider
    if (c.play) {
      c.load = Math.min(1, c.load + dt / LOAD_RAMP_S);
      if (c.load >= 1) c.play = false;
    }
    const u = feaUniforms;
    u.uLoad.value = c.play ? c.load : damp(u.uLoad.value, c.load, 10, dt);
    u.uMix.value = damp(u.uMix.value, c.mode, 6, dt);
    u.uDispScale.value = damp(u.uDispScale.value, c.exaggerate, 5, dt);
    for (const [id, f] of focus) f.value = damp(f.value, c.focus === null || c.focus === id ? 1 : 0, 8, dt);
    s.rotation.y = damp(s.rotation.y, c.yaw, 8, dt);
    s.rotation.x = damp(s.rotation.x, c.pitch, 8, dt);

    const load = u.uLoad.value;
    if (Math.abs(load - lastLoad.current) > 1e-4) {
      lastLoad.current = load;
      if (c.els.slider && document.activeElement !== c.els.slider) c.els.slider.value = String(Math.round(load * 100));
      if (c.els.readout)
        c.els.readout.textContent = `${Math.round(load * 100)}% · ${Math.round(fea.loads.forceLbf * load)} lbf · ${Math.round(fea.loads.momentLbfIn * load)} lbf·in`;
    }
    if (arrows.current) arrows.current.visible = load > 0.01;

    // DOM tags follow their 3D anchors (positions in the View's own pixel box)
    const frame = inner.current;
    if (!frame) return;
    frame.updateWorldMatrix(true, false);
    const { width, height } = state.size;
    const place = (el: HTMLElement | null, p: THREE.Vector3, opacity: number) => {
      if (!el) return;
      tmp.copy(p).applyMatrix4(frame.matrixWorld).project(cam);
      const x = ((tmp.x + 1) / 2) * width;
      const flip = x > width * 0.6; // tags right of 60 % open leftwards, so they never run off a narrow viewer
      el.dataset.flip = flip ? "1" : "0";
      el.style.transform = `translate(${x}px, ${((1 - tmp.y) / 2) * height}px)${flip ? " translateX(-100%)" : ""}`;
      el.style.opacity = String(opacity);
    };
    const tags = load > 0.01 ? 1 : 0;
    place(c.els.peak, anchors.peak, u.uMix.value * (load > 0.97 ? 1 : 0));
    place(c.els.force, anchors.force, tags);
    place(c.els.moment, anchors.moment, tags);
    place(c.els.fixed, anchors.fixed, 1);
  });

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault fov={26} near={0.01} far={10} />
      <StudioEnvironment preset="dark-studio" intensity={1.6} />
      <directionalLight position={[-1.5, 1.4, 2]} intensity={2} color="#FFE7CF" />
      <directionalLight position={[2.5, 1, -2.2]} intensity={3} color="#EEF2F8" />
      <group ref={spin}>
        <group ref={inner} position={[-centre.x, -centre.y, -centre.z]}>
          <primitive object={model} />
          <group ref={arrows}>
            <LoadArrows />
          </group>
        </group>
      </group>
    </>
  );
}

// Load symbols, Mechanical-style: A = axial push/pull along the column, B = torque about it (right-hand
// rule: +Z, counter-clockwise seen from the driver). Both act on the baseplate's driver face via the pilot.
const FORCE_TAIL = 0.042;
const FORCE_HEAD = 0.012;
const MOMENT_R = 0.03;
const MOMENT_Z = 0.014;
const MOMENT_START = -0.35;
const MOMENT_END = Math.PI * 1.25;

function LoadArrows() {
  const geo = useMemo(() => {
    const shaft = new THREE.CylinderGeometry(0.0012, 0.0012, FORCE_TAIL - FORCE_HEAD - 0.008, 12);
    shaft.rotateX(Math.PI / 2).translate(0, 0, (FORCE_TAIL + FORCE_HEAD + 0.008) / 2);
    const head = new THREE.ConeGeometry(0.004, 0.01, 16);
    head.rotateX(-Math.PI / 2).translate(0, 0, FORCE_HEAD + 0.005);
    const arc = new THREE.TorusGeometry(MOMENT_R, 0.0011, 8, 64, MOMENT_END - MOMENT_START);
    arc.rotateZ(MOMENT_START).translate(0, 0, MOMENT_Z);
    const tip = new THREE.ConeGeometry(0.0035, 0.009, 16);
    // tangent at the arc end, pointing counter-clockwise
    tip.rotateZ(MOMENT_END).translate(MOMENT_R * Math.cos(MOMENT_END), MOMENT_R * Math.sin(MOMENT_END), MOMENT_Z);
    return [shaft, head, arc, tip];
  }, []);
  useEffect(() => () => geo.forEach((g) => g.dispose()), [geo]);
  return (
    <>
      {geo.map((g, i) => (
        <mesh key={i} geometry={g} raycast={() => null}>
          <primitive object={arrowMaterial} attach="material" />
        </mesh>
      ))}
    </>
  );
}
