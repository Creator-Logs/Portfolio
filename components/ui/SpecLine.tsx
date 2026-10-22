// Mono caps line with `·` separators: "CARBON PLATE · 20-PLY · WATERJET-CUT".
export function SpecLine({ children, className = "" }: { children: string; className?: string }) {
  const parts = children.split("·").map((p) => p.trim());
  return (
    <p className={`type-label text-grey-brown ${className}`}>
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-2 text-brown">·</span>}
          {part}
        </span>
      ))}
    </p>
  );
}
