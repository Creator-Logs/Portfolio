import React from "react";
import { IconArrowRight } from "./Icons";

export const Contact: React.FC = () => {
  return (
    <section
      id="contact"
      className="scroll-mt-32 max-w-2xl mx-auto text-center md:text-left"
    >
      <h3 className="text-sm font-semibold text-accent dark:text-accent-dark uppercase tracking-widest mb-2">
        Get in touch
      </h3>
      <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-8">
        Let's build something extraordinary.
      </h2>
      <p className="text-lg text-light-textSec dark:text-dark-textSec mb-12">
        Currently available for collaboration and open to full-time
        opportunities.
      </p>

      <form
        className="space-y-6 text-left"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full bg-light-secondary dark:bg-dark-secondary rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full bg-light-secondary dark:bg-dark-secondary rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            rows={4}
            className="w-full bg-light-secondary dark:bg-dark-secondary rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
            placeholder="Tell me about your project..."
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full md:w-auto px-8 py-4 bg-light-text dark:bg-dark-text text-light-bg dark:text-dark-bg rounded-full font-semibold hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2"
        >
          Send Message
          <IconArrowRight className="w-4 h-4" />
        </button>
      </form>
    </section>
  );
};
