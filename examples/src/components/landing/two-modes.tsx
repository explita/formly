"use client";

import React from "react";
import { Puzzle, LayoutDashboard, Check, X } from "lucide-react";

const MODE_HOOKS = {
  icon: <Puzzle size={20} />,
  title: "Headless Hooks",
  tagline: "Full control over your UI",
  highlights: [
    "Use useForm() independently — no UI dependency",
    "Bring your own input components and styling",
    "Perfect for custom design systems",
    "Same reactive pub-sub performance",
  ],
  ideal: "Custom UI, design systems, minimal dependencies",
  gradient: "from-violet-500 to-purple-600",
  border: "border-violet-200 dark:border-violet-800/60",
  bg: "bg-violet-50/50 dark:bg-violet-950/30",
};

const MODE_FORM = {
  icon: <LayoutDashboard size={20} />,
  title: "Full <Form> Component",
  tagline: "Built-in DevTools & ergonomics",
  highlights: [
    "Drop-in <Form> component with field scoping",
    "Built-in DevTools bubble for live debugging",
    "Auto-focus on first error, dirty tracking, submit handling",
    "Zero-config — works out of the box",
  ],
  ideal: "Rapid development, built-in debugging & validation UX",
  gradient: "from-indigo-500 to-blue-600",
  border: "border-indigo-200 dark:border-indigo-800/60",
  bg: "bg-indigo-50/50 dark:bg-indigo-950/30",
};

export function TwoModes() {
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Two Ways to Use Formly
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Choose headless hooks for full control, or the complete Form component
          for zero-config richness — or mix both.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[MODE_HOOKS, MODE_FORM].map((mode, i) => (
          <div
            key={i}
            className={`relative overflow-hidden ${mode.bg} border ${mode.border} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
          >
            <div className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${mode.gradient}`} />

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className={`inline-flex items-center justify-center p-2.5 rounded-xl bg-linear-to-br ${mode.gradient} text-white shadow-md`}>
                  {mode.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {mode.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {mode.tagline}
                  </p>
                </div>
              </div>

              <ul className="space-y-2">
                {mode.highlights.map((h, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <Check size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                    {h}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <X size={12} className="rotate-45" />
                <span>Best for: {mode.ideal}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
