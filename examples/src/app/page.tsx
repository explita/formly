import React from "react";
import { Hero } from "../components/landing/hero";
import { Features } from "../components/landing/features";
import { LiveDemo } from "../components/landing/live-demo";
import { LandingFooter } from "../components/landing/footer";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Modular Page Sections */}
      <Hero />
      <Features />
      <LiveDemo />
      <LandingFooter />
    </div>
  );
}
