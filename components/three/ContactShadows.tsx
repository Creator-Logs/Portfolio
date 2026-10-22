"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { HorizontalBlurShader } from "three/examples/jsm/shaders/HorizontalBlurShader.js";
import { VerticalBlurShader } from "three/examples/jsm/shaders/VerticalBlurShader.js";

// Port of drei's <ContactShadows> that disposes its render targets/materials on unmount
// (drei's version leaks 2 render-target textures per mount — measured with ?debug).
// Defaults to baking once (frames=1); pass frames={Infinity} only for moving objects.

type Props = Omit<React.JSX.IntrinsicElements["group"], "scale"> & {
  scale?: number;
  frames?: number;
  opacity?: number;
  blur?: number;
  far?: number;
  resolution?: number;
  color?: THREE.ColorRepresentation;
  /** Change this value to re-bake (e.g. after another model has loaded). */
  bake?: number;
};

export function ContactShadows({
  scale = 10,
  frames = 1,
  opacity = 1,
  blur = 1,
  far = 10,
  resolution = 512,
  color = "#000000",
  bake = 0,
  ...props
}: Props) {
  const group = useRef<THREE.Group>(null);
  const shadowCamera = useRef<THREE.OrthographicCamera>(null);
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl);
  const count = useRef(0);
  const compiled = useRef(false);
  const invalidate = useThree((s) => s.invalidate);

  const r = useMemo(() => {
    const target = new THREE.WebGLRenderTarget(resolution, resolution);
    const targetBlur = new THREE.WebGLRenderTarget(resolution, resolution);
    target.texture.generateMipmaps = targetBlur.texture.generateMipmaps = false;
    const plane = new THREE.PlaneGeometry(scale, scale).rotateX(Math.PI / 2);
    const blurPlane = new THREE.Mesh(plane);
    const depth = new THREE.MeshDepthMaterial();
    depth.depthTest = depth.depthWrite = false;
    depth.onBeforeCompile = (shader) => {
      shader.uniforms.ucolor = { value: new THREE.Color(color) };
      shader.fragmentShader = shader.fragmentShader
        .replace("void main() {", "uniform vec3 ucolor;\nvoid main() {")
        .replace("vec4( vec3( 1.0 - fragCoordZ ), opacity );", "vec4( ucolor * fragCoordZ * 2.0, ( 1.0 - fragCoordZ ) * 1.0 );");
    };
    const hBlur = new THREE.ShaderMaterial(HorizontalBlurShader);
    const vBlur = new THREE.ShaderMaterial(VerticalBlurShader);
    hBlur.depthTest = vBlur.depthTest = false;
    const display = new THREE.MeshBasicMaterial({ transparent: true, map: target.texture, depthWrite: false });
    return { target, targetBlur, plane, blurPlane, depth, hBlur, vBlur, display };
  }, [resolution, scale, color]);

  useEffect(() => {
    count.current = 0; // re-bake when inputs change
    // Pre-compile the private bake materials (depth override + both blur passes) in parallel before the
    // first bake — otherwise their first use blocks the main thread on ANGLE/D3D (3D_GUIDE §7b).
    compiled.current = false;
    let cancelled = false;
    // The bake passes draw into a render target, where three builds a different program variant (no tone
    // mapping) — so compile them with the target bound; the on-screen display material without it.
    const cam = shadowCamera.current ?? new THREE.OrthographicCamera();
    const bakeScene = new THREE.Scene();
    for (const m of [r.depth, r.hBlur, r.vBlur]) bakeScene.add(new THREE.Mesh(r.plane, m));
    const screenScene = new THREE.Scene().add(new THREE.Mesh(r.plane, r.display));
    const prev = gl.getRenderTarget();
    gl.setRenderTarget(r.target);
    const bake = gl.compileAsync(bakeScene, cam); // compile() runs synchronously inside, with the target bound
    gl.setRenderTarget(prev);
    Promise.all([bake, gl.compileAsync(screenScene, cam)])
      .catch(() => {})
      .then(() => {
        if (!cancelled) compiled.current = true;
        invalidate();
      });
    return () => {
      cancelled = true;
      r.target.dispose();
      r.targetBlur.dispose();
      r.plane.dispose();
      r.depth.dispose();
      r.hBlur.dispose();
      r.vBlur.dispose();
      r.display.dispose();
    };
  }, [r]);

  useEffect(() => {
    r.display.opacity = opacity;
  }, [r, opacity]);

  useEffect(() => {
    count.current = 0;
    invalidate();
  }, [bake, invalidate]);

  const blurPass = (amount: number) => {
    const cam = shadowCamera.current!;
    r.blurPlane.visible = true;
    r.blurPlane.material = r.hBlur;
    r.hBlur.uniforms.tDiffuse.value = r.target.texture;
    r.hBlur.uniforms.h.value = amount / 256;
    gl.setRenderTarget(r.targetBlur);
    gl.render(r.blurPlane, cam);
    r.blurPlane.material = r.vBlur;
    r.vBlur.uniforms.tDiffuse.value = r.targetBlur.texture;
    r.vBlur.uniforms.v.value = amount / 256;
    gl.setRenderTarget(r.target);
    gl.render(r.blurPlane, cam);
    r.blurPlane.visible = false;
  };

  useFrame(() => {
    if (!compiled.current || !shadowCamera.current || !group.current || count.current >= frames) return;
    count.current++;
    const bg = scene.background;
    const override = scene.overrideMaterial;
    group.current.visible = false;
    scene.background = null;
    scene.overrideMaterial = r.depth;
    gl.setRenderTarget(r.target);
    gl.render(scene, shadowCamera.current);
    blurPass(blur);
    blurPass(blur * 0.4);
    gl.setRenderTarget(null);
    group.current.visible = true;
    scene.overrideMaterial = override;
    scene.background = bg;
  });

  return (
    <group ref={group} rotation-x={Math.PI / 2} {...props}>
      {/* primitives: owned + disposed by the effect above, not by R3F */}
      <mesh scale={[1, -1, 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <primitive object={r.plane} attach="geometry" />
        <primitive object={r.display} attach="material" />
      </mesh>
      <orthographicCamera ref={shadowCamera} args={[-scale / 2, scale / 2, scale / 2, -scale / 2, 0, far]} />
    </group>
  );
}
