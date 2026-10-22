"use client";

import type { ThreeEvent } from "@react-three/fiber";

// Invisible box that receives pointer events for a detailed model (3D_GUIDE §7b rule 14).
// Raycasters ignore `visible`, so it's hit-testable but never drawn.
type Props = {
  size: [number, number, number];
  position?: [number, number, number];
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
};

export function HitProxy({ size, position, ...handlers }: Props) {
  return (
    <mesh visible={false} position={position} {...handlers}>
      <boxGeometry args={size} />
    </mesh>
  );
}
