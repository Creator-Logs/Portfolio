import type { Progress } from "@/hooks/useScrollProgress";

// Shared, mutable state between the stack-up's DOM (scroll, drag, list, labels) and its 3D scene — same pattern as
// feaControls: the DOM writes targets, the scene eases and writes label positions back through element refs.
export type ExplodedControls = {
  progress: Progress;
  /** drag offsets added to the scripted view once fully exploded */
  yaw: number;
  pitch: number;
  /** index into content `parts` */
  hover: number | null;
  selected: number | null;
  els: {
    labels: (HTMLElement | null)[];
    lines: (SVGLineElement | null)[];
    dots: (SVGCircleElement | null)[];
  };
  /** set by the scene: request a frame (frameloop="demand") */
  kick?: () => void;
  /** set by the scene: which part (index) is under a point of the stage, in normalized device coords (-1..1) */
  pick?: (ndcX: number, ndcY: number) => number | null;
};

// Scroll choreography over the pinned section (progress 0..1)
export const TURN_END = 0.12; // hero pose -> 3/4 side view
export const EXPLODE = [0.14, 0.82] as const; // groups separate one after another inside this range
export const EXPLORE_FROM = 0.84; // fully exploded: drag + click enabled

export const createExplodedControls = (progress: Progress): ExplodedControls => ({
  progress,
  yaw: 0,
  pitch: 0,
  hover: null,
  selected: null,
  els: { labels: [], lines: [], dots: [] },
});
