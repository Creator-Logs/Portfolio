"use client";

import { RoundedBox, useTexture } from "@react-three/drei";
import { useLayoutEffect } from "react";
import * as THREE from "three";
import { Mat } from "./Mat";

// Procedural desk monitor (thin bezel, stand) showing a still of a site (landing.md §3: still image,
// no video/iframe). Real-ish proportions in metres; Trinket normalises the size on the mat.
const W = 0.62; // bezel width; screen is 16:10
const SCREEN_W = 0.6;
const SCREEN_H = SCREEN_W / 1.6;
const BEZEL_H = SCREEN_H + 0.026;
const DEPTH = 0.022;
const LIFT = 0.13; // bottom of the bezel above the desk

export function Monitor({ screen }: { screen: string }) {
  const tex = useTexture(screen);
  useLayoutEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
  }, [tex]);

  const centreY = LIFT + BEZEL_H / 2;
  return (
    <group>
      <RoundedBox args={[W, BEZEL_H, DEPTH]} radius={0.008} smoothness={4} position={[0, centreY, 0]}>
        <Mat preset="alu_machined" color="#2c2c2e" />
      </RoundedBox>
      {/* the screen: unlit, not tone-mapped so the page keeps its real colours (3D_GUIDE §4 screen_glass) */}
      <mesh position={[0, centreY + 0.004, DEPTH / 2 + 0.0006]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {/* glass: catches the studio reflections over the image */}
      <mesh position={[0, centreY + 0.004, DEPTH / 2 + 0.0012]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshPhysicalMaterial transparent opacity={0.12} roughness={0.05} clearcoat={1} color="#000000" depthWrite={false} />
      </mesh>
      {/* stand */}
      <mesh position={[0, LIFT / 2 + 0.06, -DEPTH / 2 - 0.012]}>
        <boxGeometry args={[0.07, LIFT + 0.12, 0.016]} />
        <Mat preset="alu_machined" color="#2c2c2e" />
      </mesh>
      <RoundedBox args={[0.24, 0.012, 0.17]} radius={0.004} position={[0, 0.006, -0.03]}>
        <Mat preset="alu_machined" color="#2c2c2e" />
      </RoundedBox>
    </group>
  );
}
