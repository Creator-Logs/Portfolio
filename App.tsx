import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Portfolio } from "./components/Portfolio";
import { Contact } from "./components/Contact";
import { ProjectDetail } from "./components/ProjectDetail";
import { Project } from "./types";
import { projects } from "./constants";
import { ParallaxProvider } from "react-scroll-parallax";

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Initialize theme based on preference
  useEffect(() => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setDarkMode(true);
    }
  }, []);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToHome = () => {
    setSelectedProject(null);
  };

  return (
    <ParallaxProvider>
      <div className="website-container" id="website-container">
        <div className="relative min-h-screen font-sans selection:bg-accent selection:text-white">
          {/* Background Grain Effect */}

          {/* Navigation */}
          <Navbar
            darkMode={darkMode}
            toggleTheme={toggleTheme}
            isDetailView={!!selectedProject}
            onBack={handleBackToHome}
          />

          <main className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="flex flex-col gap-24 md:gap-32 pb-24">
              <Hero />
              <About />
              <Portfolio />
              <Contact />
            </div>
          </main>

          {/* Footer copyright */}
          <footer className="relative z-10 py-8 text-center text-sm text-light-textSec dark:text-dark-textSec border-t border-gray-200 dark:border-gray-800 mt-12 mx-6 md:mx-20">
            <p>
              © {new Date().getFullYear()} Aesthetic Portfolio. Crafted with
              precision.
            </p>
          </footer>
        </div>
      </div>
    </ParallaxProvider>
  );
};

export default App;
