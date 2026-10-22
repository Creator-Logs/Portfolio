// Badge Factory chapter: "01 / THE FOUNDATION" eyebrow + display title, last line optionally orange.
type Props = {
  number?: string;
  eyebrow: string;
  lines?: string[];
  accentLast?: boolean;
  as?: "h1" | "h2" | "h3";
  className?: string;
};

export function ChapterHeader({ number, eyebrow, lines = [], accentLast = false, as: Tag = "h2", className = "" }: Props) {
  return (
    <div className={className}>
      <p className="type-label text-grey-brown">
        {number && <span className="text-cream">{number}</span>}
        {number && " / "}
        {eyebrow}
      </p>
      {lines.length > 0 && (
        <Tag className="type-h2 mt-4">
          {lines.map((line, i) => (
            <span key={i} className={`block ${accentLast && i === lines.length - 1 ? "text-orange" : ""}`}>
              {line}
            </span>
          ))}
        </Tag>
      )}
    </div>
  );
}
