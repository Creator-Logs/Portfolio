import { brief } from "@/content/steering-wheel";

// "The brief" (fsae-steering-wheel.md §2): goal left, requirement rows with dotted rules right.
export function WheelBrief() {
  return (
    <section className="px-page grid gap-12 py-24 md:grid-cols-16 md:gap-x-6 md:py-32" aria-labelledby="brief-heading">
      <div className="md:col-span-6">
        <h2 id="brief-heading" className="type-label text-grey-brown">
          The brief
        </h2>
        <p className="type-body1 mt-6 max-w-[34ch] text-cream">{brief.goal}</p>
      </div>
      <ul className="md:col-span-8 md:col-start-9">
        {brief.requirements.map((r) => (
          <li key={r.label} className="rule-dotted flex flex-col gap-1 py-4 last:border-b last:border-dotted last:border-grey-brown md:flex-row md:items-baseline md:justify-between md:gap-8">
            <span className="type-h4 text-cream">{r.label}</span>
            <span className="type-body2 text-grey-brown md:max-w-[38%] md:text-right">{r.note}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
