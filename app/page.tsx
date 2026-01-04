"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { About } from "../components/About";
import { Portfolio } from "../components/Portfolio";
import { Contact } from "../components/Contact";
import { ProjectDetail } from "../components/ProjectDetail";
import { Grain } from "../components/Grain";
import { Project } from "../types";
import { projects } from "../constants";
import { ParallaxProvider } from "react-scroll-parallax";

export default function Home() {
  // Initialize with dark mode by default, check localStorage on mount
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Initialize theme based on localStorage or default to dark
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("darkMode");
      if (stored !== null) {
        setDarkMode(stored === "true");
      } else {
        // Default to dark mode if no preference stored
        setDarkMode(true);
        localStorage.setItem("darkMode", "true");
      }
    }
  }, []);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Save preference to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("darkMode", darkMode.toString());
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
        <div className="relative min-h-screen selection:bg-accent selection:text-white">
          {/* Background Grain Effect */}

          {/* Navigation */}
          <Navbar
            darkMode={darkMode}
            toggleTheme={toggleTheme}
            isDetailView={!!selectedProject}
            onBack={handleBackToHome}
          />

          <main className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
            {selectedProject ? (
              <ProjectDetail
                project={selectedProject}
                onBack={handleBackToHome}
              />
            ) : (
              <div className="flex flex-col gap-24 md:gap-32 pb-24">
                <Hero />
                <About />
                <Portfolio
                  onProjectClick={handleProjectClick}
                  projects={projects}
                />
                <Contact />
              </div>
            )}
          </main>

          {/* Footer copyright */}
          <footer className="relative z-10 py-8 text-center text-sm text-light-textSec dark:text-dark-textSec border-t border-dark-tertiary dark:border-dark-tertiary mt-12 mx-6 md:mx-20">
            <p>© {new Date().getFullYear()} Creator Logs</p>
          </footer>
        </div>
      </div>
    </ParallaxProvider>
  );
}
