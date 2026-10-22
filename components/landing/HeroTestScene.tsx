"use client";

// Phase 2 checkpoint scene: proves the shared canvas, dark-studio rig, material presets,
// demand frame loop and hit-proxy hover. Replaced by the cutting-mat hero in Phase 4.
import { PerspectiveCamera, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type * as THREE from "three";
import { HitProxy } from "@/components/three/HitProxy";
import { ContactShadows } from "@/components/three/ContactShadows";
import { Mat } from "@/components/three/Mat";
import { useSceneBlock } from "@/components/three/sceneContext";
import { StudioEnvironment } from "@/components/three/StudioEnvironment";

export default function HeroTestScene() {
  const { active } = useSceneBlock();
  const knot = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!active || !knot.current) return;
    knot.current.rotation.y += delta * 0.4;
    const target = hovered ? 0.85 : 0.75;
    knot.current.position.y += (target - knot.current.position.y) * Math.min(1, delta * 8);
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 4.2]} fov={35} onUpdate={(c) => c.lookAt(0, 0.5, 0)} />
      <StudioEnvironment preset="dark-studio" />

      <mesh ref={knot} position={[0, 0.75, 0]}>
        <torusKnotGeometry args={[0.38, 0.13, 256, 48]} />
        <Mat preset="pla_matte" color="#DC5000" />
      </mesh>
      <HitProxy
        size={[1.1, 1.1, 0.5]}
        position={[0, 0.75, 0]}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
      />
      <RoundedBox args={[0.6, 0.6, 0.6]} radius={0.05} position={[-1.1, 0.3, -0.2]}>
        <Mat preset="carbon_fiber" />
      </RoundedBox>
      <mesh position={[1.05, 0.25, 0.1]}>
        <cylinderGeometry args={[0.25, 0.25, 0.5, 96]} />
        <Mat preset="alu_machined" />
      </mesh>

      <ContactShadows position={[0, 0, 0]} scale={6} blur={2.5} opacity={0.6} far={1.5} />
    </>
  );
}
