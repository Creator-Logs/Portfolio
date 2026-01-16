import React from "react";

export const PrinterGoals: React.FC = () => {
  return (
    <section
      id="printer_goals"
      className="px-12 py-10 mx-auto px-6 landscape:px-12 landscape:px-20 py-2 landscape:py-12 landscape:py-12 
      w-screen h-[70vh] landscape:h-[60vh] flex flex-col bg-dark-bg items-center justify-center"
    >
      <h2 className="text-center text-5xl font-medium text-dark-text">
        The Goal
      </h2>
      <p className="text-center w-[65vw] landscape:w-[50vw] text-md md:text-lg font-regular text-dark-text pt-6">
        This project focused on designing a compact 3D printer entirely from the
        ground up with a total system cost under $200, balancing cost efficiency
        with high-speed printing performance through careful system-level
        tradeoffs.
      </p>
      <p className="text-center w-[65vw] landscape:w-[50vw]  text-md md:text-lgfont-regular text-dark-text pt-6">
        The printer was built as a flexible rapid-prototyping platform for
        future projects, with a support for future upgrades, iteration, and the
        integration of new tools as requirements evolve.
      </p>
    </section>
  );
};
