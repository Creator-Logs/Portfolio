import React, { useState, useEffect } from "react";
import { IconSun, IconMoon, IconMenu, IconClose } from "./Icons";

interface NavbarProps {
  darkMode: boolean;
  toggleTheme: () => void;
  isDetailView: boolean;
  onBack: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  toggleTheme,
  isDetailView,
  onBack,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6 md:px-12 lg:px-20 py-6 ${
    scrolled
      ? "bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50"
      : "bg-transparent"
  }`;

  const LINKS = [
    { label: "Selected Work", href: "#portfolio" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className={navClasses}>
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        {/* Logo / Back Button */}
        <div className="flex items-center gap-4">
          {isDetailView ? (
            <button
              onClick={onBack}
              className="text-sm font-medium tracking-tight hover:text-accent transition-colors flex items-center gap-2 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">
                ←
              </span>{" "}
              Back
            </button>
          ) : (
            <a
              href="#"
              className="text-2xl font-semibold tracking-tight text-light-text dark:text-dark-text"
            >
              Creator Logs
            </a>
          )}
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-12">
          {!isDetailView &&
            LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-md font-medium text-light-textSec dark:text-dark-textSec hover:text-light-text dark:hover:text-dark-text transition-colors"
              >
                {link.label}
              </a>
            ))}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {darkMode ? (
              <IconSun className="w-5 h-5" />
            ) : (
              <IconMoon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            {darkMode ? (
              <IconSun className="w-5 h-5" />
            ) : (
              <IconMoon className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2"
          >
            {mobileMenuOpen ? (
              <IconClose className="w-6 h-6" />
            ) : (
              <IconMenu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && !isDetailView && (
        <div className="absolute top-full left-0 right-0 bg-light-secondary dark:bg-dark-secondary border-b border-gray-200 dark:border-gray-800 md:hidden flex flex-col p-6 gap-4 shadow-xl animate-fade-in-up">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-light-textSec dark:text-dark-textSec hover:text-accent transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};
