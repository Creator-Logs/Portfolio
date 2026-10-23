"use client";

import { View } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Component, Suspense, useEffect } from "react";
import { FrameDriver } from "./FrameDriver";
import { SceneContext } from "./sceneContext";

type Props = {
  children: React.ReactNode;
  active: boolean;
  /** Strictly on screen; drei skips rendering the View entirely when false. */
  visible: boolean;
  animate: boolean;
  onReady: () => void;
  onError: () => void;
};

export default function SceneView({ children, active, visible, animate, onReady, onError }: Props) {
  return (
    <View className="absolute inset-0" visible={visible}>
      <SceneContext.Provider value={{ active }}>
        <SceneErrorBoundary onError={onError}>
          <Suspense fallback={null}>
            {children}
            {/* Commits only after everything in this boundary has loaded. */}
            <Ready onReady={onReady} />
          </Suspense>
        </SceneErrorBoundary>
      </SceneContext.Provider>
      <FrameDriver active={animate && active} />
      <Kick visible={visible} />
    </View>
  );
}

// frameloop="demand": a View skips frames while not strictly on screen, so a scene that only moves on scroll
// (e.g. a pinned hero at the top of a page) would stay blank until the first scroll. Request a frame whenever
// it becomes visible.
function Kick({ visible }: { visible: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (visible) invalidate();
  }, [visible, invalidate]);
  return null;
}

function Ready({ onReady }: { onReady: () => void }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    onReady();
    invalidate(); // first frame with everything loaded (see Kick)
  }, [onReady, invalidate]);
  return null;
}

class SceneErrorBoundary extends Component<{ children: React.ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("[SceneBlock] 3D failed, showing poster", error);
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
