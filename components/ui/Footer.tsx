import { site } from "@/content/site";

// Site footer (ARCHITECTURE: shared on every page): links + mono small print.
export function Footer() {
  const links = [
    { label: "Email", href: `mailto:${site.email}` },
    { label: "LinkedIn", href: site.links.linkedin },
    { label: "GitHub", href: site.links.github },
  ];
  return (
    <footer className="px-page relative z-[1] pb-8 pt-6">
      <div className="rule-dotted type-label flex flex-col gap-4 pt-6 text-grey-brown md:flex-row md:items-center md:justify-between">
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-cream">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="hover:text-orange"
                {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {l.label} ↗
              </a>
            </li>
          ))}
        </ul>
        <p>
          {site.location} · © {new Date().getFullYear()} {site.name} · {site.subBrand}
        </p>
      </div>
    </footer>
  );
}
