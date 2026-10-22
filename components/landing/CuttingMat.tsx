"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// Green self-healing cutting mat (landing.md §1, DESIGN --olive / --olive-2), drawn procedurally:
// mm/cm/5 cm grid, ruler ticks + numbers on the edges, 45° and 60° guide lines. 0 kB download.
export const MAT_W = 0.9; // m (A1-ish, 900 × 600 mm)
export const MAT_D = 0.6;
const PX_PER_MM = 3; // 2700 × 1800 texture
const MARGIN = 18; // mm of plain border with the ruler

const COLORS = {
  base: "#445231",
  minor: "rgba(93,108,73,0.55)",
  major: "rgba(111,126,88,0.85)",
  bold: "rgba(140,155,112,0.9)",
  guide: "rgba(140,155,112,0.45)",
  text: "rgba(178,190,150,0.9)",
};

function drawMat(monoFamily: string) {
  const w = MAT_W * 1000;
  const d = MAT_D * 1000;
  const canvas = document.createElement("canvas");
  canvas.width = w * PX_PER_MM;
  canvas.height = d * PX_PER_MM;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(PX_PER_MM, PX_PER_MM); // draw in mm
  ctx.fillStyle = COLORS.base;
  ctx.fillRect(0, 0, w, d);

  const gx0 = MARGIN, gx1 = w - MARGIN, gy0 = MARGIN, gy1 = d - MARGIN;
  const line = (x0: number, y0: number, x1: number, y1: number, color: string, width: number) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  };

  // grid: 5 mm minor, 10 mm major, 50 mm bold
  for (let x = gx0; x <= gx1 + 0.01; x += 5) {
    const i = Math.round(x - gx0);
    line(x, gy0, x, gy1, i % 50 === 0 ? COLORS.bold : i % 10 === 0 ? COLORS.major : COLORS.minor, i % 50 === 0 ? 0.5 : 0.3);
  }
  for (let y = gy0; y <= gy1 + 0.01; y += 5) {
    const i = Math.round(y - gy0);
    line(gx0, y, gx1, y, i % 50 === 0 ? COLORS.bold : i % 10 === 0 ? COLORS.major : COLORS.minor, i % 50 === 0 ? 0.5 : 0.3);
  }

  // guide lines: 45° from both bottom corners and a 60° pair, clipped to the grid
  ctx.save();
  ctx.beginPath();
  ctx.rect(gx0, gy0, gx1 - gx0, gy1 - gy0);
  ctx.clip();
  const L = w + d;
  line(gx0, gy1, gx0 + L, gy1 - L, COLORS.guide, 0.35);
  line(gx1, gy1, gx1 - L, gy1 - L, COLORS.guide, 0.35);
  const t60 = Math.tan(THREE.MathUtils.degToRad(60));
  line(gx0, gy1, gx0 + L / t60, gy1 - L, COLORS.guide, 0.35);
  line(gx1, gy1, gx1 - L / t60, gy1 - L, COLORS.guide, 0.35);
  ctx.restore();

  // ruler ticks + numbers in the border (cm)
  ctx.fillStyle = COLORS.text;
  ctx.font = `4px ${monoFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let x = 0; x <= gx1 - gx0 + 0.01; x += 1) {
    const len = x % 10 === 0 ? 5 : x % 5 === 0 ? 3.5 : 2;
    line(gx0 + x, gy0, gx0 + x, gy0 - len, COLORS.bold, 0.25);
    line(gx0 + x, gy1, gx0 + x, gy1 + len, COLORS.bold, 0.25);
    if (x % 10 === 0 && x > 0) {
      ctx.fillText(String(x / 10), gx0 + x, gy0 - 9);
      ctx.fillText(String(x / 10), gx0 + x, gy1 + 9);
    }
  }
  for (let y = 0; y <= gy1 - gy0 + 0.01; y += 1) {
    const len = y % 10 === 0 ? 5 : y % 5 === 0 ? 3.5 : 2;
    line(gx0, gy0 + y, gx0 - len, gy0 + y, COLORS.bold, 0.25);
    line(gx1, gy0 + y, gx1 + len, gy0 + y, COLORS.bold, 0.25);
    if (y % 10 === 0 && y > 0) {
      ctx.fillText(String(y / 10), gx0 - 10, gy0 + y);
      ctx.fillText(String(y / 10), gx1 + 10, gy0 + y);
    }
  }
  ctx.textAlign = "left";
  ctx.font = `3.5px ${monoFamily}`;
  ctx.fillText("A1 · SELF-HEALING · CREATOR LOGS", gx0, d - 5);
  ctx.textAlign = "right";
  ctx.fillText("900 × 600 MM", gx1, d - 5);
  return canvas;
}

export function CuttingMat() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const group = useRef<THREE.Group>(null);
  // shown once its shaders are compiled in parallel — no synchronous compile stall on the first frame
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    let cancelled = false;
    gl.compileAsync(group.current!, camera, scene)
      .catch(() => {})
      .then(() => !cancelled && setWarm(true));
    return () => {
      cancelled = true;
    };
  }, [gl, scene, camera]);
  const texture = useMemo(() => {
    const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-dm-mono").trim() || "monospace";
    const tex = new THREE.CanvasTexture(drawMat(mono));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy()); // 16x over a full-screen mat is a big fill cost on iGPUs
    return tex;
  }, [gl]);
  // created imperatively -> disposed here (3D_GUIDE §7b rule 12)
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group ref={group} visible={warm}>
      {/* mat: 3 mm thick slab so the edge catches light */}
      <mesh position={[0, -0.0015, 0]}>
        <boxGeometry args={[MAT_W, 0.003, MAT_D]} />
        <meshStandardMaterial attach="material-0" color="#2f3a22" roughness={0.9} />
        <meshStandardMaterial attach="material-1" color="#2f3a22" roughness={0.9} />
        <meshStandardMaterial attach="material-2" map={texture} roughness={0.88} metalness={0} />
        <meshStandardMaterial attach="material-3" color="#2f3a22" roughness={0.9} />
        <meshStandardMaterial attach="material-4" color="#2f3a22" roughness={0.9} />
        <meshStandardMaterial attach="material-5" color="#2f3a22" roughness={0.9} />
      </mesh>
      {/* the desk under it: warm near-black */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.0031, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#1A120C" roughness={0.75} />
      </mesh>
    </group>
  );
}
