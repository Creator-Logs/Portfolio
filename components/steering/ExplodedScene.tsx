"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { GlowBackdrop } from "@/components/landing/ShowcaseScene";
import { Model } from "@/components/three/Model";
import { attachRim } from "@/components/three/rim";
import { StudioEnvironment } from "@/components/three/StudioEnvironment";
import { useWarmup } from "@/components/three/useWarmup";
import { parts } from "@/content/steering-wheel";
import { EXPLODE, TURN_END, type ExplodedControls } from "./explodedControls";
import { HERO_VIEW, PARTS_GLB } from "./WheelHeroScene";

// Chapter 01, the stack-up (fsae-steering-wheel.md §3). steering-wheel-parts.glb has one node per part group, each
// carrying its fully exploded offset (userData.explode, scripts/models/steering-wheel-parts.json). Scroll turns the
// wheel from the hero pose to a 3/4 side view, then separates the groups outermost-first; each part's leader line
// and label (DOM, positioned here every frame) draw in as it separates. AO mixes assembled -> exploded bake.
// The part popover lives in the page's left column (nothing opaque over the canvas — 3D_GUIDE §7b rule 26).

const VIEW = { yaw: -1.2, pitch: 0.36 }; // 3/4 from the driver's right: the column axis runs across the frame
const WINDOW = 0.32; // share of the explode range each group takes to separate
// share of the limiting viewport dimension the bounding sphere fills, assembled -> exploded (the exploded sphere is
// dominated by the column axis, which this view foreshortens, so it may overfill)
const FILL = { desktop: [0.86, 1.1], mobile: [0.95, 1.0] };
const EDGE = 12; // px: labels stay this far inside the stage
const LANES = [0.12, 0.88, 0.19, 0.81]; // label rows (share of stage height): top-outer, bottom-outer, top-inner, bottom-inner

const damp = THREE.MathUtils.damp;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

type Group = {
  node: THREE.Object3D;
  offset: THREE.Vector3;
  start: number; // stagger slot (0..1-WINDOW)
  box: THREE.Box3; // node-local, assembled
  centre: THREE.Vector3;
  rim: ReturnType<typeof attachRim>;
  e: number; // current explode amount 0..1
};

const tmp = new THREE.Vector3();
const tmpBox = new THREE.Box3();
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();

type Props = { ctl: RefObject<ExplodedControls>; mobile: boolean };

export default function ExplodedScene({ ctl, mobile }: Props) {
  const camera = useRef<THREE.PerspectiveCamera>(null);
  const spin = useRef<THREE.Group>(null);
  const pivot = useRef<THREE.Group>(null);
  const wrap = useRef<THREE.Group>(null);
  const groups = useRef<Map<string, Group>>(new Map());
  const frame = useRef({ c0: new THREE.Vector3(), c1: new THREE.Vector3(), r0: 0.15, r1: 0.3 });
  const view = useRef({ yaw: HERO_VIEW.yaw, pitch: HERO_VIEW.pitch });
  const aoExplode = useMemo(() => ({ value: 0 }), []);
  const labelW = useRef<number[]>([]); // label widths, measured once (static text) — no layout reads per frame
  const invalidate = useThree((s) => s.invalidate);
  useWarmup(camera);

  // find the group nodes, measure them assembled and fully exploded (idempotent: reset first — rule 25)
  useLayoutEffect(() => {
    const root = wrap.current!;
    // measure in the pivot's own space: spin + pivot at identity while measuring (set again every frame)
    spin.current!.rotation.set(0, 0, 0);
    pivot.current!.position.set(0, 0, 0);
    const found = new Map<string, Group>();
    root.traverse((o) => {
      const off = o.userData.explode as [number, number, number] | undefined;
      if (!off) return;
      o.position.set(0, 0, 0);
      o.updateWorldMatrix(true, true);
      const box = new THREE.Box3().setFromObject(o).applyMatrix4(tmpMat.copy(o.matrixWorld).invert());
      found.set(o.name, { node: o, offset: new THREE.Vector3(...off), start: 0, box, centre: box.getCenter(new THREE.Vector3()), rim: attachRim(o), e: 0 });
    });
    // outermost first: rank by how far the group travels
    const order = [...found.values()].sort((a, b) => b.offset.length() - a.offset.length());
    order.forEach((g, i) => (g.start = (i / Math.max(1, order.length - 1)) * (1 - WINDOW)));
    const sphere = (explode: number) => {
      found.forEach((g) => g.node.position.copy(g.offset).multiplyScalar(explode));
      root.updateWorldMatrix(true, true);
      const s = new THREE.Box3().setFromObject(root).getBoundingSphere(new THREE.Sphere());
      return s;
    };
    const s1 = sphere(1);
    const s0 = sphere(0);
    frame.current = { c0: s0.center, c1: s1.center, r0: s0.radius, r1: s1.radius };
    groups.current = found;
    return () => found.forEach((g) => g.rim.dispose());
  }, []);

  // hand the DOM its hooks
  useEffect(() => {
    const c = ctl.current;
    c.kick = invalidate;
    c.pick = (x, y) => {
      const cam = camera.current;
      if (!cam) return null;
      ray.setFromCamera(ndc.set(x, y), cam);
      let best: number | null = null;
      let bestD = Infinity;
      parts.forEach((p, i) => {
        for (const id of p.ids) {
          const g = groups.current.get(id);
          if (!g) continue;
          tmpBox.copy(g.box).applyMatrix4(g.node.matrixWorld);
          const hit = ray.ray.intersectBox(tmpBox, tmp);
          if (hit) {
            const d = hit.distanceTo(ray.ray.origin);
            // smaller boxes win ties with the big enclosure/plate boxes they sit inside
            const size = tmpBox.getSize(tmp).length();
            const score = d + size * 0.25;
            if (score < bestD) (bestD = score), (best = i);
          }
        }
      });
      return best;
    };
    return () => {
      c.kick = undefined;
      c.pick = undefined;
    };
  }, [ctl, invalidate]);

  useFrame((state, dt) => {
    const c = ctl.current;
    const cam = camera.current;
    const s = spin.current;
    const pv = pivot.current;
    if (!c || !cam || !s || !pv || groups.current.size === 0) return;
    const p = c.progress.value;

    // explode: each group on its own stagger slot
    const q = clamp01((p - EXPLODE[0]) / (EXPLODE[1] - EXPLODE[0]));
    let mean = 0;
    groups.current.forEach((g) => {
      g.e = smooth((q - g.start) / WINDOW);
      g.node.position.copy(g.offset).multiplyScalar(g.e);
      mean += g.e / groups.current.size;
    });
    aoExplode.value = mean;

    // view: hero pose -> 3/4, plus the visitor's drag once exploded (eased)
    const t = smooth(p / TURN_END);
    const v = view.current;
    v.yaw = damp(v.yaw, THREE.MathUtils.lerp(HERO_VIEW.yaw, VIEW.yaw, t) + c.yaw, 10, dt);
    v.pitch = damp(v.pitch, THREE.MathUtils.lerp(HERO_VIEW.pitch, VIEW.pitch, t) + c.pitch, 10, dt);
    s.rotation.set(v.pitch, v.yaw, 0);
    const f = frame.current;
    pv.position.lerpVectors(f.c0, f.c1, mean).negate(); // pivot through the current centre
    const fill = mobile ? FILL.mobile : FILL.desktop;
    const vf = THREE.MathUtils.degToRad(cam.fov);
    const hf = 2 * Math.atan(Math.tan(vf / 2) * cam.aspect);
    const dist = THREE.MathUtils.lerp(f.r0 / fill[0], f.r1 / fill[1], mean) / Math.sin(Math.min(vf, hf) / 2);
    cam.position.set(0, 0, dist);
    cam.lookAt(0, 0, 0);
    cam.updateMatrixWorld();
    const settling = Math.abs(v.yaw - (THREE.MathUtils.lerp(HERO_VIEW.yaw, VIEW.yaw, t) + c.yaw)) > 1e-4;
    if (settling) state.invalidate();

    // highlight
    groups.current.forEach((g) => g.rim.set(false));
    for (const i of [c.hover, c.selected]) if (i !== null) parts[i].ids.forEach((id) => groups.current.get(id)?.rim.set(true));

    // labels + leader lines (stage pixels). The column axis runs across the frame, so every part has its own x:
    // labels sit in four lanes above / below the model, centred over their part (sorted by x, lanes alternate),
    // and are pushed apart within a lane so they never overlap.
    s.updateWorldMatrix(true, true);
    const { width: W, height: H } = state.size;
    const items: { i: number; ax: number; ay: number; lane: number; x: number; w: number; vis: number }[] = [];
    parts.forEach((part, i) => {
      const g = groups.current.get(part.ids[part.ids.length - 1]);
      if (!g) return;
      const vis = Math.max(clamp01((g.e - 0.35) / 0.3), q >= 1 ? 1 : 0, c.selected === i ? 1 : 0);
      tmp.copy(g.centre).applyMatrix4(g.node.matrixWorld).project(cam);
      const label = c.els.labels[i];
      if (label && !labelW.current[i]) labelW.current[i] = label.offsetWidth;
      const ax = ((tmp.x + 1) / 2) * W;
      items.push({ i, ax, ay: ((1 - tmp.y) / 2) * H, lane: 0, x: ax, w: labelW.current[i] ?? 140, vis });
    });
    items.sort((a, b) => a.ax - b.ax).forEach((it, k) => (it.lane = k % LANES.length));
    for (let lane = 0; lane < LANES.length; lane++) {
      const row = items.filter((it) => it.lane === lane);
      for (let k = 0; k < row.length; k++) {
        const it = row[k];
        it.x = Math.min(Math.max(it.ax, EDGE + it.w / 2), W - EDGE - it.w / 2);
        if (k > 0) it.x = Math.max(it.x, row[k - 1].x + row[k - 1].w / 2 + 16 + it.w / 2);
      }
    }
    for (const it of items) {
      const label = c.els.labels[it.i];
      const line = c.els.lines[it.i];
      const dot = c.els.dots[it.i];
      const ly = LANES[it.lane] * H;
      const top = LANES[it.lane] < 0.5;
      const ey = ly + (top ? 10 : -10); // line end: just below / above the label
      const draw = it.vis; // the line grows from the part out to its label
      if (label) {
        label.style.transform = `translate(${it.x - it.w / 2}px, ${ly}px) translateY(-50%)`;
        label.style.opacity = String(clamp01((it.vis - 0.5) * 2));
      }
      if (line) {
        line.setAttribute("x1", String(it.ax));
        line.setAttribute("y1", String(it.ay));
        line.setAttribute("x2", String(it.ax + (it.x - it.ax) * draw));
        line.setAttribute("y2", String(it.ay + (ey - it.ay) * draw));
        line.style.opacity = String(it.vis > 0.01 ? 1 : 0);
      }
      if (dot) {
        dot.setAttribute("cx", String(it.ax));
        dot.setAttribute("cy", String(it.ay));
        dot.style.opacity = String(it.vis > 0.01 ? 1 : 0);
      }
    }
  });

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault fov={28} near={0.01} far={10} />
      {/* same rig as the hero / landing showcase (programs already compiled, 3D_GUIDE §7b rule 27) */}
      <StudioEnvironment preset="dark-studio" intensity={2.2} />
      <directionalLight position={[-1.5, 1.4, 2]} intensity={2.4} color="#FFE7CF" />
      <directionalLight position={[2.5, 1, -2.2]} intensity={6} color="#EEF2F8" />
      <directionalLight position={[-2.5, 0.6, -1.5]} intensity={3} color="#F4F4F2" />
      <directionalLight position={[1.5, -0.4, 2]} intensity={0.6} color="#F2F0EC" />
      <GlowBackdrop />
      <group ref={spin} rotation={[HERO_VIEW.pitch, HERO_VIEW.yaw, 0]}>
        <group ref={pivot}>
          <group ref={wrap}>
            <Model src={PARTS_GLB} aoExplode={aoExplode} />
          </group>
        </group>
      </group>
    </>
  );
}

const tmpMat = new THREE.Matrix4();
