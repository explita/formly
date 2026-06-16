"use client";

import React from "react";
import { Zap, Shield, Cpu, RefreshCw, Layers, Sliders } from "lucide-react";

const FEATURES_LIST = [
  {
    icon: <Cpu className="text-violet-600 dark:text-violet-400" size={24} />,
    title: "Micro-Render Architecture",
    description: "Built on a targeted pub-sub event bus. State changes channel directly to inputs, completely bypassing React's standard full-form re-renders.",
    color: "from-violet-500/10 to-purple-500/10 dark:from-violet-500/5 dark:to-purple-500/5 border-violet-100 dark:border-violet-500/10"
  },
  {
    icon: <Shield className="text-emerald-600 dark:text-emerald-400" size={24} />,
    title: "Zod Schema Validation",
    description: "Validate entire schemas or individual paths reactively. Support customized error message parsers and automated error focus controls.",
    color: "from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5 border-emerald-100 dark:border-emerald-500/10"
  },
  {
    icon: <Zap className="text-indigo-600 dark:text-indigo-400" size={24} />,
    title: "Zero-Config DevTools",
    description: "Inspect form state visually using the visual element picker, copy state diffs instantly, and rollback edits with the built-in time travel timeline.",
    color: "from-indigo-500/10 to-cyan-500/10 dark:from-indigo-500/5 dark:to-cyan-500/5 border-indigo-100 dark:border-indigo-500/10"
  },
  {
    icon: <Layers className="text-fuchsia-600 dark:text-fuchsia-400" size={24} />,
    title: "Stable-Keyed Arrays",
    description: "Automate dynamic list item keys. Formly generates persistent list keys that stay in sync during array sorting, shifting, and removal operations.",
    color: "from-fuchsia-500/10 to-pink-500/10 dark:from-fuchsia-500/5 dark:to-pink-500/5 border-fuchsia-100 dark:border-fuchsia-500/10"
  },
  {
    icon: <RefreshCw className="text-blue-600 dark:text-blue-400" size={24} />,
    title: "Draft State Persistence",
    description: "Backup unsaved forms instantly to local storage. Enable preventUnload prompts to block users from accidentally refreshing or losing data.",
    color: "from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 border-blue-100 dark:border-blue-500/10"
  },
  {
    icon: <Sliders className="text-amber-600 dark:text-amber-400" size={24} />,
    title: "Reactive Normalizers",
    description: "Sanitize, trim, and format form inputs in real-time. Automatically normalize values (e.g. phone masks, upper casing) as users type.",
    color: "from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5 border-amber-100 dark:border-amber-500/10"
  }
];

export function Features() {
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto space-y-12">
      {/* Section Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Supercharged Developer Experience
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Formly eliminates standard boilerplate and rendering bottlenecks. Get access to complete control structures right out of the box.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES_LIST.map((feat, index) => (
          <div
            key={index}
            className={`group relative overflow-hidden bg-white dark:bg-slate-900/40 border ${feat.color} rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-500/20 dark:hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1`}
          >
            {/* Top icon holder */}
            <div className="mb-4 inline-flex items-center justify-center p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform duration-300">
              {feat.icon}
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200 mb-2">
              {feat.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {feat.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
