"use client";

import { View } from "@react-three/drei";
import { Component, Suspense, useEffect } from "react";
import { FrameDriver } from "./FrameDriver";
import { SceneContext } from "./sceneContext";

type Props = {
  children: React.ReactNode;
  active: boolean;
  animate: boolean;
  onReady: () => void;
  onError: () => void;
};

export default function SceneView({ children, active, animate, onReady, onError }: Props) {
  return (
    <View className="absolute inset-0">
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
    </View>
  );
}

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
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
