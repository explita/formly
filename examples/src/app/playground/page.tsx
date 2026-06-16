"use client";

import { BasicFormExample } from "../../components/basic";
import { CascadingFormExample } from "../../components/cascading";
import { NestedArrayFormExample } from "../../components/nested-array";
import { WizardFormExample } from "../../components/wizard";
import { AsyncValidationExample } from "../../components/async-validation";
import { CrossFieldCheckExample } from "../../components/check";
import { DraftPersistenceExample } from "../../components/draft-persistence";
import { NormalizeExample } from "../../components/normalize";
import { ConditionalExample } from "../../components/conditional";
import { ExternalAccessExample } from "../../components/external-access";
import { Sparkles, Terminal } from "lucide-react";

export default function ExamplesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Page Hero Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-55 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-650 dark:text-indigo-400 text-xs font-semibold">
          <Sparkles size={12} />
          Interactive Playgrounds
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-slate-900 via-indigo-950 to-indigo-600 dark:from-slate-50 dark:via-indigo-200 dark:to-indigo-400 tracking-tight">
          Formly Developer Experience
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Test real-time reactive options loading, computed invoice array
          tallies, step-level wizard validations, and zero-setup portal DevTools
          inspectors—built for peak React performance.
        </p>
      </div>

      {/* Info Notice Badge */}
      <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-normal">
        <Terminal
          size={14}
          className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0"
        />
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Pro-Tip:
          </span>{" "}
          Look for the interactive{" "}
          <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
            Formly DevTools
          </strong>{" "}
          floating bubble in the bottom right corner! You can switch form
          portals, track live dirty states, get precise patch changes via{" "}
          <code className="text-indigo-600 dark:text-indigo-300 bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded font-semibold font-mono">
            getChanges()
          </code>
          , and imperatively override values.
        </div>
      </div>

      {/* Interactive Examples Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BasicFormExample />
        <CascadingFormExample />
        <NestedArrayFormExample />
        <WizardFormExample />
        <AsyncValidationExample />
        <CrossFieldCheckExample />
        <DraftPersistenceExample />
        <NormalizeExample />
        <ConditionalExample />
        <ExternalAccessExample />
      </div>
    </div>
  );
}
