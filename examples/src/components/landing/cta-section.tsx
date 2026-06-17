"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Terminal } from "lucide-react";
import { CopyButton } from "../copy-button";

export function CtaSection() {
  return (
    <section className="py-20 px-4 max-w-4xl mx-auto text-center space-y-8">
      <div className="space-y-4">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Ready to Simplify Your Forms?
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Install, define a schema, and wire up your form. No boilerplate, no
          unnecessary re-renders.
        </p>
      </div>

      <div className="inline-flex items-center gap-2 bg-slate-950 dark:bg-slate-900 border border-slate-800 rounded-xl px-5 py-3.5 shadow-xl">
        <span className="text-indigo-400 font-mono text-sm font-semibold select-all">
          npm install @explita/formly
        </span>
        <CopyButton text="npm install @explita/formly" />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/docs"
          className="inline-flex items-center justify-center gap-2 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl px-7 py-3.5 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <BookOpen size={18} />
          Read Documentation
        </Link>
        <Link
          href="/playground"
          className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700/80 rounded-xl px-7 py-3.5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <Terminal size={18} />
          Explore Playground
        </Link>
      </div>
    </section>
  );
}
