"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Suspense, useCallback, useRef, useState } from "react";
import * as THREE from "three";
import { ContactShadows } from "@/components/three/ContactShadows";
import { Model } from "@/components/three/Model";
import { Monitor } from "@/components/three/Monitor";
import { StudioEnvironment } from "@/components/three/StudioEnvironment";
import { Trinket } from "@/components/three/Trinket";
import { trinkets, type TrinketDef } from "@/content/trinkets";
import { CuttingMat } from "./CuttingMat";

// Landing hero (landing.md §1, revised by Ansh): a green cutting mat with every model on it,
// idling; hover shows the name, click pushes the camera in and opens the project.

export type HeroMatProps = {
  mobile: boolean;
  hovered: string | null;
  onHover: (id: string | null) => void;
  /** Hovered object's label anchor in normalised device coords (-1..1) of this view. */
  onLabel: (ndcX: number, ndcY: number) => void;
  onNavigate: (t: TrinketDef) => void;
};

const CAMERA = {
  // camera centred on the mat (x = 0) and square to it (Ansh: skewed / off-centre mat looked wrong)
  desktop: { position: new THREE.Vector3(0, 0.95, 0.8), target: new THREE.Vector3(0, 0, 0.0), fov: 32 },
  mobile: { position: new THREE.Vector3(0, 1.02, 0.52), target: new THREE.Vector3(0, 0, 0.04), fov: 34 },
};
const PUSH_SECONDS = 0.7;
const MOBILE_SCALE = 0.47; // top-down portrait view is much narrower
const expoInOut = (t: number) =>
  t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;

// reused (no allocations per frame)
const ndc = new THREE.Vector3();
const lookNow = new THREE.Vector3();

export default function HeroMatScene({ mobile, hovered, onHover, onLabel, onNavigate }: HeroMatProps) {
  const camera = useRef<THREE.PerspectiveCamera>(null);
  const cam = mobile ? CAMERA.mobile : CAMERA.desktop;
  const [loaded, setLoaded] = useState(1); // stream models one at a time (3D_GUIDE §7b rule 18)
  const push = useRef<{ t0: number; from: THREE.Vector3; to: THREE.Vector3; look: THREE.Vector3; def: TrinketDef } | null>(null);
  const tapped = useRef<string | null>(null);

  const select = useCallback(
    (def: TrinketDef, e: ThreeEvent<MouseEvent>) => {
      if (push.current) return;
      // touch: first tap shows the name, second tap opens (landing.md §1 mobile)
      if ((e.nativeEvent as PointerEvent).pointerType === "touch" && tapped.current !== def.id) {
        tapped.current = def.id;
        onHover(def.id);
        return;
      }
      const c = camera.current!;
      const [x, z] = mobile ? def.mobilePosition : def.position;
      const look = new THREE.Vector3(x, def.size * 0.35, z);
      const to = c.position.clone().lerp(look, 0.45);
      push.current = { t0: performance.now(), from: c.position.clone(), to, look, def };
    },
    [mobile, onHover],
  );

  useFrame(({ invalidate }) => {
    const c = camera.current;
    if (!c) return;
    const p = push.current;
    if (p) {
      const t = Math.min(1, (performance.now() - p.t0) / (PUSH_SECONDS * 1000));
      const e = expoInOut(t);
      c.position.lerpVectors(p.from, p.to, e);
      lookNow.lerpVectors(cam.target, p.look, e);
      c.lookAt(lookNow);
      invalidate();
      if (t >= 1) {
        push.current = null;
        onNavigate(p.def);
      }
    }
  });

  const onLabelAnchor = useCallback(
    (world: THREE.Vector3) => {
      const c = camera.current;
      if (!c) return;
      ndc.copy(world).project(c);
      onLabel(ndc.x, ndc.y);
    },
    [onLabel],
  );

  return (
    <>
      <PerspectiveCamera
        ref={camera}
        makeDefault
        fov={cam.fov}
        position={cam.position.toArray()}
        near={0.02}
        far={20}
        onUpdate={(c) => c.lookAt(cam.target)}
      />
      <StudioEnvironment preset="dark-studio" />
      {/* warm desk-lamp key from top-left (landing.md "3D treatment") */}
      <directionalLight position={[-0.8, 1.4, 0.6]} intensity={1.6} color="#FFD9B0" />

      <CuttingMat />
      {trinkets.slice(0, loaded).map((def, i) => (
        <Suspense key={def.id} fallback={null}>
          <Trinket
            id={def.id}
            size={def.size * (mobile ? MOBILE_SCALE : 1)}
            position={mobile ? def.mobilePosition : def.position}
            rotation={def.rotation}
            phase={i * 1.7}
            hovered={hovered === def.id}
            onHover={(id) => {
              if (id === null) tapped.current = null;
              onHover(id);
            }}
            onSelect={(_, e) => select(def, e)}
            onLabelAnchor={onLabelAnchor}
            onLoaded={() => setLoaded((n) => Math.max(n, i + 2))}
          >
            {def.kind === "monitor" ? <Monitor screen="/project_media/tapcarry/hero.webp" /> : <Model src={def.src!} />}
          </Trinket>
        </Suspense>
      ))}
      <ContactShadows position={[0, 0.0005, 0]} scale={1.1} blur={2.2} opacity={0.75} far={0.35} resolution={1024} bake={loaded} />
    </>
  );
}
