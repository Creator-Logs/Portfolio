import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { DM_Mono, Inter } from "next/font/google";
import { Nav } from "@/components/ui/Nav";
import { Grain } from "@/components/ui/Grain";
import "./globals.css";

const cabinet = localFont({
  src: [
    { path: "../public/fonts/CabinetGrotesk-500.woff2", weight: "500" },
    { path: "../public/fonts/CabinetGrotesk-700.woff2", weight: "700" },
    { path: "../public/fonts/CabinetGrotesk-800.woff2", weight: "800" },
    { path: "../public/fonts/CabinetGrotesk-900.woff2", weight: "900" },
  ],
  variable: "--font-cabinet",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Ansh Gupta — Creator Logs",
  description:
    "Ansh Gupta, Systems Engineering & Design at UIUC. Things I designed in CAD, made by hand, and wrote the software for.",
};

export const viewport: Viewport = {
  themeColor: "#100904",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cabinet.variable} ${inter.variable} ${dmMono.variable}`}>
      {/* Browser extensions (e.g. ColorZilla) inject attributes on <body>. */}
      <body suppressHydrationWarning>
        <Nav />
        {children}
        <Grain />
      </body>
    </html>
  );
}
