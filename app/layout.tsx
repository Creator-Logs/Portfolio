import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Creator Logs - Ansh Gupta | Portfolio",
  description:
    "Creator Logs by Ansh Gupta: Explore portfolio of innovative engineering projects bringing mechanical, electrical and software engineering together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text antialiased overflow-x-hidden font-sans`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Check localStorage first, then default to dark mode
                const stored = localStorage.getItem('darkMode');
                const isDark = stored !== null ? stored === 'true' : true;
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
