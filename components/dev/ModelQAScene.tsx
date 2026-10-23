"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ContactShadows } from "@/components/three/ContactShadows";
import { Model } from "@/components/three/Model";
import { StudioEnvironment, type StudioPreset } from "@/components/three/StudioEnvironment";

// Fixed QA cameras, fitted to the model's bounds: 0 3/4 hero, 1 top-down (mat view), 2 close-up,
// 3-6 front (+Z) / right (+X) / back (-Z) / left (-X) at a slight elevation, for orientation review.
// `explode` (0-1) moves exploded-view group nodes (extras.explode, scripts/models/process.py) and mixes the AO
// towards the exploded bake (_ao_x), as the page does.
const VIEWS = [
  { dir: [-1, 0.65, 1.25], zoom: 1 },
  { dir: [0.0001, 1, 0.12], zoom: 1 },
  { dir: [1, 0.35, 0.9], zoom: 2.4 },
  { dir: [0, 0.3, 1], zoom: 1 },
  { dir: [1, 0.3, 0], zoom: 1 },
  { dir: [0, 0.3, -1], zoom: 1 },
  { dir: [-1, 0.3, 0], zoom: 1 },
];

type Props = { src: string; view: number; env: StudioPreset; explode?: number };

export default function ModelQAScene({ src, view, env, explode = 0 }: Props) {
  const group = useRef<THREE.Group>(null);
  const camera = useRef<THREE.PerspectiveCamera>(null);
  const invalidate = useThree((s) => s.invalidate);
  const aoExplode = useMemo(() => ({ value: 0 }), []);
  aoExplode.value = explode;

  useLayoutEffect(() => {
    if (!group.current || !camera.current) return;
    group.current.traverse((o) => {
      const offset = o.userData.explode as [number, number, number] | undefined;
      if (offset) o.position.fromArray(offset).multiplyScalar(explode);
    });
    const box = new THREE.Box3().setFromObject(group.current);
    const centre = box.getCenter(new THREE.Vector3());
    const radius = box.getSize(new THREE.Vector3()).length() / 2;
    const v = VIEWS[view] ?? VIEWS[0];
    const dist = radius / Math.sin(THREE.MathUtils.degToRad(camera.current.fov / 2)) / v.zoom;
    camera.current.position.copy(centre).add(new THREE.Vector3(...v.dir).normalize().multiplyScalar(dist));
    camera.current.near = dist / 100;
    camera.current.far = dist * 10;
    camera.current.lookAt(centre);
    camera.current.updateProjectionMatrix();
    invalidate();
    // let a few frames land (shadows bake on first frame) before signalling capture
    const id = setTimeout(() => (document.body.dataset.qaReady = "1"), 800);
    return () => clearTimeout(id);
  }, [src, view, explode, invalidate]);

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault fov={30} />
      <StudioEnvironment preset={env} />
      <group ref={group}>
        <Model src={src} aoExplode={aoExplode} />
      </group>
      <ContactShadows scale={1.5} blur={2} opacity={0.55} far={0.6} />
    </>
  );
}
