import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tactical Command (Battleship)",
  description: "Advanced Battleship Web App",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen relative`}>
        {/* Background Decorative Grid */}
        <div className="fixed inset-0 pointer-events-none z-[-2] bg-[linear-gradient(rgba(8,145,178,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Animated Scanline overlay */}
        <div className="fixed inset-0 pointer-events-none z-[-1] bg-scanline opacity-30" />
        
        <main className="relative z-0 min-h-screen flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
