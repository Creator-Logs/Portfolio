import Image from "next/image";
import type { Tool } from "@/content/projects";

// DESIGN.md §5 Tool chips: rounded square tiles with the tool's logo (dark: ink-2 bg, brown border);
// tools without a logo in /public/logos render as mono text chips.
export function ToolChips({ tools, className = "" }: { tools: Tool[]; className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`} aria-label="Tools">
      {tools.map((t) =>
        t.logo ? (
          <li key={t.name} title={t.name} className="grid size-9 place-items-center rounded-xl border border-brown bg-ink-2">
            <Image src={t.logo} alt={t.name} width={20} height={20} className="size-5 object-contain" />
          </li>
        ) : (
          <li key={t.name} className="type-label rounded-xl border border-brown bg-ink-2 px-3 py-2 text-cream-dim">
            {t.name}
          </li>
        ),
      )}
    </ul>
  );
}
