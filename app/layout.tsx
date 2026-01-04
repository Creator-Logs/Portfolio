import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Portfolio | Aesthete",
  description: "A minimalist, aesthetic personal portfolio website featuring bento-grid layouts, fluid transitions, and a focus on visual storytelling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text antialiased overflow-x-hidden font-sans`}>
        {children}
      </body>
    </html>
  );
}