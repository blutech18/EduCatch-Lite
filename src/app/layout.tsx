import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "EduCatch Lite — Student Catch-up Planner",
  description:
    "A simplified catch-up planner for students who miss classes due to competitions. Track missed lessons, generate study schedules, and monitor progress.",
  keywords: [
    "education",
    "student planner",
    "catch-up",
    "study schedule",
    "lesson tracker",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} min-h-screen bg-slate-950 font-sans text-white antialiased`}
      >
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
