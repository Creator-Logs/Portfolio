"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";

// With frameloop="demand", requests a new frame every frame — but only while `active`
// (block on screen, motion allowed). 3D_GUIDE §7b rule 7.
export function FrameDriver({ active }: { active: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (active) invalidate();
  }, [active, invalidate]);
  useFrame(() => {
    if (active) invalidate();
  });
  return null;
}
