const paragraphs = [
  "This project focused on designing a compact 3D printer entirely from the ground up with a total system cost under $200, balancing cost efficiency with high-speed printing performance through careful system-level tradeoffs.",
  "The printer was built as a flexible rapid-prototyping platform for future projects, with a support for future upgrades, iteration, and the integration of new tools as requirements evolve.",
];

export function PrinterGoal() {
  return (
    <section
      id="printer_goals"
      className="flex min-h-[70vh] w-full flex-col items-center justify-center bg-[#1B1B1B] px-6 py-12 landscape:min-h-[60vh] landscape:px-20"
    >
      <h2 className="text-center text-5xl font-medium text-[#F8F8F8]">The Goal</h2>
      {paragraphs.map((p) => (
        <p key={p.slice(0, 16)} className="w-full pt-6 text-center text-base text-[#F8F8F8] sm:w-[65vw] md:text-lg landscape:w-[50vw]">
          {p}
        </p>
      ))}
    </section>
  );
}
