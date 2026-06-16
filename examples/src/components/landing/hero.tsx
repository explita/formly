"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Terminal, Sparkles } from "lucide-react";
import { VERSION } from "@/dist/version";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 flex flex-col items-center justify-center text-center px-4">
      {/* Background radial highlight glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-linear-to-b from-indigo-500/10 via-fuchsia-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Decorative Blobs */}
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-purple-300/10 dark:bg-purple-950/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-20 right-0 w-80 h-80 bg-cyan-300/10 dark:bg-cyan-950/20 rounded-full blur-3xl pointer-events-none animate-pulse duration-5000" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        {/* Sparkle release tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-linear-to-r from-indigo-500/10 to-fuchsia-500/10 dark:from-indigo-500/20 dark:to-fuchsia-500/20 border border-indigo-200/50 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold select-none shadow-xs">
          <Sparkles
            size={12}
            className="animate-spin-slow text-indigo-500 dark:text-indigo-400"
          />
          <span>Formly v{VERSION} is officially here</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight sm:leading-none text-slate-900 dark:text-white">
          Micro-Renders.
          <span className="block mt-4 bg-clip-text text-transparent bg-linear-to-r from-indigo-600 via-purple-600 to-fuchsia-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
            Absolute Type-Safety.
          </span>
        </h1>

        {/* Hero Description */}
        <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
          A high-performance form state & validation toolkit for React. Bypasses
          general re-renders using a reactive pub-sub architecture—built with
          Zod and developer ergonomics in mind.
        </p>

        {/* CTA Actions */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="/docs"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl px-7 py-3.5 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <BookOpen size={18} />
            Read Documentation
          </Link>
          <Link
            href="/playground"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700/80 rounded-xl px-7 py-3.5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Terminal size={18} />
            Explore Playground
            <ArrowRight
              size={16}
              className="text-slate-400 dark:text-slate-500"
            />
          </Link>
        </div>

        {/* Metrics/Highlights badges row */}
        <div className="pt-10 flex flex-wrap items-center justify-center gap-y-4 gap-x-8 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>&lt; 5KB Bundle Size (Gzipped)</span>
          </div>
          <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-250 dark:border-slate-800 pt-2 sm:pt-0 sm:pl-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Zero Unnecessary Re-Renders</span>
          </div>
          <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-250 dark:border-slate-800 pt-2 sm:pt-0 sm:pl-8">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            <span>100% Declarative Zod Integration</span>
          </div>
        </div>
      </div>
    </section>
  );
}
