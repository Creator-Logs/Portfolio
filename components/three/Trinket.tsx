"use client";

import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { HitProxy } from "./HitProxy";
import { attachRim } from "./rim";
import { useSceneBlock } from "./sceneContext";

// An object resting on the hero mat: normalised to `size`, idles (slow bob + sway, own phase),
// lifts with an orange rim on hover, and reports its label anchor each frame while hovered.
// Interaction goes through a hit proxy so detailed meshes are never raycast (3D_GUIDE §7b rule 14).

type Props = {
  id: string;
  size: number;
  position: [number, number];
  rotation: [number, number, number];
  phase: number;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string, e: ThreeEvent<MouseEvent>) => void;
  /** Called every frame while hovered with the world-space point the label should sit at. */
  onLabelAnchor?: (world: THREE.Vector3) => void;
  onLoaded?: () => void;
  children: React.ReactNode;
};

const BOB = 0.006; // m
const SWAY = THREE.MathUtils.degToRad(5);
const LIFT = 0.018; // m
const anchor = new THREE.Vector3(); // reused every frame (no allocations in useFrame)

export function Trinket(props: Props) {
  const { id, size, position, rotation, phase, hovered, onHover, onSelect, onLabelAnchor, onLoaded, children } = props;
  const outer = useRef<THREE.Group>(null); // position + idle motion
  const scaler = useRef<THREE.Group>(null); // normalised scale + rest rotation
  const inner = useRef<THREE.Group>(null); // re-centred content
  const lift = useRef(0);
  const rim = useRef<ReturnType<typeof attachRim> | null>(null);
  const [box, setBox] = useState<{ size: [number, number, number]; centre: [number, number, number]; top: number } | null>(null);
  const { active } = useSceneBlock();
  // Stay invisible until this trinket's shaders are compiled in parallel (compileAsync): drawing first
  // makes the browser wait synchronously for ANGLE/D3D compiles — measured 1.1 s blocked at load.
  const [warm, setWarm] = useState(false);
  const gl = useThree((st) => st.gl);
  const scene = useThree((st) => st.scene);
  const camera = useThree((st) => st.camera);

  // Normalise once the content has loaded (this component only mounts after its Suspense resolves).
  useLayoutEffect(() => {
    const s = scaler.current!;
    const content = inner.current!;
    content.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).raycast = () => {};
    });
    s.rotation.set(...(rotation.map(THREE.MathUtils.degToRad) as [number, number, number]), "XYZ");
    s.scale.setScalar(1);
    s.position.set(0, 0, 0); // idempotent if the effect runs twice (dev double-invoke / remount)
    outer.current!.updateMatrixWorld(true); // not rendered yet, so matrices are stale
    // Fit: rotated bounds in the trinket's own frame.
    const bounds = new THREE.Box3().setFromObject(content);
    const parentInv = outer.current!.matrixWorld.clone().invert();
    bounds.applyMatrix4(parentInv);
    const dims = bounds.getSize(new THREE.Vector3());
    const k = size / Math.max(dims.x, dims.y, dims.z);
    s.scale.setScalar(k);
    // sit on the mat, centred on its footprint
    s.position.set(-((bounds.min.x + bounds.max.x) / 2) * k, -bounds.min.y * k, -((bounds.min.z + bounds.max.z) / 2) * k);
    setBox({ size: [dims.x * k, dims.y * k, dims.z * k], centre: [0, (dims.y * k) / 2, 0], top: dims.y * k });
    rim.current = attachRim(content);
    let cancelled = false;
    gl.compileAsync(outer.current!, camera, scene)
      .catch(() => {})
      .then(() => {
        if (cancelled) return;
        setWarm(true);
        onLoaded?.(); // the next model starts loading only once this one is ready to draw
      });
    return () => {
      cancelled = true;
      rim.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    rim.current?.set(hovered);
  }, [hovered]);

  useFrame(({ clock, invalidate }, delta) => {
    const g = outer.current;
    if (!g) return;
    const target = hovered ? LIFT : 0;
    const settling = Math.abs(target - lift.current) > 1e-4;
    lift.current += (target - lift.current) * Math.min(1, delta * 10);
    const t = active ? clock.elapsedTime + phase : phase;
    // lift-only bob: 0 (resting on the mat) .. BOB, never below the mat
    const bob = active ? (0.5 - 0.5 * Math.cos(t * ((2 * Math.PI) / 5.5))) * BOB : 0;
    g.position.y = bob + lift.current;
    g.rotation.y = Math.sin(t * ((2 * Math.PI) / 9)) * SWAY * (active ? 1 : 0);
    if (hovered && box && onLabelAnchor) {
      anchor.set(0, box.top + 0.02, 0);
      g.localToWorld(anchor);
      onLabelAnchor(anchor);
    }
    if (settling) invalidate(); // finish the lift even when idle animation is off
  });

  return (
    <group ref={outer} position={[position[0], 0, position[1]]} visible={warm}>
      <group ref={scaler}>
        <group ref={inner}>{children}</group>
      </group>
      {box && (
        <HitProxy
          size={box.size}
          position={box.centre}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(id);
          }}
          onPointerOut={() => onHover(null)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(id, e);
          }}
        />
      )}
    </group>
  );
}
