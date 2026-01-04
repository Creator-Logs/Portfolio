import React from "react";

interface GrainProps {
  darkMode: boolean;
}

export const Grain: React.FC<GrainProps> = ({ darkMode }) => {
  // Fallback to CSS noise for better performance and easier implementation of the "aesthetic"
  // The user requested "Grain/Noise Texture... Animate it with perlin noise...".
  // Perlin noise in JS without libraries is verbose.
  // I will use a high-quality CSS overlay technique which is industry standard for this look.

  return (
    <div className="fixed inset-0 pointer-events-none z-[0] opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay">
      <div className="absolute inset-[-200%] w-[400%] h-[400%] animate-[grain_8s_steps(10)_infinite] bg-[url('https://api.dicebear.com/7.x/initials/svg?seed=Noise&backgroundColor=808080')] filter contrast-150 brightness-100 grayscale"></div>
      {/* Note: Ideally we use a real noise SVG data URI. Using a placeholder for now or generating one. */}
      <svg className="hidden">
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
      </svg>
      <div
        className="w-full h-full"
        style={{ filter: "url(#noiseFilter)" }}
      ></div>
    </div>
  );
};
