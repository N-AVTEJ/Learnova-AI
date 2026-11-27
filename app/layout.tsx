import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Learnova AI — Adaptive Mastery & Knowledge Graphs",
  description:
    "Precision AI learning platform built around structured knowledge graphs and adaptive mastery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} min-h-screen bg-background font-sans text-foreground antialiased selection:bg-accent-violet/30 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
