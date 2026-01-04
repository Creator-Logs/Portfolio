import React from "react";

/**
 * GrainSVG
 * A fine-grained SVG noise overlay using feTurbulence, for overlay use.
 * Adjustable via props if needed.
 */
const GrainSVG: React.FC<{
  opacity?: number;
  blendMode?: React.CSSProperties["mixBlendMode"];
  className?: string;
}> = ({ opacity = 0.13, blendMode = "overlay", className = "" }) => (
  <svg
    className={
      "absolute inset-0 w-full h-full pointer-events-none " + className
    }
    style={{ opacity, mixBlendMode: blendMode }}
    width="100%"
    height="100%"
    aria-hidden="true"
    focusable="false"
  >
    {/* Gray Layer Underneath Noise */}
    <rect width="100%" height="100%" fill="#888" opacity="0.5" />
    <filter id="grain">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.75"
        numOctaves="9"
        stitchTiles="stitch"
        seed="6"
      />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer>
        <feFuncA type="linear" slope="3" intercept="-1" />
      </feComponentTransfer>
    </filter>
    <rect width="100%" height="100%" filter="url(#grain)" fill="black" />
  </svg>
);

export default GrainSVG;
